import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { invoiceEmail } from "@/lib/emails/invoice";
import { formatCurrency, formatDate } from "@/lib/utils/quote";

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

/**
 * POST /api/invoices/[id]/send — Send an invoice email to the client.
 * Updates status to 'sent'.
 */
export async function POST(
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

  // Fetch invoice + client + quote
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, clients(name, email), quotes(title)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
  if (!client?.email) {
    return NextResponse.json(
      { error: "Aucun email client associé à cette facture" },
      { status: 400 }
    );
  }

  const quoteData = Array.isArray(invoice.quotes) ? invoice.quotes[0] : invoice.quotes;

  // Fetch sender profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, full_name")
    .eq("id", user.id)
    .single();

  const companyName =
    profile?.company_name || profile?.full_name || "Votre prestataire";

  const { subject, html } = invoiceEmail({
    clientName: client.name,
    invoiceNumber: invoice.invoice_number,
    quoteTitle: quoteData?.title || "Prestation",
    amount: formatCurrency(Number(invoice.amount)),
    dueDate: invoice.due_date ? formatDate(invoice.due_date) : "—",
    checkoutUrl: invoice.stripe_checkout_url || "#",
    companyName,
  });

  const { error: sendError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: client.email,
    subject,
    html,
  });

  if (sendError) {
    return NextResponse.json(
      { error: "Erreur envoi email: " + sendError.message },
      { status: 500 }
    );
  }

  // Update status to sent
  await supabase
    .from("invoices")
    .update({ status: "sent" })
    .eq("id", id);

  return NextResponse.json({ success: true });
}
