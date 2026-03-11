import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/time-entries/bill
 * Creates quote line items from unbilled time entries and marks them as billed.
 * Body: { entry_ids: string[], quote_id: string, hourly_rate: number }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { entry_ids, quote_id, hourly_rate } = (await request.json()) as {
    entry_ids: string[];
    quote_id: string;
    hourly_rate: number;
  };

  if (!entry_ids?.length || !quote_id || !hourly_rate) {
    return NextResponse.json({ error: "Champs requis: entry_ids, quote_id, hourly_rate" }, { status: 400 });
  }

  // Fetch entries owned by user
  const { data: entries, error: fetchError } = await supabase
    .from("time_entries")
    .select("id, description, duration_minutes, started_at")
    .eq("user_id", user.id)
    .eq("billed", false)
    .in("id", entry_ids);

  if (fetchError || !entries?.length) {
    return NextResponse.json({ error: "Aucune entree trouvee" }, { status: 404 });
  }

  // Get current max position in quote
  const { data: existingItems } = await supabase
    .from("quote_items")
    .select("position")
    .eq("quote_id", quote_id)
    .order("position", { ascending: false })
    .limit(1);

  let position = (existingItems?.[0]?.position || 0) + 1;

  // Create quote line items from time entries
  const items = entries.map((entry) => {
    const hours = (entry.duration_minutes || 0) / 60;
    const roundedHours = Math.round(hours * 100) / 100;
    const total = Math.round(roundedHours * hourly_rate * 100) / 100;

    const desc = entry.description
      ? `${entry.description} (${roundedHours}h)`
      : `Temps facture — ${new Date(entry.started_at).toLocaleDateString("fr-FR")} (${roundedHours}h)`;

    const item = {
      quote_id,
      description: desc,
      quantity: roundedHours,
      unit_price: hourly_rate,
      total,
      position: position++,
    };

    return item;
  });

  const { error: insertError } = await supabase
    .from("quote_items")
    .insert(items);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Mark entries as billed
  await supabase
    .from("time_entries")
    .update({ billed: true })
    .in("id", entry_ids)
    .eq("user_id", user.id);

  // Recalculate quote totals
  const { data: allItems } = await supabase
    .from("quote_items")
    .select("total")
    .eq("quote_id", quote_id);

  const totalHt = (allItems || []).reduce((sum, i) => sum + Number(i.total), 0);

  const { data: quote } = await supabase
    .from("quotes")
    .select("tva_rate, discount")
    .eq("id", quote_id)
    .single();

  const tvaRate = quote?.tva_rate || 20;
  const discount = quote?.discount || 0;
  const afterDiscount = totalHt * (1 - discount / 100);
  const totalTtc = afterDiscount * (1 + tvaRate / 100);

  await supabase
    .from("quotes")
    .update({
      total_ht: Math.round(totalHt * 100) / 100,
      total_ttc: Math.round(totalTtc * 100) / 100,
    })
    .eq("id", quote_id)
    .eq("user_id", user.id);

  return NextResponse.json({
    success: true,
    items_created: items.length,
    total_hours: items.reduce((sum, i) => sum + i.quantity, 0),
  });
}
