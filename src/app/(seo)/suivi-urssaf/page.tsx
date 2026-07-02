import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CTABanner } from "@/components/seo/cta-banner";
import { Calculator, Percent, Bell, TrendingUp, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Suivi URSSAF auto-entrepreneur — CA, cotisations, ACRE | Devizly",
  description:
    "Calculez vos cotisations URSSAF automatiquement depuis vos factures. Taux ACRE, rappels avant échéance, seuils TVA et plafond micro en temps réel.",
  alternates: { canonical: "https://devizly.fr/suivi-urssaf" },
  openGraph: {
    title: "Suivi URSSAF auto-entrepreneur — Devizly",
    description:
      "Cotisations calculées automatiquement depuis votre CA facturé. ACRE, rappels avant échéance, seuils en temps réel.",
    url: "https://devizly.fr/suivi-urssaf",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly — Suivi URSSAF auto-entrepreneur" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suivi URSSAF auto-entrepreneur — Devizly",
    description: "CA, cotisations, ACRE et seuils micro calculés automatiquement.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Devizly remplace-t-il la déclaration URSSAF ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Devizly calcule vos cotisations et votre chiffre d'affaires automatiquement depuis vos factures et devis payés, et vous rappelle par email quand une échéance approche, mais la déclaration officielle reste à faire vous-même sur autoentrepreneur.urssaf.fr. Devizly vous fait gagner le temps du calcul et vous évite d'oublier une échéance — pas la déclaration elle-même.",
      },
    },
    {
      "@type": "Question",
      name: "Comment fonctionne l'ACRE dans Devizly ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'ACRE (Aide à la Création ou Reprise d'Entreprise) réduit de 50% le taux de cotisation pendant les 12 mois suivant le début d'activité. Dans l'onglet URSSAF de Devizly, cochez « J'ai l'ACRE » et indiquez votre date de début d'activité : le taux réduit est appliqué automatiquement sur toutes les périodes concernées, avec un badge visible sur le calcul. Passé les 12 mois, Devizly repasse automatiquement au taux plein.",
      },
    },
    {
      "@type": "Question",
      name: "Quels sont les seuils micro-entrepreneur 2026 ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Deux seuils distincts s'appliquent. Le plafond de chiffre d'affaires du régime micro-entrepreneur : 203 100 € pour la vente de marchandises et l'hébergement, 83 600 € pour les prestations de services et professions libérales. Le seuil de franchise en base de TVA (différent) : 85 000 € (majoré 93 500 €) pour la vente, 37 500 € (majoré 41 250 €) pour les prestations de services. Devizly affiche les deux seuils en temps réel dans l'onglet URSSAF, avec une alerte dès 90% du seuil atteint.",
      },
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Suivi URSSAF auto-entrepreneur",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Calcul automatique des cotisations URSSAF, ACRE et seuils micro-entrepreneur depuis les factures Devizly.",
  url: "https://devizly.fr/suivi-urssaf",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: "https://devizly.fr" },
    { "@type": "ListItem", position: 2, name: "Devis auto-entrepreneur", item: "https://devizly.fr/devis-auto-entrepreneur" },
    { "@type": "ListItem", position: 3, name: "Suivi URSSAF", item: "https://devizly.fr/suivi-urssaf" },
  ],
};

export default function SuiviUrssafPage() {
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <article className="space-y-16">
        {/* Hero */}
        <header className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
            <Calculator className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Auto-entrepreneurs & micro-entreprises</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Suivi URSSAF intégré —<br className="hidden sm:block" />
            <span className="text-violet-400"> vos cotisations calculées automatiquement</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Votre chiffre d&apos;affaires est déjà dans Devizly. Pas besoin de
            le ressaisir ailleurs : l&apos;onglet URSSAF calcule vos
            cotisations, applique l&apos;ACRE et vous rappelle les échéances.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500"
            >
              Essayer gratuitement
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/devis-auto-entrepreneur"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              Voir le logiciel de devis auto-entrepreneur &rarr;
            </Link>
          </div>
        </header>

        {/* Pourquoi suivre ses cotisations dans Devizly */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            Pourquoi suivre ses cotisations URSSAF dans Devizly ?
          </h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            En tant qu&apos;auto-entrepreneur, votre chiffre d&apos;affaires
            existe déjà dans votre logiciel de devis et de facturation.
            Le ressaisir dans un tableur ou un simulateur externe pour
            estimer vos cotisations, c&apos;est une double saisie source
            d&apos;erreurs et de perte de temps.
          </p>
          <p className="text-base leading-relaxed text-slate-300">
            Devizly calcule automatiquement votre CA à partir de vos factures
            et devis payés, applique le taux de cotisation correspondant à
            votre activité (vente, prestations BIC, prestations BNC,
            libérale CIPAV), et affiche le montant à déclarer — mensuel ou
            trimestriel, selon votre périodicité.
          </p>
        </section>

        {/* ACRE */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">ACRE : le taux réduit de 50%</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <Percent className="mt-1 h-6 w-6 shrink-0 text-violet-400" />
              <div>
                <p className="text-sm leading-relaxed text-slate-400">
                  Si vous bénéficiez de l&apos;ACRE, votre taux de cotisation
                  est réduit de 50% pendant les 12 mois suivant votre début
                  d&apos;activité. Dans Devizly, un simple toggle « J&apos;ai
                  l&apos;ACRE » avec votre date de début d&apos;activité
                  suffit — le taux réduit est appliqué automatiquement sur
                  toutes les périodes concernées, avec un badge « Taux ACRE
                  -50% appliqué » visible sur le calcul. Passé les 12 mois,
                  Devizly repasse au taux plein sans action de votre part.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Rappels automatiques */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Rappels automatiques</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <Bell className="mb-3 h-6 w-6 text-violet-400" />
              <h3 className="mb-2 font-semibold">Email J-5 avant échéance</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Devizly vous envoie un rappel automatique 5 jours avant votre
                date limite de déclaration — mensuelle ou trimestrielle selon
                votre régime — avec le CA de la période déjà calculé.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <TrendingUp className="mb-3 h-6 w-6 text-violet-400" />
              <h3 className="mb-2 font-semibold">Historique des déclarations</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Un tableau récapitulatif de vos périodes déclarées ou à
                déclarer, avec CA et cotisations associées, pour garder une
                vue d&apos;ensemble de votre année.
              </p>
            </div>
          </div>
        </section>

        {/* Double seuils */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Double seuils en temps réel</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Deux seuils distincts s&apos;appliquent aux micro-entrepreneurs,
            et il est facile de les confondre :
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Seuil</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Vente de marchandises</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Prestations de services</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="px-4 py-2.5 font-medium">Franchise TVA</td>
                  <td className="px-4 py-2.5 text-slate-400">85 000 € (majoré 93 500 €)</td>
                  <td className="px-4 py-2.5 text-slate-400">37 500 € (majoré 41 250 €)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium">Plafond micro-entrepreneur</td>
                  <td className="px-4 py-2.5 text-slate-400">203 100 €</td>
                  <td className="px-4 py-2.5 text-slate-400">83 600 €</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Devizly affiche votre progression sur les deux seuils en temps
            réel, avec une alerte visuelle dès que vous atteignez 90% de
            l&apos;un d&apos;eux.
          </p>
        </section>

        {/* Cross-link */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Aller plus loin</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Si vous facturez aussi des chantiers en plusieurs fois, découvrez
            notre{" "}
            <Link href="/paiement-btp" className="text-violet-400 hover:underline">
              échéancier de paiement BTP
            </Link>. Et pour rester conforme à la réforme facturation
            électronique, consultez notre page sur la{" "}
            <Link href="/facture-electronique-2026" className="text-violet-400 hover:underline">
              facturation électronique 2026
            </Link>.
          </p>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="mb-8 text-2xl font-bold">Questions fréquentes</h2>
          <div className="space-y-0">
            {(faqSchema.mainEntity as Array<{ "@type": string; name: string; acceptedAnswer: { text: string } }>).map((faq) => (
              <details key={faq.name} className="group border-b border-white/10">
                <summary className="flex w-full cursor-pointer items-center justify-between py-5 text-left select-none [&::-webkit-details-marker]:hidden list-none">
                  <span className="pr-4 text-sm font-medium sm:text-base">{faq.name}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-slate-500 transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pb-5">
                  <p className="text-sm leading-relaxed text-slate-400">{faq.acceptedAnswer.text}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <CTABanner
          title="Fini le calcul URSSAF à la main"
          subtitle="Votre CA est déjà dans Devizly — laissez-le calculer vos cotisations."
        />
      </article>
    </>
  );
}
