import {
  resolveVariables,
  type TemplateProfile,
  type TemplateClient,
} from "./template-engine";

interface QuoteForMapping {
  id: string;
  title: string;
  total_ht: number;
  currency: string;
  client_id: string | null;
}

interface QuoteItemForMapping {
  description: string;
}

interface ContractTemplateForMapping {
  id: string;
  name: string;
  content: string | null;
  category: string | null;
}

export interface ContractFromQuotePayload {
  title: string;
  client_id: string | null;
  template_id: string | null;
  quote_id: string;
  amount: number;
  currency: string;
  frequency: string;
  start_date: string;
  document_type: string;
  description: string;
  content: string | null;
}

/**
 * Derives the {{objet}} text from a quote. There's no dedicated
 * objet/description column on `quotes` — only `title` (required) and the
 * line items — so title is the primary source, with a fallback that
 * concatenates item descriptions when the title alone isn't descriptive.
 */
function deriveObjet(quote: QuoteForMapping, items: QuoteItemForMapping[]): string {
  if (quote.title?.trim()) return quote.title.trim();
  if (items.length > 0) {
    return `Prestation de : ${items.map((i) => i.description).join(", ")}`;
  }
  return "";
}

/**
 * Builds the contract creation payload from an existing quote, resolving
 * the template's {{variables}} against the quote's client + the
 * prestataire's profile. `duree` is intentionally left unresolved
 * ([à compléter]) since quotes have no duration field.
 */
export function buildContractFromQuote({
  quote,
  items,
  client,
  profile,
  template,
}: {
  quote: QuoteForMapping;
  items: QuoteItemForMapping[];
  client: TemplateClient | null;
  profile: TemplateProfile | null;
  template: ContractTemplateForMapping | null;
}): ContractFromQuotePayload {
  const objet = deriveObjet(quote, items);
  const montant = String(Number(quote.total_ht));

  const content = template?.content
    ? resolveVariables(template.content, {
        profile,
        client,
        custom: { objet, montant },
      })
    : null;

  return {
    title: template?.name ? `${template.name} — ${quote.title}` : quote.title,
    client_id: quote.client_id,
    template_id: template?.id ?? null,
    quote_id: quote.id,
    amount: Number(quote.total_ht),
    currency: quote.currency || "EUR",
    frequency: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    document_type: template?.category === "prestation" ? "prestation" : "cgv",
    description: objet,
    content,
  };
}
