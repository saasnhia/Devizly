import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInvoice } from "@/lib/invoices/generate-invoice";

/**
 * GET /api/invoices — List all invoices for the authenticated user.
 * Supports ?status=sent&page=1&limit=20
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("invoices")
    .select("*, clients(name, email)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && ["draft", "sent", "paid", "overdue"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data: invoices, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  return NextResponse.json({
    invoices: invoices || [],
    total: count || 0,
    page,
    limit,
  });
}

/**
 * POST /api/invoices — Create a manual invoice from a quote.
 * Body: { quoteId: string }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { quoteId } = await request.json();

  if (!quoteId) {
    return NextResponse.json({ error: "quoteId requis" }, { status: 400 });
  }

  try {
    const result = await generateInvoice(quoteId, user.id);
    return NextResponse.json({ success: true, invoice: result.invoice });
  } catch (err) {
    console.error("[invoices] POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
