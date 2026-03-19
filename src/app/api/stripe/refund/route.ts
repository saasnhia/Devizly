import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { getSiteUrl } from "@/lib/url";

/**
 * POST /api/stripe/refund
 * Body: { quoteId: string, reason?: string }
 * Refunds the Stripe payment for a quote deposit.
 * Requires authenticated user who owns the quote.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { quoteId, reason } = body as { quoteId: string; reason?: string };

  if (!quoteId) {
    return NextResponse.json({ error: "quoteId requis" }, { status: 400 });
  }

  // Fetch quote owned by user
  const { data: quote, error: qError } = await supabase
    .from("quotes")
    .select("id, number, title, total_ttc, status, stripe_payment_intent, deposit_refunded, user_id, client_id, clients(name, email)")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .single();

  if (qError || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  if (quote.deposit_refunded) {
    return NextResponse.json({ error: "Déjà remboursé" }, { status: 400 });
  }

  if (!quote.stripe_payment_intent) {
    return NextResponse.json({ error: "Aucun paiement Stripe trouvé" }, { status: 400 });
  }

  // Issue refund via Stripe
  const stripe = getStripe();
  try {
    await stripe.refunds.create({
      payment_intent: quote.stripe_payment_intent,
      reason: "requested_by_customer",
      metadata: {
        quote_id: quoteId,
        reason: reason || "Remboursement demandé par le prestataire",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Update quote
  await supabase
    .from("quotes")
    .update({
      deposit_refunded: true,
      deposit_refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  // Send email to client
  const client = quote.clients as unknown as { name: string; email: string | null } | null;
  if (client?.email) {
    const quoteRef = `DEV-${String(quote.number).padStart(4, "0")}`;
    const appUrl = getSiteUrl();
    resend.emails.send({
      from: "Devizly <noreply@devizly.fr>",
      to: client.email,
      subject: `Remboursement effectué — ${quoteRef}`,
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
          Le remboursement pour le devis <strong>${quoteRef} — ${quote.title}</strong> a été effectué.
          Le montant sera recrédité sur votre moyen de paiement sous 5 à 10 jours ouvrés.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr><td align="center">
            <a href="${appUrl}/devis/${quoteId}" style="display:inline-block;background:#6366F1;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Voir le devis</a>
          </td></tr>
        </table>
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

  return NextResponse.json({ success: true, message: "Remboursement effectué" });
}
