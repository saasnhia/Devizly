import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Logiciel Devis Gratuit en Ligne",
  description:
    "Cr\u00e9ez vos devis professionnels en 2 minutes avec l\u2019IA. Signature \u00e9lectronique, paiement Stripe, relances automatiques. Essai gratuit \u2014 sans CB.",
  alternates: { canonical: "https://devizly.fr" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Devizly est-il gratuit ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, plan gratuit avec 3 devis/mois, sans CB.",
      },
    },
    {
      "@type": "Question",
      name: "Comment cr\u00e9er un devis en ligne ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inscrivez-vous sur devizly.fr, renseignez les infos client et l\u2019IA g\u00e9n\u00e8re le devis en 2 minutes.",
      },
    },
    {
      "@type": "Question",
      name: "Devizly fonctionne-t-il sur mobile ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, accessible sur tout navigateur mobile.",
      },
    },
    {
      "@type": "Question",
      name: "Puis-je envoyer des factures ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, facturation automatique apr\u00e8s signature du devis.",
      },
    },
    {
      "@type": "Question",
      name: "Est-ce conforme \u00e0 la loi fran\u00e7aise ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, mentions l\u00e9gales obligatoires, TVA, num\u00e9rotation s\u00e9quentielle.",
      },
    },
    {
      "@type": "Question",
      name: "Comment recevoir un paiement ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Via Stripe Connect int\u00e9gr\u00e9 directement dans le devis.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <LandingPage />
    </>
  );
}
