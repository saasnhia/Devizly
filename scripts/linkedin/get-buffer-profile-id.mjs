#!/usr/bin/env node
/**
 * Get Buffer profile IDs
 *
 * Lists all connected profiles on your Buffer account.
 * Use the returned ID as BUFFER_PROFILE_ID in your .env.linkedin
 *
 * Usage:
 *   node scripts/linkedin/get-buffer-profile-id.mjs
 *
 * Requires:
 *   BUFFER_ACCESS_TOKEN in scripts/linkedin/.env.linkedin
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════
// LOAD ENV
// ═══════════════════════════════════════════════════

function loadEnv() {
  const envPath = join(__dirname, ".env.linkedin");
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.linkedin not found — rely on system env
  }
}

loadEnv();

const TOKEN = process.env.BUFFER_ACCESS_TOKEN;
if (!TOKEN) {
  console.error("❌ BUFFER_ACCESS_TOKEN manquant.");
  console.error("   Ajoutez-le dans scripts/linkedin/.env.linkedin");
  console.error("");
  console.error("   Pour obtenir un token :");
  console.error("   1. Allez sur https://buffer.com/developers/apps");
  console.error("   2. Créez une app (ou utilisez l'existante)");
  console.error("   3. Copiez l'Access Token");
  process.exit(1);
}

// ═══════════════════════════════════════════════════
// FETCH PROFILES
// ═══════════════════════════════════════════════════

async function main() {
  console.log("🔍 Récupération des profils Buffer...\n");

  const res = await fetch(
    `https://api.bufferapp.com/1/profiles.json?access_token=${TOKEN}`
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ Erreur Buffer API (${res.status}): ${text}`);
    process.exit(1);
  }

  const profiles = await res.json();

  if (!profiles.length) {
    console.log("⚠️  Aucun profil connecté à votre compte Buffer.");
    console.log("   Connectez un profil LinkedIn sur https://publish.buffer.com");
    process.exit(0);
  }

  console.log(`📋 ${profiles.length} profil(s) trouvé(s) :\n`);
  console.log("─".repeat(60));

  for (const p of profiles) {
    console.log(`  ID            : ${p.id}`);
    console.log(`  Service       : ${p.service}`);
    console.log(`  Type          : ${p.service_type || "N/A"}`);
    console.log(`  Nom           : ${p.formatted_username || p.service_username}`);
    console.log(`  Statut        : ${p.paused ? "⏸️  En pause" : "✅ Actif"}`);
    console.log(`  Posts queue    : ${p.counts?.pending || 0}`);
    console.log(`  Posts envoyés  : ${p.counts?.sent || 0}`);
    console.log("─".repeat(60));
  }

  // Highlight LinkedIn profiles
  const linkedin = profiles.filter((p) => p.service === "linkedin");
  if (linkedin.length) {
    console.log("\n🎯 Profils LinkedIn détectés :\n");
    for (const p of linkedin) {
      console.log(`   BUFFER_PROFILE_ID=${p.id}`);
      console.log(`   → ${p.formatted_username || p.service_username}`);
      console.log("");
    }
    console.log("   Copiez l'ID dans scripts/linkedin/.env.linkedin");
  } else {
    console.log("\n⚠️  Aucun profil LinkedIn trouvé.");
    console.log("   Connectez LinkedIn sur https://publish.buffer.com → Channels");
  }
}

main().catch((err) => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});
