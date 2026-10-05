/**
 * Server-side filter for compliance / guarantee claims in AI-generated quotes.
 *
 * The prompt (NO_COMPLIANCE_CLAIMS_RULE) discourages them; this filter is what
 * actually guarantees none reaches the user's client: a small fallback model
 * does not reliably follow the prompt rule. It only removes the listed
 * compliance vocabulary — ordinary technical wording ("Carrelage sol 6 m²",
 * "Normalisation des données", "étiquette") is left untouched.
 */

// Letters (any script, accented or not) — JS \b is ASCII-only, so "conformité" needs lookarounds
const L = "\\p{L}";

/**
 * Compliance vocabulary, case- and accent-insensitive, matched as whole words:
 * conforme / conformité / conformément · norme(s) · NF · RT 20xx · RE 20xx ·
 * garanti / garantie / garantit · certifié / certification · label / labellisé · décennale ·
 * professional qualifications: RGE (+ "Reconnu Garant de l'Environnement") · Qualibat ·
 * Qualifelec · QualiPV · Qualit'EnR · agréé(e)(s)
 */
const TERM = `(?:conform${L}*|normes?|nf|rt\\s?20\\d{2}|re\\s?20\\d{2}|garanti${L}*|certifi${L}*|label${L}*|d[eéèê]cennales?|rge(?:\\s+reconnus?\\s+garants?(?:\\s+de\\s+l['’]\\s?environnement)?)?|qualibat|qualifelec|qualipv|qualit['’]?\\s?enr|agr[eéè][eéè]e?s?)`;

export const COMPLIANCE_TERM = new RegExp(`(?<![${L}\\d])${TERM}(?![${L}])`, "iu");

/**
 * The full claim span inside a short description, so that only the claim is cut:
 * "Électricité aux normes NF C 15-100" → "Électricité",
 * "Mise aux normes du tableau électrique" → "Tableau électrique".
 * = optional lead-in words ("mise aux", "conforme à la", "selon les", "respectant les")
 *   + the term + trailing reference codes ("NF C 15-100", "DTU 52.2", "en vigueur").
 */
// Holder nouns ("entreprise RGE", "par artisan agréé") mean nothing once the qualification is cut
const HOLDER = `entreprises?|soci[eé]t[eé]s?|artisans?|installateurs?|professionnels?|prestataires?|par|une?|l['’]`;
const LEAD_IN = `(?:(?:mise|mises|mis|aux?|à|a|selon|suivant|en|respect${L}*|conform${L}*|les?|la|des|du|${HOLDER})\\s*(?<=\\s|['’]))*`;
const TRAILING_REF = `(?:\\s+(?:${TERM}|nf|en|iso|dtu|c|aux?|à|a|la|les?|des|du|en\\s+vigueur|vigueur|r[eé]glement${L}*|[eé]lectriques?|\\d[\\d.\\-]*(?:\\s+(?:ans?|années?|mois))?)(?![${L}]))*`;
const CLAIM_SPAN = new RegExp(`(?<![${L}\\d])${LEAD_IN}${TERM}(?![${L}])${TRAILING_REF}`, "giu");

const CONNECTOR_EDGES = new RegExp(
  `^(?:(?:du|de|des|la|le|les|à|a|aux?|et|en|pour)\\s+)+|(?:\\s+(?:du|de|des|la|le|les|à|a|aux?|et|en|pour))+$`,
  "iu"
);

export function hasComplianceClaim(text: string | null | undefined): boolean {
  return !!text && COMPLIANCE_TERM.test(text);
}

function capitalize(s: string): string {
  return s.charAt(0).toLocaleUpperCase("fr-FR") + s.slice(1);
}

/**
 * Free text (notes, payment conditions): every sentence containing a claim is removed,
 * the other sentences are kept as written.
 */
export function stripClaimSentences(text: string): string {
  if (!hasComplianceClaim(text)) return text;
  return text
    .split(/(?<=[.!?;])\s+|\n+/)
    .filter((sentence) => sentence.trim() && !hasComplianceClaim(sentence))
    .join(" ")
    .trim();
}

/**
 * Line description: removes the claim and keeps the work it describes.
 * Returns null when nothing but the claim was there — the caller drops the line.
 */
export function stripClaimFromDescription(description: string): string | null {
  if (!hasComplianceClaim(description)) return description;

  const cleaned = description
    // "(NF C 15-100)", "[certifié Qualibat]" → removed entirely
    .replace(/\s*[([][^)\]]*[)\]]/g, (group) => (hasComplianceClaim(group) ? "" : group))
    // "Pose carrelage - garantie 10 ans" → segments separated by - – , + / ; keep the clean ones
    .split(/(\s+[-–—+/]\s+|\s*[,;]\s*)/)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(CLAIM_SPAN, " ").replace(/\s{2,}/g, " ").trim()))
    .reduce<string[]>((acc, part, i, parts) => {
      // drop a separator whose neighbouring segment became empty
      if (i % 2 === 1) {
        if (acc.length && acc[acc.length - 1] && parts[i + 1]) acc.push(part);
      } else if (part) {
        acc.push(part);
      }
      return acc;
    }, [])
    .join("")
    .replace(CONNECTOR_EDGES, "")
    .replace(/[\s\-–—,;:+/]+$/u, "")
    .trim();

  // nothing meaningful left (fewer than 3 letters) → the description was only a claim
  return (cleaned.match(/\p{L}/gu)?.length ?? 0) >= 3 ? capitalize(cleaned) : null;
}

/** Applies the filter to a quote: title, notes and every line; drops lines that were only a claim. */
export function filterQuoteClaims<T extends { description: string }>(
  tag: string,
  quote: { title: string; notes?: string; lines: T[] }
): { title: string; notes?: string; lines: T[] } {
  let removed = 0;
  let droppedLines = 0;

  const title = stripClaimFromDescription(quote.title) ?? "Devis";
  if (title !== quote.title) removed++;

  const notes = quote.notes === undefined ? undefined : stripClaimSentences(quote.notes);
  if (notes !== quote.notes) removed++;

  const lines: T[] = [];
  for (const line of quote.lines) {
    const description = stripClaimFromDescription(line.description);
    if (description === null) {
      droppedLines++;
      continue;
    }
    if (description !== line.description) removed++;
    lines.push({ ...line, description });
  }

  if (removed || droppedLines) {
    // Counts only — never the text itself (client data)
    console.warn(JSON.stringify({ event: "ai_compliance_claims_removed", tag, fieldsEdited: removed, droppedLines }));
  }
  return { title, notes, lines };
}
