import { Bot, Send, CreditCard } from "lucide-react";

export interface RecentPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
}

export const professions = [
  "Développeurs Web", "Architectes", "Consultants", "Photographes",
  "Graphistes", "Artisans", "Coaches", "Formateurs", "Traducteurs",
  "Community Managers", "Rédacteurs", "Vidéastes", "Électriciens",
  "Plombiers", "Menuisiers",
];

export const steps = [
  {
    num: "01",
    icon: Bot,
    title: "Décrivez votre prestation",
    description: "En quelques mots, l'IA structure votre devis avec des prix marché. Vous ajustez tout librement.",
  },
  {
    num: "02",
    icon: Send,
    title: "Envoyez et faites signer",
    description: "Votre client reçoit un lien, consulte le devis et signe électroniquement depuis son navigateur.",
  },
  {
    num: "03",
    icon: CreditCard,
    title: "Encaissez immédiatement",
    description: "Acompte Stripe intégré. Votre client paie en ligne, les fonds arrivent sous 48h.",
  },
];

export const plans = [
  {
    name: "Gratuit",
    price: 0,
    period: "",
    description: "Pour tester sans engagement",
    features: [
      "3 devis par mois",
      "Génération IA",
      "Signature électronique eIDAS",
      "Acompte Stripe",
      "Calendly intégré",
      "Export PDF",
    ],
    cta: "Commencer gratuitement",
    popular: false,
    href: "/signup",
  },
  {
    name: "Pro",
    price: 19,
    period: "/mois HT",
    description: "Pour les indépendants actifs",
    features: [
      "Devis illimités",
      "Tout le plan Gratuit",
      "Facturation automatique",
      "Relances J+2, J+5, J+7",
      "Templates relances",
      "Envoi contrats",
    ],
    cta: "Choisir Pro",
    popular: true,
    href: "/signup?plan=pro",
  },
  {
    name: "Business",
    price: 39,
    period: "/mois HT",
    description: "Pour les agences et pros exigeants",
    features: [
      "Tout le plan Pro",
      "Lead forms (5+ types)",
      "Contrats récurrents",
      "Gestion d'équipe",
      "Export CSV comptable",
      "Branding personnalisé",
      "Support prioritaire 24h",
    ],
    cta: "Choisir Business",
    popular: false,
    href: "/signup?plan=business",
  },
];

export const faqs = [
  {
    q: "Est-ce conforme aux exigences légales françaises ?",
    a: "Oui. Devizly génère des devis avec toutes les mentions obligatoires : SIRET, TVA, conditions de paiement, date de validité. L'IA est hébergée en France — vos données ne quittent jamais l'UE.",
  },
  {
    q: "L'IA décide-t-elle de mes prix ?",
    a: "Non. L'IA propose une structure de devis avec des prix marché comme suggestion de départ. Vous gardez le contrôle total : modifiez chaque ligne, chaque tarif, chaque description avant d'envoyer.",
  },
  {
    q: "Combien de devis gratuits par mois ?",
    a: "Le plan Gratuit offre 3 devis par mois, pour toujours, sans carte bancaire. Passez Pro (19\u00A0€/mois) pour un nombre illimité.",
  },
  {
    q: "Le client a-t-il besoin de créer un compte ?",
    a: "Non. Le client reçoit un lien unique et peut consulter, signer et payer le devis directement depuis son navigateur, sans inscription.",
  },
  {
    q: "Comment fonctionne le paiement intégré ?",
    a: "Devizly utilise Stripe Connect. Votre client paie par carte bancaire. Les fonds arrivent sur votre compte sous 48h. Vous n'avez rien à configurer côté facturation.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Hébergement européen (Supabase EU), chiffrement en transit et au repos, conforme RGPD. L'IA est 100% hébergée en France.",
  },
  {
    q: "Devizly fonctionne-t-il avec mon logiciel comptable ?",
    a: "Vous pouvez exporter vos factures en CSV compatible avec la plupart des logiciels comptables (Pennylane, Indy, etc.).",
  },
  {
    q: "La signature électronique a-t-elle une valeur juridique ?",
    a: "Oui. La signature Devizly est conforme au règlement européen eIDAS. Elle est horodatée, traçable et juridiquement opposable.",
  },
];

export const segmentCopy: Record<string, { hero: string; badge: string }> = {
  graphiste: { hero: "Devis pros pour graphistes", badge: "Designers & créatifs" },
  dev: { hero: "Devis pros pour développeurs", badge: "Développeurs web" },
  consultant: { hero: "Devis pros pour consultants", badge: "Consultants & coachs" },
  artisan: { hero: "Devis pros pour artisans", badge: "Artisans & BTP" },
  photographe: { hero: "Devis pros pour photographes", badge: "Photographes" },
  formateur: { hero: "Devis pros pour formateurs", badge: "Formateurs & coachs" },
};
