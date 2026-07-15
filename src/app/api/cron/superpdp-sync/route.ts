import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { syncSuperpdpEvents } from "@/lib/superpdp/sync";

/**
 * Scheduled polling for SUPER PDP invoice lifecycle events (fr:200..
 * fr:213/fr:501). SUPER PDP has no webhook mechanism, so this cron is the
 * only way statuses (received, accepted, rejected, paid...) get reflected
 * locally without a user manually clicking "Rafraîchir".
 * Protected by CRON_SECRET header, same pattern as the other /api/cron/*
 * routes.
 */

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const result = await syncSuperpdpEvents(supabase);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[cron/superpdp-sync] Failed:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
