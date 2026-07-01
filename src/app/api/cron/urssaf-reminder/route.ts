import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resend } from "@/lib/resend";
import { urssafReminderEmail } from "@/lib/emails/urssaf-reminder";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";
import { getSiteUrl } from "@/lib/url";

/**
 * Cron endpoint: URSSAF declaration reminder, J-5 before the deadline.
 * Vercel Cron runs daily at 8:00 AM UTC (vercel.json) — the route itself
 * determines whether today is J-5 for the mensuel or trimestriel deadline.
 * Protected by CRON_SECRET header.
 *
 * Mensuel   : deadline = last day of month+1 (CA de mai -> deadline 30 juin).
 * Trimestriel : deadlines fixes 30/04, 31/07, 31/10, 31/01.
 *
 * Targets: is_micro_entrepreneur = true, marketing_emails_opt_out != true.
 */

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
] as const;

interface UrssafDeadline {
  periodeLabel: string;
  periodeStart: string;
  periodeEnd: string;
  deadline: Date;
}

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function daysBetweenUTC(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const aUTC = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUTC = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bUTC - aUTC) / msPerDay);
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Every month has a last day, which is the mensuel deadline for the previous month's CA. */
function getMensuelDeadlineForToday(today: Date): UrssafDeadline | null {
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const deadline = new Date(Date.UTC(y, m + 1, 0));
  if (daysBetweenUTC(today, deadline) !== 5) return null;

  const periodDate = new Date(Date.UTC(y, m - 1, 1));
  const py = periodDate.getUTCFullYear();
  const pm = periodDate.getUTCMonth();
  const start = new Date(Date.UTC(py, pm, 1));
  const end = new Date(Date.UTC(py, pm + 1, 0));

  return {
    periodeLabel: `${MONTHS_FR[pm]} ${py}`,
    periodeStart: toISODate(start),
    periodeEnd: toISODate(end),
    deadline,
  };
}

/** Fixed calendar deadlines: 30/04 (T1), 31/07 (T2), 31/10 (T3), 31/01 (T4 de l'année précédente). */
function getTrimestrielDeadlineForToday(today: Date): UrssafDeadline | null {
  const y = today.getUTCFullYear();

  for (const yy of [y - 1, y, y + 1]) {
    const candidates = [
      { deadline: new Date(Date.UTC(yy, 3, 30)), quarterYear: yy, quarterStartMonth: 0, quarter: 1 },
      { deadline: new Date(Date.UTC(yy, 6, 31)), quarterYear: yy, quarterStartMonth: 3, quarter: 2 },
      { deadline: new Date(Date.UTC(yy, 9, 31)), quarterYear: yy, quarterStartMonth: 6, quarter: 3 },
      { deadline: new Date(Date.UTC(yy, 0, 31)), quarterYear: yy - 1, quarterStartMonth: 9, quarter: 4 },
    ];

    for (const c of candidates) {
      if (daysBetweenUTC(today, c.deadline) === 5) {
        const start = new Date(Date.UTC(c.quarterYear, c.quarterStartMonth, 1));
        const end = new Date(Date.UTC(c.quarterYear, c.quarterStartMonth + 3, 0));
        return {
          periodeLabel: `T${c.quarter} ${c.quarterYear}`,
          periodeStart: toISODate(start),
          periodeEnd: toISODate(end),
          deadline: c.deadline,
        };
      }
    }
  }
  return null;
}

function formatDeadlineLabel(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(d);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const appUrl = getSiteUrl();
  const dashboardUrl = `${appUrl}/dashboard/urssaf`;
  const today = new Date();

  const mensuelDeadline = getMensuelDeadlineForToday(today);
  const trimestrielDeadline = getTrimestrielDeadlineForToday(today);

  if (!mensuelDeadline && !trimestrielDeadline) {
    return NextResponse.json({ sent: 0, message: "Not J-5 for any deadline today" });
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, urssaf_periodicite")
    .eq("is_micro_entrepreneur", true)
    .or("marketing_emails_opt_out.is.null,marketing_emails_opt_out.eq.false");

  if (error) {
    console.error("[UrssafReminder] Query failed:", error);
    return NextResponse.json({ error: "Query failed", details: error.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, message: "No eligible users" });
  }

  let totalSent = 0;
  const errors: string[] = [];

  for (const profile of profiles) {
    const periodicite = profile.urssaf_periodicite === "trimestriel" ? "trimestriel" : "mensuel";
    const deadlineInfo = periodicite === "trimestriel" ? trimestrielDeadline : mensuelDeadline;
    if (!deadlineInfo) continue;

    const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(profile.id);
    if (authErr || !authUser?.user?.email) {
      errors.push(`${profile.id}: no email`);
      continue;
    }

    const periodEndBound = `${deadlineInfo.periodeEnd}T23:59:59`;

    const [{ data: invoices }, { data: paidQuotes }] = await Promise.all([
      supabase
        .from("invoices")
        .select("amount")
        .eq("user_id", profile.id)
        .eq("status", "paid")
        .gte("paid_at", deadlineInfo.periodeStart)
        .lte("paid_at", periodEndBound),
      supabase
        .from("quotes")
        .select("total_ht")
        .eq("user_id", profile.id)
        .eq("status", "payé")
        .gte("paid_at", deadlineInfo.periodeStart)
        .lte("paid_at", periodEndBound),
    ]);

    const invoiceTotal = (invoices || []).reduce((s, i) => s + Number(i.amount), 0);
    const quoteTotal = (paidQuotes || []).reduce((s, q) => s + Number(q.total_ht), 0);
    const caHt = invoiceTotal + quoteTotal;

    const companyName = profile.company_name || profile.full_name || "votre entreprise";
    const unsubscribeUrl = `${appUrl}/api/emails/unsubscribe?token=${signUnsubscribeToken(profile.id)}`;

    const { subject, html } = urssafReminderEmail({
      companyName,
      periodeLabel: deadlineInfo.periodeLabel,
      deadlineLabel: formatDeadlineLabel(deadlineInfo.deadline),
      caFormatted: formatCurrency(caHt),
      dashboardUrl,
      unsubscribeUrl,
    });

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: authUser.user.email,
      subject,
      html,
    });

    if (sendError) {
      console.error(`[UrssafReminder] Failed for ${authUser.user.email}:`, sendError);
      errors.push(`${authUser.user.email}: ${sendError.message}`);
      continue;
    }

    totalSent++;
    console.log(`[UrssafReminder] Sent → ${authUser.user.email} (${deadlineInfo.periodeLabel})`);
  }

  return NextResponse.json({
    sent: totalSent,
    candidates: profiles.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
