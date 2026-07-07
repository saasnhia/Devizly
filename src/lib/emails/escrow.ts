/**
 * Escrow (séquestre) email templates — matches existing Devizly email style
 * (violet header, green CTA, slate footer).
 */

function wrap(headerColor: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr><td style="background:${headerColor};padding:24px 32px;"><span style="color:#FFFFFF;font-size:20px;font-weight:700;">Devizly</span></td></tr>
    <tr><td style="padding:32px;">${body}</td></tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-align:center;">Cet email a été envoyé automatiquement par Devizly.</p>
        <p style="margin:0;font-size:10px;color:#CBD5E1;text-align:center;">NBHC SAS — 55 Rue Henri Clément, 71100 Saint-Rémy — SIREN 102 637 899</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface ReleasedArtisanParams {
  amountFmt: string;
  invoiceNumber: string;
  auto: boolean;
}

export function escrowReleasedArtisanEmail(p: ReleasedArtisanParams): { subject: string; html: string } {
  return {
    subject: `Fonds libérés — ${p.amountFmt} transférés sur votre compte`,
    html: wrap(
      "#22C55E",
      `
        <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonne nouvelle !</p>
        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
          Les fonds en séquestre de la facture <strong>${p.invoiceNumber}</strong> (<strong>${p.amountFmt}</strong>) ont été libérés
          ${p.auto ? "automatiquement (délai de 90 jours atteint)" : "suite à votre confirmation de livraison"}
          et transférés vers votre compte Stripe.
        </p>
        <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">
          Le virement sera visible sur votre compte bancaire sous 2 à 7 jours ouvrés.
        </p>
      `
    ),
  };
}

interface ReleasedClientParams {
  amountFmt: string;
  invoiceNumber: string;
  artisanName: string;
}

export function escrowReleasedClientEmail(p: ReleasedClientParams): { subject: string; html: string } {
  return {
    subject: `Paiement confirmé — ${p.invoiceNumber}`,
    html: wrap(
      "#6366F1",
      `
        <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour,</p>
        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
          ${p.artisanName} a confirmé la livraison des travaux liés à la facture <strong>${p.invoiceNumber}</strong>
          (<strong>${p.amountFmt}</strong>). Les fonds que vous aviez réglés ont été libérés de leur séquestre.
        </p>
        <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">
          Merci d'avoir utilisé le paiement sécurisé Devizly.
        </p>
      `
    ),
  };
}
