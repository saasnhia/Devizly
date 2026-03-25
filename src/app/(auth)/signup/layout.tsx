import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte gratuit — Devizly",
  description: "Créez votre compte Devizly gratuitement et générez vos devis professionnels avec l'IA en 2 minutes.",
  alternates: { canonical: "https://devizly.fr/signup" },
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
