import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateDailyBriefing } from "@/lib/ai/daily-briefing";
import { briefingEmail } from "@/lib/emails/briefing";
import { resend } from "@/lib/resend";
import { getSiteUrl } from "@/lib/url";

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const appUrl = getSiteUrl();
  let totalSent = 0;
  const errors: string[] = [];

  // NOTE: Daily briefing available on all plans (free included).
  // Previously restricted to pro/business.
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, subscription_status")
    .not("subscription_status", "is", null);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, message: "No active users" });
  }

  for (const profile of profiles) {
    try {
      // Get user email from auth
      const { data: authData } = await supabase.auth.admin.getUserById(
        profile.id
      );
      const userEmail = authData?.user?.email;
      if (!userEmail) continue;

      // Generate briefing
      const briefing = await generateDailyBriefing(profile.id);

      // Build and send email
      const userName =
        profile.full_name || profile.company_name || "there";
      const { subject, html } = briefingEmail({
        userName,
        briefing,
        dashboardUrl: `${appUrl}/dashboard/briefing`,
      });

      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject,
        html,
      });

      if (sendError) {
        console.error(
          `[Briefing] Failed for ${userEmail}:`,
          sendError.message
        );
        errors.push(`${userEmail}: ${sendError.message}`);
        continue;
      }

      // Store the briefing for dashboard display
      await supabase.from("daily_briefings").insert({
        user_id: profile.id,
        summary: briefing.summary,
        actions: briefing.actions,
        stats: briefing.stats,
      });

      console.log(`[Briefing] Sent to ${userEmail}`);
      totalSent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[Briefing] Error for ${profile.id}:`, msg);
      errors.push(`${profile.id}: ${msg}`);
    }
  }

  return NextResponse.json({
    sent: totalSent,
    total: profiles.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
