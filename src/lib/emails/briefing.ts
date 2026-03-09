import type { BriefingResult } from "@/lib/ai/daily-briefing";

interface BriefingEmailParams {
  userName: string;
  briefing: BriefingResult;
  dashboardUrl: string;
}

export function briefingEmail(p: BriefingEmailParams): {
  subject: string;
  html: string;
} {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const actionsHtml = p.briefing.actions
    .map(
      (a) =>
        `<tr><td style="padding:8px 0 8px 0;font-size:14px;color:#334155;border-bottom:1px solid #F1F5F9;">
          <span style="color:#22D3A5;font-weight:700;margin-right:8px;">&#x2192;</span>${a}
        </td></tr>`
    )
    .join("");

  return {
    subject: `Votre briefing du ${today}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <tr>
      <td style="background:#0F172A;padding:24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td><span style="color:#22D3A5;font-size:20px;font-weight:700;">Devizly</span></td>
            <td style="text-align:right;"><span style="color:#94A3B8;font-size:13px;">Briefing du ${today}</span></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Greeting + Summary -->
    <tr>
      <td style="padding:32px 32px 16px;">
        <p style="margin:0 0 16px;font-size:16px;color:#0F172A;">Bonjour ${p.userName},</p>
        <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">${p.briefing.summary}</p>
      </td>
    </tr>

    <!-- Stats cards -->
    <tr>
      <td style="padding:0 32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="width:50%;padding:16px;background:#F0FDF4;text-align:center;border-right:1px solid #E2E8F0;">
              <span style="font-size:12px;color:#64748B;display:block;">CA cette semaine</span>
              <span style="font-size:22px;font-weight:700;color:#16A34A;">${p.briefing.stats.caThisWeek}</span>
              <span style="font-size:12px;color:#64748B;display:block;">${p.briefing.stats.caVariation} vs sem. derniere</span>
            </td>
            <td style="width:50%;padding:16px;background:#EFF6FF;text-align:center;">
              <span style="font-size:12px;color:#64748B;display:block;">En attente</span>
              <span style="font-size:22px;font-weight:700;color:#2563EB;">${p.briefing.stats.pendingQuotes}</span>
              <span style="font-size:12px;color:#64748B;display:block;">${p.briefing.stats.pendingRevenue}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Actions -->
    <tr>
      <td style="padding:0 32px 24px;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0F172A;">Actions prioritaires</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${actionsHtml}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:0 32px 32px;" align="center">
        <a href="${p.dashboardUrl}" style="display:inline-block;background:#22D3A5;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Ouvrir mon dashboard</a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
        <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">
          Briefing genere par l'IA Devizly — Lun-Ven a 8h00.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
