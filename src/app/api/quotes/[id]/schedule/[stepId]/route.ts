import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["pending", "paid", "overdue", "cancelled"];

/**
 * PUT /api/quotes/[id]/schedule/[stepId] — update one payment schedule step.
 * Mainly used to mark a step "paid" (with its linked invoice_id) once the
 * artisan invoices that step.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id: quoteId, stepId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { status, invoice_id, stripe_payment_intent_id, paid_at, label, due_date } = body as {
    status?: string;
    invoice_id?: string | null;
    stripe_payment_intent_id?: string | null;
    paid_at?: string | null;
    label?: string;
    due_date?: string | null;
  };

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const updateFields: Record<string, unknown> = {};
  if (status !== undefined) updateFields.status = status;
  if (invoice_id !== undefined) updateFields.invoice_id = invoice_id;
  if (stripe_payment_intent_id !== undefined) updateFields.stripe_payment_intent_id = stripe_payment_intent_id;
  if (paid_at !== undefined) updateFields.paid_at = paid_at;
  if (label !== undefined) updateFields.label = label;
  if (due_date !== undefined) updateFields.due_date = due_date;

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("payment_schedule")
    .update(updateFields)
    .eq("id", stepId)
    .eq("quote_id", quoteId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Étape introuvable ou erreur de mise à jour" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
