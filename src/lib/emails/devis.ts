/**
 * Devis email template — sent when a quote is shared with a client.
 * Matches the existing reminder email style (violet header, green CTA).
 */

interface DevisEmailParams {
  clientName: string;
  quoteRef: string;
  quoteTitle: string;
  totalTTC: string;
  shareUrl: string;
  stripeUrl?: string;
  companyName: string;
  trackingPixelUrl?: string;
  customMessage?: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function devisEmail(p: DevisEmailParams): { subject: string; html: string } {
  const paymentBlock = p.stripeUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;">
        <tr>
          <td align="center">
            <a href="${p.stripeUrl}" style="display:inline-block;background:#1e40af;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Payer maintenant</a>
          </td>
        </tr>
      </table>`
    : "";

  return {
    subject: `Devis ${p.quoteRef} — ${p.quoteTitle}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td style="background:#6366F1;padding:24px 32px;">
        <span style="color:#FFFFFF;font-size:20px;font-weight:700;">Devizly</span>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.clientName},</p>
        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
          ${p.customMessage
            ? escapeHtml(p.customMessage).replace(/\n/g, "<br>")
            : `${p.companyName} vous a transmis un devis pour votre projet.`}
        </p>

        <!-- Devis summary card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:16px 20px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;">
              <span style="font-size:13px;color:#64748B;font-weight:600;">DEVIS</span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;color:#64748B;padding-bottom:8px;">Reference</td>
                  <td style="font-size:14px;color:#0F172A;font-weight:600;text-align:right;padding-bottom:8px;">${p.quoteRef}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#64748B;padding-bottom:8px;">Objet</td>
                  <td style="font-size:14px;color:#0F172A;font-weight:500;text-align:right;padding-bottom:8px;">${p.quoteTitle}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#64748B;border-top:1px solid #E2E8F0;padding-top:12px;">Montant TTC</td>
                  <td style="font-size:20px;color:#0F172A;font-weight:700;text-align:right;border-top:1px solid #E2E8F0;padding-top:12px;">${p.totalTTC}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA: View devis -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td align="center">
              <a href="${p.shareUrl}" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Consulter le devis</a>
            </td>
          </tr>
        </table>

        ${paymentBlock}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-align:center;">
          Cet email a ete envoye par ${p.companyName} via Devizly.
        </p>
        <p style="margin:0 0 4px;font-size:11px;color:#CBD5E1;text-align:center;">
          Conformement au RGPD, vos donnees sont traitees uniquement pour la gestion de ce devis.
        </p>
        <p style="margin:0;font-size:10px;color:#CBD5E1;text-align:center;">
          NBHC SAS — 55 Rue Henri Cl\u00e9ment, 71100 Saint-R\u00e9my — SIREN 102 637 899
        </p>
      </td>
    </tr>
  </table>${p.trackingPixelUrl ? `\n  <img src="${p.trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />` : ""}
</body>
</html>`,
  };
}
