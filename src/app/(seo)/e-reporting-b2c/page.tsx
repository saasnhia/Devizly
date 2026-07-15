import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CTABanner } from "@/components/seo/cta-banner";
import { Globe, Users, Download, Calendar, ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "E-reporting B2C artisans — Réforme facturation 2026 | Devizly",
  description:
    "Devizly enregistre automatiquement vos ventes aux particuliers pour l'e-reporting obligatoire. Export CSV pour votre plateforme agréée.",
  alternates: { canonical: "https://devizly.fr/e-reporting-b2c" },
  openGraph: {
    title: "E-reporting B2C artisans — Devizly",
    description:
      "Distinction B2B/B2C automatique, enregistrement des transactions particuliers, export CSV pour votre plateforme agréée.",
    url: "https://devizly.fr/e-reporting-b2c",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly — E-reporting B2C" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-reporting B2C artisans — Devizly",
    description: "Vos ventes aux particuliers enregistrées automatiquement pour la réforme 2026.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "L'e-reporting est-il obligatoire pour les auto-entrepreneurs ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. L'obligation d'e-reporting concerne tous les assujettis à la TVA établis en France, y compris les auto-entrepreneurs et micro-entrepreneurs en franchise en base (article 293 B du CGI). Dès qu'une entreprise vend à des particuliers (B2C) ou réalise des opérations internationales, elle doit transmettre les données de ces transactions à l'administration fiscale via une plateforme agréée. Le calendrier suit celui de la facturation électronique : septembre 2026 pour les grandes entreprises et ETI, septembre 2027 pour les PME et micro-entreprises.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle est la différence entre e-invoicing et e-reporting ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'e-invoicing (facturation électronique) concerne les transactions B2B entre entreprises assujetties à la TVA : la facture elle-même (au format Factur-X, UBL ou CII) transite par une Plateforme Agréée. L'e-reporting concerne les transactions que la facturation électronique ne couvre pas — les ventes à des particuliers (B2C) et les opérations internationales — ainsi que les données de paiement. Dans ce cas, ce n'est pas la facture qui est transmise mais un résumé structuré des données de la transaction (montant HT, TVA, TTC, date). Les deux obligations sont complémentaires et suivent le même calendrier.",
      },
    },
    {
      "@type": "Question",
      name: "Devizly peut-il envoyer les données directement à l'administration ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Devizly enregistre automatiquement chaque transaction B2C ou internationale dès qu'une facture est payée, avec toutes les données requises (montant HT, TVA, TTC, taux, date de paiement). Ces transactions sont visibles dans un tableau de bord dédié et exportables en CSV au format attendu par les plateformes agréées. L'envoi automatique vers votre Plateforme Agréée est en cours de déploiement. Précision importante : l'e-reporting transite par une Plateforme Agréée immatriculée DGFiP, pas par l'URSSAF — l'URSSAF gère vos cotisations sociales, pas la transmission fiscale de vos ventes.",
      },
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — E-reporting B2C",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Enregistrement automatique des ventes B2C et internationales pour l'obligation d'e-reporting, réforme facturation électronique 2026.",
  url: "https://devizly.fr/e-reporting-b2c",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: "https://devizly.fr" },
    { "@type": "ListItem", position: 2, name: "Facturation électronique 2026", item: "https://devizly.fr/facture-electronique-2026" },
    { "@type": "ListItem", position: 3, name: "E-reporting B2C", item: "https://devizly.fr/e-reporting-b2c" },
  ],
};

export default function EReportingB2cPage() {
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <article className="space-y-16">
        {/* Hero */}
        <header className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
            <Globe className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Réforme 2026</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            E-reporting B2C — vos ventes aux<br className="hidden sm:block" />
            <span className="text-violet-400"> particuliers déclarées automatiquement</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            La facturation électronique ne couvre que le B2B. Pour vos clients
            particuliers, l&apos;e-reporting est une obligation distincte —
            Devizly l&apos;enregistre pour vous à chaque paiement.
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
              href="/facture-electronique-2026"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              Comprendre la réforme 2026 &rarr;
            </Link>
          </div>
        </header>

        {/* C'est quoi l'e-reporting */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">C&apos;est quoi l&apos;e-reporting ?</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            L&apos;e-reporting est l&apos;obligation de transmettre à
            l&apos;administration fiscale, via une{" "}
            <Link href="/facture-electronique-2026" className="text-violet-400 hover:underline">
              Plateforme Agréée (PA)
            </Link>, les données des transactions qui ne passent pas par la
            facturation électronique classique : les ventes à des
            particuliers (B2C) et les opérations avec des clients ou
            fournisseurs à l&apos;international. S&apos;y ajoutent les
            données de paiement (date, montant encaissé).
          </p>
          <p className="text-base leading-relaxed text-slate-300">
            Contrairement à la facturation électronique B2B, ce n&apos;est
            pas la facture elle-même qui est transmise, mais un résumé
            structuré de la transaction — montant HT, TVA, TTC, taux, date.
          </p>
        </section>

        {/* Qui est concerné */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Qui est concerné ?</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <Users className="mt-1 h-6 w-6 shrink-0 text-violet-400" />
              <div>
                <p className="text-sm leading-relaxed text-slate-400">
                  Tous les assujettis à la TVA établis en France sont
                  concernés — y compris les micro-entrepreneurs en{" "}
                  <strong>franchise en base de TVA</strong> (article 293 B du
                  CGI). Dès que vous facturez un particulier ou un client à
                  l&apos;étranger, cette transaction doit être reportée, que
                  vous facturiez de la TVA ou non.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comment Devizly gère l'e-reporting */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Comment Devizly gère l&apos;e-reporting</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Users,
                title: "Distinction B2B/B2C automatique",
                desc: "Chaque client est classé Professionnel (B2B) ou Particulier (B2C) — automatiquement selon le SIRET renseigné, ou manuellement si besoin.",
              },
              {
                icon: Check,
                title: "Enregistrement à chaque paiement",
                desc: "Dès qu'une facture liée à un client B2C ou international est payée, la transaction est automatiquement enregistrée avec toutes les données requises.",
              },
              {
                icon: Globe,
                title: "Dashboard dédié",
                desc: "Un tableau de bord E-reporting liste vos transactions en attente et déjà reportées, avec le montant total encaissé.",
              },
              {
                icon: Download,
                title: "Export CSV",
                desc: "Un bouton « Exporter pour e-reporting » génère un fichier CSV avec les colonnes attendues par votre plateforme agréée.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <item.icon className="mb-3 h-6 w-6 text-violet-400" />
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Calendrier */}
        <section>
          <h2 className="mb-8 text-2xl font-bold">Calendrier</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                  1er sept. 2026
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Grandes entreprises et ETI</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Obligation d&apos;émission de factures électroniques et de
                transmission des données d&apos;e-reporting dès cette date.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-400">
                  1er sept. 2027
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">PME, TPE et micro-entreprises</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Échéance qui concerne la majorité des utilisateurs Devizly —
                artisans, freelances, consultants, prestataires de services.
              </p>
            </div>
          </div>
        </section>

        {/* Cross-links */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Aller plus loin</h2>
          <p className="text-base leading-relaxed text-slate-300">
            L&apos;e-reporting complète vos obligations B2B déjà couvertes par
            les factures{" "}
            <Link href="/facturx-conforme" className="text-violet-400 hover:underline">
              Factur-X conformes
            </Link>. Si vous facturez aussi vos chantiers en plusieurs fois,
            découvrez notre{" "}
            <Link href="/paiement-btp" className="text-violet-400 hover:underline">
              échéancier de paiement BTP
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
          title="Restez conforme sans y penser"
          subtitle="B2B, B2C, international — Devizly gère la conformité en arrière-plan."
        />
      </article>
    </>
  );
}
