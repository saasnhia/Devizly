import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/resend";
import { welcomeEmail } from "@/lib/emails/welcome";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Send welcome email on first OAuth login (non-blocking)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const createdAt = new Date(user.created_at).getTime();
          const now = Date.now();
          const isNewUser = now - createdAt < 60_000; // created less than 60s ago
          if (isNewUser) {
            const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
            const { subject, html } = welcomeEmail({ userName });
            await getResend().emails.send({
              from: "Devizly <noreply@devizly.fr>",
              to: user.email!,
              subject,
              html,
            });
          }
        }
      } catch (emailErr) {
        console.error("[auth/callback] Welcome email failed:", emailErr);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
