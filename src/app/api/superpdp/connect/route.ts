import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/url";
import { getAuthorizationUrl } from "@/lib/superpdp/client";

const STATE_COOKIE = "superpdp_oauth_state";

/**
 * GET /api/superpdp/connect
 * Starts the SUPER PDP authorization_code flow: generates an anti-CSRF
 * state, stores it in a short-lived httpOnly cookie, and redirects to
 * SUPER PDP's hosted authorization/enrollment tunnel.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUrl = getSiteUrl();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_siret")
    .eq("id", user.id)
    .single();

  const state = randomBytes(24).toString("base64url");
  const redirectUri = `${appUrl}/api/superpdp/callback`;

  const siren = (profile?.company_siret || "").replace(/\s/g, "").slice(0, 9);

  const authUrl = getAuthorizationUrl({
    redirectUri,
    state,
    loginHint: user.email || undefined,
    // Prefill the company only when we have a plausible SIREN on file —
    // an incomplete/short value would just confuse the enrollment tunnel.
    companyNumber: siren.length === 9 ? siren : undefined,
    companyNumberScheme: siren.length === 9 ? "fr_siren" : undefined,
    // v1 default: Devizly only emits invoices. Most users already have a
    // PA for reception (their accountant, their bank) — forcing directory
    // registration risks the exact conflict NBHC hit with Tiime.
    sendAndReceive: "send",
  });

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    // Secure cookies aren't sent over plain http:// — required for the
    // devizly.fr redirect, but would silently break localhost:3000 dev.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes — plenty for an OAuth redirect round-trip
    path: "/api/superpdp",
  });
  return res;
}
