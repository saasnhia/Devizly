import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEligibleTips, type TipProfile, type TipStats } from "@/lib/tips/tips-engine";

/**
 * GET /api/tips — returns the single highest-priority tip eligible for the
 * user (not dismissed, condition true), or an empty array if none/opted out.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_siret, stripe_connect_status, calendly_url, is_micro_entrepreneur, urssaf_visited_at, tips_disabled")
    .eq("id", user.id)
    .single();

  if (!profile || profile.tips_disabled) {
    return NextResponse.json({ success: true, data: [] });
  }

  const today = new Date().toISOString().split("T")[0];

  const [
    { count: clientsCount },
    { count: quotesCount },
    { count: quotesSignedCount },
    { count: invoicesCount },
    { count: invoicesOverdueCount },
    { count: facturxCount },
    { count: scheduleCount },
    { count: b2cClientsCount },
    { count: acompteQuotesCount },
    { data: dismissedRows },
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("archived_at", null),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .in("status", ["signé", "accepté", "payé"]),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .in("status", ["draft", "sent"]).lt("due_date", today),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .not("facturx_pdf_path", "is", null),
    supabase.from("payment_schedule").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("client_type", "b2c"),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("deposit_percent", "is", null),
    supabase.from("dismissed_tips").select("tip_id").eq("user_id", user.id),
  ]);

  const tipProfile: TipProfile = {
    companySiret: profile.company_siret,
    stripeConnected: profile.stripe_connect_status === "connected",
    calendlyUrl: profile.calendly_url,
    isMicroEntrepreneur: profile.is_micro_entrepreneur === true,
    visitedUrssaf: !!profile.urssaf_visited_at,
  };

  const stats: TipStats = {
    clientsCount: clientsCount || 0,
    quotesCount: quotesCount || 0,
    quotesSigned: quotesSignedCount || 0,
    invoicesCount: invoicesCount || 0,
    invoicesOverdue: invoicesOverdueCount || 0,
    hasGeneratedFacturx: (facturxCount || 0) > 0,
    hasSchedule: (scheduleCount || 0) > 0,
    hasB2cClients: (b2cClientsCount || 0) > 0,
    usesAcompte: (acompteQuotesCount || 0) > 0,
  };

  const dismissedIds = new Set((dismissedRows || []).map((r) => r.tip_id));
  const eligible = getEligibleTips(tipProfile, stats, dismissedIds);

  return NextResponse.json({ success: true, data: eligible.slice(0, 1) });
}
