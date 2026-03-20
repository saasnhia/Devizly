/**
 * Generate voiceovers + word-level timings for Devizly ads.
 *
 * Usage:
 *   npx tsx src/remotion/scripts/generate-voiceover.ts
 *
 * Outputs per ad:
 *   public/ads/voiceovers/ad{n}.mp3          — audio file
 *   public/ads/voiceovers/ad{n}-timings.json — word-level timestamps
 *
 * Requires ELEVENLABS_API_KEY in .env.local
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("❌ ELEVENLABS_API_KEY not found in .env.local");
  process.exit(1);
}

const BASE_URL = "https://api.elevenlabs.io/v1";
const OUTPUT_DIR = path.resolve(process.cwd(), "public/ads/voiceovers");
const MODEL = "eleven_multilingual_v2";

const scripts: Record<string, string> = {
  ad1: "Tu perds quatre heures par semaine à faire tes devis manuellement... Copier-coller, mise en forme, PDF... C'est terminé. Avec Devizly, l'intelligence artificielle génère ton devis complet en deux minutes. Essaie gratuitement sur devizly point fr.",
  ad2: "Avant : Word, Excel, copier-coller, reformater... Après Devizly : un devis professionnel en deux clics. Signature électronique intégrée. Paiement Stripe direct. Tes clients adorent, toi aussi.",
  ad3: "Soixante-huit pourcent des freelances français ne relancent jamais leurs devis non signés. C'est de l'argent perdu. Devizly relance automatiquement tes clients. Ne laisse plus passer un seul devis.",
  ad4: "Ton client reçoit un lien. Il ouvre son téléphone. Il lit ton devis. Il signe en dix secondes. C'est ça, Devizly. La signature électronique la plus simple du marché.",
  ad5: "Freebe : quatre-vingt-dix-neuf euros par mois. Sellsy : cent-vingt euros. Devizly : dix-neuf euros. Même fonctionnalités. Cinq fois moins cher. Pourquoi payer plus ?",
  ad6: "Marc, artisan électricien à Lyon. Avant Devizly : il perdait des clients faute de devis rapides. Après : son taux de signature a augmenté de vingt pourcent en trois mois. Devizly, c'est son secret.",
  ad7: "Devis IA en deux minutes. Signature électronique. Paiement Stripe. Relances automatiques. Tout ça pour dix-neuf euros par mois. Crée ton compte gratuit maintenant sur devizly point fr.",
};

interface Voice {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
}

interface TimestampsResponse {
  audio_base64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
}

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

async function findFrenchVoice(): Promise<string> {
  console.log("🔍 Fetching available voices...");
  const res = await fetch(`${BASE_URL}/voices`, {
    headers: { "xi-api-key": API_KEY! },
  });
  if (!res.ok) throw new Error(`Failed to fetch voices: ${res.status}`);
  const data = (await res.json()) as { voices: Voice[] };

  const preferred = ["antoine", "liam", "thomas", "daniel", "adam"];
  for (const name of preferred) {
    const match = data.voices.find((v) => v.name.toLowerCase().includes(name));
    if (match) {
      console.log(`✅ Selected voice: "${match.name}" (${match.voice_id})`);
      return match.voice_id;
    }
  }

  const frenchVoice = data.voices.find(
    (v) => v.labels?.language === "fr" || v.labels?.accent === "french"
  );
  if (frenchVoice) {
    console.log(`✅ French voice: "${frenchVoice.name}" (${frenchVoice.voice_id})`);
    return frenchVoice.voice_id;
  }

  const first = data.voices[0];
  if (first) {
    console.log(`⚠️ Fallback voice: "${first.name}" (${first.voice_id})`);
    return first.voice_id;
  }
  throw new Error("No voices available");
}

/**
 * Convert character-level alignment data into word-level timings.
 */
function extractWordTimings(alignment: TimestampsResponse["alignment"]): WordTiming[] {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
  const words: WordTiming[] = [];
  let currentWord = "";
  let wordStart = -1;
  let wordEnd = 0;

  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i];
    const start = character_start_times_seconds[i];
    const end = character_end_times_seconds[i];

    if (ch === " " || ch === "\n") {
      if (currentWord.length > 0) {
        words.push({ word: currentWord, start: wordStart, end: wordEnd });
        currentWord = "";
        wordStart = -1;
      }
    } else {
      if (wordStart < 0) wordStart = start;
      currentWord += ch;
      wordEnd = end;
    }
  }
  // Last word
  if (currentWord.length > 0) {
    words.push({ word: currentWord, start: wordStart, end: wordEnd });
  }

  return words;
}

async function generateWithTimestamps(
  voiceId: string,
  text: string,
  mp3Path: string,
  timingsPath: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}/with-timestamps`, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as TimestampsResponse;

  // Save MP3
  const audioBuffer = Buffer.from(data.audio_base64, "base64");
  fs.writeFileSync(mp3Path, audioBuffer);

  // Extract and save word timings
  const words = extractWordTimings(data.alignment);
  const totalDuration = words.length > 0 ? words[words.length - 1].end : 0;

  fs.writeFileSync(
    timingsPath,
    JSON.stringify({ words, totalDuration }, null, 2)
  );
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const voiceId = await findFrenchVoice();

  const entries = Object.entries(scripts);
  for (let i = 0; i < entries.length; i++) {
    const [name, text] = entries[i];
    const mp3Path = path.join(OUTPUT_DIR, `${name}.mp3`);
    const timingsPath = path.join(OUTPUT_DIR, `${name}-timings.json`);

    // Skip if both files exist
    if (fs.existsSync(mp3Path) && fs.existsSync(timingsPath)) {
      const mp3Stat = fs.statSync(mp3Path);
      const timStat = fs.statSync(timingsPath);
      if (mp3Stat.size > 1000 && timStat.size > 100) {
        console.log(`⏭️  ${name} already complete, skipping`);
        continue;
      }
    }

    console.log(`🎙️  Generating ${name} with timings (${i + 1}/${entries.length})...`);
    try {
      await generateWithTimestamps(voiceId, text, mp3Path, timingsPath);
      const mp3Stat = fs.statSync(mp3Path);
      const timData = JSON.parse(fs.readFileSync(timingsPath, "utf-8"));
      console.log(`   ✅ ${name}.mp3 — ${(mp3Stat.size / 1024).toFixed(0)}KB, ${timData.words.length} words, ${timData.totalDuration.toFixed(1)}s`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err}`);
    }

    if (i < entries.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // Verification
  console.log("\n📦 Verification:");
  let allOk = true;
  for (const name of Object.keys(scripts)) {
    const mp3 = path.join(OUTPUT_DIR, `${name}.mp3`);
    const tim = path.join(OUTPUT_DIR, `${name}-timings.json`);
    const hasMp3 = fs.existsSync(mp3);
    const hasTim = fs.existsSync(tim);
    if (hasMp3 && hasTim) {
      const timData = JSON.parse(fs.readFileSync(tim, "utf-8"));
      console.log(`   ✅ ${name} — MP3 + ${timData.words.length} words (${timData.totalDuration.toFixed(1)}s)`);
    } else {
      console.log(`   ❌ ${name} — mp3:${hasMp3} timings:${hasTim}`);
      allOk = false;
    }
  }
  console.log(allOk ? "\n🎉 All voiceovers + timings generated!" : "\n⚠️ Some files missing.");
}

main().catch(console.error);
