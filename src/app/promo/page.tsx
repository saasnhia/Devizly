import type { Metadata } from "next";
import { PromoCountdown } from "./promo-client";

/**
 * Page promo "2 Semaines Offertes".
 * URL : /promo?code=DEVIZLY-XXXXXX&expires=<ms-epoch>
 * Hors groupes de routes -> layout racine uniquement (pas de chrome marketing),
 * pour un visuel premium plein ecran.
 */

export const metadata: Metadata = {
  title: "2 semaines Pro offertes — Devizly",
  description: "Activez 2 semaines du plan Pro Devizly, gratuitement.",
  robots: { index: false, follow: false },
};

export default async function PromoPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; expires?: string }>;
}) {
  const { code, expires } = await searchParams;
  const expiresMs = Number(expires);

  return (
    <PromoCountdown
      code={typeof code === "string" ? code : ""}
      expiresMs={Number.isFinite(expiresMs) && expiresMs > 0 ? expiresMs : 0}
    />
  );
}
