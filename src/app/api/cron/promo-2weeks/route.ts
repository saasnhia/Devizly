import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resend } from "@/lib/resend";
import { promo2WeeksEmail } from "@/lib/emails/promo-2weeks";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";
import { getSiteUrl } from "@/lib/url";
import { issuePromoCode, buildPromoUrl } from "@/lib/promo";

/**
 * Cron : campagne promo "2 Semaines Offertes" pour les users gratuits.
 * Vercel Cron schedule : "0 8 1,28 * *" (1er & 28 du mois @ 08:00 UTC).
 * Protege par CRON_SECRET (header Authorization Bearer).
 *
 * Cibles : subscription_status='free', non desinscrits, compte >= 7 jours,
 *          n'ayant jamais redeem de promo, et pas relances depuis 30 jours.
 */

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";
const MIN_ACCOUNT_AGE_DAYS = 7;
const MIN_DAYS_BETWEEN_PROMOS = 30;

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
  const now = new Date();

  const minAccountDate = new Date(
    now.getTime() - MIN_ACCOUNT_AGE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const promoCutoff = new Date(
    now.getTime() - MIN_DAYS_BETWEEN_PROMOS * 24 * 60 * 60 * 1000
  ).toISOString();

  // Users gratuits eligibles. Chaque .or() est combine en AND avec les autres.
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("subscription_status", "free")
    .or("marketing_emails_opt_out.is.null,marketing_emails_opt_out.eq.false")
    .or("promo_redeemed.is.null,promo_redeemed.eq.false")
    .lte("created_at", minAccountDate)
    .or(`last_promo_sent_at.is.null,last_promo_sent_at.lte.${promoCutoff}`);

  if (error) {
    console.error("[Promo2Weeks] Query failed:", error);
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
    if (!profile.email) {
      errors.push(`${profile.id}: no email`);
      continue;
    }

    try {
      const { code, expiresAt } = await issuePromoCode(supabase, profile.id);
      const promoUrl = buildPromoUrl(appUrl, code, expiresAt);
      const unsubscribeUrl = `${appUrl}/api/emails/unsubscribe?token=${signUnsubscribeToken(profile.id)}`;

      const { subject, html } = promo2WeeksEmail({
        userName: profile.full_name,
        code,
        promoUrl,
        unsubscribeUrl,
      });

      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: profile.email,
        subject,
        html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (sendError) {
        console.error(
          `[Promo2Weeks] Send failed for ${profile.email}:`,
          sendError
        );
        errors.push(`${profile.email}: ${sendError.message}`);
        continue;
      }

      await supabase
        .from("profiles")
        .update({ last_promo_sent_at: now.toISOString() })
        .eq("id", profile.id);

      totalSent++;
      console.log(`[Promo2Weeks] Sent → ${profile.email} (code ${code})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown error";
      console.error(`[Promo2Weeks] Failed for ${profile.id}:`, msg);
      errors.push(`${profile.id}: ${msg}`);
    }
  }

  return NextResponse.json({
    sent: totalSent,
    candidates: profiles.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
