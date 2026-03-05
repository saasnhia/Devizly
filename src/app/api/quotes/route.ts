import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { title, client_id, tva_rate, discount, notes, valid_until, items, ai_prompt, total_ht, total_ttc } = body;

  if (!title) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
  }

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      title,
      client_id: client_id || null,
      tva_rate: tva_rate ?? 20,
      discount: discount ?? 0,
      notes: notes || null,
      valid_until: valid_until || null,
      ai_prompt: ai_prompt || null,
      total_ht: total_ht ?? 0,
      total_ttc: total_ttc ?? 0,
    })
    .select()
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: quoteError?.message || "Erreur création devis" }, { status: 500 });
  }

  if (items && Array.isArray(items) && items.length > 0) {
    const itemsToInsert = items.map((item: { description: string; quantity: number; unit_price: number; total: number }, index: number) => ({
      quote_id: quote.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
      position: index,
    }));

    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(itemsToInsert);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, data: quote }, { status: 201 });
}
