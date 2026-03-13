import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createHash } from "crypto";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

/**
 * GET /api/contracts/sign/[token]
 * Public endpoint — returns contract data for the signing page.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select(
      "id, title, description, content, document_type, amount, currency, frequency, start_date, end_date, status, signature_data, signer_name, signed_at, created_at, user_id, clients(name, email)"
    )
    .eq("sign_token", token)
    .single();

  if (error || !contract) {
    return NextResponse.json(
      { error: "Contrat introuvable" },
      { status: 404 }
    );
  }

  // Get owner company info
  const { data: owner } = await supabase
    .from("profiles")
    .select("company_name, logo_url, brand_color, email, company_address, company_siret")
    .eq("id", contract.user_id)
    .single();

  const client = Array.isArray(contract.clients)
    ? contract.clients[0]
    : contract.clients;

  return NextResponse.json({
    contract: {
      id: contract.id,
      title: contract.title,
      description: contract.description,
      content: contract.content,
      documentType: contract.document_type,
      amount: contract.amount,
      currency: contract.currency,
      frequency: contract.frequency,
      startDate: contract.start_date,
      endDate: contract.end_date,
      status: contract.status,
      isSigned: !!contract.signed_at,
      signedAt: contract.signed_at,
      signerName: contract.signer_name,
      createdAt: contract.created_at,
    },
    client: client
      ? { name: client.name, email: client.email }
      : null,
    company: {
      name: owner?.company_name || "Votre prestataire",
      logoUrl: owner?.logo_url || null,
      brandColor: owner?.brand_color || "#22D3A5",
      email: owner?.email || null,
      address: owner?.company_address || null,
      siret: owner?.company_siret || null,
    },
  });
}

/**
 * POST /api/contracts/sign/[token]
 * Public endpoint — submit electronic signature.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: contract } = await supabase
    .from("contracts")
    .select("id, status, content, signed_at")
    .eq("sign_token", token)
    .single();

  if (!contract) {
    return NextResponse.json(
      { error: "Contrat introuvable" },
      { status: 404 }
    );
  }

  if (contract.signed_at) {
    return NextResponse.json(
      { error: "Ce contrat a deja ete signe" },
      { status: 400 }
    );
  }

  if (contract.status !== "pending_signature") {
    return NextResponse.json(
      { error: "Ce contrat n'est pas en attente de signature" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { signerName, signatureData } = body as {
    signerName: string;
    signatureData: string;
  };

  // Validation
  if (!signerName || signerName.length > 200) {
    return NextResponse.json(
      { error: "Nom du signataire invalide" },
      { status: 400 }
    );
  }

  if (!signatureData || signatureData.length > 500_000) {
    return NextResponse.json(
      { error: "Signature invalide ou trop volumineuse" },
      { status: 400 }
    );
  }

  // eIDAS audit fields
  const signerIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const documentHash = contract.content
    ? createHash("sha256").update(contract.content).digest("hex")
    : null;

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("contracts")
    .update({
      signature_data: signatureData,
      signer_name: signerName,
      signed_at: now,
      signer_ip: signerIp,
      document_hash: documentHash,
      status: "signed",
      updated_at: now,
    })
    .eq("id", contract.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Erreur lors de la signature" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, signedAt: now });
}
