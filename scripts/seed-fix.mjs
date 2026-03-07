/**
 * Clean up failed seed + re-insert missing quotes
 * Usage: node scripts/seed-fix.mjs
 */

import { createClient } from "@supabase/supabase-js";

import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const userId = "d5b34b28-475e-4798-8fd6-bd613a8fa750";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Delete all existing test data for this user (clean slate)
  console.log("Cleaning existing data...");
  await supabase.from("quote_items").delete().in(
    "quote_id",
    (await supabase.from("quotes").select("id").eq("user_id", userId)).data?.map(q => q.id) || []
  );
  await supabase.from("quotes").delete().eq("user_id", userId);
  await supabase.from("clients").delete().eq("user_id", userId);
  console.log("Cleaned.");

  // Re-run the fixed seed
  console.log("\nNow run: node scripts/seed-test-data.mjs");
}

main().catch(console.error);
