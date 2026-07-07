import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { releaseEscrowFunds } from "@/lib/invoices/escrow";

/**
 * POST /api/invoices/[id]/release-escrow
 * Artisan self-service confirmation of delivery — releases the escrowed
 * funds by transferring them from the platform account to the artisan's
 * connected Stripe account.
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

  // Ownership check — RLS also enforces this, but we want an explicit 404
  // rather than a generic Stripe/RLS error if the invoice isn't the user's.
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const result = await releaseEscrowFunds(supabase, invoiceId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    escrow_status: "released",
    transfer_id: result.transferId,
  });
}
