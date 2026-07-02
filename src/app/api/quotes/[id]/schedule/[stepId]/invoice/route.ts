import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStepInvoice } from "@/lib/invoices/generate-step-invoice";

/**
 * POST /api/quotes/[id]/schedule/[stepId]/invoice
 * "Facturer cette étape" — creates an invoice + Stripe checkout link for
 * a single payment_schedule step.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id: quoteId, stepId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const result = await generateStepInvoice(quoteId, user.id, stepId);
    return NextResponse.json({ success: true, invoice: result.invoice });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
