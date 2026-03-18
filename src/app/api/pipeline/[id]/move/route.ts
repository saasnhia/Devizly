import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["prospect", "brouillon", "envoyé", "négociation", "signé", "accepté", "refusé", "payé"];

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
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { type, newStatus } = await request.json();

  if (!VALID_STATUSES.includes(newStatus)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  if (type === "quote") {
    const { error } = await supabase
      .from("quotes")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (type === "prospect") {
    // Moving prospect to a quote status — convert to quote
    if (newStatus !== "prospect") {
      const { data: prospect } = await supabase
        .from("prospects")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (!prospect) {
        return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
      }

      // Find or create client
      let clientId: string | null = null;
      if (prospect.email) {
        const { data: existingClient } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .eq("email", prospect.email)
          .single();

        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const { data: newClient } = await supabase
            .from("clients")
            .insert({
              user_id: user.id,
              name: prospect.name,
              email: prospect.email,
            })
            .select("id")
            .single();
          clientId = newClient?.id || null;
        }
      }

      // Create quote from prospect
      const { data: newQuote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          client_id: clientId,
          title: prospect.notes || `Devis pour ${prospect.name}`,
          total_ht: prospect.estimated_amount || 0,
          total_ttc: prospect.estimated_amount || 0,
          status: newStatus === "envoyé" ? "brouillon" : newStatus,
        })
        .select("id")
        .single();

      if (quoteError || !newQuote) {
        return NextResponse.json({ error: "Erreur creation devis" }, { status: 500 });
      }

      // Mark prospect as converted
      await supabase
        .from("prospects")
        .update({ converted_quote_id: newQuote.id })
        .eq("id", id);

      return NextResponse.json({ success: true, quoteId: newQuote.id });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}
