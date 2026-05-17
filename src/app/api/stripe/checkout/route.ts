import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/url";
import { checkRateLimit } from "@/lib/ratelimit";
import { PROMO_CAMPAIGN, PROMO_TRIAL_DAYS } from "@/lib/promo";

export async function POST(request: Request) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { priceId, promoCode } = await request.json();

  if (!priceId) {
    return NextResponse.json({ error: "priceId requis" }, { status: 400 });
  }

  // Whitelist valid price IDs to prevent arbitrary subscription creation
  const validPriceIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
  ].filter(Boolean);

  if (!validPriceIds.includes(priceId)) {
    return NextResponse.json({ error: "priceId invalide" }, { status: 400 });
  }

  try {
    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

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

    const appUrl = getSiteUrl();

    // Determine coupon: PARRAIN50 for referrals, FONDATEUR if slots remain
    let discount: Array<{ coupon: string }> | null = null;
    try {
      const { data: referral } = await supabase
        .from("referrals")
        .select("id")
        .eq("referred_id", user.id)
        .eq("status", "pending")
        .single();

      if (referral) {
        discount = [{ coupon: "PARRAIN50" }];
      } else {
        const { count: founderCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_founder", true);
        if ((founderCount ?? 0) < 100) {
          discount = [{ coupon: "FONDATEUR" }];
        }
      }
    } catch {
      // Non-blocking — proceed without coupon
    }

    // Promo "2 semaines offertes" : si un code valide est fourni, la
    // subscription demarre avec 14 jours d'essai gratuit (trial_period_days).
    // Validation server-side sur la table promo_codes — la RLS garantit
    // que l'utilisateur ne peut valider que SES propres codes.
    let trialDays: number | undefined;
    let validatedPromoCode: string | undefined;
    if (typeof promoCode === "string" && promoCode.trim()) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("code, campaign, expires_at, redeemed_at")
        .eq("code", promoCode.trim())
        .maybeSingle();

      if (
        promo &&
        promo.campaign === PROMO_CAMPAIGN &&
        !promo.redeemed_at &&
        new Date(promo.expires_at).getTime() > Date.now()
      ) {
        trialDays = PROMO_TRIAL_DAYS;
        validatedPromoCode = promo.code;
      }
      // Code invalide/expire/deja utilise : on poursuit sans essai (graceful).
    }

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancel`,
      metadata: {
        supabase_user_id: user.id,
        ...(validatedPromoCode ? { promo_code: validatedPromoCode } : {}),
      },
      ...(discount ? { discounts: discount } : {}),
      ...(trialDays
        ? { subscription_data: { trial_period_days: trialDays } }
        : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe Checkout]", err);
    return NextResponse.json({ error: "Impossible de créer la session de paiement" }, { status: 500 });
  }
}
