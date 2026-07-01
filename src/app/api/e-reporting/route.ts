import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("e_reporting_data")
    .select(
      "id, invoice_id, client_type, transaction_date, total_ht, total_vat, total_ttc, vat_rate, payment_date, payment_amount, reporting_status, sent_at, invoices(invoice_number, clients(name))"
    )
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

/** Mark one or more e-reporting rows as sent (manual acknowledgement — no automated PA push yet). */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const ids: unknown = body.ids;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids requis" }, { status: 400 });
  }

  const { error } = await supabase
    .from("e_reporting_data")
    .update({ reporting_status: "sent", sent_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
