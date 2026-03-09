import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateInvoice } from "@/lib/invoices/generate-invoice";
import { resend } from "@/lib/resend";
import { invoiceEmail } from "@/lib/emails/invoice";
import { formatCurrency, formatDate } from "@/lib/utils/quote";

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

/**
 * GET /api/cron/invoices — Daily cron to generate recurring invoices.
 * Protected by CRON_SECRET.
 *
 * Logic:
 * 1. Find quotes where is_recurring = true AND recurring_next_date <= today
 *    AND (recurring_end_date IS NULL OR recurring_end_date >= today)
 * 2. For each: generateInvoice() → send email
 * 3. If Stripe fails, skip that quote (retry next day — recurring_next_date unchanged)
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = new Date().toISOString().split("T")[0];

  // Find all due recurring quotes
  const { data: quotes } = await supabase
    .from("quotes")
    .select(`
      id, user_id, title, total_ttc,
      recurring_frequency, recurring_next_date, recurring_end_date,
      client_id, clients(name, email),
      profiles!quotes_user_id_fkey(company_name, full_name, subscription_status)
    `)
    .eq("is_recurring", true)
    .lte("recurring_next_date", today)
    .or("recurring_end_date.is.null,recurring_end_date.gte." + today);

  if (!quotes || quotes.length === 0) {
    return NextResponse.json({ generated: 0, message: "No recurring invoices due" });
  }

  let generated = 0;
  const errors: string[] = [];

  for (const quote of quotes) {
    // Only Pro/Business users
    const profile = quote.profiles as unknown as {
      company_name: string | null;
      full_name: string | null;
      subscription_status: string;
    } | null;

    if (!profile || profile.subscription_status === "free") continue;

    const client = Array.isArray(quote.clients) ? quote.clients[0] : quote.clients;
    const clientName = (client as { name: string } | null)?.name || "Client";
    const clientEmail = (client as { email: string | null } | null)?.email;

    try {
      const result = await generateInvoice(quote.id, quote.user_id);

      // Send email if client has email
      if (clientEmail && result.invoice.stripe_checkout_url) {
        const companyName =
          profile.company_name || profile.full_name || "Votre prestataire";

        const { subject, html } = invoiceEmail({
          clientName,
          invoiceNumber: result.invoice.invoice_number,
          quoteTitle: quote.title,
          amount: formatCurrency(Number(result.invoice.amount)),
          dueDate: result.invoice.due_date
            ? formatDate(result.invoice.due_date)
            : "—",
          checkoutUrl: result.invoice.stripe_checkout_url,
          companyName,
        });

        const { error: sendError } = await resend.emails.send({
          from: FROM_EMAIL,
          to: clientEmail,
          subject,
          html,
        });

        if (!sendError) {
          // Mark as sent
          await supabase
            .from("invoices")
            .update({ status: "sent" })
            .eq("id", result.invoice.id);
        } else {
          console.error(
            `[Cron Invoice] Email failed for ${result.invoice.invoice_number}:`,
            sendError
          );
        }
      }

      generated++;
      console.log(
        `[Cron Invoice] Generated ${result.invoice.invoice_number} for quote ${quote.id}`
      );
    } catch (err) {
      // Stripe failure or other error — recurring_next_date NOT updated (retry tomorrow)
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[Cron Invoice] Failed for quote ${quote.id}:`, msg);
      errors.push(`${quote.id}: ${msg}`);
    }
  }

  return NextResponse.json({
    generated,
    errors: errors.length > 0 ? errors : undefined,
  });
}
