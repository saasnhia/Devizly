import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { releaseEscrowFunds } from "@/lib/invoices/escrow";

/**
 * Cron endpoint: auto-release escrows held for 90+ days.
 * Stripe caps manual transfers at 90 days after the original charge —
 * beyond that, funds must be released automatically to stay compliant.
 * Vercel Cron runs daily (vercel.json). Protected by CRON_SECRET header.
 */

const ESCROW_MAX_HOLD_DAYS = 90;

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

  const supabase = createServiceClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ESCROW_MAX_HOLD_DAYS);

  const { data: heldInvoices, error } = await supabase
    .from("invoices")
    .select("id")
    .eq("escrow_status", "held")
    .lte("paid_at", cutoff.toISOString());

  if (error) {
    console.error("[Escrow Cron] Fetch failed:", error.message);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }

  let released = 0;
  const errors: string[] = [];

  for (const invoice of heldInvoices || []) {
    const result = await releaseEscrowFunds(supabase, invoice.id, { auto: true });
    if (result.ok) {
      released++;
      console.log(`[Escrow Cron] Auto-released invoice ${invoice.id} (transfer ${result.transferId})`);
    } else {
      errors.push(`${invoice.id}: ${result.error}`);
      console.error(`[Escrow Cron] Auto-release failed for ${invoice.id}:`, result.error);
    }
  }

  return NextResponse.json({
    released,
    errors: errors.length > 0 ? errors : undefined,
  });
}
