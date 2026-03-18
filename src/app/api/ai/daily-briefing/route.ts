import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDailyBriefing } from "@/lib/ai/daily-briefing";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const briefing = await generateDailyBriefing(user.id);

    // Store briefing
    await supabase.from("daily_briefings").insert({
      user_id: user.id,
      summary: briefing.summary,
      actions: briefing.actions,
      stats: briefing.stats,
    });

    return NextResponse.json({ success: true, briefing });
  } catch (error) {
    console.error("[daily-briefing] Error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
