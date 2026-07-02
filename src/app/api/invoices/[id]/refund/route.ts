import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";

const VALID_REASONS = [
  "Chantier annulé",
  "Litige client",
  "Erreur de facturation",
  "Autre",
];

/**
 * POST /api/invoices/[id]/refund
 * Body: { amount?: number, reason: string }
 * Full refund if `amount` is omitted, partial otherwise.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { amount, reason } = body as { amount?: number; reason?: string };

  if (!reason || !VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Motif de remboursement requis" }, { status: 400 });
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, currency, status, stripe_payment_intent_id, refunded_amount, clients(name, email)")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  if (invoice.status !== "paid" && invoice.status !== "partially_refunded") {
    return NextResponse.json(
      { error: "Seule une facture payée peut être remboursée" },
      { status: 400 }
    );
  }

  if (!invoice.stripe_payment_intent_id) {
    return NextResponse.json(
      { error: "Aucun paiement Stripe associé à cette facture" },
      { status: 400 }
    );
  }

  const invoiceAmount = Number(invoice.amount);
  const alreadyRefunded = Number(invoice.refunded_amount) || 0;
  const remaining = Math.round((invoiceAmount - alreadyRefunded) * 100) / 100;

  const isPartial = amount !== undefined && amount !== null;
  let refundAmount = remaining;

  if (isPartial) {
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }
    if (amount > remaining) {
      return NextResponse.json(
        { error: `Le montant dépasse ce qui reste remboursable (${remaining} ${invoice.currency || "EUR"})` },
        { status: 400 }
      );
    }
    refundAmount = amount;
  }

  // Connect accounts hold the PaymentIntent in their own namespace — the
  // refund call must target the same connected account the charge was
  // made on, or Stripe returns "No such payment_intent".
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_connect_status")
    .eq("id", user.id)
    .single();

  const hasConnect =
    profile?.stripe_account_id && profile.stripe_connect_status === "connected";

  const stripe = getStripe();
  const isFullRemaining = Math.round(refundAmount * 100) === Math.round(remaining * 100);

  try {
    await stripe.refunds.create(
      {
        payment_intent: invoice.stripe_payment_intent_id,
        // Omit `amount` for a full refund of what's left — Stripe refunds
        // the entire remaining captured amount in that case.
        ...(isFullRemaining ? {} : { amount: Math.round(refundAmount * 100) }),
        reason: "requested_by_customer",
        metadata: { invoice_id: invoiceId, refund_reason: reason },
      },
      hasConnect ? { stripeAccount: profile!.stripe_account_id! } : undefined
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const newRefundedTotal = Math.round((alreadyRefunded + refundAmount) * 100) / 100;
  const newStatus = newRefundedTotal >= invoiceAmount ? "refunded" : "partially_refunded";

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      status: newStatus,
      refunded_amount: newRefundedTotal,
      refund_reason: reason,
    })
    .eq("id", invoiceId);

  if (updateError) {
    // Stripe refund already succeeded — surface the DB error but don't
    // pretend the refund itself failed.
    console.error("[Refund] DB update failed after successful Stripe refund:", updateError);
    return NextResponse.json(
      { error: "Remboursement Stripe effectué, mais la mise à jour de la facture a échoué" },
      { status: 500 }
    );
  }

  // Notify the client (non-blocking — refund already succeeded either way)
  const client = invoice.clients as unknown as { name: string; email: string | null } | null;
  if (client?.email) {
    const refundAmountFmt = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: invoice.currency || "EUR",
    }).format(refundAmount);

    resend.emails.send({
      from: "Devizly <noreply@devizly.fr>",
      to: client.email,
      subject: `Remboursement de votre facture ${invoice.invoice_number}`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr><td style="background:#6366F1;padding:24px 32px;"><span style="color:#FFFFFF;font-size:20px;font-weight:700;">Devizly</span></td></tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${client.name},</p>
        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
          Un remboursement de <strong>${refundAmountFmt}</strong> a été effectué pour la facture
          <strong>${invoice.invoice_number}</strong>.
        </p>
        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
          Motif : <strong>${reason}</strong>
        </p>
        <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">
          Le montant sera recrédité sur votre moyen de paiement sous 5 à 10 jours ouvrés.
        </p>
      </td>
    </tr>
    <tr><td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
      <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-align:center;">Cet email a été envoyé automatiquement par Devizly.</p>
      <p style="margin:0;font-size:10px;color:#CBD5E1;text-align:center;">NBHC SAS — 55 Rue Henri Clément, 71100 Saint-Rémy — SIREN 102 637 899</p>
    </td></tr>
  </table>
</body>
</html>`,
    }).then(() => {});
  }

  return NextResponse.json({
    success: true,
    status: newStatus,
    refunded_amount: newRefundedTotal,
  });
}
