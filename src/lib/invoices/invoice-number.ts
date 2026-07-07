import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Sequential invoice number: INV-YYYY-NNN, scoped per user per year.
 */
export async function getNextInvoiceNumber(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${year}-01-01`)
    .lt("created_at", `${year + 1}-01-01`);

  const seq = (count || 0) + 1;
  return `INV-${year}-${String(seq).padStart(3, "0")}`;
}
