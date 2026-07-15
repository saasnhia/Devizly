import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resend } from "@/lib/resend";
import { productUpdateEmail } from "@/lib/emails/product-update";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";
import { getSiteUrl } from "@/lib/url";

/**
 * One-shot endpoint: product update announcement to all subscribers.
 * NOT a recurring cron — triggered manually once via curl.
 * Protected by CRON_SECRET header.
 *
 * Targets: profiles where marketing_emails_opt_out IS NOT TRUE AND
 * last_product_update_at IS NULL — the latter excludes anyone already
 * sent (both modes apply this filter so dry-run counts stay accurate).
 *
 * Modes:
 *   - dry-run (default, or ?dry=true): counts recipients and lists their
 *     emails, sends nothing.
 *   - real send (?send=true): sends to every recipient (throttled to
 *     stay under Resend's 10 req/s cap), updates last_product_update_at
 *     immediately after each success, and continues past individual
 *     failures (collected in failed[]) — except a daily-quota error,
 *     which stops the loop cleanly (see stoppedReason).
 *
 * Optional ?limit=N caps how many sends are attempted in this run, to
 * send in batches when the daily Resend quota is tight.
 */

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";
const SEND_DELAY_MS = 250; // Resend caps at 10 req/s — 4/s leaves margin
const QUOTA_ERROR_MARKER = "daily email sending quota";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  const { searchParams } = new URL(request.url);
  const send = searchParams.get("send") === "true";
  const mode = send ? "send" : "dry-run";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : null;

  const supabase = createServiceClient();
  const appUrl = getSiteUrl();
  const dashboardUrl = `${appUrl}/dashboard`;
  const pricingUrl = `${appUrl}/pricing`;

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .or("marketing_emails_opt_out.is.null,marketing_emails_opt_out.eq.false")
    .is("last_product_update_at", null);

  if (error) {
    console.error("[ProductUpdate] Query failed:", error);
    return NextResponse.json(
      { error: "Query failed", details: error.message },
      { status: 500 }
    );
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({
      mode,
      recipientCount: 0,
      recipients: [],
      sent: [],
      failed: [],
    });
  }

  // Resolve emails from auth.users (not exposed via RLS, service role required)
  const resolved: { id: string; email: string; fullName: string | null }[] = [];
  const unresolved: string[] = [];

  for (const profile of profiles) {
    const { data: authUser, error: authErr } =
      await supabase.auth.admin.getUserById(profile.id);
    if (authErr || !authUser?.user?.email) {
      unresolved.push(profile.id);
      continue;
    }
    resolved.push({
      id: profile.id,
      email: authUser.user.email,
      fullName: profile.full_name,
    });
  }

  if (mode === "dry-run") {
    return NextResponse.json({
      mode,
      recipientCount: resolved.length,
      recipients: resolved.map((r) => r.email),
      sent: [],
      failed: unresolved.length > 0 ? unresolved.map((id) => `${id}: no email`) : [],
    });
  }

  const batch =
    limit !== null && limit >= 0 ? resolved.slice(0, limit) : resolved;

  const sent: string[] = [];
  const failed: { email: string; error: string }[] = [];
  let stoppedReason: string | null = null;

  for (let i = 0; i < batch.length; i++) {
    const r = batch[i];
    const unsubscribeUrl = `${appUrl}/api/emails/unsubscribe?token=${signUnsubscribeToken(r.id)}`;

    const { subject, html } = productUpdateEmail({
      userName: r.fullName,
      unsubscribeUrl,
      dashboardUrl,
      pricingUrl,
    });

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: r.email,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (sendError) {
      console.error(`[ProductUpdate] Send failed for ${r.email}:`, sendError);
      failed.push({ email: r.email, error: sendError.message });

      if (sendError.message.includes(QUOTA_ERROR_MARKER)) {
        stoppedReason = "quota_exceeded";
        console.error(
          `[ProductUpdate] Daily quota hit — stopping. ${batch.length - i - 1} remaining unattempted.`
        );
        break;
      }

      await sleep(SEND_DELAY_MS);
      continue;
    }

    await supabase
      .from("profiles")
      .update({ last_product_update_at: new Date().toISOString() })
      .eq("id", r.id);

    sent.push(r.email);
    console.log(`[ProductUpdate] Sent → ${r.email}`);

    await sleep(SEND_DELAY_MS);
  }

  const attempted = sent.length + failed.length;
  const remaining = batch.length - attempted;

  return NextResponse.json({
    mode,
    recipientCount: resolved.length,
    recipients: resolved.map((r) => r.email),
    sent,
    failed,
    ...(stoppedReason
      ? { stoppedReason, remaining }
      : {}),
  });
}
