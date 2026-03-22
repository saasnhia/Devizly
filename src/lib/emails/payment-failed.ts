/**
 * Payment failed email template — sent when subscription payment fails.
 */

interface PaymentFailedEmailParams {
  settingsUrl: string;
}

export function paymentFailedEmail(p: PaymentFailedEmailParams): { subject: string; html: string } {
  return {
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
          <a href="${p.settingsUrl}" style="display:inline-block;background:#6366F1;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Mettre à jour mon paiement</a>
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
