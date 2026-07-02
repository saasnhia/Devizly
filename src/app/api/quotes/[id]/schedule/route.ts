import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ScheduleStepInput {
  label: string;
  percentage: number;
  due_date?: string | null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * GET /api/quotes/[id]/schedule — list payment schedule steps for a quote.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: quoteId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("payment_schedule")
    .select("*")
    .eq("quote_id", quoteId)
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data || [] });
}

/**
 * POST /api/quotes/[id]/schedule — create/replace the payment schedule.
 * Body: { steps: [{ label, percentage, due_date? }] }
 *
 * Validates sum(percentages) === 100, computes each step's amount from
 * quotes.total_ttc, and — if quotes.retention_guarantee is active —
 * reduces the LAST step's amount by the retention percentage (BLOC B
 * scope: no separate retention invoice line yet, that's a later bloc).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: quoteId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const steps: ScheduleStepInput[] = Array.isArray(body.steps) ? body.steps : [];

  if (steps.length === 0) {
    return NextResponse.json({ error: "Au moins une étape est requise" }, { status: 400 });
  }

  for (const s of steps) {
    if (!s.label || !s.label.trim()) {
      return NextResponse.json({ error: "Chaque étape doit avoir un label" }, { status: 400 });
    }
    if (typeof s.percentage !== "number" || s.percentage <= 0) {
      return NextResponse.json({ error: "Pourcentage invalide" }, { status: 400 });
    }
  }

  const totalPct = round2(steps.reduce((sum, s) => sum + Number(s.percentage), 0));
  if (totalPct !== 100) {
    return NextResponse.json(
      { error: `La somme des pourcentages doit être égale à 100% (actuellement ${totalPct}%)` },
      { status: 400 }
    );
  }

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, total_ttc, retention_guarantee, retention_percentage")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  // Refuse to replace a schedule that's already partly invoiced/paid —
  // rewriting amounts underneath an existing invoice would desync them.
  const { data: existingSteps } = await supabase
    .from("payment_schedule")
    .select("id, status")
    .eq("quote_id", quoteId);

  if (existingSteps?.some((s) => s.status !== "pending" && s.status !== "cancelled")) {
    return NextResponse.json(
      { error: "Impossible de modifier l'échéancier : au moins une étape a déjà été facturée ou payée" },
      { status: 400 }
    );
  }

  const totalTtc = Number(quote.total_ttc) || 0;
  const retentionActive = quote.retention_guarantee === true;
  const retentionPct = Number(quote.retention_percentage) || 5;

  const rows = steps.map((s, idx) => {
    let amount = round2(totalTtc * (Number(s.percentage) / 100));
    if (retentionActive && idx === steps.length - 1) {
      amount = round2(amount - round2(totalTtc * (retentionPct / 100)));
    }
    return {
      quote_id: quoteId,
      user_id: user.id,
      label: s.label.trim(),
      percentage: s.percentage,
      amount,
      due_date: s.due_date || null,
      position: idx + 1,
      status: "pending" as const,
    };
  });

  // Replace: clear any prior (unpaid) rows then insert the new set.
  const { error: deleteError } = await supabase
    .from("payment_schedule")
    .delete()
    .eq("quote_id", quoteId);

  if (deleteError) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("payment_schedule")
    .insert(rows)
    .select();

  if (insertError) {
    return NextResponse.json({ error: "Erreur lors de la création de l'échéancier" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: inserted });
}
