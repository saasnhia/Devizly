import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  submitInvoice,
  checkDirectoryEntry,
  SuperPdpError,
} from "@/lib/superpdp/client";
import { loadConnection, getValidAccessToken } from "@/lib/superpdp/connection";

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

  // 1. Fetch invoice + client (for the directory pre-check)
  const { data: invoice, error: invoiceError } = await dbClient
    .from("invoices")
    .select("*, clients(name, siret)")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  // 2. Check Factur-X exists
  if (!invoice.facturx_pdf_path) {
    return NextResponse.json(
      { error: "Factur-X non généré. Veuillez d'abord générer la facture Factur-X." },
      { status: 400 }
    );
  }

  // 3. Already transmitted? Idempotent — surface the existing transmission
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

  // 4. This user's own SUPER PDP connection (multi-tenant: one per user,
  // established via the authorization_code flow in /api/superpdp/connect).
  const connection = await loadConnection(dbClient, user.id);
  if (!connection) {
    return NextResponse.json(
      { error: "Connectez votre entreprise à SUPER PDP dans Paramètres" },
      { status: 400 }
    );
  }

  // 5. Fetch profile (informational SIREN sanity check only — see below)
  const { data: profile } = await dbClient
    .from("profiles")
    .select("company_siret")
    .eq("id", user.id)
    .single();

  // 6. Download Factur-X PDF from Supabase Storage (same source as generation)
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

    // Pre-check: is the client reachable on the PA network? Soft check —
    // a missing/foreign client SIREN doesn't block the attempt, but a known
    // French SIREN absent from the directory gets a clear message upfront
    // rather than the platform's cryptic rejection.
    const clientRecord = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
    const clientSiren = cleanSiren(clientRecord?.siret).slice(0, 9);
    if (clientSiren.length === 9) {
      try {
        const directory = await checkDirectoryEntry(token, clientSiren);
        if (!directory.data || directory.data.length === 0) {
          return NextResponse.json(
            {
              error:
                "Le client n'est pas inscrit à l'annuaire des Plateformes Agréées — il ne peut pas encore recevoir de facture électronique. Il doit se raccorder à une PA/PDP.",
            },
            { status: 400 }
          );
        }
      } catch (precheckErr) {
        // Directory lookup failing shouldn't block the send attempt itself.
        console.warn(
          "[send-superpdp] Directory pre-check failed, proceeding anyway:",
          precheckErr instanceof Error ? precheckErr.message : precheckErr
        );
      }
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
