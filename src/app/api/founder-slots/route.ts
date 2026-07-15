import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Public, unauthenticated: live founder-offer seat count, so marketing
 * pages (/pricing, landing, TopBar) can display a price that never
 * diverges from what /api/stripe/checkout actually charges. Mirrors the
 * same is_founder < 100 check used there.
 *
 * Cached for 60s at the edge (the count only ever climbs toward 100,
 * so a short cache is enough — see src/app/api/stats/public/route.ts
 * for the same pattern with a longer window).
 */

const FOUNDER_SEAT_CAP = 100;

export const revalidate = 60;

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_founder", true);

    if (error) throw error;

    const remaining = Math.max(0, FOUNDER_SEAT_CAP - (count ?? 0));
    return NextResponse.json({
      remaining,
      isFounderAvailable: remaining > 0,
    });
  } catch (err) {
    console.error("[FounderSlots] Query failed:", err);
    // Fail closed — on error, don't risk displaying a 9€ price the
    // checkout route (which fails the same way) wouldn't honor.
    return NextResponse.json({ remaining: 0, isFounderAvailable: false });
  }
}
