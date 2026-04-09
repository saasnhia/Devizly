import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // 1. Fetch invoice with client
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*, clients(*)")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (invoiceError || !invoice) {
    return NextResponse.json(
      { error: "Facture introuvable" },
      { status: 404 }
    );
  }

  // 2. Fetch seller profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.company_siret) {
    return NextResponse.json(
      {
        error: "Informations entreprise incompletes",
        detail:
          "SIRET, ville et code postal sont obligatoires pour Factur-X",
      },
      { status: 400 }
    );
  }

  // 3. Fetch quote_items if linked to a quote
  type QuoteItem = {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  };
  let items: QuoteItem[] = [];

  if (invoice.quote_id) {
    const { data: quoteItems } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", invoice.quote_id)
      .order("position", { ascending: true });

    if (quoteItems && quoteItems.length > 0) {
      items = quoteItems as QuoteItem[];
    }
  }

  // Fallback: single line with total amount
  if (items.length === 0) {
    items = [
      {
        description: "Prestation facturee",
        quantity: 1,
        unit_price: invoice.amount,
        total: invoice.amount,
      },
    ];
  }

  const isExempt = profile.tva_applicable === false;
  const tvaRate = isExempt ? 0 : (profile.default_tva_rate ?? 20);

  // 4. Build InvoiceData payload
  const payload = {
    invoice_number: invoice.invoice_number,
    invoice_type_code: "380",
    issue_date: new Date(invoice.created_at).toISOString().split("T")[0],
    currency: invoice.currency || "EUR",
    buyer_reference: invoice.quote_id || undefined,
    notes: isExempt
      ? "TVA non applicable, article 293 B du CGI"
      : undefined,
    seller: {
      name: profile.company_name,
      siret: profile.company_siret,
      vat_number: profile.tva_number || undefined,
      legal_form: profile.legal_form || undefined,
      rcs_number: profile.rcs_number || undefined,
      address: {
        line1: profile.company_address || "",
        postal_code: profile.company_postal_code || "",
        city: profile.company_city || "",
        country_code: profile.company_country || "FR",
      },
      email: user.email,
      phone: profile.company_phone || undefined,
      iban: profile.iban || undefined,
      bic: profile.bic || undefined,
      is_micro_entrepreneur: profile.is_micro_entrepreneur || false,
      vat_applicable: !isExempt,
    },
    buyer: {
      name: invoice.clients?.name || "Client",
      siret: invoice.clients?.siret || undefined,
      address: {
        line1: invoice.clients?.address || "",
        postal_code: invoice.clients?.postal_code || "",
        city: invoice.clients?.city || "",
        country_code: "FR",
      },
      email: invoice.clients?.email || undefined,
    },
    lines: items.map((item: QuoteItem, idx: number) => ({
      line_id: String(idx + 1),
      description: item.description,
      quantity: item.quantity,
      unit_code: "C62",
      unit_price_ht: item.unit_price,
      vat_category_code: isExempt ? "E" : "S",
      vat_rate: tvaRate,
      vat_exemption_reason: isExempt
        ? "TVA non applicable, article 293 B du CGI"
        : undefined,
    })),
    totals: {
      total_ht: invoice.amount,
      total_vat: 0, // TODO Phase 2B: calculate from lines
      total_ttc: invoice.amount,
      amount_payable: invoice.amount,
    },
    vat_breakdowns: [
      {
        basis_amount: invoice.amount,
        category_code: isExempt ? "E" : "S",
        rate: tvaRate,
        exemption_reason: isExempt
          ? "TVA non applicable, article 293 B du CGI"
          : undefined,
        tax_amount: 0, // TODO Phase 2B
      },
    ],
    payment: {
      due_date:
        invoice.due_date ||
        new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      terms: "Paiement a 30 jours",
      iban: profile.iban || undefined,
      bic: profile.bic || undefined,
    },
  };

  // 5. Call the Python function
  const facturxSecret = process.env.FACTURX_INTERNAL_SECRET;
  if (!facturxSecret) {
    return NextResponse.json(
      { error: "FACTURX_INTERNAL_SECRET non configure" },
      { status: 500 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const facturxUrl = `${baseUrl}/api/facturx/generate`;

  const facturxResponse = await fetch(facturxUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${facturxSecret}`,
    },
    body: JSON.stringify(payload),
  });

  if (!facturxResponse.ok) {
    const errorBody = await facturxResponse.text();
    return NextResponse.json(
      { error: "Echec generation Factur-X", detail: errorBody },
      { status: 500 }
    );
  }

  const pdfBuffer = await facturxResponse.arrayBuffer();

  // 6. Upload to Supabase Storage
  const filePath = `${user.id}/${invoice.invoice_number}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Echec upload storage", detail: uploadError.message },
      { status: 500 }
    );
  }

  // 7. Update invoice record
  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      facturx_pdf_path: filePath,
      facturx_generated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  if (updateError) {
    return NextResponse.json(
      { error: "Echec mise a jour DB", detail: updateError.message },
      { status: 500 }
    );
  }

  // 8. Return signed URL for download
  const { data: signedUrl } = await supabase.storage
    .from("invoices")
    .createSignedUrl(filePath, 3600);

  return NextResponse.json({
    success: true,
    invoice_number: invoice.invoice_number,
    facturx_pdf_path: filePath,
    download_url: signedUrl?.signedUrl,
  });
}
