import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Devizly — Devis professionnels par IA pour freelancers",
  description:
    "Générez vos devis en 30 secondes avec l'IA, relancez automatiquement et encaissez plus vite. Essai gratuit.",
  openGraph: {
    title: "Devizly — Devis pro en 30 secondes avec l'IA",
    description:
      "Générez, envoyez et faites signer vos devis professionnels en quelques clics. IA Mistral hébergée en France.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Devizly — Devis pro en 30 secondes avec l'IA",
    description:
      "Générez, envoyez et faites signer vos devis en quelques clics. Gratuit.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <LandingPage />;
}
