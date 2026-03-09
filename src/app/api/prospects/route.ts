import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, company, notes, estimated_amount } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("prospects")
    .insert({
      user_id: user.id,
      name: name.trim(),
      email: email?.trim() || null,
      company: company?.trim() || null,
      notes: notes?.trim() || null,
      estimated_amount: estimated_amount || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, prospect: data });
}
