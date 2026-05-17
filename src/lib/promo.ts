/**
 * Campagne promo "2 Semaines Offertes" — constantes partagees + generation de codes.
 *
 * Approche retenue : table `promo_codes` (cf. migration 038).
 * Le code est court et lisible (affichage premium + bouton "Copier"), et la
 * validation server-side se fait sur la table — un code = un user (RLS).
 */

import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PROMO_CAMPAIGN = "2-weeks-free-pro";
export const PROMO_TRIAL_DAYS = 14;
export const PROMO_TTL_HOURS = 24;

// Alphabet sans caracteres ambigus (pas de 0/O, 1/I, etc.)
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

/** Genere un code promo lisible : "DEVIZLY-XXXXXX". */
export function generatePromoCode(): string {
  let suffix = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    suffix += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return `DEVIZLY-${suffix}`;
}

/** URL absolue de la page promo pour un code + une expiration donnes. */
export function buildPromoUrl(
  appUrl: string,
  code: string,
  expiresAt: Date
): string {
  return `${appUrl}/promo?code=${encodeURIComponent(code)}&expires=${expiresAt.getTime()}`;
}

/**
 * Cree un code promo en base pour un user (campagne 2-weeks-free-pro).
 * Doit etre appele avec un client service role (ecriture sur promo_codes).
 * Retente sur collision de code (contrainte UNIQUE).
 */
export async function issuePromoCode(
  supabase: SupabaseClient,
  userId: string
): Promise<{ code: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + PROMO_TTL_HOURS * 60 * 60 * 1000);

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generatePromoCode();
    const { error } = await supabase.from("promo_codes").insert({
      user_id: userId,
      code,
      campaign: PROMO_CAMPAIGN,
      expires_at: expiresAt.toISOString(),
    });
    if (!error) return { code, expiresAt };
    // 23505 = unique_violation -> on retente avec un nouveau code
    if (error.code !== "23505") {
      throw new Error(`Insertion promo_codes échouée : ${error.message}`);
    }
  }
  throw new Error("Impossible de générer un code promo unique");
}
