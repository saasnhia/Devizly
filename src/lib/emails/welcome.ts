/**
 * Welcome email template — sent after a new user signs up.
 * Same style as existing emails (violet header, green CTA).
 * Inclut un bloc Offre Fondateur 9€ + lien de desinscription marketing.
 */

interface WelcomeEmailParams {
  userName: string;
  /** URL absolue de desinscription marketing (token HMAC). */
  unsubscribeUrl: string;
}

export function welcomeEmail(p: WelcomeEmailParams): { subject: string; html: string } {
  const firstName = p.userName.split(" ")[0] || p.userName || "";
  const greeting = firstName ? `Bonjour ${firstName}` : "Bonjour";

  return {
    subject: "Bienvenue sur Devizly 👋 — Créez votre premier devis",
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
          Votre compte Devizly est prêt. Vous pouvez dès maintenant créer et envoyer des devis professionnels en quelques clics.
        </p>

        <!-- 3 Steps -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:16px 20px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;">
              <span style="font-size:13px;color:#64748B;font-weight:600;">VOS 3 PREMIÈRES ÉTAPES</span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:#6366F1;border-radius:50%;text-align:center;vertical-align:middle;color:#FFFFFF;font-weight:700;font-size:14px;">1</td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0F172A;">Complétez votre profil</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#64748B;">Logo, SIRET, taux de TVA — pour des devis conformes</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:#6366F1;border-radius:50%;text-align:center;vertical-align:middle;color:#FFFFFF;font-weight:700;font-size:14px;">2</td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0F172A;">Créez votre premier devis</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#64748B;">Décrivez votre prestation, l'IA génère le devis en 30 secondes</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:#6366F1;border-radius:50%;text-align:center;vertical-align:middle;color:#FFFFFF;font-weight:700;font-size:14px;">3</td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0F172A;">Partagez le lien à votre client</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#64748B;">Signature électronique et paiement intégrés</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td align="center">
              <a href="https://devizly.fr/devis/nouveau" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Créer mon premier devis →</a>
            </td>
          </tr>
        </table>

        <!-- Offre Fondateur -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border:2px solid #6366F1;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 100%);">
          <tr><td style="padding:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#6366F1;font-weight:700;letter-spacing:0.5px;">🎁 OFFRE FONDATEUR</p>
            <p style="margin:0 0 4px;font-size:26px;font-weight:800;color:#0F172A;">9€<span style="font-size:15px;font-weight:500;color:#64748B;"> /mois à vie</span> <span style="font-size:14px;color:#94A3B8;text-decoration:line-through;">19€</span></p>
            <p style="margin:0 0 14px;font-size:13px;color:#334155;">Réservé aux 100 premiers abonnés Pro — à vie, sans augmentation.</p>
            <table cellpadding="0" cellspacing="0"><tr><td style="font-size:13px;color:#334155;line-height:1.9;">
              <span style="color:#22C55E;font-weight:700;">✓</span>&nbsp;Devis illimités&nbsp;&nbsp;
              <span style="color:#22C55E;font-weight:700;">✓</span>&nbsp;Envoi de contrats<br>
              <span style="color:#22C55E;font-weight:700;">✓</span>&nbsp;Relances personnalisées&nbsp;&nbsp;
              <span style="color:#22C55E;font-weight:700;">✓</span>&nbsp;Badge Fondateur
            </td></tr></table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;"><tr><td>
              <a href="https://devizly.fr/pricing" style="display:inline-block;background:#6366F1;color:#FFFFFF;padding:11px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Profiter de l'offre Fondateur →</a>
            </td></tr></table>
          </td></tr>
        </table>

        <p style="margin:24px 0 0;font-size:14px;color:#334155;line-height:1.6;">
          Une question, un doute ? Répondez directement à cet email — c'est moi qui réponds, pas un robot.
        </p>
        <p style="margin:4px 0 0;font-size:14px;color:#0F172A;font-weight:600;">Haroun — Fondateur de Devizly</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;text-align:center;">
          Vous recevez cet email car vous venez de créer un compte sur Devizly.<br>
          <a href="${p.unsubscribeUrl}" style="color:#94A3B8;text-decoration:underline;">Se désinscrire des emails marketing</a>
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
