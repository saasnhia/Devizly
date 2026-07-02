import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/tips/dismiss — body: { tipId: string } */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { tipId } = body as { tipId?: string };

  if (!tipId || typeof tipId !== "string") {
    return NextResponse.json({ error: "tipId requis" }, { status: 400 });
  }

  const { error } = await supabase
    .from("dismissed_tips")
    .upsert({ user_id: user.id, tip_id: tipId }, { onConflict: "user_id,tip_id" });

  if (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
