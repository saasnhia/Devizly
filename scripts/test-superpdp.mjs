#!/usr/bin/env node
// Standalone SUPER PDP API smoke test — bypasses the whole app so we can
// validate the real integration without deploying anything.
//
// Usage:
//   node scripts/test-superpdp.mjs
//   node scripts/test-superpdp.mjs --pdf ./mon-facturx.pdf
//
// Reads SUPERPDP_CLIENT_ID / SUPERPDP_CLIENT_SECRET from .env.local
// automatically (no extra flag needed), or from the environment if
// already set (e.g. in CI).
//
// What it does, mirroring the reference Dolibarr module's quick_start:
//   1. POST /oauth2/token — client_credentials, get an access_token
//   2. GET  /v1.beta/companies/me — confirms identity (SIREN + env)
//   3. POST /v1.beta/invoices — sends a test Factur-X PDF (raw body,
//      NOT multipart — that's the actual SUPER PDP request format)
//   4. GET  /v1.beta/invoices/{id} — shows the invoice back
//
// Nothing here touches Supabase, the app's routes, or production data.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE_URL = "https://api.superpdp.tech";
const REPO_ROOT = path.resolve(import.meta.dirname, "..");

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

// ── Minimal .env.local loader (no dependency) ───────────────────
async function loadEnvLocal() {
  const envPath = path.join(REPO_ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const content = await readFile(envPath, "utf8");
  for (const rawLine of content.split("\n")) {
    const l = rawLine.trim();
    if (!l || l.startsWith("#")) continue;
    const eq = l.indexOf("=");
    if (eq === -1) continue;
    const key = l.slice(0, eq).trim();
    let value = l.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

await loadEnvLocal();

const args = process.argv.slice(2);
const pdfArgIndex = args.indexOf("--pdf");
const pdfArgPath = pdfArgIndex !== -1 ? args[pdfArgIndex + 1] : null;

const clientId = process.env.SUPERPDP_CLIENT_ID;
const clientSecret = process.env.SUPERPDP_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  fail("SUPERPDP_CLIENT_ID / SUPERPDP_CLIENT_SECRET manquants.");
  info(
    "Ajoute-les dans .env.local, ou exporte-les dans l'environnement avant de lancer le script."
  );
  process.exit(1);
}

// ── Locate a Factur-X test PDF (reuse the Pennylane test fixtures) ──
const candidatePdfs = [
  pdfArgPath,
  process.env.SUPERPDP_TEST_PDF,
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

// ── Step 1: OAuth token ──────────────────────────────────────────
async function getAccessToken() {
  logSection("ÉTAPE 1 — OAuth 2.1 client_credentials (POST /oauth2/token)");
  const res = await fetch(`${BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });
  const bodyText = await res.text();
  console.log(`Status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    fail(`Échec d'authentification — ${bodyText.slice(0, 500)}`);
    return null;
  }

  let data;
  try {
    data = JSON.parse(bodyText);
  } catch {
    fail("Réponse OAuth non-JSON.");
    console.log(bodyText.slice(0, 500));
    return null;
  }

  if (!data.access_token) {
    fail("access_token absent de la réponse.");
    console.log(JSON.stringify(data, null, 2));
    return null;
  }

  ok(`Token obtenu (expire dans ${data.expires_in ?? "?"}s)`);
  return data.access_token;
}

// ── Step 2: identity ─────────────────────────────────────────────
async function getCompanyInfo(token) {
  logSection("ÉTAPE 2 — Identité (GET /v1.beta/companies/me)");
  const res = await fetch(`${BASE_URL}/v1.beta/companies/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const bodyText = await res.text();
  console.log(`Status: ${res.status} ${res.statusText}`);
  console.log(`Body: ${bodyText.slice(0, 1000)}`);

  if (!res.ok) {
    fail(`Échec — status ${res.status}`);
    return null;
  }

  try {
    const data = JSON.parse(bodyText);
    ok(
      `Entreprise : SIREN ${data.number ?? "?"} (schéma ${data.number_scheme ?? "?"}) — environnement : ${data.env ?? "?"}`
    );
    return data;
  } catch {
    fail("Réponse non-JSON.");
    return null;
  }
}

// ── Step 3: submit a test invoice ────────────────────────────────
async function submitInvoice(token) {
  logSection(
    "ÉTAPE 3 — Envoi facture test (POST /v1.beta/invoices)\n" +
      "Body brut = le PDF lui-même (PAS multipart), Content-Type: application/pdf"
  );
  const res = await fetch(`${BASE_URL}/v1.beta/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/pdf",
    },
    body: pdfBuffer,
  });
  const bodyText = await res.text();
  console.log(`Status: ${res.status} ${res.statusText}`);
  console.log(`Body: ${bodyText.slice(0, 2000)}`);

  if (!res.ok) {
    fail(`Échec — status ${res.status}. Voir le body ci-dessus pour le détail.`);
    return null;
  }

  try {
    const data = JSON.parse(bodyText);
    ok(`Facture envoyée — id SUPER PDP: ${data.id ?? "?"}`);
    return data;
  } catch {
    fail("Réponse non-JSON malgré un status 2xx.");
    return null;
  }
}

// ── Step 4: fetch it back ────────────────────────────────────────
async function getInvoice(token, id) {
  logSection(`ÉTAPE 4 — Relecture (GET /v1.beta/invoices/${id})`);
  const res = await fetch(`${BASE_URL}/v1.beta/invoices/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const bodyText = await res.text();
  console.log(`Status: ${res.status} ${res.statusText}`);
  console.log(`Body: ${bodyText.slice(0, 1500)}`);
  if (res.ok) ok("Facture retrouvée sur la plateforme.");
  else fail(`Échec — status ${res.status}`);
}

// ── Run ──────────────────────────────────────────────────────────
const token = await getAccessToken();
if (!token) process.exit(1);

const company = await getCompanyInfo(token);
if (!company) process.exit(1);

const submitted = await submitInvoice(token);
if (submitted?.id) {
  await getInvoice(token, submitted.id);
}

logSection("RÉSUMÉ");
console.log(
  "Rappel : ce script n'écrit rien dans Supabase ni dans l'app — c'est un test isolé " +
    "contre l'API SUPER PDP réelle."
);
if (!submitted) {
  fail("La transmission de facture a échoué — voir le détail ci-dessus.");
  process.exit(1);
} else {
  ok("Test complet réussi.");
}
