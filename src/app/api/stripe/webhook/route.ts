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
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  return "free";
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
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
          await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: (session.payment_intent as string) || null,
            })
            .eq("invoice_number", invoiceNumber);
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
            ? parseInt(session.metadata.deposit_percent)
            : null;

          await supabase
            .from("quotes")
            .update({
              status: "payé",
              paid_at: new Date().toISOString(),
              stripe_payment_intent: (session.payment_intent as string) || null,
              updated_at: new Date().toISOString(),
              ...(depositPercent ? { deposit_paid_at: new Date().toISOString() } : {}),
            })
            .eq("id", quoteId);

          // Automation: auto-generate paid invoice receipt (non-blocking)
          if (quoteData?.user_id) {
            tryAutoInvoice("payment", {
              quoteId,
              userId: quoteData.user_id,
              markAsPaid: true,
            });

            // In-app notification (non-blocking, fire-and-forget)
            const amountTotal = session.amount_total
              ? `${(session.amount_total / 100).toFixed(2)} €`
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
                  .select("number, title, total_ttc, client_id, clients(name)")
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
                const amount = amountTotal ?? `${Number(quote.total_ttc).toFixed(2)} €`;
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
      <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">Cet email a été envoyé automatiquement par Devizly.</p>
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

      await supabase
        .from("profiles")
        .update({
          subscription_status: plan,
          subscription_id: subscription.id,
          stripe_customer_id: session.customer as string,
        })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price?.id || "";
      const plan = subscription.status === "active"
        ? planFromPriceId(priceId)
        : "free";

      await supabase
        .from("profiles")
        .update({
          subscription_status: plan,
          subscription_id: subscription.id,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from("profiles")
        .update({
          subscription_status: "free",
          subscription_id: null,
          devis_used: 0,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
