import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/url";
import { checkRateLimit } from "@/lib/ratelimit";

/**
 * GET /api/stripe/checkout-redirect?priceId=xxx
 * Creates a Stripe Checkout Session and redirects to it.
 * Used after Google OAuth signup with a plan selected.
 */
export async function GET(request: Request) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const priceId = searchParams.get("priceId");
  const appUrl = getSiteUrl();

  if (!priceId) {
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  // Whitelist valid price IDs
  const validPriceIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
  ].filter(Boolean);

  if (!validPriceIds.includes(priceId)) {
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/signup?plan=${priceId}`);
  }

  // Check if already subscribed
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_status === "pro" || profile?.subscription_status === "business") {
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  // Get or create Stripe customer
  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancel`,
    metadata: { supabase_user_id: user.id },
  });

  if (!session.url) {
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  return NextResponse.redirect(session.url);
}
