import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

/**
 * GET /api/emails/unsubscribe?token=[hmac_token]
 * Public route — user clicks unsubscribe link in marketing emails
 * (Founder reminder, etc.). Sets marketing_emails_opt_out=true on
 * their profile.
 *
 * Token is HMAC-signed (signUnsubscribeToken) so a leaked link only
 * unsubscribes that specific user, not arbitrary ones.
 */

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(
      htmlPage("Lien invalide", "Le lien de désinscription est invalide ou expiré."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return new NextResponse(
      htmlPage("Lien invalide", "Le lien de désinscription est invalide ou expiré."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const supabase = createServiceClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, marketing_emails_opt_out")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return new NextResponse(
      htmlPage("Compte introuvable", "Aucun compte ne correspond à ce lien."),
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (profile.marketing_emails_opt_out) {
    return new NextResponse(
      htmlPage(
        "Déjà désinscrit",
        "Vous êtes déjà désinscrit de nos emails de rappel. Vous pouvez fermer cette page."
      ),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ marketing_emails_opt_out: true })
    .eq("id", userId);

  if (updateError) {
    console.error("[Unsubscribe] Update failed:", updateError);
    return new NextResponse(
      htmlPage(
        "Erreur",
        "Impossible de traiter votre demande pour l'instant. Réessayez dans quelques instants."
      ),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return new NextResponse(
    htmlPage(
      "Désinscription confirmée",
      "Vous ne recevrez plus d'emails de rappel marketing de Devizly. Vos emails transactionnels (devis, factures, paiements) restent actifs. Vous pouvez fermer cette page."
    ),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Devizly</title>
  <style>
    body { margin:0; padding:40px 20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#F8FAFC; color:#0F172A; }
    .card { max-width:480px; margin:60px auto; background:#fff; border-radius:12px; padding:40px; box-shadow:0 1px 3px rgba(0,0,0,0.1); text-align:center; }
    h1 { font-size:24px; margin:0 0 16px; }
    p { font-size:16px; color:#64748B; line-height:1.6; margin:0; }
    .logo { color:#6366F1; font-size:20px; font-weight:700; margin-bottom:24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Devizly</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
