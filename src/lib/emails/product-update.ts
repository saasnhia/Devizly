/**
 * Product update announcement — one-shot email to all subscribers.
 * Branded Devizly (violet #6366F1 header, green CTA), same pattern as
 * founder-reminder.ts.
 */

interface ProductUpdateEmailParams {
  userName: string | null;
  unsubscribeUrl: string;
  dashboardUrl: string;
  pricingUrl: string;
}

interface Feature {
  emoji: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    emoji: "🔒",
    title: "Séquestre de paiement",
    description:
      "Votre client paie à la commande, mais les fonds restent bloqués jusqu'à ce que vous confirmiez la livraison des travaux. Zéro risque d'impayé pour vous, zéro risque pour lui. Activable sur n'importe quel devis.",
  },
  {
    emoji: "📅",
    title: "Paiement en plusieurs fois",
    description:
      "30% à la signature, 40% à mi-chantier, 30% à la réception — ou l'échéancier que vous voulez. Chaque étape génère sa propre facture et son lien de paiement.",
  },
  {
    emoji: "🛡️",
    title: "Retenue de garantie 5%",
    description:
      "Conforme au décret n°72-388. Calculée automatiquement, facturée séparément.",
  },
  {
    emoji: "↩️",
    title: "Remboursement en 1 clic",
    description:
      "Chantier annulé ? Remboursez votre client, en total ou en partiel, depuis votre tableau de bord.",
  },
  {
    emoji: "📄",
    title: "Contrats en moins d'une minute",
    description:
      "Générez un contrat pré-rempli à partir d'un devis existant, envoyez-le à la signature électronique.",
  },
];

export function productUpdateEmail(
  p: ProductUpdateEmailParams
): { subject: string; html: string } {
  const firstName =
    (p.userName ?? "").split(" ")[0]?.trim() || "bonjour";
  const greeting = firstName === "bonjour" ? "Bonjour" : `Bonjour ${firstName}`;

  const featureBlocks = FEATURES.map(
    (f) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border:1px solid #E2E8F0;border-radius:10px;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="margin:0 0 4px;font-size:15px;color:#0F172A;">
                <span style="font-size:18px;">${f.emoji}</span>&nbsp;&nbsp;<strong>${f.title}</strong>
              </p>
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">
                ${f.description}
              </p>
            </td>
          </tr>
        </table>`
  ).join("");

  return {
    subject: "Ne travaillez plus sans être sûr d'être payé",
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
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
          Ces dernières semaines, on a construit ce qui manque le plus aux
          artisans et freelances : la sécurité du paiement.
        </p>

        <!-- Features -->
        ${featureBlocks}

        <!-- Divider -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr><td style="border-top:1px solid #E2E8F0;font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>

        <!-- Réforme block — distinct, light background + border -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #C7D2FE;border-radius:12px;background:#EEF2FF;">
          <tr>
            <td style="padding:20px 22px;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0F172A;">
                Réforme de la facturation électronique : vous êtes prêt
              </p>
              <p style="margin:0 0 10px;font-size:14px;color:#334155;line-height:1.6;">
                Vos factures Factur-X sont conformes à la norme EN 16931,
                validées par l'outil officiel FNFE-MPE. Devizly s'intègre à
                SUPER PDP, une Plateforme Agréée immatriculée par la DGFiP :
                connectez votre entreprise depuis vos paramètres et
                transmettez vos factures par le circuit électronique officiel.
              </p>
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">
                L'obligation d'émettre en électronique arrive en septembre
                2027 pour les TPE et indépendants. Vous avez déjà tout ce
                qu'il faut.
              </p>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td align="center">
              <a href="${p.dashboardUrl}" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Découvrir les nouveautés →</a>
            </td>
          </tr>
        </table>

        <!-- Founder offer — amber/gold -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:2px solid #F59E0B;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 100%);">
          <tr>
            <td style="padding:20px 22px;">
              <p style="margin:0 0 8px;font-size:14px;color:#0F172A;line-height:1.6;">
                🎁 <strong>L'Offre Fondateur est toujours ouverte</strong> :
                9€/mois à vie au lieu de 19€, pour les 100 premières places.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${p.pricingUrl}" style="display:inline-block;background:#F59E0B;color:#FFFFFF;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Voir l'offre →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 4px;font-size:14px;color:#334155;line-height:1.6;">
          Une question, un problème ? Répondez directement à cet email —
          c'est moi qui réponds.
        </p>
        <p style="margin:24px 0 0;font-size:14px;color:#334155;line-height:1.6;">À bientôt,</p>
        <p style="margin:4px 0 0;font-size:14px;color:#0F172A;font-weight:600;">Haroun — Fondateur de Devizly</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;text-align:center;">
          Vous recevez cet email car vous avez un compte Devizly.<br>
          <a href="${p.unsubscribeUrl}" style="color:#94A3B8;text-decoration:underline;">Se désinscrire</a>
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
