import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * CSV export for e-reporting (B2C + international sales only — B2B is
 * already covered by Factur-X/PDP transmission, not by e-reporting).
 * GET /api/e-reporting/export?status=pending|sent|all (default: pending)
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  let query = supabase
    .from("e_reporting_data")
    .select(
      "transaction_date, client_type, total_ht, total_vat, total_ttc, vat_rate, payment_date, payment_amount, reporting_status, invoices(invoice_number)"
    )
    .eq("user_id", user.id)
    .in("client_type", ["b2c", "international"])
    .order("transaction_date", { ascending: true });

  if (status !== "all") {
    query = query.eq("reporting_status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }

  const header = [
    "Date transaction",
    "Type client",
    "N° facture",
    "Montant HT",
    "Montant TVA",
    "Montant TTC",
    "Taux TVA",
    "Date paiement",
    "Montant encaissé",
  ];

  const rows = (data || []).map((row) => {
    const invoiceNumber =
      (row.invoices as unknown as { invoice_number: string } | null)?.invoice_number || "";
    return [
      row.transaction_date,
      row.client_type,
      invoiceNumber,
      String(row.total_ht),
      String(row.total_vat),
      String(row.total_ttc),
      row.vat_rate != null ? String(row.vat_rate) : "",
      row.payment_date || "",
      row.payment_amount != null ? String(row.payment_amount) : "",
    ];
  });

  const BOM = "﻿"; // UTF-8 BOM for Excel FR
  const csvLines = [header, ...rows].map((cols) =>
    cols.map((c) => csvEscape(String(c))).join(";")
  );
  const csv = BOM + csvLines.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="e-reporting-${status}.csv"`,
    },
  });
}
