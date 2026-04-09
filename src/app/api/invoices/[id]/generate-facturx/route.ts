import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params;

  // Auth: cookie session in priority, fall back to Authorization: Bearer
  // for testing (e.g., cross-origin tests when OAuth callback is hardcoded
  // to production domain). Bearer validation uses the same Supabase JWT
  // signature check as cookie flow, so security is identical.
  //
  // For RLS-aware queries, we need a Supabase client whose underlying
  // PostgREST requests carry the user's JWT. The cookie SSR client does
  // this automatically from cookies. For Bearer flow, we instantiate a
  // separate token-scoped client (supabase-js) that injects the token
  // as Authorization header on every request. RLS still applies — we
  // never use the service role key here.
  const supabase = await createClient();
  let user = null;
  let dbClient: ReturnType<typeof createSupabaseClient> | Awaited<ReturnType<typeof createClient>> = supabase;
  const { data: { user: cookieUser } } = await supabase.auth.getUser();

  if (cookieUser) {
    user = cookieUser;
  } else {
    // Fallback: accept Bearer token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const {
        data: { user: bearerUser },
        error: bearerError,
      } = await supabase.auth.getUser(token);
      if (bearerError) {
        console.warn(
          "[facturx relay] Bearer token validation failed:",
          bearerError.message
        );
      } else if (bearerUser) {
        user = bearerUser;
        // Create a token-scoped client so RLS queries work without cookies
        dbClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          }
        );
      }
    }
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch invoice with client
  const { data: invoice, error: invoiceError } = await dbClient
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
  const { data: profile } = await dbClient
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
    const { data: quoteItems } = await dbClient
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

  // 4. VAT computation from profile + lines
  const isExempt =
    profile.is_micro_entrepreneur === true ||
    profile.tva_applicable === false;
  const effectiveTvaRate = isExempt
    ? 0
    : Number(profile.default_tva_rate) || 20;
  const vatCategory: "E" | "S" = isExempt ? "E" : "S";
  const exemptionReason: string | undefined = isExempt
    ? "TVA non applicable, article 293 B du CGI"
    : undefined;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  // Per-line computed amounts (kept locally for aggregation; not sent
  // in the payload because Pydantic InvoiceLine has no net/tax fields).
  type ComputedLine = {
    line_id: string;
    description: string;
    quantity: number;
    unit_code: string;
    unit_price_ht: number;
    vat_category_code: "E" | "S";
    vat_rate: number;
    vat_exemption_reason: string | undefined;
    _net: number;
    _tax: number;
  };

  const computedLines: ComputedLine[] = items.map(
    (item: QuoteItem, idx: number) => {
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const netAmount =
        item.total != null && !Number.isNaN(Number(item.total))
          ? Number(item.total)
          : round2(qty * unitPrice);
      const taxAmount = round2((netAmount * effectiveTvaRate) / 100);
      return {
        line_id: String(idx + 1),
        description: item.description,
        quantity: qty,
        unit_code: "C62",
        unit_price_ht: unitPrice,
        vat_category_code: vatCategory,
        vat_rate: effectiveTvaRate,
        vat_exemption_reason: exemptionReason,
        _net: netAmount,
        _tax: taxAmount,
      };
    }
  );

  // Aggregate vat_breakdowns by distinct rate (key = rate.toFixed(2)
  // to avoid float-collision bugs).
  const breakdownMap = new Map<
    string,
    { rate: number; basis: number; tax: number }
  >();
  for (const line of computedLines) {
    const key = line.vat_rate.toFixed(2);
    const existing =
      breakdownMap.get(key) || { rate: line.vat_rate, basis: 0, tax: 0 };
    existing.basis = round2(existing.basis + line._net);
    existing.tax = round2(existing.tax + line._tax);
    breakdownMap.set(key, existing);
  }

  const vatBreakdowns = Array.from(breakdownMap.values())
    .sort((a, b) => a.rate - b.rate)
    .map((b) => ({
      basis_amount: b.basis,
      category_code: vatCategory,
      rate: b.rate,
      exemption_reason: exemptionReason,
      tax_amount: b.tax,
    }));

  // Totals computed from lines (authoritative)
  const totalHt = round2(
    computedLines.reduce((s, l) => s + l._net, 0)
  );
  const totalVat = round2(
    vatBreakdowns.reduce((s, b) => s + b.tax_amount, 0)
  );
  const totalTtc = round2(totalHt + totalVat);

  // Sanity check vs invoice.amount (TTC in DB)
  const dbAmount = Number(invoice.amount) || 0;
  const gap = Math.abs(totalTtc - dbAmount);
  if (gap > 0.01) {
    console.warn(
      `[facturx relay] Computed TTC (${totalTtc}) differs from ` +
        `invoice.amount (${dbAmount}) by ${gap.toFixed(2)}€ — ` +
        `using computed values`
    );
  }

  // 5. Build InvoiceData payload (matches lib/models.py Pydantic schema)
  const payloadLines = computedLines.map((l) => ({
    line_id: l.line_id,
    description: l.description,
    quantity: l.quantity,
    unit_code: l.unit_code,
    unit_price_ht: l.unit_price_ht,
    vat_category_code: l.vat_category_code,
    vat_rate: l.vat_rate,
    vat_exemption_reason: l.vat_exemption_reason,
  }));

  const cleanSellerSiret = (profile.company_siret || "").replace(/\D/g, "");
  const cleanBuyerSiret =
    (invoice.clients?.siret || "").replace(/\D/g, "") || undefined;

  const payload = {
    invoice_number: invoice.invoice_number,
    invoice_type_code: "380",
    issue_date: new Date(invoice.created_at).toISOString().split("T")[0],
    currency: invoice.currency || "EUR",
    buyer_reference: invoice.quote_id || undefined,
    notes: exemptionReason,
    seller: {
      name: profile.company_name,
      siret: cleanSellerSiret,
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
      siret: cleanBuyerSiret,
      address: {
        line1: invoice.clients?.address || "",
        postal_code: invoice.clients?.postal_code || "",
        city: invoice.clients?.city || "",
        country_code: invoice.clients?.country || "FR",
      },
      email: invoice.clients?.email || undefined,
    },
    lines: payloadLines,
    totals: {
      total_ht: totalHt,
      total_vat: totalVat,
      total_ttc: totalTtc,
      amount_payable: totalTtc,
    },
    vat_breakdowns: vatBreakdowns,
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

  // For function-to-function calls on Vercel, use VERCEL_URL which is
  // auto-injected per deployment (preview → preview URL, prod → prod URL).
  // VERCEL_URL does not include protocol. Falls back to NEXT_PUBLIC_SITE_URL
  // for local dev and non-Vercel envs.
  const vercelHost = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;
  const baseUrl =
    vercelHost ||
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
  const { error: uploadError } = await dbClient.storage
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
  const { error: updateError } = await dbClient
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
  const { data: signedUrl } = await dbClient.storage
    .from("invoices")
    .createSignedUrl(filePath, 3600);

  return NextResponse.json({
    success: true,
    invoice_number: invoice.invoice_number,
    facturx_pdf_path: filePath,
    download_url: signedUrl?.signedUrl,
  });
}
