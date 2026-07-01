import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

/**
 * Records a paid invoice into e_reporting_data (e-reporting obligation —
 * distinct from Factur-X B2B e-invoicing, covers B2C + international sales).
 * Never throws — must not break the payment flows that call it.
 */
export async function recordEReportingTransaction(invoiceId: string): Promise<void> {
  try {
    const supabase = createServiceClient();

    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, user_id, client_id, quote_id, amount, paid_at")
      .eq("id", invoiceId)
      .single();

    if (!invoice) return;

    // Anti-doublon — idx_e_reporting_data_invoice_unique also enforces this
    // at the DB level, but checking first avoids a noisy constraint error
    // on retriggers (e.g. auto-invoice's redundant status='paid' updates).
    const { data: existing } = await supabase
      .from("e_reporting_data")
      .select("id")
      .eq("invoice_id", invoiceId)
      .single();
    if (existing) return;

    let clientType: "b2b" | "b2c" | "international" = "b2b";
    if (invoice.client_id) {
      const { data: client } = await supabase
        .from("clients")
        .select("client_type, country")
        .eq("id", invoice.client_id)
        .single();
      if (client) {
        clientType = client.client_type === "b2c" ? "b2c" : "b2b";
        if (client.country && client.country !== "FR") {
          clientType = "international";
        }
      }
    }

    const totalTtc = Number(invoice.amount) || 0;
    let totalHt = totalTtc;
    let totalVat = 0;
    let vatRate: number | null = null;

    if (invoice.quote_id) {
      const { data: quote } = await supabase
        .from("quotes")
        .select("total_ht, tva_rate")
        .eq("id", invoice.quote_id)
        .single();
      if (quote) {
        totalHt = Number(quote.total_ht) || 0;
        vatRate = Number(quote.tva_rate) || 0;
        totalVat = Math.round((totalTtc - totalHt) * 100) / 100;
      }
    } else {
      // No linked quote — derive HT/VAT from the seller's profile settings
      // (same fallback logic used in the Factur-X relay route).
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_micro_entrepreneur, tva_applicable, default_tva_rate")
        .eq("id", invoice.user_id)
        .single();
      const isExempt =
        profile?.is_micro_entrepreneur === true || profile?.tva_applicable === false;
      vatRate = isExempt ? 0 : Number(profile?.default_tva_rate) || 20;
      totalHt = Math.round((totalTtc / (1 + vatRate / 100)) * 100) / 100;
      totalVat = Math.round((totalTtc - totalHt) * 100) / 100;
    }

    const transactionDate = (invoice.paid_at || new Date().toISOString()).slice(0, 10);

    await supabase.from("e_reporting_data").insert({
      user_id: invoice.user_id,
      invoice_id: invoice.id,
      client_type: clientType,
      transaction_date: transactionDate,
      total_ht: totalHt,
      total_vat: totalVat,
      total_ttc: totalTtc,
      vat_rate: vatRate,
      payment_date: transactionDate,
      payment_amount: totalTtc,
      reporting_status: "pending",
    });
  } catch (err) {
    console.error("[e-reporting] recordEReportingTransaction failed:", err);
  }
}
