import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { getSiteUrl } from "@/lib/url";
import { randomUUID } from "crypto";

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Check subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, company_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_status === "free") {
    return NextResponse.json(
      { error: "Fonctionnalite reservee au plan Pro ou Business" },
      { status: 403 }
    );
  }

  // Fetch contract with client
  const { data: contract } = await supabase
    .from("contracts")
    .select("*, clients(name, email)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!contract) {
    return NextResponse.json({ error: "Contrat introuvable" }, { status: 404 });
  }

  const client = Array.isArray(contract.clients)
    ? contract.clients[0]
    : contract.clients;

  if (!client?.email) {
    return NextResponse.json(
      { error: "Le client n'a pas d'adresse email" },
      { status: 400 }
    );
  }

  // Generate sign token if not exists
  const signToken = contract.sign_token || randomUUID();

  // Update contract status + token
  const { error: updateError } = await supabase
    .from("contracts")
    .update({
      sign_token: signToken,
      status: "pending_signature",
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send email
  const appUrl = getSiteUrl();
  const signUrl = `${appUrl}/contracts/sign/${signToken}`;
  const companyName = profile.company_name || "Votre prestataire";

  const { to } = await request.json().catch(() => ({ to: client.email }));
  const recipientEmail = to || client.email;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `${companyName} — Contrat à signer : ${contract.title}`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td style="background:linear-gradient(135deg,#0F172A,#1E293B);padding:32px;text-align:center;">
        <h1 style="color:#22D3A5;margin:0;font-size:24px;">Contrat a signer</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="font-size:16px;color:#334155;">Bonjour ${client.name},</p>
        <p style="font-size:14px;color:#64748B;line-height:1.6;">
          ${companyName} vous a envoye un contrat <strong>"${contract.title}"</strong> a signer electroniquement.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${signUrl}" style="display:inline-block;background:#22D3A5;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
            Consulter et signer
          </a>
        </div>
        <p style="font-size:12px;color:#94A3B8;text-align:center;">
          Ce lien est unique et securise. Ne le partagez pas.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#F8FAFC;padding:16px 32px;text-align:center;">
        <p style="font-size:12px;color:#94A3B8;margin:0;">
          Envoye via <a href="${appUrl}" style="color:#22D3A5;text-decoration:none;">Devizly</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  return NextResponse.json({ success: true, signToken });
}
