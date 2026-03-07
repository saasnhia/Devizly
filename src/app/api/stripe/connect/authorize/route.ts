import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!user) {
    console.error("[Stripe Connect] No authenticated user");
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
  if (!clientId) {
    console.error("[Stripe Connect] STRIPE_CONNECT_CLIENT_ID not set");
    return NextResponse.redirect(`${appUrl}/parametres?stripe=error&reason=no_client_id`);
  }

  const redirectUri = `${appUrl}/api/stripe/connect/callback`;
  console.log("[Stripe Connect] Authorize →", {
    clientId: clientId.substring(0, 10) + "...",
    redirectUri,
    userId: user.id,
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: redirectUri,
    state: user.id,
    "stripe_user[email]": user.email || "",
    "stripe_user[country]": "FR",
  });

  const stripeUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(stripeUrl);
}
