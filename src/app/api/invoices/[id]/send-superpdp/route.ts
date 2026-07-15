import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { submitInvoice, SuperPdpError } from "@/lib/superpdp/client";
import { loadConnection, getValidAccessToken } from "@/lib/superpdp/connection";
import { getClientDirectoryStatus } from "@/lib/superpdp/directory";

export const runtime = "nodejs";
export const maxDuration = 30;

function cleanSiren(siren: string | null | undefined): string {
  return (siren || "").replace(/\s/g, "");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params;

  // Auth: cookie session + Bearer fallback (same pattern as push-pennylane)
  const supabase = await createClient();
  let user = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dbClient: any = supabase;
  const { data: { user: cookieUser } } = await supabase.auth.getUser();

  if (cookieUser) {
    user = cookieUser;
  } else {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user: bearerUser }, error: bearerError } =
        await supabase.auth.getUser(token);
      if (bearerError) {
        console.warn("[send-superpdp] Bearer validation failed:", bearerError.message);
      } else if (bearerUser) {
        user = bearerUser;
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

  // 1. Fetch invoice + client (for the B2C gate + directory check)
  const { data: invoice, error: invoiceError } = await dbClient
    .from("invoices")
    .select("*, clients(name, siret, client_type)")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const clientRecord = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;

  // 2. B2C clients are out of scope for e-invoicing entirely — the
  // reform's B2B obligation doesn't apply to individuals. No SUPER PDP
  // attempt, no directory check; the UI should already hide this button
  // for B2C clients, this is the server-side backstop.
  //
  // TODO (not this obligation cycle — B2C e-reporting is Sept 2027, and
  // SUPER PDP's /v1.beta/b2c_transactions + /v1.beta/b2c_payments require
  // daily-granularity batching tied to the company's VAT declaration
  // calendar, which needs real design work): B2C invoices already feed
  // `e_reporting_data` at payment time for the manual CSV export. Once
  // ready, that same capture point should also push to SUPER PDP's B2C
  // e-reporting endpoints instead of/alongside the CSV export.
  if (clientRecord?.client_type === "b2c") {
    return NextResponse.json({ success: true, routable: false, reason: "b2c_not_applicable" });
  }

  // 3. Check Factur-X exists
  if (!invoice.facturx_pdf_path) {
    return NextResponse.json(
      { error: "Factur-X non généré. Veuillez d'abord générer la facture Factur-X." },
      { status: 400 }
    );
  }

  // 4. Already transmitted? Idempotent — surface the existing transmission
  // instead of sending a duplicate (mirrors the app's other PA integration).
  const { data: existingTransmission } = await dbClient
    .from("superpdp_transmissions")
    .select("*")
    .eq("invoice_id", invoiceId)
    .maybeSingle();

  if (existingTransmission?.status === "sent") {
    return NextResponse.json({
      success: true,
      already_sent: true,
      superpdp_invoice_id: existingTransmission.superpdp_invoice_id,
    });
  }

  // 5. This user's own SUPER PDP connection (multi-tenant: one per user,
  // established via the authorization_code flow in /api/superpdp/connect).
  const connection = await loadConnection(dbClient, user.id);
  if (!connection) {
    return NextResponse.json(
      { error: "Connectez votre entreprise à SUPER PDP dans Paramètres" },
      { status: 400 }
    );
  }

  // 6. Fetch profile (informational SIREN sanity check only — see below)
  const { data: profile } = await dbClient
    .from("profiles")
    .select("company_siret")
    .eq("id", user.id)
    .single();

  // 7. Download Factur-X PDF from Supabase Storage (same source as generation)
  const { data: pdfData, error: downloadError } = await dbClient.storage
    .from("invoices")
    .download(invoice.facturx_pdf_path);

  if (downloadError || !pdfData) {
    return NextResponse.json(
      { error: "Impossible de télécharger le PDF Factur-X", detail: downloadError?.message },
      { status: 500 }
    );
  }

  const pdfBytes = await pdfData.arrayBuffer();

  try {
    const token = await getValidAccessToken(dbClient, connection);

    // Sanity check only — not a hard block. Under the authorization_code
    // model the connected company IS the user's own company by
    // construction (they went through SUPER PDP's own enrollment tunnel),
    // so a mismatch here would indicate a data problem worth knowing about
    // rather than a structural blocker like it was under client_credentials.
    if (connection.companyNumberScheme === "fr_siren" && connection.companySiren) {
      const oauthSiren = cleanSiren(connection.companySiren);
      const sellerSiren = cleanSiren(profile?.company_siret);
      if (sellerSiren && oauthSiren !== sellerSiren) {
        console.warn(
          `[send-superpdp] SIREN mismatch for user ${user.id}: profil=${sellerSiren} vs connexion SUPER PDP=${oauthSiren}`
        );
      }
    }

    // Directory routing check (cached, TTL 14 days — see
    // src/lib/superpdp/directory.ts). In July 2026, almost no French
    // company is registered yet (reception obligation starts 1 Sept
    // 2026), so this is NOT a hard block: an unregistered client just
    // means "not routable via SUPER PDP today", surfaced to the UI so it
    // can fall back to the existing email flow instead of erroring.
    const directoryStatus = await getClientDirectoryStatus(dbClient, token, invoice.client_id);
    if (directoryStatus.registered !== true) {
      return NextResponse.json({ success: true, routable: false, reason: "not_in_directory" });
    }

    // Send the Factur-X PDF as-is — SUPER PDP is a transport/PA layer,
    // it does not regenerate the document.
    const result = await submitInvoice(token, pdfBytes, "facturx");
    const superpdpInvoiceId = String(result.id);
    const now = new Date().toISOString();

    const { data: transmission, error: upsertError } = await dbClient
      .from("superpdp_transmissions")
      .upsert(
        {
          invoice_id: invoiceId,
          user_id: user.id,
          superpdp_invoice_id: superpdpInvoiceId,
          status: "sent",
          format_sent: "facturx",
          error_message: null,
          response_raw: result,
          sent_at: now,
          updated_at: now,
        },
        { onConflict: "invoice_id" }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("[send-superpdp] Failed to persist transmission:", upsertError.message);
    }

    return NextResponse.json({
      success: true,
      superpdp_invoice_id: superpdpInvoiceId,
      transmission_id: transmission?.id,
    });
  } catch (err) {
    const isSuperPdp = err instanceof SuperPdpError;
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[send-superpdp] Error:", errMsg, isSuperPdp ? err.responseBody : "");

    await dbClient
      .from("superpdp_transmissions")
      .upsert(
        {
          invoice_id: invoiceId,
          user_id: user.id,
          status: "error",
          error_message: errMsg.slice(0, 500),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "invoice_id" }
      );

    return NextResponse.json(
      { error: "Erreur SUPER PDP", detail: errMsg },
      { status: isSuperPdp ? 502 : 500 }
    );
  }
}
