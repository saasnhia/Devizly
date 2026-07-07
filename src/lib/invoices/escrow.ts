import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { escrowReleasedArtisanEmail, escrowReleasedClientEmail } from "@/lib/emails/escrow";
import { getNextInvoiceNumber } from "./invoice-number";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

interface CreateEscrowInvoiceParams {
  quoteId: string;
  userId: string;
  clientId: string | null;
  paymentIntentId: string | null;
  chargeId: string | null;
  amount: number;
  currency: string;
}

/**
 * Force-create (or update) the invoice row that carries escrow state for a
 * quote payment. Called synchronously from the Stripe webhook — unlike
 * tryAutoInvoice, this does NOT depend on the user's auto_invoice_on_payment
 * setting, because escrow has nowhere else to live.
 * Never throws — the webhook must still return 200 to Stripe on failure.
 */
export async function createEscrowInvoice(
  params: CreateEscrowInvoiceParams
): Promise<string | null> {
  const { quoteId, userId, clientId, paymentIntentId, chargeId, amount, currency } = params;

  try {
    const supabase = createServiceClient();

    // Anti-doublon: an invoice may already exist for this quote (e.g. webhook
    // retry, or auto_invoice_on_payment already created one for another reason).
    const { data: existing } = await supabase
      .from("invoices")
      .select("id, escrow_status")
      .eq("quote_id", quoteId)
      .single();

    if (existing) {
      // Already progressed past creation (held/released/disputed) — don't clobber.
      if (existing.escrow_status) return existing.id;

      await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: paymentIntentId,
          escrow_status: "held",
          escrow_charge_id: chargeId,
        })
        .eq("id", existing.id);
      return existing.id;
    }

    const invoiceNumber = await getNextInvoiceNumber(supabase, userId);
    const dueDate = new Date().toISOString().split("T")[0];

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        quote_id: quoteId,
        client_id: clientId,
        invoice_number: invoiceNumber,
        amount,
        currency,
        status: "paid",
        due_date: dueDate,
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntentId,
        escrow_status: "held",
        escrow_charge_id: chargeId,
      })
      .select("id")
      .single();

    if (error || !invoice) {
      console.error("[Escrow] Invoice creation failed:", error);
      return null;
    }

    return invoice.id;
  } catch (err) {
    console.error("[Escrow] createEscrowInvoice failed:", err);
    return null;
  }
}

export interface ReleaseEscrowResult {
  ok: boolean;
  error?: string;
  transferId?: string;
}

/**
 * Transfers escrowed funds from the platform account to the artisan's
 * connected Stripe account. Shared by the manual release route and the
 * 90-day auto-release cron.
 */
export async function releaseEscrowFunds(
  supabase: SupabaseClient,
  invoiceId: string,
  options?: { auto?: boolean }
): Promise<ReleaseEscrowResult> {
  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .select("id, user_id, quote_id, amount, currency, escrow_status, escrow_charge_id, invoice_number, clients(name, email)")
    .eq("id", invoiceId)
    .single();

  if (invErr || !invoice) {
    return { ok: false, error: "Facture introuvable" };
  }
  if (invoice.escrow_status !== "held") {
    return { ok: false, error: "Ce séquestre n'est plus en attente de libération" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_connect_status, email, company_name, full_name")
    .eq("id", invoice.user_id)
    .single();

  const hasConnect =
    profile?.stripe_account_id && profile.stripe_connect_status === "connected";

  if (!hasConnect) {
    return { ok: false, error: "Compte Stripe Connect introuvable ou non actif" };
  }

  const stripe = getStripe();
  let transferId: string;

  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(Number(invoice.amount) * 100),
      currency: (invoice.currency || "EUR").toLowerCase(),
      destination: profile!.stripe_account_id!,
      transfer_group: `escrow_${invoice.quote_id || invoice.id}`,
      ...(invoice.escrow_charge_id ? { source_transaction: invoice.escrow_charge_id } : {}),
    });
    transferId = transfer.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    return { ok: false, error: message };
  }

  await supabase
    .from("invoices")
    .update({
      escrow_status: "released",
      escrow_released_at: new Date().toISOString(),
      escrow_transfer_id: transferId,
    })
    .eq("id", invoiceId);

  // Notify both parties (non-blocking — the transfer already succeeded either way).
  const client = invoice.clients as unknown as { name: string; email: string | null } | null;
  const amountFmt = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: invoice.currency || "EUR",
  }).format(Number(invoice.amount));
  const artisanName = profile?.company_name || profile?.full_name || "Votre prestataire";

  if (profile?.email) {
    const { subject, html } = escrowReleasedArtisanEmail({
      amountFmt,
      invoiceNumber: invoice.invoice_number,
      auto: !!options?.auto,
    });
    resend.emails.send({ from: "Devizly <noreply@devizly.fr>", to: profile.email, subject, html }).then(() => {});
  }

  if (client?.email) {
    const { subject, html } = escrowReleasedClientEmail({
      amountFmt,
      invoiceNumber: invoice.invoice_number,
      artisanName,
    });
    resend.emails.send({ from: "Devizly <noreply@devizly.fr>", to: client.email, subject, html }).then(() => {});
  }

  return { ok: true, transferId };
}
