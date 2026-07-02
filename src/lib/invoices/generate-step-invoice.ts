import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/url";
import type Stripe from "stripe";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

interface GenerateStepInvoiceResult {
  invoice: {
    id: string;
    invoice_number: string;
    amount: number;
    stripe_checkout_url: string | null;
  };
}

/**
 * Generates an invoice for a single payment_schedule step (BTP échéancier
 * — "Facturer cette étape"). Mirrors generate-invoice.ts's Stripe/Connect
 * pattern but bills the step's amount as a single line item labeled with
 * its position ("Acompte 1/3 — 30%") instead of the quote's line items.
 */
export async function generateStepInvoice(
  quoteId: string,
  userId: string,
  stepId: string
): Promise<GenerateStepInvoiceResult> {
  const supabase = createServiceClient();

  const { data: step, error: stepError } = await supabase
    .from("payment_schedule")
    .select("*")
    .eq("id", stepId)
    .eq("quote_id", quoteId)
    .eq("user_id", userId)
    .single();

  if (stepError || !step) {
    throw new Error("Étape introuvable");
  }
  if (step.invoice_id) {
    throw new Error("Cette étape a déjà été facturée");
  }
  if (step.status !== "pending") {
    throw new Error("Seule une étape en attente peut être facturée");
  }

  const { data: allSteps } = await supabase
    .from("payment_schedule")
    .select("id, position")
    .eq("quote_id", quoteId)
    .order("position", { ascending: true });

  const total = allSteps?.length || 1;
  const position = allSteps?.findIndex((s) => s.id === stepId);
  const positionLabel = position !== undefined && position >= 0 ? position + 1 : step.position;

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*, clients(*)")
    .eq("id", quoteId)
    .eq("user_id", userId)
    .single();

  if (quoteError || !quote) {
    throw new Error("Devis introuvable");
  }

  const client = Array.isArray(quote.clients) ? quote.clients[0] : quote.clients;
  const clientEmail = client?.email || null;

  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${year}-01-01`)
    .lt("created_at", `${year + 1}-01-01`);

  const seq = (count || 0) + 1;
  const invoiceNumber = `INV-${year}-${String(seq).padStart(3, "0")}`;

  const dueDate = step.due_date || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  })();

  const stepLabel = `${step.label} ${positionLabel}/${total} — ${Number(step.percentage)}%`;

  const stripe = getStripe();
  const appUrl = getSiteUrl();
  const stripeCurrency = (quote.currency || "EUR").toLowerCase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_connect_status")
    .eq("id", userId)
    .single();

  const hasConnect =
    profile?.stripe_account_id && profile.stripe_connect_status === "connected";

  let stripeCheckoutUrl: string | null = null;

  try {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: { name: stepLabel },
            unit_amount: Math.round(Number(step.amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/dashboard/factures?paid=${invoiceNumber}`,
      cancel_url: `${appUrl}/dashboard/factures`,
      metadata: {
        invoice_payment: "true",
        quote_id: quoteId,
        invoice_number: invoiceNumber,
        payment_schedule_step_id: stepId,
      },
      payment_intent_data: {
        metadata: { quote_id: quoteId, invoice_number: invoiceNumber, payment_schedule_step_id: stepId },
      },
    };

    if (clientEmail) {
      sessionConfig.customer_email = clientEmail;
    }

    const session = hasConnect
      ? await stripe.checkout.sessions.create(sessionConfig, {
          stripeAccount: profile!.stripe_account_id!,
        })
      : await stripe.checkout.sessions.create(sessionConfig);

    stripeCheckoutUrl = session.url;
  } catch (stripeErr) {
    console.error("[Step Invoice] Stripe checkout creation failed:", stripeErr);
    throw new Error("Erreur Stripe lors de la création du paiement");
  }

  const { data: invoice, error: insertError } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      quote_id: quoteId,
      client_id: quote.client_id,
      invoice_number: invoiceNumber,
      amount: Number(step.amount),
      currency: quote.currency || "EUR",
      status: "draft",
      due_date: dueDate,
      stripe_checkout_url: stripeCheckoutUrl,
    })
    .select("id, invoice_number, amount, stripe_checkout_url")
    .single();

  if (insertError || !invoice) {
    throw new Error("Erreur insertion facture");
  }

  await supabase
    .from("payment_schedule")
    .update({ invoice_id: invoice.id })
    .eq("id", stepId);

  return { invoice };
}
