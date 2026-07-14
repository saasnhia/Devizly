import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContractPdf } from "@/lib/pdf/contract-template";
import type { ContractPdfProps } from "@/lib/pdf/contract-template";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*, clients(name, email)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !contract) {
    return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, company_address, company_siret, logo_url, subscription_status")
    .eq("id", user.id)
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
