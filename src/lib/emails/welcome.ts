/**
 * Welcome email template — sent after a new user signs up.
 * Same style as existing emails (violet header, green CTA).
 */

interface WelcomeEmailParams {
  userName: string;
}

export function welcomeEmail(p: WelcomeEmailParams): { subject: string; html: string } {
  const firstName = p.userName.split(" ")[0] || p.userName;

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
        <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${firstName},</p>
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

        <p style="margin:0;font-size:14px;color:#64748B;line-height:1.6;text-align:center;">
          Une question ? Écrivez-nous à <a href="mailto:contact@devizly.fr" style="color:#6366F1;text-decoration:underline;">contact@devizly.fr</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-align:center;">
          Vous recevez cet email car vous venez de créer un compte sur Devizly.
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
