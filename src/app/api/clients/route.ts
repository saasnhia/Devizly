import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
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
  const { name, email, phone, address, city, postal_code, siret, client_type } = body;

  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  // Explicit choice wins. Otherwise infer from SIRET presence — covers
  // CSV imports and any other caller that doesn't send client_type.
  const resolvedClientType =
    client_type === "b2b" || client_type === "b2c"
      ? client_type
      : siret && String(siret).trim()
        ? "b2b"
        : "b2c";

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      postal_code: postal_code || null,
      siret: siret || null,
      client_type: resolvedClientType,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
