import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revokeToken, SuperPdpError } from "@/lib/superpdp/client";
import { loadConnection } from "@/lib/superpdp/connection";

/**
 * POST /api/superpdp/disconnect
 * Revokes the user's refresh_token with SUPER PDP (cascades to any access
 * tokens derived from it) and deletes the local connection row.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const connection = await loadConnection(supabase, user.id);
  if (!connection) {
    return NextResponse.json({ error: "Aucune connexion SUPER PDP à déconnecter" }, { status: 400 });
  }

  try {
    await revokeToken(connection.refreshToken, "refresh_token");
  } catch (err) {
    // Revocation failing shouldn't block removing our own local record —
    // log it, but still delete so the user isn't stuck with a broken
    // connection they can't get rid of from the UI.
    const isSuperPdp = err instanceof SuperPdpError;
    console.error(
      "[superpdp/disconnect] Revocation failed (deleting local record anyway):",
      err instanceof Error ? err.message : err,
      isSuperPdp ? err.responseBody : ""
    );
  }

  const { error: deleteError } = await supabase
    .from("superpdp_connections")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la connexion", detail: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
