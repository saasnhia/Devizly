import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — Devizly",
  description: "Connectez-vous à votre compte Devizly pour gérer vos devis et factures.",
  alternates: { canonical: "https://devizly.fr/login" },
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
