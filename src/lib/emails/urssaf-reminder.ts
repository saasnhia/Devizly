/**
 * URSSAF declaration reminder — sent J-5 before the periodic CA
 * declaration deadline (auto-entrepreneur / micro-entrepreneur).
 */

interface UrssafReminderParams {
  companyName: string;
  periodeLabel: string;
  deadlineLabel: string;
  caFormatted: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
}

interface UrssafReminderTemplate {
  subject: string;
  html: string;
}

export function urssafReminderEmail(p: UrssafReminderParams): UrssafReminderTemplate {
  return {
    subject: `Rappel : déclaration URSSAF ${p.periodeLabel} due le ${p.deadlineLabel}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td style="background:#0F172A;padding:24px 32px;">
        <span style="color:#22D3A5;font-size:20px;font-weight:700;">Devizly</span>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.companyName},</p>
        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
          Votre déclaration URSSAF pour la période <strong>${p.periodeLabel}</strong> est due le <strong>${p.deadlineLabel}</strong>.
        </p>
        <div style="margin:0 0 16px;padding:16px;background:#F0FDFA;border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#64748B;">Votre CA calculé (factures et devis payés sur la période)</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#0F172A;">${p.caFormatted}</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td align="center">
              <a href="${p.dashboardUrl}" style="display:inline-block;background:#22D3A5;color:#0F172A;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Voir le récapitulatif</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;text-align:center;">
          Cet email a été envoyé automatiquement par Devizly. Ne pas répondre.
        </p>
        <p style="margin:0 0 4px;font-size:11px;color:#94A3B8;text-align:center;">
          <a href="${p.unsubscribeUrl}" style="color:#22D3A5;text-decoration:underline;">Se désinscrire des rappels</a>
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
