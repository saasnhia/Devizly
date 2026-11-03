import type { UrssafActiviteType } from "@/types";

/**
 * Taux, seuils et plafonds micro-entrepreneur — source unique.
 *
 * Toute page ou calcul affichant un de ces chiffres doit importer ce
 * fichier : ne jamais recopier un taux en dur ailleurs.
 *
 * Sources officielles (consultées le 3 novembre 2026) :
 * - Taux 2026, plafonds micro, franchise TVA, CFP :
 *   https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html
 * - Calendrier BNC (24,6 % en 2025 → 25,6 % au 1er janvier 2026) et CIPAV 23,2 % :
 *   https://www.urssaf.fr/accueil/actualites/taux-cotisations-autoentrepeneur.html
 * - Taux ACRE et durée (fin du 3e trimestre civil suivant le début d'activité) :
 *   https://www.urssaf.fr/files/live/sites/urssaffr/files/autres/Diaporama_Auto-entrepreneur.pdf
 *   (Urssaf, avril 2026, pages 16-17)
 * - Passage de l'ACRE de 50 % à 25 % de réduction au 1er juillet 2026 :
 *   Décret n° 2026-69 du 6 février 2026, https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053449085
 */

export const URSSAF_RATES_YEAR = 2026;

/** Taux global de cotisations sociales, en %, à partir du 1er janvier 2026. */
export const TAUX_COTISATIONS: Record<UrssafActiviteType, number> = {
  vente_marchandises: 12.3,
  prestations_bic: 21.2,
  prestations_bnc: 25.6,
  liberale_cipav: 23.2,
};

/**
 * Taux ACRE publiés par l'Urssaf, en %. Ce ne sont pas de simples
 * fractions du taux plein (CIPAV notamment) : on reprend les valeurs
 * publiées telles quelles.
 */
export const TAUX_ACRE_AVANT_JUILLET_2026: Record<UrssafActiviteType, number> = {
  vente_marchandises: 6.2,
  prestations_bic: 10.6,
  prestations_bnc: 12.8,
  liberale_cipav: 13.4,
};

export const TAUX_ACRE_A_PARTIR_JUILLET_2026: Record<UrssafActiviteType, number> = {
  vente_marchandises: 9.3,
  prestations_bic: 15.9,
  prestations_bnc: 19.2,
  liberale_cipav: 17.4,
};

/** Créations à partir de cette date : réduction ACRE de 25 % au lieu de 50 %. */
export const ACRE_REFORM_DATE = "2026-07-01";

/**
 * Contribution à la formation professionnelle, en % du CA :
 * 0,1 % commerçants, 0,3 % artisans, 0,2 % professions libérales.
 */
export const TAUX_CFP: Record<UrssafActiviteType, number> = {
  vente_marchandises: 0.1,
  prestations_bic: 0.3,
  prestations_bnc: 0.2,
  liberale_cipav: 0.2,
};

/** Franchise en base de TVA (CGI art. 293 B), règles applicables depuis le 1er janvier 2025. */
export const SEUILS_TVA: Record<UrssafActiviteType, number> = {
  vente_marchandises: 85000,
  prestations_bic: 37500,
  prestations_bnc: 37500,
  liberale_cipav: 37500,
};

/** Seuils majorés : dépassement = sortie de la franchise dès l'année du dépassement. */
export const SEUILS_TVA_MAJORES: Record<UrssafActiviteType, number> = {
  vente_marchandises: 93500,
  prestations_bic: 41250,
  prestations_bnc: 41250,
  liberale_cipav: 41250,
};

/** Plafonds de chiffre d'affaires du régime micro-entrepreneur (CGI art. 50-0 et 102 ter). */
export const PLAFONDS_MICRO: Record<UrssafActiviteType, number> = {
  vente_marchandises: 203100,
  prestations_bic: 83600,
  prestations_bnc: 83600,
  liberale_cipav: 83600,
};

/** Formate un taux pour l'affichage : 25.6 → "25,6 %". */
export function formatTaux(taux: number): string {
  return `${taux.toLocaleString("fr-FR")} %`;
}

/** Formate un montant pour l'affichage : 83600 → "83 600 €". */
export function formatSeuil(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} €`;
}

/**
 * Dernier jour d'application du taux ACRE : fin du 3e trimestre civil
 * suivant celui du début d'activité (ex. début le 2 avril 2026 → 31 mars 2027).
 */
export function acreEndDate(startISO: string): Date | null {
  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) return null;
  const startQuarter = Math.floor(start.getMonth() / 3);
  // Premier jour du trimestre qui suit la période réduite, moins un jour.
  return new Date(start.getFullYear(), (startQuarter + 4) * 3, 0);
}

/**
 * Taux de cotisation applicable à une période (mois ou trimestre) commençant
 * à `periodeStartISO`, ACRE compris. Retourne aussi si l'ACRE s'applique.
 */
export function tauxCotisationPourPeriode(
  activite: UrssafActiviteType,
  periodeStartISO: string,
  acreActive: boolean,
  acreStartISO: string,
): { taux: number; acre: boolean } {
  const plein = TAUX_COTISATIONS[activite];
  if (!acreActive || !acreStartISO) return { taux: plein, acre: false };
  const end = acreEndDate(acreStartISO);
  const periodeStart = new Date(periodeStartISO);
  if (!end || Number.isNaN(periodeStart.getTime()) || periodeStart > end) {
    return { taux: plein, acre: false };
  }
  const table = acreStartISO < ACRE_REFORM_DATE
    ? TAUX_ACRE_AVANT_JUILLET_2026
    : TAUX_ACRE_A_PARTIR_JUILLET_2026;
  return { taux: table[activite], acre: true };
}
