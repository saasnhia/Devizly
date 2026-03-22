import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs Devizly — Gratuit, Pro 19€, Business 39€/mois",
  description:
    "Découvrez les tarifs Devizly. Plan gratuit sans CB, Pro à 19€/mois pour les freelances, Business à 39€/mois pour les équipes. Sans engagement.",
  alternates: { canonical: "https://devizly.fr/pricing" },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
