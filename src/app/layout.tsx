import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/cookie-banner";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://devizly.fr";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const metadata: Metadata = {
  title: {
    default: "Devizly — Logiciel Devis et Facturation Gratuit pour Freelances",
    template: "%s | Devizly — Devis & Factures IA",
  },
  description:
    "Créez vos devis professionnels en 2 minutes avec l'IA. Signature électronique, paiement Stripe, relances automatiques. Essai gratuit — sans CB.",
  keywords: [
    "logiciel devis gratuit",
    "créer devis en ligne",
    "logiciel devis artisan",
    "devis facture auto-entrepreneur",
    "logiciel facturation freelance",
    "devis en ligne gratuit",
    "application devis iPhone Android",
    "logiciel devis batiment gratuit",
    "generateur devis IA",
    "créer facture en ligne gratuit",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "https://devizly.fr" },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large" as const,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://devizly.fr",
    siteName: "Devizly",
    title: "Devizly — Logiciel Devis et Facturation Gratuit pour Freelances",
    description:
      "Créez vos devis professionnels en 2 minutes avec l'IA. Signature électronique, paiement Stripe, relances automatiques. Essai gratuit — sans CB.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly — Logiciel devis IA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Devizly — Logiciel Devis et Facturation Gratuit pour Freelances",
    description:
      "Créez vos devis professionnels en 2 minutes avec l'IA. Essai gratuit — sans CB.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "49",
    priceCurrency: "EUR",
  },
  description:
    "Logiciel de devis et facturation en ligne pour freelances et artisans français.",
  url: "https://devizly.fr",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {SUPABASE_URL && (
          <link rel="preconnect" href={SUPABASE_URL} />
        )}
        <JsonLd data={softwareSchema} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
        <CookieBanner />
      </body>
    </html>
  );
}
