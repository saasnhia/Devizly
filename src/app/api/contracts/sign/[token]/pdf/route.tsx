import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContractPdf } from "@/lib/pdf/contract-template";
import type { ContractPdfProps } from "@/lib/pdf/contract-template";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

/**
 * GET /api/contracts/sign/[token]/pdf
 * Public endpoint — lets the client download the (draft or signed) contract
 * PDF from the signing page, without a session.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*, clients(name, email)")
    .eq("sign_token", token)
    .single();

  if (error || !contract) {
    return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, company_address, company_siret, logo_url, subscription_status")
    .eq("id", contract.user_id)
    .single();

  const client = Array.isArray(contract.clients)
    ? contract.clients[0]
    : contract.clients;

  const props: ContractPdfProps = {
    title: contract.title,
    documentType: contract.document_type,
    content: contract.content,
    amount: Number(contract.amount),
    currency: contract.currency || "EUR",
    frequency: contract.frequency,
    startDate: contract.start_date,
    endDate: contract.end_date,
    status: contract.status,
    client: client ? { name: client.name, email: client.email } : null,
    company: {
      name: profile?.company_name || undefined,
      address: profile?.company_address || undefined,
      siret: profile?.company_siret || undefined,
      logo_url: profile?.logo_url || undefined,
    },
    signatureData: contract.signature_data,
    signerName: contract.signer_name,
    signedAt: contract.signed_at,
    signerIp: contract.signer_ip,
    documentHash: contract.document_hash,
    createdAt: contract.created_at,
    ownerPlan: profile?.subscription_status || "free",
  };

  const buffer = await renderToBuffer(<ContractPdf {...props} />);
  const bytes = new Uint8Array(buffer);

  const filename = `${contract.title.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}.pdf`;

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
