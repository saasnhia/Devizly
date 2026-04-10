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

  // Auth: cookie session + Bearer fallback (same pattern as generate-facturx)
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
        console.warn("[push-pennylane] Bearer validation failed:", bearerError.message);
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

  // 1. Fetch invoice
  const { data: invoice, error: invoiceError } = await dbClient
    .from("invoices")
    .select("*")
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

  // 3. Fetch profile with Pennylane token
  const { data: profile } = await dbClient
    .from("profiles")
    .select("pa_provider, pa_credentials_encrypted")
    .eq("id", user.id)
    .single();

  if (!profile?.pa_provider || !profile.pa_credentials_encrypted) {
    return NextResponse.json(
      { error: "Pennylane non connecté. Connectez votre compte dans Paramètres." },
      { status: 400 }
    );
  }

  const pennylaneToken = profile.pa_credentials_encrypted;

  // 4. Download Factur-X PDF from Supabase Storage
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

  // 5. Push to Pennylane
  try {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([pdfBytes], { type: "application/pdf" }),
      `${invoice.invoice_number}.pdf`
    );
    formData.append("type", "customer");

    const pennylaneRes = await fetch(
      "https://app.pennylane.com/api/external/v2/e-invoices/imports",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${pennylaneToken}` },
        body: formData,
      }
    );

    if (!pennylaneRes.ok) {
      const errorBody = await pennylaneRes.text();
      console.error("[push-pennylane] Pennylane error:", pennylaneRes.status, errorBody);

      // Update invoice with error status
      await dbClient
        .from("invoices")
        .update({
          pa_status: "error",
          pa_error: `Pennylane ${pennylaneRes.status}: ${errorBody.slice(0, 500)}`,
        })
        .eq("id", invoiceId);

      return NextResponse.json(
        { error: "Erreur Pennylane", detail: errorBody },
        { status: 502 }
      );
    }

    const pennylaneData = await pennylaneRes.json();
    const pennylaneUrl = pennylaneData.url || "";
    // Extract invoice ID from URL (last numeric segment)
    const pennylaneId = pennylaneUrl.match(/\/(\d+)$/)?.[1] || pennylaneUrl;

    // 6. Update invoice with success
    await dbClient
      .from("invoices")
      .update({
        pa_invoice_id: pennylaneId,
        pa_status: "sent",
        pa_sent_at: new Date().toISOString(),
        pa_error: null,
      })
      .eq("id", invoiceId);

    // Update last sync on profile
    await dbClient
      .from("profiles")
      .update({ pa_last_sync_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      pennylane_url: pennylaneUrl,
      pa_status: "sent",
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[push-pennylane] Unexpected error:", errMsg);

    await dbClient
      .from("invoices")
      .update({
        pa_status: "error",
        pa_error: errMsg.slice(0, 500),
      })
      .eq("id", invoiceId);

    return NextResponse.json(
      { error: "Erreur inattendue", detail: errMsg },
      { status: 500 }
    );
  }
}
