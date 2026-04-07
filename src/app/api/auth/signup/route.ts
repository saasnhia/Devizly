import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { checkSignupAbuse, recordSignupIp } from "@/lib/antiabuse";
import { getResend } from "@/lib/resend";
import { welcomeEmail } from "@/lib/emails/welcome";
import { assignReferralCode, linkReferral } from "@/lib/referral";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, fullName, ref_code } = body as {
    email: string;
    password: string;
    fullName: string;
    ref_code?: string;
  };

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "Tous les champs sont requis" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 6 caractères" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Adresse email invalide" },
      { status: 400 }
    );
  }

  // Get client IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "127.0.0.1";

  // Check IP rate limit
  const abuseCheck = await checkSignupAbuse(ip);
  if (!abuseCheck.allowed) {
    return NextResponse.json(
      { error: abuseCheck.reason },
      { status: 429 }
    );
  }

  // Create user via service role (server-side)
  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Record IP for rate limiting
  if (data.user) {
    await recordSignupIp(ip, data.user.id);

    // Assign referral code (non-blocking)
    try {
      await assignReferralCode(supabase, data.user.id, fullName);
    } catch (refErr) {
      console.error("[signup] Referral code assignment failed:", refErr);
    }

    // Link referral if ref_code provided
    if (ref_code) {
      try {
        await linkReferral(supabase, data.user.id, ref_code);
      } catch (linkErr) {
        console.error("[signup] Referral link failed:", linkErr);
      }
    }

    // Send welcome email (non-blocking)
    try {
      const { subject, html } = welcomeEmail({ userName: fullName });
      await getResend().emails.send({
        from: "Devizly <noreply@devizly.fr>",
        to: email,
        subject,
        html,
      });
    } catch (emailErr) {
      console.error("[signup] Welcome email failed:", emailErr);
    }
  }

  return NextResponse.json({ success: true, userId: data.user?.id });
}
