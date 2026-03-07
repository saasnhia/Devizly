import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createPublicClient();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("share_token", token)
    .single();

  if (error || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  // Update viewed_at on first view
  if (!quote.viewed_at) {
    await supabase
      .from("quotes")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", quote.id);
  }

  return NextResponse.json({ success: true, data: quote });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createPublicClient();

  const body = await request.json();
  const { action, signature_data, signer_name } = body;

  if (action !== "accepté" && action !== "refusé" && action !== "signé") {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  // For signing, require signature data + signer name
  if (action === "signé") {
    if (!signature_data || !signer_name?.trim()) {
      return NextResponse.json(
        { error: "Signature et nom requis" },
        { status: 400 }
      );
    }
  }

  const { data: quote, error: findError } = await supabase
    .from("quotes")
    .select("id, status")
    .eq("share_token", token)
    .single();

  if (findError || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  if (
    quote.status === "signé" ||
    quote.status === "accepté" ||
    quote.status === "refusé"
  ) {
    return NextResponse.json(
      { error: "Ce devis a déjà reçu une réponse" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    status: action,
    updated_at: now,
  };

  if (action === "signé") {
    updateData.signature_data = signature_data;
    updateData.signer_name = signer_name.trim();
    updateData.signed_at = now;
  }

  const { error: updateError } = await supabase
    .from("quotes")
    .update(updateData)
    .eq("id", quote.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: action });
}
