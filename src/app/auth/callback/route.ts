import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { getResend } from "@/lib/resend";
import { welcomeEmail } from "@/lib/emails/welcome";
import { assignReferralCode, linkReferral } from "@/lib/referral";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";
import { getSiteUrl } from "@/lib/url";

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

            // Assign referral code + link referral (service role needed)
            try {
              const serviceClient = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { cookies: { getAll: () => [], setAll: () => {} } }
              );
              await assignReferralCode(serviceClient, user.id, userName);
              const cookieStore = await cookies();
              const refCode = cookieStore.get("ref_code")?.value;
              if (refCode) {
                await linkReferral(serviceClient, user.id, refCode);
              }
            } catch (refErr) {
              console.error("[auth/callback] Referral setup failed:", refErr);
            }

            const unsubscribeUrl = `${getSiteUrl()}/api/emails/unsubscribe?token=${signUnsubscribeToken(user.id)}`;
            const { subject, html } = welcomeEmail({ userName, unsubscribeUrl });
            await getResend().emails.send({
              from: "Devizly <noreply@devizly.fr>",
              to: user.email!,
              subject,
              html,
              headers: {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
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
