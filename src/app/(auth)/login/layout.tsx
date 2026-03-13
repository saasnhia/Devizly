import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte Devizly pour gérer vos devis et factures.",
  alternates: { canonical: "https://devizly.fr/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
