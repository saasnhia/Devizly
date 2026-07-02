/**
 * In-app contextual guidance — tips shown on the dashboard based on what
 * the user has already done and what's left. See src/app/api/tips/route.ts
 * for how TipProfile/TipStats are computed and how tips are filtered.
 */

export interface TipProfile {
  companySiret: string | null;
  stripeConnected: boolean;
  calendlyUrl: string | null;
  isMicroEntrepreneur: boolean;
  visitedUrssaf: boolean;
}

export interface TipStats {
  clientsCount: number;
  quotesCount: number;
  quotesSigned: number;
  invoicesCount: number;
  invoicesOverdue: number;
  hasGeneratedFacturx: boolean;
  hasSchedule: boolean;
  hasB2cClients: boolean;
  usesAcompte: boolean;
}

export type TipCategory = "onboarding" | "feature" | "news" | "conseil";

export interface Tip {
  id: string;
  title: string;
  message: string;
  action?: { label: string; href: string };
  condition: (profile: TipProfile, stats: TipStats) => boolean;
  priority: number;
  dismissable: boolean;
  category: TipCategory;
  /** Matches a sidebar/UI element's data-tip-target for the highlight effect. */
  targetSelector?: string;
}

export const TIPS: Tip[] = [
  // ── ONBOARDING ──────────────────────────────────────────
  {
    id: "tip_complete_profile",
    title: "Complétez votre profil",
    message: "Complétez votre profil entreprise (SIRET, TVA) pour que vos devis soient conformes.",
    action: { label: "Paramètres", href: "/parametres" },
    condition: (p) => !p.companySiret,
    priority: 1,
    dismissable: true,
    category: "onboarding",
    targetSelector: "parametres",
  },
  {
    id: "tip_first_client",
    title: "Ajoutez votre premier client",
    message: "Ajoutez votre premier client pour pouvoir créer un devis.",
    action: { label: "Clients", href: "/clients" },
    condition: (_p, s) => s.clientsCount === 0,
    priority: 2,
    dismissable: true,
    category: "onboarding",
    targetSelector: "clients",
  },
  {
    id: "tip_first_quote",
    title: "Créez votre premier devis",
    message: "Créez votre premier devis en 30 secondes avec l'IA.",
    action: { label: "Nouveau devis", href: "/devis/nouveau" },
    condition: (_p, s) => s.quotesCount === 0 && s.clientsCount > 0,
    priority: 3,
    dismissable: true,
    category: "onboarding",
    targetSelector: "nouveau-devis",
  },
  {
    id: "tip_stripe_connect",
    title: "Connectez Stripe",
    message: "Connectez Stripe pour encaisser les paiements de vos clients directement sur votre compte.",
    action: { label: "Paramètres", href: "/parametres" },
    condition: (p, s) => !p.stripeConnected && s.quotesCount > 0,
    priority: 4,
    dismissable: true,
    category: "onboarding",
    targetSelector: "parametres",
  },
  {
    id: "tip_calendly",
    title: "Ajoutez votre Calendly",
    message: "Ajoutez votre lien Calendly — il apparaîtra sur vos devis pour faciliter la prise de rendez-vous.",
    action: { label: "Paramètres", href: "/parametres" },
    condition: (p, s) => !p.calendlyUrl && s.quotesCount > 2,
    priority: 5,
    dismissable: true,
    category: "onboarding",
    targetSelector: "parametres",
  },

  // ── FEATURES ────────────────────────────────────────────
  {
    id: "tip_facturx",
    title: "Factures Factur-X",
    message: "Saviez-vous que Devizly génère des factures Factur-X conformes à la réforme 2026 ?",
    action: { label: "Factures", href: "/dashboard/factures" },
    condition: (_p, s) => s.invoicesCount > 0 && !s.hasGeneratedFacturx,
    priority: 6,
    dismissable: true,
    category: "feature",
  },
  {
    id: "tip_echeancier",
    title: "Échéancier de paiement BTP",
    message: "Pour le BTP : créez un échéancier de paiement multi-étapes (acompte, situation, solde) directement sur vos devis.",
    action: { label: "Nouveau devis", href: "/devis/nouveau" },
    condition: (_p, s) => s.quotesCount > 3 && !s.hasSchedule,
    priority: 7,
    dismissable: true,
    category: "feature",
  },
  {
    id: "tip_relances",
    title: "Activez les relances",
    message: "Vous avez des factures en retard — activez les relances automatiques.",
    action: { label: "Paramètres", href: "/parametres" },
    condition: (_p, s) => s.invoicesOverdue > 0,
    priority: 8,
    dismissable: true,
    category: "feature",
    targetSelector: "parametres",
  },
  {
    id: "tip_urssaf",
    title: "Suivez vos cotisations URSSAF",
    message: "Suivez votre CA et vos cotisations URSSAF en temps réel.",
    action: { label: "URSSAF", href: "/dashboard/urssaf" },
    condition: (p) => p.isMicroEntrepreneur && !p.visitedUrssaf,
    priority: 9,
    dismissable: true,
    category: "feature",
    targetSelector: "urssaf",
  },

  // ── NEWS ────────────────────────────────────────────────
  {
    id: "tip_news_btp",
    title: "Nouveau",
    message: "🆕 Nouveau : échéancier BTP, remboursements en 1 clic, retenue de garantie 5%. Découvrez les nouvelles fonctionnalités !",
    action: { label: "Factures", href: "/dashboard/factures" },
    condition: () => true,
    priority: 10,
    dismissable: true,
    category: "news",
  },
  {
    id: "tip_news_ereporting",
    title: "E-reporting B2C",
    message: "🆕 E-reporting B2C : vos transactions particuliers sont automatiquement enregistrées pour la réforme 2026.",
    action: { label: "E-reporting", href: "/dashboard/e-reporting" },
    condition: (_p, s) => s.hasB2cClients,
    priority: 11,
    dismissable: true,
    category: "news",
  },

  // ── CONSEILS ────────────────────────────────────────────
  {
    id: "tip_conseil_acompte",
    title: "Conseil",
    message: "💡 Conseil : demandez un acompte de 30% à la signature pour sécuriser votre trésorerie.",
    condition: (_p, s) => s.quotesSigned > 2 && !s.usesAcompte,
    priority: 12,
    dismissable: true,
    category: "conseil",
  },
  {
    id: "tip_conseil_relance",
    title: "Conseil",
    message: "💡 Les relances automatiques à J+2, J+5 et J+7 récupèrent en moyenne 60% des impayés. Activez-les dans Paramètres.",
    action: { label: "Paramètres", href: "/parametres" },
    condition: (_p, s) => s.invoicesOverdue > 2,
    priority: 13,
    dismissable: true,
    category: "conseil",
    targetSelector: "parametres",
  },
];

/** Returns eligible, non-dismissed tips sorted by priority (ascending = shown first). */
export function getEligibleTips(
  profile: TipProfile,
  stats: TipStats,
  dismissedIds: Set<string>
): Tip[] {
  return TIPS.filter((tip) => !dismissedIds.has(tip.id) && tip.condition(profile, stats)).sort(
    (a, b) => a.priority - b.priority
  );
}
