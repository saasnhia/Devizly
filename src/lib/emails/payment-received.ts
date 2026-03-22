/**
 * Payment received email template — sent to freelance when client pays a quote.
 */

interface PaymentReceivedEmailParams {
  clientName: string;
  quoteRef: string;
  quoteTitle: string;
  amount: string;
  dashboardUrl: string;
}

export function paymentReceivedEmail(p: PaymentReceivedEmailParams): { subject: string; html: string } {
  return {
    subject: `Paiement reçu — ${p.quoteRef} (${p.amount})`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr><td style="background:#22C55E;padding:24px 32px;"><span style="color:#FFFFFF;font-size:20px;font-weight:700;">Devizly</span></td></tr>
    <tr><td style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonne nouvelle !</p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        <strong>${p.clientName}</strong> a réglé le devis <strong>${p.quoteRef} — ${p.quoteTitle}</strong> pour un montant de <strong>${p.amount}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Le paiement a été traité par Stripe et sera viré sur votre compte connecté.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td align="center">
          <a href="${p.dashboardUrl}" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Voir mes factures</a>
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
  };
}
