// Diagnostic : appelle Mistral comme /api/ai/generate-quote (même prompt système importé de src/lib/ai/prompts.ts,
// même chaîne modèle principal → fallback sur 429/403/5xx), avec la clé de
// .env.local, et affiche les devis générés ou la vraie erreur.
// Usage : node scripts/test-ai-generation.mjs ["prompt" ...]
import { readFileSync } from "node:fs";
import { Mistral } from "@mistralai/mistralai";
import { QUOTE_SYSTEM_PROMPT } from "../src/lib/ai/prompts.ts";
import { COMPLIANCE_TERM, filterQuoteClaims } from "../src/lib/ai/compliance-filter.ts";

function loadEnvLocal() {
  const env = {};
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const envLocal = loadEnvLocal();
const env = (k) => process.env[k] || envLocal[k];
const apiKey = env("MISTRAL_API_KEY");
if (!apiKey) {
  console.error("MISTRAL_API_KEY absente");
  process.exit(1);
}
const models = [env("MISTRAL_MODEL") || "mistral-small-latest", env("MISTRAL_FALLBACK_MODEL") || "ministral-14b-latest"];

const SYSTEM = QUOTE_SYSTEM_PROMPT;

const prompts = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "Création d'un logo pour une boulangerie",
      "Rénovation complète d'une salle de bain de 6 m² : dépose de l'existant, plomberie, douche à l'italienne, carrelage sol et murs, meuble vasque double, électricité aux normes NF C 15-100",
      "Accompagnement marketing digital sur 3 mois : audit SEO, 8 articles de blog, gestion LinkedIn, reporting mensuel",
    ];

const client = new Mistral({ apiKey });
const shouldFallback = (s) => s == null || s === 403 || s === 429 || s >= 500;
let failures = 0;
let claimsBefore = 0;
let claimsAfter = 0;

for (const prompt of prompts) {
  console.log(`\n${"═".repeat(70)}\nPrompt : ${prompt}`);
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const t0 = Date.now();
    try {
      const completion = await client.chat.complete({
        model,
        responseFormat: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });
      const content = completion.choices?.[0]?.message?.content;
      console.log(`→ ${model} : 200 en ${Date.now() - t0} ms${i > 0 ? " (FALLBACK)" : ""}`);
      let q;
      try {
        q = JSON.parse(String(content));
      } catch (e) {
        console.log("  JSON invalide :", e.message, "\n", content);
        failures++;
        break;
      }
      const ok =
        typeof q.title === "string" &&
        Array.isArray(q.items) &&
        q.items.length > 0 &&
        q.items.every((it) => typeof it.description === "string" && typeof it.quantity === "number" && typeof it.unit_price === "number");
      console.log(`  Schéma : ${ok ? "OK" : "NON CONFORME"}`);
      if (!ok) failures++;

      // Claims written by the model (before filter) — every text field
      const texts = [q.title, q.notes, ...(q.items ?? []).map((it) => it.description)].filter(Boolean);
      const before = texts.filter((t) => COMPLIANCE_TERM.test(t));
      const f = filterQuoteClaims("test", { title: q.title, notes: q.notes, lines: q.items ?? [] });
      const after = [f.title, f.notes, ...f.lines.map((l) => l.description)].filter((t) => t && COMPLIANCE_TERM.test(t));
      claimsBefore += before.length;
      claimsAfter += after.length;
      if (after.length) failures++;
      console.log(`  Conformité — écrites par le modèle : ${before.length}${before.length ? " → " + before.map((t) => JSON.stringify(t)).join(" | ") : ""}`);
      console.log(`  Conformité — après filtre : ${after.length}${after.length ? " ✗ " + after.join(" | ") : " ✓"}${f.lines.length !== (q.items ?? []).length ? ` (${(q.items ?? []).length - f.lines.length} ligne(s) retirée(s))` : ""}`);

      console.log(`  Titre : ${f.title}`);
      let total = 0;
      for (const it of f.lines) {
        const line = Number(it.quantity) * Number(it.unit_price);
        total += line;
        console.log(`   - ${String(it.description).padEnd(52)} ${String(it.quantity).padStart(5)} × ${String(it.unit_price).padStart(8)} € = ${line.toFixed(2).padStart(10)} €`);
      }
      console.log(`  Total HT : ${total.toFixed(2)} €`);
      if (f.notes) console.log(`  Notes : ${f.notes}`);
      break;
    } catch (err) {
      console.log(`→ ${model} : ÉCHEC ${err?.statusCode ?? err?.name} en ${Date.now() - t0} ms — ${err?.body ?? err?.message}`);
      if (i === models.length - 1 || !shouldFallback(err?.statusCode)) {
        failures++;
        break;
      }
    }
  }
}

console.log(`\nAffirmations de conformité : ${claimsBefore} écrite(s) par le modèle, ${claimsAfter} après filtre`);
console.log(`${failures === 0 ? "TOUS LES TESTS OK" : `${failures} ÉCHEC(S)`}`);
process.exitCode = failures === 0 ? 0 : 2;
