import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/url";
import { exchangeCodeForToken, getCompanyInfo, SuperPdpError } from "@/lib/superpdp/client";
import { encrypt } from "@/lib/crypto";

const STATE_COOKIE = "superpdp_oauth_state";

/**
 * GET /api/superpdp/callback
 * Finishes the authorization_code flow: verifies state, exchanges the
 * code, fetches the connected company's identity, and stores the
 * encrypted connection for the current user.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appUrl = getSiteUrl();

  const errorRedirect = (reason: string) =>
    NextResponse.redirect(`${appUrl}/parametres?superpdp=error&reason=${encodeURIComponent(reason)}`);

  const errorParam = searchParams.get("error");
  if (errorParam) {
    console.error("[superpdp/callback] SUPER PDP returned error:", errorParam);
    return errorRedirect(errorParam);
  }

  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  if (!code || !stateParam) {
    return errorRedirect("missing_code_or_state");
  }

  // Anti-CSRF: the state must match what /connect stored in the cookie.
  const cookieHeader = request.headers.get("cookie") || "";
  const stateCookieMatch = cookieHeader.match(
    new RegExp(`${STATE_COOKIE}=([^;]+)`)
  );
  const storedState = stateCookieMatch ? decodeURIComponent(stateCookieMatch[1]) : null;

  if (!storedState || storedState !== stateParam) {
    console.error("[superpdp/callback] State mismatch");
    return errorRedirect("state_mismatch");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const redirectUri = `${appUrl}/api/superpdp/callback`;

  try {
    const tokens = await exchangeCodeForToken(code, redirectUri);
    const company = await getCompanyInfo(tokens.accessToken);

    const { error: dbError } = await supabase
      .from("superpdp_connections")
      .upsert(
        {
          user_id: user.id,
          access_token_encrypted: encrypt(tokens.accessToken),
          refresh_token_encrypted: encrypt(tokens.refreshToken),
          expires_at: new Date(tokens.expiresAt).toISOString(),
          company_siren: company.number ?? null,
          company_number_scheme: company.number_scheme ?? null,
          company_name: (company.formal_name as string | undefined) ?? null,
          company_env: company.env ?? null,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (dbError) {
      console.error("[superpdp/callback] DB upsert failed:", dbError.message);
      return errorRedirect("db_error");
    }

    const res = NextResponse.redirect(`${appUrl}/parametres?superpdp=connected`);
    // Clear with the same path used when setting it in /connect, otherwise
    // the browser won't match it and the stale cookie lingers.
    res.cookies.set(STATE_COOKIE, "", { path: "/api/superpdp", maxAge: 0 });
    return res;
  } catch (err) {
    const isSuperPdp = err instanceof SuperPdpError;
    console.error(
      "[superpdp/callback] Failed:",
      err instanceof Error ? err.message : err,
      isSuperPdp ? err.responseBody : ""
    );
    return errorRedirect("exchange_failed");
  }
}
