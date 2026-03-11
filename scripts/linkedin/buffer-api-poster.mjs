#!/usr/bin/env node
/**
 * Buffer API Poster — Schedule 30 LinkedIn posts via Buffer API
 *
 * Reads posts.json, formats each post for LinkedIn, and schedules
 * them via the Buffer API with the correct date/time.
 *
 * Usage:
 *   node scripts/linkedin/buffer-api-poster.mjs --dry-run     # Preview without posting
 *   node scripts/linkedin/buffer-api-poster.mjs --all          # Schedule all 30 posts
 *   node scripts/linkedin/buffer-api-poster.mjs --day 1        # Schedule a single post
 *   node scripts/linkedin/buffer-api-poster.mjs --day 1-5      # Schedule a range
 *
 * Requires in scripts/linkedin/.env.linkedin:
 *   BUFFER_ACCESS_TOKEN=xxx
 *   BUFFER_PROFILE_ID=xxx
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
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

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════

const TOKEN = process.env.BUFFER_ACCESS_TOKEN;
const PROFILE_ID = process.env.BUFFER_PROFILE_ID;

const SCHEDULE_MAP = {
  "Mardi 9h": { dayOfWeek: 2, hour: 9, minute: 0 },
  "Mercredi 11h": { dayOfWeek: 3, hour: 11, minute: 0 },
  "Jeudi 14h": { dayOfWeek: 4, hour: 14, minute: 0 },
  "Dimanche 18h": { dayOfWeek: 0, hour: 18, minute: 0 },
};

const RATE_LIMIT_MS = 2000; // 1 post per 2 seconds
const STATE_FILE = join(__dirname, ".post-state.json");

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function getNextDate(dayOfWeek, startFrom) {
  const d = new Date(startFrom);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d;
}

function toUnixTimestamp(date, hour, minute) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function formatPostText(post) {
  const lines = [];

  // Hook (slide 1) — clean up prefix
  lines.push(post.slides[0].replace(/^HOOK:\s*/i, ""));
  lines.push("");

  // Content slides (2 to N-1)
  for (let i = 1; i < post.slides.length - 1; i++) {
    lines.push(post.slides[i]);
    lines.push("");
  }

  lines.push("—");
  lines.push("");

  // CTA (last slide)
  lines.push(post.slides[post.slides.length - 1]);
  lines.push("");

  // Hashtags
  lines.push(post.hashtags);

  return lines.join("\n");
}

function loadState() {
  try {
    if (existsSync(STATE_FILE)) {
      return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    }
  } catch {
    // corrupted state — reset
  }
  return { posted: {} };
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════
// BUFFER API
// ═══════════════════════════════════════════════════

async function bufferCreateUpdate(text, scheduledAt, isDryRun) {
  if (isDryRun) {
    const date = new Date(scheduledAt * 1000);
    return {
      success: true,
      id: `dry-run-${Date.now()}`,
      scheduled_at: date.toISOString(),
    };
  }

  const params = new URLSearchParams();
  params.append("access_token", TOKEN);
  params.append("profile_ids[]", PROFILE_ID);
  params.append("text", text);
  params.append("scheduled_at", String(scheduledAt));

  const res = await fetch("https://api.bufferapp.com/1/updates/create.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Buffer API ${res.status}: ${errText}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(`Buffer rejected: ${JSON.stringify(data)}`);
  }

  return data;
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isAll = args.includes("--all");
  const dayIdx = args.indexOf("--day");

  // Parse --day argument
  let dayFilter = null;
  if (dayIdx !== -1 && args[dayIdx + 1]) {
    const dayArg = args[dayIdx + 1];
    if (dayArg.includes("-")) {
      const [start, end] = dayArg.split("-").map(Number);
      dayFilter = [];
      for (let d = start; d <= end; d++) dayFilter.push(d);
    } else {
      dayFilter = [Number(dayArg)];
    }
  }

  if (!isDryRun && !isAll && !dayFilter) {
    console.log("Buffer API Poster — Schedule LinkedIn posts via Buffer\n");
    console.log("Usage:");
    console.log("  --dry-run       Preview posts without scheduling");
    console.log("  --all           Schedule all 30 posts");
    console.log("  --day N         Schedule post for day N");
    console.log("  --day N-M       Schedule posts for days N through M");
    console.log("");
    console.log("Examples:");
    console.log("  node buffer-api-poster.mjs --dry-run");
    console.log("  node buffer-api-poster.mjs --all");
    console.log("  node buffer-api-poster.mjs --day 1");
    console.log("  node buffer-api-poster.mjs --day 1-5");
    process.exit(0);
  }

  // Validate config
  if (!isDryRun) {
    if (!TOKEN) {
      console.error("❌ BUFFER_ACCESS_TOKEN manquant dans .env.linkedin");
      process.exit(1);
    }
    if (!PROFILE_ID) {
      console.error("❌ BUFFER_PROFILE_ID manquant dans .env.linkedin");
      console.error("   Lancez: node get-buffer-profile-id.mjs");
      process.exit(1);
    }
  }

  // Load posts
  const posts = JSON.parse(
    readFileSync(join(__dirname, "posts.json"), "utf-8")
  );

  // Filter posts
  let selectedPosts = posts;
  if (dayFilter) {
    selectedPosts = posts.filter((p) => dayFilter.includes(p.day));
    if (!selectedPosts.length) {
      console.error(`❌ Aucun post trouvé pour jour(s) ${dayFilter.join(", ")}`);
      process.exit(1);
    }
  }

  // Load state
  const state = loadState();

  // Compute scheduled dates
  let cursor = new Date();
  const postSchedules = new Map();

  for (const post of posts) {
    const schedule = SCHEDULE_MAP[post.hour];
    if (!schedule) continue;
    cursor = getNextDate(schedule.dayOfWeek, cursor);
    postSchedules.set(post.day, {
      date: new Date(cursor),
      hour: schedule.hour,
      minute: schedule.minute,
    });
  }

  // Process
  console.log(isDryRun ? "🔍 DRY RUN — Aperçu sans poster\n" : "🚀 Scheduling posts via Buffer API\n");
  console.log(`📋 ${selectedPosts.length} post(s) à traiter\n`);
  console.log("═".repeat(60));

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of selectedPosts) {
    const sched = postSchedules.get(post.day);
    if (!sched) {
      console.log(`⚠️  Jour ${post.day}: heure "${post.hour}" non reconnue — skip`);
      skipped++;
      continue;
    }

    // Check if already posted
    if (!isDryRun && state.posted[post.day]) {
      console.log(`⏭️  Jour ${post.day}: déjà posté (${state.posted[post.day].id}) — skip`);
      skipped++;
      continue;
    }

    const text = formatPostText(post);
    const timestamp = toUnixTimestamp(sched.date, sched.hour, sched.minute);
    const dateStr = sched.date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    console.log("");
    console.log(`📝 Jour ${post.day}: ${post.title}`);
    console.log(`   📅 ${dateStr} à ${sched.hour}h${String(sched.minute).padStart(2, "0")}`);
    console.log(`   📊 Viralité: ${post.virality} | Type: ${post.type}`);
    console.log(`   📏 ${text.length} caractères`);

    if (isDryRun) {
      console.log(`   ✅ [DRY RUN] Serait programmé`);
      // Show first 120 chars of text
      const preview = text.slice(0, 120).replace(/\n/g, " ");
      console.log(`   📄 "${preview}..."`);
      success++;
      continue;
    }

    try {
      const result = await bufferCreateUpdate(text, timestamp, false);

      // Save state
      state.posted[post.day] = {
        id: result.updates?.[0]?.id || "unknown",
        scheduled_at: new Date(timestamp * 1000).toISOString(),
        posted_at: new Date().toISOString(),
      };
      saveState(state);

      console.log(`   ✅ Programmé ! (ID: ${state.posted[post.day].id})`);
      success++;

      // Rate limit
      if (selectedPosts.indexOf(post) < selectedPosts.length - 1) {
        await sleep(RATE_LIMIT_MS);
      }
    } catch (err) {
      console.error(`   ❌ Erreur: ${err.message}`);
      errors++;
    }
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("\n📊 Résumé :");
  console.log(`   ✅ Programmés : ${success}`);
  if (skipped) console.log(`   ⏭️  Ignorés    : ${skipped}`);
  if (errors) console.log(`   ❌ Erreurs    : ${errors}`);

  if (isDryRun) {
    console.log("\n💡 Pour programmer réellement :");
    console.log("   node scripts/linkedin/buffer-api-poster.mjs --all");
  }

  if (success > 0 && !isDryRun) {
    console.log("\n✅ Posts programmés dans Buffer !");
    console.log("   → Vérifiez sur https://publish.buffer.com");
  }
}

main().catch((err) => {
  console.error("❌ Erreur fatale:", err.message);
  process.exit(1);
});
