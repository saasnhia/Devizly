import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Cron endpoint: auto-send reminders for "envoyé" quotes at J+3, J+7, J+14.
 * Trigger via Vercel Cron or external scheduler.
 * Protected by CRON_SECRET header.
 */

const REMINDER_DAYS = [3, 7, 14] as const;

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  let totalSent = 0;

  // Find all "envoyé" quotes from pro/business users
  const { data: quotes } = await supabase
    .from("quotes")
    .select(`
      id, title, created_at, user_id, client_id,
      clients(name, email, phone),
      profiles!quotes_user_id_fkey(subscription_status)
    `)
    .eq("status", "envoyé");

  if (!quotes || quotes.length === 0) {
    return NextResponse.json({ sent: 0, message: "No pending quotes" });
  }

  for (const quote of quotes) {
    // Only pro and business users get auto-reminders
    const profile = quote.profiles as unknown as { subscription_status: string } | null;
    if (!profile || profile.subscription_status === "free") continue;

    const client = quote.clients as unknown as { name: string; email: string | null; phone: string | null } | null;
    if (!client?.email) continue;

    const createdAt = new Date(quote.created_at);
    const daysSinceCreated = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i < REMINDER_DAYS.length; i++) {
      const reminderDay = REMINDER_DAYS[i];
      const reminderNumber = i + 1;

      if (daysSinceCreated < reminderDay) continue;

      // Check if already sent
      const { data: existing } = await supabase
        .from("quote_reminders")
        .select("id")
        .eq("quote_id", quote.id)
        .eq("reminder_number", reminderNumber)
        .eq("type", "email")
        .single();

      if (existing) continue;

      // TODO: integrate real email service (Resend, SendGrid, etc.)
      // For now, just log and record the reminder
      console.log(
        `[Reminder] J+${reminderDay} for quote "${quote.title}" → ${client.email}`
      );

      // Record reminder as sent
      await supabase.from("quote_reminders").insert({
        quote_id: quote.id,
        user_id: quote.user_id,
        type: "email",
        reminder_number: reminderNumber,
      });

      totalSent++;
    }
  }

  return NextResponse.json({ sent: totalSent });
}
