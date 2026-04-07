import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";
import { tryAutoInvoice } from "@/lib/invoices/auto-invoice";
import { createNotification } from "@/lib/notifications/create";
import { resend } from "@/lib/resend";
import { getSiteUrl } from "@/lib/url";
import type Stripe from "stripe";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function planFromPriceId(priceId: string): "pro" | "business" | "free" {
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO;
  const businessPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS || process.env.STRIPE_PRICE_BUSINESS;
  if (priceId === proPriceId) return "pro";
  if (priceId === businessPriceId) return "business";
  return "free";
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Invoice payment
      if (session.metadata?.invoice_payment === "true") {
        const invoiceNumber = session.metadata.invoice_number;
        if (invoiceNumber) {
          const { error: invErr } = await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: (session.payment_intent as string) || null,
            })
            .eq("invoice_number", invoiceNumber);
          if (invErr) console.error("[Webhook] Invoice update failed:", { invoiceNumber, error: invErr.message });
        }
        break;
      }

      // Connect payment for a quote
      if (session.metadata?.devizly_payment === "true") {
        const quoteId = session.metadata.quote_id;
        if (quoteId) {
          // Fetch user_id before update (needed for auto-invoice)
          const { data: quoteData } = await supabase
            .from("quotes")
            .select("user_id")
            .eq("id", quoteId)
            .single();

          const depositPercent = session.metadata?.deposit_percent
            ? parseInt(session.metadata.deposit_percent, 10)
            : null;

          const { error: quoteErr } = await supabase
            .from("quotes")
            .update({
              status: "payé",
              paid_at: new Date().toISOString(),
              stripe_payment_intent: (session.payment_intent as string) || null,
              updated_at: new Date().toISOString(),
              ...(depositPercent ? { deposit_paid_at: new Date().toISOString() } : {}),
            })
            .eq("id", quoteId);
          if (quoteErr) console.error("[Webhook] Quote payment update failed:", { quoteId, error: quoteErr.message });

          // Automation: auto-generate paid invoice receipt (non-blocking)
          if (quoteData?.user_id) {
            tryAutoInvoice("payment", {
              quoteId,
              userId: quoteData.user_id,
              markAsPaid: true,
            });

            // In-app notification (non-blocking, fire-and-forget)
            const sessionCurrency = (session.currency || "eur").toUpperCase();
            const amountTotal = session.amount_total
              ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: sessionCurrency }).format(session.amount_total / 100)
              : null;
            createNotification({
              userId: quoteData.user_id,
              type: "payment",
              title: "Paiement reçu",
              message: amountTotal ?? `Devis ${quoteId}`,
              link: "/dashboard/factures",
            }).then(() => {});

            // Email freelance: payment received (non-blocking)
            (async () => {
              try {
                const { data: quote } = await supabase
                  .from("quotes")
                  .select("number, title, total_ttc, currency, client_id, clients(name)")
                  .eq("id", quoteId)
                  .single();
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("email, company_name")
                  .eq("id", quoteData.user_id)
                  .single();
                if (!profile?.email || !quote) return;
                const quoteRef = `DEV-${String(quote.number).padStart(4, "0")}`;
                const clientName = (quote.clients as unknown as { name: string } | null)?.name ?? "votre client";
                const quoteCurrency = (quote as Record<string, unknown>).currency as string || "EUR";
                const amount = amountTotal ?? new Intl.NumberFormat("fr-FR", { style: "currency", currency: quoteCurrency }).format(Number(quote.total_ttc));
                const appUrl = getSiteUrl();
                await resend.emails.send({
                  from: "Devizly <noreply@devizly.fr>",
                  to: profile.email,
                  subject: `Paiement reçu — ${quoteRef} (${amount})`,
                  html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr><td style="background:#22C55E;padding:24px 32px;"><span style="color:#FFFFFF;font-size:20px;font-weight:700;">Devizly</span></td></tr>
    <tr><td style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonne nouvelle !</p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        <strong>${clientName}</strong> a réglé le devis <strong>${quoteRef} — ${quote.title}</strong> pour un montant de <strong>${amount}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Le paiement a été traité par Stripe et sera viré sur votre compte connecté.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td align="center">
          <a href="${appUrl}/dashboard/factures" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Voir mes factures</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
      <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-align:center;">Cet email a été envoyé automatiquement par Devizly.</p>
      <p style="margin:0;font-size:10px;color:#CBD5E1;text-align:center;">NBHC SAS — 55 Rue Henri Clément, 71100 Saint-Rémy — SIREN 102 637 899</p>
    </td></tr>
  </table>
</body>
</html>`,
                });
              } catch { /* non-blocking */ }
            })();
          }
        }
        break;
      }

      // Subscription checkout
      const userId = session.metadata?.supabase_user_id;
      if (!userId || !session.subscription) break;

      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      );
      const priceId = subscription.items.data[0]?.price?.id || "";
      const plan = planFromPriceId(priceId);

      const { error: subErr } = await supabase
        .from("profiles")
        .update({
          subscription_status: plan,
          subscription_id: subscription.id,
          stripe_customer_id: session.customer as string,
        })
        .eq("id", userId);
      if (subErr) console.error("[Webhook] Subscription activation failed:", { userId, plan, error: subErr.message });

      // Founder badge (first 100 paying subscribers)
      if (plan !== "free") {
        try {
          const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("is_founder", true);

          if ((count ?? 0) < 100) {
            const founderNumber = (count ?? 0) + 1;
            await supabase
              .from("profiles")
              .update({
                is_founder: true,
                founder_number: founderNumber,
              })
              .eq("id", userId);
            console.log(`[FOUNDER] User ${userId} est le fondateur #${founderNumber}`);

            // Apply FONDATEUR coupon to the subscription
            try {
              if (subscription.id) {
                await getStripe().subscriptions.update(subscription.id, {
                  discounts: [{ coupon: "FONDATEUR" }],
                });
                console.log(`[FOUNDER] Coupon FONDATEUR appliqué à ${subscription.id}`);
              }
            } catch (couponErr) {
              console.error("[FOUNDER] Erreur application coupon:", couponErr);
            }
          }
        } catch (founderErr) {
          console.error("[Webhook] Founder badge failed:", founderErr);
        }
      }

      // Referral reward (1 month credit to referrer)
      if (plan !== "free") {
        try {
          const { data: referral } = await supabase
            .from("referrals")
            .select("referrer_id, status")
            .eq("referred_id", userId)
            .eq("status", "pending")
            .single();

          if (referral) {
            const { data: referrer } = await supabase
              .from("profiles")
              .select("stripe_customer_id, email")
              .eq("id", referral.referrer_id)
              .single();

            if (referrer?.stripe_customer_id) {
              const stripe = getStripe();
              await stripe.customers.createBalanceTransaction(
                referrer.stripe_customer_id,
                {
                  amount: -1900, // -19€ = 1 mois Pro offert
                  currency: "eur",
                  description: "Parrainage Devizly — 1 mois offert",
                }
              );
            }

            await supabase
              .from("referrals")
              .update({
                status: "completed",
                rewarded_at: new Date().toISOString(),
              })
              .eq("referred_id", userId);

            console.log(`[REFERRAL] Parrain ${referrer?.email} récompensé pour avoir parrainé ${userId}`);
          }
        } catch (refErr) {
          console.error("[Webhook] Referral reward failed:", refErr);
        }
      }

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price?.id || "";
      const plan = subscription.status === "active"
        ? planFromPriceId(priceId)
        : "free";

      const { error: updErr } = await supabase
        .from("profiles")
        .update({
          subscription_status: plan,
          subscription_id: subscription.id,
        })
        .eq("stripe_customer_id", customerId);
      if (updErr) console.error("[Webhook] Subscription update failed:", { customerId, plan, error: updErr.message });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { error: delErr } = await supabase
        .from("profiles")
        .update({
          subscription_status: "free",
          subscription_id: null,
          devis_used: 0,
        })
        .eq("stripe_customer_id", customerId);
      if (delErr) console.error("[Webhook] Subscription deletion failed:", { customerId, error: delErr.message });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      if (!customerId) break;

      // Find user by Stripe customer ID
      const { data: failedProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("stripe_customer_id", customerId)
        .single();

      if (failedProfile) {
        // Notify user in-app
        createNotification({
          userId: failedProfile.id,
          type: "system",
          title: "Échec de paiement",
          message: "Votre paiement d'abonnement a échoué. Mettez à jour votre moyen de paiement.",
          link: "/parametres",
        }).then(() => {});

        // Send email notification (non-blocking)
        if (failedProfile.email) {
          const appUrl = getSiteUrl();
          resend.emails.send({
            from: "Devizly <noreply@devizly.fr>",
            to: failedProfile.email,
            subject: "Échec de paiement — Action requise",
            html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr><td style="background:#DC2626;padding:24px 32px;"><span style="color:#FFFFFF;font-size:20px;font-weight:700;">Devizly</span></td></tr>
    <tr><td style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Problème de paiement</p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Votre paiement d'abonnement Devizly a échoué. Veuillez mettre à jour votre moyen de paiement pour conserver l'accès à vos fonctionnalités Pro/Business.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td align="center">
          <a href="${appUrl}/parametres" style="display:inline-block;background:#6366F1;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Mettre à jour mon paiement</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
      <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-align:center;">Cet email a été envoyé automatiquement par Devizly.</p>
      <p style="margin:0;font-size:10px;color:#CBD5E1;text-align:center;">NBHC SAS — 55 Rue Henri Clément, 71100 Saint-Rémy — SIREN 102 637 899</p>
    </td></tr>
  </table>
</body>
</html>`,
          }).then(() => {});
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
