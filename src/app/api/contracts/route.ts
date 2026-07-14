import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Check plan — Pro+ only
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_status === "free") {
    return NextResponse.json(
      { error: "Fonctionnalité réservée au plan Pro ou Business" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("contracts")
    .select("*, clients(name, email), quotes(number, total_ht)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Check plan — Pro+ only
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_status === "free") {
    return NextResponse.json(
      { error: "Fonctionnalité réservée au plan Pro ou Business" },
      { status: 403 }
    );
  }

  const body = await request.json() as {
    title?: string;
    client_id?: string | null;
    template_id?: string | null;
    quote_id?: string | null;
    amount?: number;
    frequency?: string;
    start_date?: string;
    end_date?: string | null;
    notes?: string | null;
    description?: string | null;
    content?: string | null;
    document_type?: string;
    currency?: string;
  };

  const {
    title,
    client_id,
    template_id,
    quote_id,
    amount,
    frequency,
    start_date,
    end_date,
    notes,
    description,
    content,
    document_type,
    currency,
  } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
  }

  if (!start_date) {
    return NextResponse.json(
      { error: "La date de début est requise" },
      { status: 400 }
    );
  }

  const validFrequencies = ["monthly", "quarterly", "yearly"];
  const freq = frequency || "monthly";
  if (!validFrequencies.includes(freq)) {
    return NextResponse.json(
      { error: "Fréquence invalide" },
      { status: 400 }
    );
  }

  // A quote can only be linked to one contract — verify ownership if provided.
  if (quote_id) {
    const { data: quote } = await supabase
      .from("quotes")
      .select("id")
      .eq("id", quote_id)
      .eq("user_id", user.id)
      .single();
    if (!quote) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }
  }

  // Compute next_invoice_date = start_date
  const { data, error } = await supabase
    .from("contracts")
    .insert({
      user_id: user.id,
      title: title.trim(),
      client_id: client_id || null,
      template_id: template_id || null,
      quote_id: quote_id || null,
      amount: amount ?? 0,
      currency: currency || "EUR",
      frequency: freq,
      start_date,
      end_date: end_date || null,
      next_invoice_date: start_date,
      notes: notes || null,
      description: description || null,
      content: content || null,
      document_type: document_type || "recurring",
      status: "draft",
    })
    .select("*, clients(name, email), quotes(number, total_ht)")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ce devis a déjà un contrat associé" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
