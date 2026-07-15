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
 * Targets: profiles where marketing_emails_opt_out IS NOT TRUE.
 *
 * Modes:
 *   - dry-run (default, or ?dry=true): counts recipients and lists their
 *     emails, sends nothing.
 *   - real send (?send=true): sends to every recipient, updates
 *     last_product_update_at on success, and continues past individual
 *     Resend failures (collected in failed[]).
 */

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

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

  const supabase = createServiceClient();
  const appUrl = getSiteUrl();
  const dashboardUrl = `${appUrl}/dashboard`;
  const pricingUrl = `${appUrl}/pricing`;
  const now = new Date();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .or("marketing_emails_opt_out.is.null,marketing_emails_opt_out.eq.false");

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

  const sent: string[] = [];
  const failed: { email: string; error: string }[] = [];

  for (const r of resolved) {
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
      continue;
    }

    await supabase
      .from("profiles")
      .update({ last_product_update_at: now.toISOString() })
      .eq("id", r.id);

    sent.push(r.email);
    console.log(`[ProductUpdate] Sent → ${r.email}`);
  }

  return NextResponse.json({
    mode,
    recipientCount: resolved.length,
    recipients: resolved.map((r) => r.email),
    sent,
    failed,
  });
}
