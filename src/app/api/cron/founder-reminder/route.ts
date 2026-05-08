import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resend } from "@/lib/resend";
import { founderReminderEmail } from "@/lib/emails/founder-reminder";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";
import { getSiteUrl } from "@/lib/url";

/**
 * Cron endpoint: biweekly Founder offer reminder for free-plan users.
 * Vercel Cron schedule: "0 9 1,15 * *" (1st & 15th @ 09:00 UTC).
 * Protected by CRON_SECRET header.
 *
 * Targets: subscription_status='free', not opted-out, account >= 3 days old,
 *          not reminded in the last 13 days. Founders/Pro/Business excluded.
 */

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";
const MIN_ACCOUNT_AGE_DAYS = 3;
const MIN_DAYS_BETWEEN_REMINDERS = 13;
const FOUNDER_SEAT_CAP = 100;

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const appUrl = getSiteUrl();
  const pricingUrl = `${appUrl}/pricing`;
  const now = new Date();

  // Compute date thresholds
  const minAccountDate = new Date(
    now.getTime() - MIN_ACCOUNT_AGE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const reminderCutoff = new Date(
    now.getTime() - MIN_DAYS_BETWEEN_REMINDERS * 24 * 60 * 60 * 1000
  ).toISOString();

  // Count current founders for "remaining seats" copy
  const { count: founderCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_founder", true);
  const remainingSeats = Math.max(
    0,
    FOUNDER_SEAT_CAP - (founderCount ?? 0)
  );

  // If founder seats are gone, no point sending the reminder anymore
  if (remainingSeats === 0) {
    return NextResponse.json({
      sent: 0,
      skipped: "founder_seats_full",
    });
  }

  // Pull eligible free users + their email from auth.users via inner select
  // We use service role + a direct SELECT with auth.users join for email.
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, last_founder_reminder_at")
    .eq("subscription_status", "free")
    .or("marketing_emails_opt_out.is.null,marketing_emails_opt_out.eq.false")
    .or("is_founder.is.null,is_founder.eq.false")
    .lte("created_at", minAccountDate)
    .or(
      `last_founder_reminder_at.is.null,last_founder_reminder_at.lte.${reminderCutoff}`
    );

  if (error) {
    console.error("[FounderReminder] Query failed:", error);
    return NextResponse.json(
      { error: "Query failed", details: error.message },
      { status: 500 }
    );
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, message: "No eligible users" });
  }

  let totalSent = 0;
  const errors: string[] = [];

  for (const profile of profiles) {
    // Lookup email from auth.users (not exposed via RLS, service role required)
    const { data: authUser, error: authErr } =
      await supabase.auth.admin.getUserById(profile.id);
    if (authErr || !authUser?.user?.email) {
      errors.push(`${profile.id}: no email`);
      continue;
    }

    const unsubscribeUrl = `${appUrl}/api/emails/unsubscribe?token=${signUnsubscribeToken(profile.id)}`;

    const { subject, html } = founderReminderEmail({
      userName: profile.full_name,
      unsubscribeUrl,
      pricingUrl,
      remainingSeats,
    });

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: authUser.user.email,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (sendError) {
      console.error(
        `[FounderReminder] Send failed for ${authUser.user.email}:`,
        sendError
      );
      errors.push(`${authUser.user.email}: ${sendError.message}`);
      continue;
    }

    await supabase
      .from("profiles")
      .update({ last_founder_reminder_at: now.toISOString() })
      .eq("id", profile.id);

    totalSent++;
    console.log(
      `[FounderReminder] Sent → ${authUser.user.email} (remaining ${remainingSeats}/${FOUNDER_SEAT_CAP})`
    );
  }

  return NextResponse.json({
    sent: totalSent,
    candidates: profiles.length,
    remainingSeats,
    errors: errors.length > 0 ? errors : undefined,
  });
}
