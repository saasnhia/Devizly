import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { syncSuperpdpEventsForUser } from "@/lib/superpdp/sync";

/**
 * On-demand "Rafraîchir" for a single invoice's SUPER PDP status —
 * triggers a sync of just this invoice owner's SUPER PDP connection (each
 * user has their own /invoice_events feed under the multi-tenant
 * authorization_code model), then returns this invoice's current
 * transmission + latest event.
 */

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Ownership check under the user's own RLS-scoped session before doing
  // any service-role work below.
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  try {
    const serviceClient = createServiceClient();
    await syncSuperpdpEventsForUser(serviceClient, user.id);

    const { data: transmission } = await serviceClient
      .from("superpdp_transmissions")
      .select("*")
      .eq("invoice_id", invoiceId)
      .maybeSingle();

    const { data: latestEvent } = await serviceClient
      .from("superpdp_events")
      .select("status_code, reason_code, message, event_date")
      .eq("invoice_id", invoiceId)
      .order("event_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      transmission,
      latest_event: latestEvent,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[superpdp-refresh] Failed:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
