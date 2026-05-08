/**
 * Founder reminder email — biweekly nudge for free-plan users.
 * Branded Devizly (violet #6366F1 header, green CTA).
 */

interface FounderReminderEmailParams {
  userName: string | null;
  unsubscribeUrl: string;
  pricingUrl: string;
  remainingSeats: number;
}

export function founderReminderEmail(
  p: FounderReminderEmailParams
): { subject: string; html: string } {
  const firstName =
    (p.userName ?? "").split(" ")[0]?.trim() || "bonjour";
  const greeting = firstName === "bonjour" ? "Bonjour" : `Bonjour ${firstName}`;
  const seatsLine =
    p.remainingSeats > 0 && p.remainingSeats <= 100
      ? `Il reste seulement <strong>${p.remainingSeats} places</strong> sur les 100 disponibles.`
      : `Cette offre est réservée aux 100 premiers inscrits — ne tardez pas.`;

  return {
    subject: "🎁 Offre Fondateur Devizly — 9€/mois à vie (places limitées)",
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
        <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">${greeting},</p>
        <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.6;">
          Vous utilisez Devizly en version gratuite — et on voulait vous rappeler que notre offre de lancement est toujours active.
        </p>

        <!-- Offer card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:2px solid #6366F1;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 100%);">
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 8px;font-size:13px;color:#6366F1;font-weight:700;letter-spacing:0.5px;">🎯 OFFRE FONDATEUR</p>
              <p style="margin:0 0 4px;font-size:28px;font-weight:800;color:#0F172A;">9€<span style="font-size:16px;font-weight:500;color:#64748B;"> /mois à vie</span></p>
              <p style="margin:0 0 16px;font-size:13px;color:#94A3B8;text-decoration:line-through;">Au lieu de 19€/mois</p>
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">
                ${seatsLine}
              </p>
            </td>
          </tr>
        </table>

        <!-- Benefits -->
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0F172A;">Ce que vous débloquez :</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr><td style="padding:6px 0;font-size:14px;color:#334155;"><span style="color:#22C55E;font-weight:700;">✓</span>&nbsp;&nbsp;Devis illimités <span style="color:#94A3B8;">(vs 3/mois actuellement)</span></td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#334155;"><span style="color:#22C55E;font-weight:700;">✓</span>&nbsp;&nbsp;Envoi de contrats avec signature électronique</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#334155;"><span style="color:#22C55E;font-weight:700;">✓</span>&nbsp;&nbsp;Templates de relances personnalisés</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#334155;"><span style="color:#22C55E;font-weight:700;">✓</span>&nbsp;&nbsp;Badge Fondateur exclusif (numéroté à vie)</td></tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td align="center">
              <a href="${p.pricingUrl}" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Profiter de l'offre →</a>
            </td>
          </tr>
        </table>

        <p style="margin:24px 0 0;font-size:14px;color:#334155;line-height:1.6;">À bientôt,</p>
        <p style="margin:4px 0 0;font-size:14px;color:#0F172A;font-weight:600;">Haroun — Fondateur de Devizly</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;text-align:center;">
          Vous recevez cet email car vous avez un compte Devizly.<br>
          <a href="${p.unsubscribeUrl}" style="color:#94A3B8;text-decoration:underline;">Se désinscrire de ces rappels</a>
        </p>
        <p style="margin:0;font-size:10px;color:#CBD5E1;text-align:center;">
          NBHC SAS — 55 Rue Henri Clément, 71100 Saint-Rémy — SIREN 102 637 899
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
