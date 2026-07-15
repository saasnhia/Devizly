#!/usr/bin/env node
// Standalone script: decrypts the stored SUPER PDP connection token (via
// the service role key, same crypto scheme as src/lib/crypto.ts,
// reimplemented here in plain JS since this runs outside the Next.js
// TypeScript build) and queries the french_directory endpoint to see
// which companies are actually registered — real or sandbox.
//
// Usage: node scripts/list-sandbox-directory.mjs [siren1] [siren2] ...
// With no args, tries a set of known candidate SIRENs (the Dolibarr
// module's sandbox companies) plus a bare, unfiltered call.

import { readFile } from "node:fs/promises";
import { createDecipheriv, createCipheriv, randomBytes } from "node:crypto";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const BASE_URL = "https://api.superpdp.tech";

async function loadEnvLocal() {
  const envPath = path.join(REPO_ROOT, ".env.local");
  const content = await readFile(envPath, "utf8");
  for (const rawLine of content.split("\n")) {
    const l = rawLine.trim();
    if (!l || l.startsWith("#")) continue;
    const eq = l.indexOf("=");
    if (eq === -1) continue;
    const key = l.slice(0, eq).trim();
    let value = l.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
await loadEnvLocal();

function decrypt(payload, keyB64) {
  const key = Buffer.from(keyB64, "base64");
  const [ivB64, authTagB64, ciphertextB64] = payload.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

function encrypt(plaintext, keyB64) {
  const key = Buffer.from(keyB64, "base64");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const CLIENT_ID = process.env.SUPERPDP_SANDBOX_CLIENT_ID || process.env.SUPERPDP_CLIENT_ID;
const CLIENT_SECRET = process.env.SUPERPDP_SANDBOX_CLIENT_SECRET || process.env.SUPERPDP_CLIENT_SECRET;

if (!SUPABASE_URL || !SERVICE_KEY || !ENCRYPTION_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ENCRYPTION_KEY in .env.local");
  process.exit(1);
}

async function sb(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  return res.json();
}

async function sbPatch(path, body) {
  await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
}

console.log("── Loading stored SUPER PDP connection ──");
const rows = await sb(
  "superpdp_connections?select=id,user_id,access_token_encrypted,refresh_token_encrypted,expires_at,company_siren,company_name,company_env,company_number_scheme"
);
if (!Array.isArray(rows) || rows.length === 0) {
  console.error("No superpdp_connections row found — connect via /parametres first.");
  process.exit(1);
}
const row = rows[0];
console.log(
  `Connection: ${row.company_name} — SIREN ${row.company_siren} — scheme=${row.company_number_scheme} — env=${row.company_env}`
);

let accessToken = decrypt(row.access_token_encrypted, ENCRYPTION_KEY);
const expiresAt = new Date(row.expires_at).getTime();

if (expiresAt < Date.now() + 30_000) {
  console.log("Access token expired — refreshing...");
  const refreshToken = decrypt(row.refresh_token_encrypted, ENCRYPTION_KEY);
  const res = await fetch(`${BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    console.error("Refresh failed:", res.status, JSON.stringify(data));
    process.exit(1);
  }
  accessToken = data.access_token;
  await sbPatch(`superpdp_connections?id=eq.${row.id}`, {
    access_token_encrypted: encrypt(data.access_token, ENCRYPTION_KEY),
    refresh_token_encrypted: encrypt(data.refresh_token, ENCRYPTION_KEY),
    expires_at: new Date(Date.now() + (data.expires_in ?? 1800) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log("Refreshed and persisted new tokens.");
}

async function queryDirectory(label, qs) {
  console.log(`\n── ${label} ──`);
  const url = `${BASE_URL}/v1.beta/french_directory/entries${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  const bodyText = await res.text();
  console.log(`GET ${url}`);
  console.log(`Status: ${res.status}`);
  console.log(`Body: ${bodyText.slice(0, 1500)}`);
}

const args = process.argv.slice(2);
if (args.length > 0) {
  for (const siren of args) {
    await queryDirectory(`SIREN fourni: ${siren}`, `number=${encodeURIComponent(siren)}`);
  }
} else {
  await queryDirectory("Sans filtre (liste complète si supportée)", "");
  // Known candidate SIRENs from the Dolibarr reference module's sandbox
  // pilot-phase comments ("Burger Queen SIREN 000000002", default sandbox
  // client SIREN 000000001).
  for (const siren of ["000000001", "000000002", "102637899"]) {
    await queryDirectory(`Candidat: ${siren}`, `number=${encodeURIComponent(siren)}`);
  }
}
