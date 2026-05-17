import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { issuePromoCode, buildPromoUrl } from "@/lib/promo";
import { getSiteUrl } from "@/lib/url";

/**
 * Generation d'un code promo "2 semaines offertes" pour un user donne.
 *
 * Utilitaire protege par CRON_SECRET (pas un endpoint public — sinon
 * n'importe qui pourrait s'auto-attribuer des essais gratuits).
 * Le cron /api/cron/promo-2weeks genere les codes en masse via le meme
 * helper `issuePromoCode`. Cette route sert aux tests manuels / envois cibles.
 *
 * POST body : { "userId": "<uuid>" }
 * Retourne  : { code, url, expiresAt }
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: unknown;
  try {
    ({ userId } = await request.json());
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (typeof userId !== "string" || !UUID_RE.test(userId)) {
    return NextResponse.json({ error: "userId invalide" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verifier que le profil existe avant de generer un code orphelin
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  try {
    const { code, expiresAt } = await issuePromoCode(supabase, userId);
    return NextResponse.json({
      code,
      url: buildPromoUrl(getSiteUrl(), code, expiresAt),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[PromoGenerate]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
