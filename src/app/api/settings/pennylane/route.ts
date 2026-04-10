import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();

  // Disconnect flow
  if (body.action === "disconnect") {
    const { error } = await supabase
      .from("profiles")
      .update({
        pa_provider: null,
        pa_credentials_encrypted: null,
        pa_connected_at: null,
        pa_last_sync_at: null,
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Erreur déconnexion", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }

  // Connect flow
  const token = body.token;
  if (!token || typeof token !== "string" || token.length < 10) {
    return NextResponse.json(
      { error: "Token requis (minimum 10 caractères)" },
      { status: 400 }
    );
  }

  // TODO: validate token against Pennylane API (GET /api/external/v2/company)
  // when a sandbox account is available. For v1, we trust the user's input.

  const connectedAt = new Date().toISOString();

  // Store token in pa_credentials_encrypted (plaintext v1).
  // TODO: encrypt with AES-256 using ENCRYPTION_KEY env var before prod launch.
  // The column is protected by RLS (only the owning user can SELECT it)
  // and is never sent to the client (parametres page only reads pa_provider
  // and pa_connected_at, not pa_credentials_encrypted).
  const { error } = await supabase
    .from("profiles")
    .update({
      pa_provider: "pennylane",
      pa_credentials_encrypted: token,
      pa_connected_at: connectedAt,
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Erreur sauvegarde", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, connected_at: connectedAt });
}
