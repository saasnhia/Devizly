#!/usr/bin/env node
// Standalone Pennylane API smoke test — bypasses the whole app so we can
// validate the real API against our integration assumptions without
// deploying anything.
//
// Usage:
//   PENNYLANE_TEST_TOKEN=xxx node scripts/test-pennylane.mjs
//   PENNYLANE_TEST_TOKEN=xxx node scripts/test-pennylane.mjs --pdf ./mon-facturx.pdf
//   PENNYLANE_TEST_TOKEN=xxx node scripts/test-pennylane.mjs --only=legacy
//   PENNYLANE_TEST_TOKEN=xxx node scripts/test-pennylane.mjs --only=v2
//
// What it does:
//   1. GET /api/external/v2/me — confirms the token is valid at all
//   2. POST /api/external/v2/e-invoices/imports — the endpoint our current
//      push-pennylane route calls (DEPRECATED per Pennylane's own docs as
//      of this writing, but still tested so we know if/when it breaks)
//   3. POST /api/external/v2/customer_invoices/e_invoices/imports — the
//      documented replacement endpoint
//
// Nothing here touches Supabase, the app's routes, or production data.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE_URL = "https://app.pennylane.com";
const REPO_ROOT = path.resolve(import.meta.dirname, "..");

const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith("--only="))?.split("=")[1];
const pdfArgIndex = args.indexOf("--pdf");
const pdfArgPath = pdfArgIndex !== -1 ? args[pdfArgIndex + 1] : null;

const token = process.env.PENNYLANE_TEST_TOKEN;

function line(char = "─", n = 70) {
  return char.repeat(n);
}

function logSection(title) {
  console.log(`\n${line()}`);
  console.log(title);
  console.log(line());
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

function fail(msg) {
  console.log(`❌ ${msg}`);
}

function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

if (!token) {
  fail("PENNYLANE_TEST_TOKEN manquant.");
  info("Usage : PENNYLANE_TEST_TOKEN=xxx node scripts/test-pennylane.mjs");
  info(
    "Génère un token dans Pennylane : Paramètres > Connectivité > Développeurs > " +
      "Générer un token d'API (scope customer_invoices:all requis)."
  );
  process.exit(1);
}

// ── Locate a Factur-X test PDF ──────────────────────────────────
const candidatePdfs = [
  pdfArgPath,
  process.env.PENNYLANE_TEST_PDF,
  "phase2d-via-relay.pdf",
  "test-output-phase2b-final.pdf",
  "test-output-preview.pdf",
]
  .filter(Boolean)
  .map((p) => (path.isAbsolute(p) ? p : path.join(REPO_ROOT, p)));

const pdfPath = candidatePdfs.find((p) => existsSync(p));

if (!pdfPath) {
  fail("Aucun PDF Factur-X de test trouvé.");
  info(
    "Génère-en un avec `python api/facturx/generate.py` ou passe un chemin via --pdf <fichier>."
  );
  process.exit(1);
}

const pdfBuffer = await readFile(pdfPath);
info(`PDF de test : ${pdfPath} (${(pdfBuffer.byteLength / 1024).toFixed(1)} KB)`);

// ── Step 1: token validity ──────────────────────────────────────
async function testTokenValidity() {
  logSection("ÉTAPE 1 — Validité du token (GET /api/external/v2/me)");
  try {
    const res = await fetch(`${BASE_URL}/api/external/v2/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bodyText = await res.text();
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Body: ${bodyText.slice(0, 1000)}`);
    if (res.ok) {
      ok("Token valide et accepté par Pennylane.");
    } else if (res.status === 404) {
      info(
        "404 sur /me — l'endpoint n'existe peut-être pas sous ce chemin exact, " +
          "ce n'est pas forcément un problème de token. On continue."
      );
    } else if (res.status === 401) {
      fail("401 — token invalide, expiré, ou mal copié.");
    } else if (res.status === 403) {
      fail("403 — token valide mais scope insuffisant pour /me.");
    } else {
      fail(`Statut inattendu: ${res.status}`);
    }
    return res.status;
  } catch (err) {
    fail(`Erreur réseau: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

// ── Step 2: legacy endpoint (what our current route.ts calls) ──
async function testLegacyEndpoint() {
  logSection(
    "ÉTAPE 2 — Endpoint LEGACY (celui utilisé actuellement par push-pennylane/route.ts)\n" +
      "POST /api/external/v2/e-invoices/imports — ⚠️ marqué DEPRECATED dans la doc Pennylane"
  );

  const formData = new FormData();
  formData.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), "test-invoice.pdf");
  formData.append("type", "customer");

  try {
    const res = await fetch(`${BASE_URL}/api/external/v2/e-invoices/imports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const bodyText = await res.text();
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Body: ${bodyText.slice(0, 2000)}`);

    if (res.ok) {
      ok("L'endpoint legacy répond encore avec succès (pas encore supprimé).");
      try {
        const json = JSON.parse(bodyText);
        info(`Champs de la réponse: ${Object.keys(json).join(", ")}`);
      } catch {
        info("Réponse non-JSON.");
      }
    } else {
      fail(`Échec — status ${res.status}. Voir le body ci-dessus pour le détail.`);
    }
    return { status: res.status, body: bodyText };
  } catch (err) {
    fail(`Erreur réseau: ${err instanceof Error ? err.message : String(err)}`);
    return { status: null, body: null };
  }
}

// ── Step 3: documented replacement endpoint ─────────────────────
async function testV2Endpoint() {
  logSection(
    "ÉTAPE 3 — Endpoint V2 recommandé (remplacement documenté)\n" +
      "POST /api/external/v2/customer_invoices/e_invoices/imports"
  );

  const formData = new FormData();
  formData.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), "test-invoice.pdf");
  // No "type" field here — implicit in the URL (customer_invoices/...).

  try {
    const res = await fetch(
      `${BASE_URL}/api/external/v2/customer_invoices/e_invoices/imports`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    const bodyText = await res.text();
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Body: ${bodyText.slice(0, 2000)}`);

    if (res.ok) {
      ok("L'endpoint v2 fonctionne — c'est celui à utiliser en remplacement.");
      try {
        const json = JSON.parse(bodyText);
        info(`Champs de la réponse: ${Object.keys(json).join(", ")}`);
      } catch {
        info("Réponse non-JSON.");
      }
    } else {
      fail(`Échec — status ${res.status}. Voir le body ci-dessus pour le détail.`);
    }
    return { status: res.status, body: bodyText };
  } catch (err) {
    fail(`Erreur réseau: ${err instanceof Error ? err.message : String(err)}`);
    return { status: null, body: null };
  }
}

// ── Run ──────────────────────────────────────────────────────────
await testTokenValidity();

const results = {};
if (onlyArg !== "v2") {
  results.legacy = await testLegacyEndpoint();
}
if (onlyArg !== "legacy") {
  results.v2 = await testV2Endpoint();
}

logSection("RÉSUMÉ");
if (results.legacy) {
  console.log(
    `Legacy (/e-invoices/imports)              : ${results.legacy.status ?? "erreur réseau"}`
  );
}
if (results.v2) {
  console.log(
    `V2 (/customer_invoices/e_invoices/imports) : ${results.v2.status ?? "erreur réseau"}`
  );
}
console.log(
  "\nRappel : ce script n'écrit rien dans Supabase ni dans l'app — c'est un test isolé " +
    "contre l'API Pennylane réelle (sandbox ou prod selon le token fourni)."
);
