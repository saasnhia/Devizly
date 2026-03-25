import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Tarifs Devizly — Gratuit, Pro 19€, Business 39€/mois",
  description:
    "Découvrez les tarifs Devizly. Plan gratuit sans CB, Pro à 19€/mois pour les freelances, Business à 39€/mois pour les équipes. Sans engagement.",
  alternates: { canonical: "https://devizly.fr/pricing" },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://devizly.fr/pricing",
  offers: [
    {
      "@type": "Offer",
      name: "Gratuit",
      price: "0",
      priceCurrency: "EUR",
      description: "3 devis par mois, génération IA Mistral, templates professionnels",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "19",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "19",
        priceCurrency: "EUR",
        billingDuration: "P1M",
      },
      description: "Devis illimités, signature électronique, acomptes Stripe, relances auto, facturation PDF",
    },
    {
      "@type": "Offer",
      name: "Business",
      price: "39",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "39",
        priceCurrency: "EUR",
        billingDuration: "P1M",
      },
      description: "Tout le plan Pro + lead forms, contrats récurrents, gestion d'équipe, export CSV, branding personnalisé",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Puis-je changer de plan à tout moment ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, vous pouvez upgrader ou downgrader à tout moment. Le changement prend effet immédiatement, au prorata du temps restant.",
      },
    },
    {
      "@type": "Question",
      name: "Comment fonctionne le plan gratuit ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le plan Gratuit offre 3 devis par mois, pour toujours, sans carte bancaire. Passez Pro pour un nombre illimité de devis.",
      },
    },
    {
      "@type": "Question",
      name: "Comment annuler mon abonnement ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Depuis la page Paramètres ou via le bouton « Gérer l'abonnement ». L'annulation prend effet à la fin de la période en cours.",
      },
    },
  ],
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      {children}
    </>
  );
}
