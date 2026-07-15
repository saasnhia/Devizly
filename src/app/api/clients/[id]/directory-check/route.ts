import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadConnection, getValidAccessToken } from "@/lib/superpdp/connection";
import { getClientDirectoryStatus } from "@/lib/superpdp/directory";

/**
 * POST /api/clients/[id]/directory-check
 * Check-and-cache a client's e-invoicing directory status (TTL 14 days —
 * see src/lib/superpdp/directory.ts). Shared by send-superpdp (checked
 * inline before sending) and a future manual "Revérifier" button — never
 * called per-row from the invoices list to avoid N+1 SUPER PDP API calls.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  const connection = await loadConnection(supabase, user.id);
  if (!connection) {
    return NextResponse.json({
      registered: null,
      checked_at: null,
      reason: "not_connected",
    });
  }

  try {
    const token = await getValidAccessToken(supabase, connection);
    const status = await getClientDirectoryStatus(supabase, token, clientId);
    return NextResponse.json({
      registered: status.registered,
      checked_at: status.checkedAt,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[directory-check] Failed:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
