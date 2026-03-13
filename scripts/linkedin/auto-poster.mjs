/**
 * LinkedIn Auto-Poster for Devizly
 *
 * Posts content with images to LinkedIn via UGC API.
 * Supports posting as company page (LINKEDIN_ORG_URN) or personal profile.
 *
 * Setup:
 *   1. Run: node scripts/linkedin/linkedin-oauth-setup.mjs
 *   2. Verify .env.linkedin has LINKEDIN_ORG_URN for company page posting
 *
 * Usage:
 *   node scripts/linkedin/auto-poster.mjs --dry-run --day 1  # Preview
 *   node scripts/linkedin/auto-poster.mjs --day 1            # Post day 1
 *   node scripts/linkedin/auto-poster.mjs --post 1           # Alias
 *   node scripts/linkedin/auto-poster.mjs --no-images --day 1 # Text only
 *   node scripts/linkedin/auto-poster.mjs --cron             # Scheduler
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════

const POSTS_FILE = join(__dirname, "posts.json");
const STATE_FILE = join(__dirname, ".post-state.json");
const MARKETING_DIR = join(__dirname, "..", "..", "public", "marketing");

// Load env from .env.linkedin
const envFile = join(__dirname, ".env.linkedin");
if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
let LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN;
const LINKEDIN_ORG_URN = process.env.LINKEDIN_ORG_URN;

// Map post types to real screenshots in public/marketing/
const POST_IMAGES = {
  educatif: ["Dashboard final.png", "devis final form .png"],
  cas_usage: ["devis list.png", "pipeline.png"],
  storytelling: ["création IA devis .png", "devis client.png"],
  inspiration: ["Dashboard final.png", "stripe.png"],
};

// ═══════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════

function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  }
  return { lastPostedDay: 0, history: [] };
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════════════
// LINKEDIN API — Person URN resolution
// ═══════════════════════════════════════════════════

async function resolvePersonUrn() {
  if (LINKEDIN_PERSON_URN) return LINKEDIN_PERSON_URN;

  console.log("🔍 LINKEDIN_PERSON_URN non défini — auto-détection...");

  for (const endpoint of [
    "https://api.linkedin.com/v2/userinfo",
    "https://api.linkedin.com/v2/me",
  ]) {
    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}` },
      });
      if (res.ok) {
        const data = await res.json();
        const id = data.sub || data.id;
        if (id) {
          LINKEDIN_PERSON_URN = `urn:li:person:${id}`;
          console.log(`   ✅ Trouvé: ${LINKEDIN_PERSON_URN}`);
          return LINKEDIN_PERSON_URN;
        }
      }
    } catch {
      // try next
    }
  }

  throw new Error(
    "Impossible de détecter votre person URN.\n" +
    "Relancez: node scripts/linkedin/linkedin-oauth-setup.mjs"
  );
}

// ═══════════════════════════════════════════════════
// LINKEDIN API — Image upload via Assets API
// ═══════════════════════════════════════════════════

async function uploadImage(authorUrn, imagePath) {
  // Step 1: Register upload
  const registerBody = {
    registerUploadRequest: {
      recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
      owner: authorUrn,
      serviceRelationships: [
        {
          relationshipType: "OWNER",
          identifier: "urn:li:userGeneratedContent",
        },
      ],
    },
  };

  const filename = imagePath.split(/[/\\]/).pop();
  console.log(`   📸 Upload: ${filename}`);

  const regRes = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerBody),
    }
  );

  if (!regRes.ok) {
    const errText = await regRes.text();
    throw new Error(`Image register failed (${regRes.status}): ${errText}`);
  }

  const regData = await regRes.json();
  const uploadUrl =
    regData.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;
  const asset = regData.value.asset;

  // Step 2: Upload binary
  const imageBuffer = readFileSync(imagePath);

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      "Content-Type": "image/png",
    },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Image upload failed (${uploadRes.status}): ${errText}`);
  }

  console.log(`   ✅ Uploaded: ${asset}`);
  return asset;
}

// ═══════════════════════════════════════════════════
// LINKEDIN API — Post with images (UGC API)
// ═══════════════════════════════════════════════════

async function postToLinkedIn(text, imageAssets) {
  const authorUrn = LINKEDIN_ORG_URN || LINKEDIN_PERSON_URN;

  if (!authorUrn) {
    throw new Error(
      "Aucun author URN défini.\n" +
      "Relancez: node scripts/linkedin/linkedin-oauth-setup.mjs"
    );
  }

  const hasImages = imageAssets && imageAssets.length > 0;

  const shareContent = hasImages
    ? {
        shareCommentary: { text },
        shareMediaCategory: "IMAGE",
        media: imageAssets.map((asset, i) => ({
          status: "READY",
          media: asset,
          title: { text: `Devizly ${i + 1}` },
        })),
      }
    : {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      };

  const body = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": shareContent,
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  console.log(`\n📤 POST /v2/ugcPosts`);
  console.log(`   author: ${authorUrn}`);
  console.log(`   images: ${hasImages ? imageAssets.length : 0}`);
  console.log(`   text: ${text.slice(0, 80)}...`);

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`\n❌ LinkedIn API Error (${res.status}):`);
    console.error(`   Body: ${errText}`);

    if (res.status === 403) {
      console.error("\n💡 Vérifiez que :");
      if (authorUrn.includes("organization")) {
        console.error("   1. 'Community Management API' est activé dans votre app LinkedIn");
        console.error("   2. Le scope w_organization_social est autorisé");
        console.error("   3. Relancez linkedin-oauth-setup.mjs pour obtenir un token avec ce scope");
      } else {
        console.error("   1. 'Share on LinkedIn' est activé dans votre app");
      }
      console.error("   2. Le token n'est pas expiré");
      console.error(`   3. L'URN est correct : ${authorUrn}`);
    }

    throw new Error(`LinkedIn post failed: ${res.status} ${errText}`);
  }

  const result = await res.json();
  return { id: result.id || "OK" };
}

// ═══════════════════════════════════════════════════
// FIND IMAGES FOR POST
// ═══════════════════════════════════════════════════

function findImagesForPost(post) {
  const candidates = POST_IMAGES[post.type] || POST_IMAGES.educatif;
  const found = [];

  if (!existsSync(MARKETING_DIR)) return found;

  for (const filename of candidates) {
    const fullPath = join(MARKETING_DIR, filename);
    if (existsSync(fullPath)) {
      found.push(fullPath);
    }
  }

  // Fallback: first available PNG in marketing root
  if (found.length === 0) {
    try {
      const files = readdirSync(MARKETING_DIR).filter(
        (f) => f.endsWith(".png") && !f.includes("banner") && !f.includes("header")
      );
      if (files.length > 0) {
        found.push(join(MARKETING_DIR, files[0]));
      }
    } catch {
      // dir not readable
    }
  }

  return found;
}

// ═══════════════════════════════════════════════════
// FORMAT POST
// ═══════════════════════════════════════════════════

function formatPostText(post) {
  const lines = [];

  // Slide 1 = Hook
  lines.push(post.slides[0].replace(/^HOOK:\s*/i, ""));
  lines.push("");

  // Slides 2-4 = Content
  for (let i = 1; i < post.slides.length - 1; i++) {
    lines.push(post.slides[i]);
    lines.push("");
  }

  // Slide 5 = CTA
  lines.push("---");
  lines.push("");
  lines.push(post.slides[post.slides.length - 1]);
  lines.push("");

  // Hashtags
  lines.push(post.hashtags);

  return lines.join("\n");
}

// ═══════════════════════════════════════════════════
// SCHEDULING
// ═══════════════════════════════════════════════════

const SCHEDULE = [
  { day: 2, hour: 9, minute: 0 },   // Mardi 9h
  { day: 3, hour: 11, minute: 0 },  // Mercredi 11h
  { day: 4, hour: 14, minute: 0 },  // Jeudi 14h
  { day: 0, hour: 18, minute: 0 },  // Dimanche 18h
];

function getNextScheduledSlot() {
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const slot of SCHEDULE) {
    if (
      slot.day > currentDay ||
      (slot.day === currentDay && slot.hour * 60 + slot.minute > currentMinutes)
    ) {
      return slot;
    }
  }
  return SCHEDULE[0];
}

function msUntilNextSlot(slot) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(slot.hour, slot.minute, 0, 0);

  let daysAhead = slot.day - now.getDay();
  if (daysAhead < 0 || (daysAhead === 0 && target <= now)) {
    daysAhead += 7;
  }
  target.setDate(target.getDate() + daysAhead);

  return target.getTime() - now.getTime();
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isCron = args.includes("--cron");
const noImages = args.includes("--no-images");
const dayIdx = args.indexOf("--day") >= 0 ? args.indexOf("--day") : args.indexOf("--post");
const specificDay = dayIdx >= 0 ? parseInt(args[dayIdx + 1], 10) : null;

const posts = JSON.parse(readFileSync(POSTS_FILE, "utf-8"));
const state = loadState();

async function postNext(dayOverride) {
  const nextDay = dayOverride || state.lastPostedDay + 1;

  if (nextDay > posts.length) {
    console.log("✅ Tous les 30 posts ont été publiés !");
    return;
  }

  const post = posts.find((p) => p.day === nextDay);
  if (!post) {
    console.error(`❌ Post jour ${nextDay} introuvable`);
    return;
  }

  const text = formatPostText(post);
  const authorUrn = LINKEDIN_ORG_URN || LINKEDIN_PERSON_URN;

  console.log(`\n📅 JOUR ${post.day} — ${post.title}`);
  console.log(`🕒 ${post.hour} | 🔥 Viralité: ${post.virality}`);
  console.log(`📝 Type: ${post.type}`);
  console.log(`👤 Poster en tant que: ${authorUrn || "(non défini)"}`);
  console.log("─".repeat(50));
  console.log(text.slice(0, 500) + (text.length > 500 ? "\n..." : ""));
  console.log("─".repeat(50));

  // Find images
  const imageFiles = noImages ? [] : findImagesForPost(post);
  if (imageFiles.length > 0) {
    console.log(`📸 Images: ${imageFiles.map((f) => f.split(/[/\\]/).pop()).join(", ")}`);
  } else {
    console.log("📸 Aucune image (post texte uniquement)");
  }

  if (isDryRun) {
    console.log("\n🔍 DRY RUN — pas de publication");
    return;
  }

  if (!LINKEDIN_ACCESS_TOKEN) {
    console.error("❌ LINKEDIN_ACCESS_TOKEN manquant.");
    console.error("   Lancez: node scripts/linkedin/linkedin-oauth-setup.mjs");
    return;
  }

  // Auto-detect person URN if needed (only when not using org)
  if (!LINKEDIN_ORG_URN) {
    await resolvePersonUrn();
  }

  try {
    // Upload images
    const imageAssets = [];
    const postAuthor = LINKEDIN_ORG_URN || LINKEDIN_PERSON_URN;

    for (const imgPath of imageFiles) {
      try {
        const asset = await uploadImage(postAuthor, imgPath);
        imageAssets.push(asset);
        // Rate limit between uploads
        await new Promise((r) => setTimeout(r, 1000));
      } catch (imgErr) {
        console.warn(`   ⚠️  Image skip: ${imgErr.message}`);
      }
    }

    const result = await postToLinkedIn(text, imageAssets);
    console.log(`\n✅ Publié ! ID: ${result.id}`);

    state.lastPostedDay = nextDay;
    state.history.push({
      day: nextDay,
      postedAt: new Date().toISOString(),
      title: post.title,
    });
    saveState(state);
  } catch (err) {
    console.error(`\n❌ Erreur publication: ${err.message}`);
  }
}

if (isCron) {
  console.log("🤖 Devizly LinkedIn Auto-Poster — Mode CRON");
  console.log(`📊 Posts restants: ${posts.length - state.lastPostedDay}/${posts.length}`);
  console.log(`👤 Poster en tant que: ${LINKEDIN_ORG_URN || LINKEDIN_PERSON_URN || "(non défini)"}\n`);

  async function scheduleNext() {
    const slot = getNextScheduledSlot();
    const ms = msUntilNextSlot(slot);
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    console.log(
      `⏰ Prochain post: ${days[slot.day]} ${slot.hour}h${String(slot.minute).padStart(2, "0")} (dans ${Math.round(ms / 3600000)}h)`
    );

    setTimeout(async () => {
      await postNext();
      scheduleNext();
    }, ms);
  }

  scheduleNext();
} else {
  await postNext(specificDay);
}
