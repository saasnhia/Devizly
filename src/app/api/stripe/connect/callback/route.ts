import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // supabase user id
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  console.log("[Stripe Callback] Params:", {
    code: code ? code.substring(0, 10) + "..." : null,
    state,
    error: errorParam,
    error_description: errorDesc,
    all: searchParams.toString(),
  });

  if (errorParam) {
    console.error("[Stripe Callback] Stripe returned error:", errorParam, errorDesc);
    return NextResponse.redirect(
      `${appUrl}/parametres?stripe=error&reason=${encodeURIComponent(errorParam)}`
    );
  }

  if (!code) {
    console.error("[Stripe Callback] No code in params");
    return NextResponse.redirect(`${appUrl}/parametres?stripe=error&reason=no_code`);
  }

  if (!state) {
    console.error("[Stripe Callback] No state (userId) in params");
    return NextResponse.redirect(`${appUrl}/parametres?stripe=error&reason=no_state`);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("[Stripe Callback] STRIPE_SECRET_KEY not set");
    return NextResponse.redirect(`${appUrl}/parametres?stripe=error&reason=no_secret_key`);
  }

  try {
    // Exchange authorization code for connected account
    console.log("[Stripe Callback] Exchanging code for token...");
    const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_secret: secretKey,
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    console.log("[Stripe Callback] Token response:", {
      ok: tokenRes.ok,
      status: tokenRes.status,
      has_error: !!tokenData.error,
      error: tokenData.error,
      error_description: tokenData.error_description,
      stripe_user_id: tokenData.stripe_user_id || null,
    });

    if (tokenData.error || !tokenData.stripe_user_id) {
      return NextResponse.redirect(
        `${appUrl}/parametres?stripe=error&reason=${encodeURIComponent(tokenData.error || "no_user_id")}`
      );
    }

    const accountId = tokenData.stripe_user_id as string;

    // Check account readiness
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(accountId);
    const isReady = account.charges_enabled && account.payouts_enabled;

    console.log("[Stripe Callback] Account status:", {
      accountId,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      isReady,
    });

    // Save to profile
    const service = createServiceClient();
    const { error: dbError } = await service
      .from("profiles")
      .update({
        stripe_account_id: accountId,
        stripe_connect_status: isReady ? "connected" : "pending",
      })
      .eq("id", state);

    if (dbError) {
      console.error("[Stripe Callback] DB update error:", dbError);
    }

    return NextResponse.redirect(
      `${appUrl}/parametres?stripe=${isReady ? "success" : "pending"}`
    );
  } catch (err) {
    console.error("[Stripe Callback] Exception:", err);
    return NextResponse.redirect(`${appUrl}/parametres?stripe=error&reason=exception`);
  }
}
