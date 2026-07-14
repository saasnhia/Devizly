import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildContractFromQuote } from "@/lib/contracts/from-quote";

/**
 * POST /api/contracts/from-quote
 * Creates a draft contract pre-filled from an existing quote (client,
 * amount, objet). Idempotent: if a contract is already linked to this
 * quote, returns that one instead of creating a duplicate.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "subscription_status, company_name, company_siret, company_address, company_postal_code, company_city, full_name"
    )
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_status === "free") {
    return NextResponse.json(
      { error: "Fonctionnalité réservée au plan Pro ou Business" },
      { status: 403 }
    );
  }

  const body = await request.json() as { quoteId?: string };
  const { quoteId } = body;

  if (!quoteId) {
    return NextResponse.json({ error: "quoteId requis" }, { status: 400 });
  }

  // Already linked? Return the existing contract instead of erroring.
  const { data: existing } = await supabase
    .from("contracts")
    .select("*, clients(name, email), quotes(number, total_ht)")
    .eq("quote_id", quoteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, data: existing, alreadyExisted: true });
  }

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, title, total_ht, currency, client_id, clients(*)")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("quote_items")
    .select("description")
    .eq("quote_id", quoteId);

  const { data: templates } = await supabase
    .from("contract_templates")
    .select("id, name, content, category, is_system")
    .order("name");

  const template =
    (templates || []).find((t) => t.category === "prestation" && t.is_system) ||
    (templates || []).find((t) => t.is_system && t.content) ||
    null;

  const client = Array.isArray(quote.clients) ? quote.clients[0] : quote.clients;

  const payload = buildContractFromQuote({
    quote: {
      id: quote.id,
      title: quote.title,
      total_ht: Number(quote.total_ht),
      currency: quote.currency || "EUR",
      client_id: quote.client_id,
    },
    items: items || [],
    client,
    profile,
    template,
  });

  const { data, error } = await supabase
    .from("contracts")
    .insert({
      user_id: user.id,
      title: payload.title,
      client_id: payload.client_id,
      template_id: payload.template_id,
      quote_id: payload.quote_id,
      amount: payload.amount,
      currency: payload.currency,
      frequency: payload.frequency,
      start_date: payload.start_date,
      next_invoice_date: payload.start_date,
      description: payload.description,
      document_type: payload.document_type,
      content: payload.content,
      status: "draft",
    })
    .select("*, clients(name, email), quotes(number, total_ht)")
    .single();

  if (error) {
    // Unique index race: another request created the link first.
    if (error.code === "23505") {
      const { data: raceExisting } = await supabase
        .from("contracts")
        .select("*, clients(name, email), quotes(number, total_ht)")
        .eq("quote_id", quoteId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (raceExisting) {
        return NextResponse.json({ success: true, data: raceExisting, alreadyExisted: true });
      }
    }
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data, alreadyExisted: false }, { status: 201 });
}
