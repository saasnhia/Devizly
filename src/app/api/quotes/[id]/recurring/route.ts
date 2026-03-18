import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_FREQUENCIES = ["monthly", "quarterly", "yearly"];

/**
 * PATCH /api/quotes/[id]/recurring — Toggle recurring invoicing on a quote.
 * Body: { isRecurring: boolean, frequency?: string, startDate?: string, endDate?: string }
 * Only allowed on quotes with status 'signé' or 'payé'.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Verify quote ownership + status
  const { data: quote, error: fetchError } = await supabase
    .from("quotes")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  if (quote.status !== "signé" && quote.status !== "payé") {
    return NextResponse.json(
      { error: "La récurrence n'est disponible que pour les devis signés ou payés" },
      { status: 400 }
    );
  }

  const { isRecurring, frequency, startDate, endDate } = await request.json();

  if (isRecurring) {
    if (!frequency || !VALID_FREQUENCIES.includes(frequency)) {
      return NextResponse.json({ error: "Fréquence invalide" }, { status: 400 });
    }

    if (!startDate) {
      return NextResponse.json({ error: "Date de début requise" }, { status: 400 });
    }

    const { error } = await supabase
      .from("quotes")
      .update({
        is_recurring: true,
        recurring_frequency: frequency,
        recurring_start_date: startDate,
        recurring_end_date: endDate || null,
        recurring_next_date: startDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
  } else {
    // Disable recurring
    const { error } = await supabase
      .from("quotes")
      .update({
        is_recurring: false,
        recurring_next_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
