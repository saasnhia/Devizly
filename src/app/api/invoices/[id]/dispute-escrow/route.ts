import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/invoices/[id]/dispute-escrow
 * Freezes a held escrow — no Stripe action, just blocks release until the
 * dispute is resolved manually (support).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, escrow_status")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  if (invoice.escrow_status !== "held") {
    return NextResponse.json(
      { error: "Ce séquestre n'est pas en attente de libération" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("invoices")
    .update({ escrow_status: "disputed" })
    .eq("id", invoiceId);

  if (error) {
    return NextResponse.json({ error: "Erreur lors du signalement du litige" }, { status: 500 });
  }

  return NextResponse.json({ success: true, escrow_status: "disputed" });
}
