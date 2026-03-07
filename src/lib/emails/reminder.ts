/**
 * Reminder email templates — J+3 / J+7 / J+14 sequence.
 * Inspired by QuickBooks/Jobber automated reminders.
 */

interface ReminderParams {
  clientName: string;
  quoteTitle: string;
  quoteRef: string;
  totalTTC: string;
  shareUrl: string;
  companyName: string;
}

interface ReminderTemplate {
  subject: string;
  html: string;
}

function baseLayout(content: string, ctaUrl: string, ctaText: string): string {
  return `
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
        ${content}
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td align="center">
              <a href="${ctaUrl}" style="display:inline-block;background:#22C55E;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">${ctaText}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">
          Cet email a été envoyé automatiquement par Devizly. Ne pas répondre.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** J+3 — Friendly nudge */
export function reminderJ3(p: ReminderParams): ReminderTemplate {
  return {
    subject: `Rappel : Votre devis ${p.quoteRef} attend votre réponse`,
    html: baseLayout(
      `<p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.clientName},</p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         ${p.companyName} vous a envoyé le devis <strong>${p.quoteRef} — ${p.quoteTitle}</strong> d'un montant de <strong>${p.totalTTC}</strong>.
       </p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         Ce devis est en attente de votre réponse. Vous pouvez le consulter, le signer et le payer en un clic.
       </p>`,
      p.shareUrl,
      `Consulter le devis — ${p.totalTTC}`
    ),
  };
}

/** J+7 — Urgency */
export function reminderJ7(p: ReminderParams): ReminderTemplate {
  return {
    subject: `${p.quoteRef} : Devis en attente depuis 7 jours`,
    html: baseLayout(
      `<p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.clientName},</p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         Le devis <strong>${p.quoteRef} — ${p.quoteTitle}</strong> (${p.totalTTC}) est en attente depuis 7 jours.
       </p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         Pour ne pas retarder votre projet, nous vous invitons à le valider rapidement. Signez et payez directement en ligne.
       </p>`,
      p.shareUrl,
      `Signer et payer maintenant`
    ),
  };
}

/** J+14 — Last chance */
export function reminderJ14(p: ReminderParams): ReminderTemplate {
  return {
    subject: `Dernier rappel : ${p.quoteRef} expire bientôt`,
    html: baseLayout(
      `<p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.clientName},</p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         C'est notre dernier rappel concernant le devis <strong>${p.quoteRef} — ${p.quoteTitle}</strong> d'un montant de <strong>${p.totalTTC}</strong>.
       </p>
       <p style="margin:0 0 8px;font-size:15px;color:#DC2626;line-height:1.6;font-weight:600;">
         Ce devis expirera sous peu si aucune action n'est effectuée.
       </p>
       <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
         Signez-le maintenant pour confirmer votre accord.
       </p>`,
      p.shareUrl,
      `Dernière chance — Signer le devis`
    ),
  };
}

export const REMINDER_TEMPLATES = [reminderJ3, reminderJ7, reminderJ14] as const;
