import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CTABanner } from "@/components/seo/cta-banner";
import { Send, Shield, Clock, ArrowRight, Plug, Users, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Integration Pennylane : envoyez vos factures Factur-X en 1 clic",
  description:
    "Devizly s'integre avec Pennylane, Plateforme Agreee DGFiP. Envoyez vos factures Factur-X a votre expert-comptable automatiquement. Setup en 30 secondes, 0 saisie manuelle.",
  alternates: { canonical: "https://devizly.fr/integration-pennylane" },
  openGraph: {
    title: "Devizly + Pennylane — Facturation automatisee",
    description:
      "Envoyez vos factures Factur-X a votre expert-comptable via Pennylane. Setup 30s.",
    url: "https://devizly.fr/integration-pennylane",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly + Pennylane" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Devizly + Pennylane — Facturation automatisee",
    description: "Factur-X + Pennylane en 1 clic. 0 saisie manuelle.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Mon expert-comptable doit-il etre sur Pennylane ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, pour profiter de l'envoi automatique, votre expert-comptable doit utiliser Pennylane. Si ce n'est pas le cas, vous pouvez toujours generer vos factures Factur-X avec Devizly et les transmettre manuellement (telechargement PDF). Pour les autres logiciels comptables, Devizly propose l'export CSV et FEC.",
      },
    },
    {
      "@type": "Question",
      name: "L'integration Pennylane est-elle gratuite ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'envoi automatique vers Pennylane est inclus dans le plan Business de Devizly (39 EUR/mois HT). La generation de factures Factur-X est incluse des le plan Pro (19 EUR/mois HT). Le plan Gratuit permet de creer 3 devis par mois mais ne donne pas acces a la facturation.",
      },
    },
    {
      "@type": "Question",
      name: "Comment obtenir mon token API Pennylane ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Connectez-vous a votre compte Pennylane, allez dans Parametres > API, et generez un token d'acces. Copiez-le dans Devizly (Parametres > Plateforme Agreee). Le processus prend moins de 30 secondes. Un guide detaille est disponible dans la documentation Pennylane.",
      },
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Integration Pennylane",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "19", priceCurrency: "EUR" },
  description: "Integration Pennylane pour l'envoi automatique de factures Factur-X.",
  url: "https://devizly.fr/integration-pennylane",
};

export default function IntegrationPennylanePage() {
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <article className="space-y-16">
        {/* Hero */}
        <header className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
            <Plug className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Integration officielle</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Devizly + Pennylane :<br className="hidden sm:block" />
            <span className="text-violet-400"> vos factures chez votre comptable en 1 clic</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Connectez votre compte Pennylane a Devizly en 30 secondes. Vos
            factures Factur-X sont envoyees automatiquement a votre
            expert-comptable — plus de transmission manuelle, plus de
            ressaisie, plus d'erreurs.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/facturx-conforme"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              En savoir plus sur Factur-X &rarr;
            </Link>
          </div>
        </header>

        {/* Pourquoi integrer Pennylane */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Pourquoi integrer Pennylane ?</h2>
          <p className="mb-6 text-base leading-relaxed text-slate-300">
            Pennylane est une <strong>Plateforme Agreee (PA)</strong> immatriculee
            par la DGFiP, utilisee par des milliers d'experts-comptables en France.
            En connectant Devizly a Pennylane, vous automatisez la chaine
            complete : devis &rarr; signature &rarr; paiement &rarr; facture
            Factur-X &rarr; comptabilite.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Clock,
                title: "Setup en 30 secondes",
                desc: "Collez votre token API Pennylane dans les parametres Devizly. C'est tout. Pas de configuration complexe, pas de plugin a installer.",
              },
              {
                icon: Send,
                title: "Envoi en 1 clic",
                desc: "Depuis le tableau de bord Factures, cliquez sur le bouton PA. La facture Factur-X est envoyee instantanement a Pennylane.",
              },
              {
                icon: Shield,
                title: "Conformite automatique",
                desc: "Pennylane, en tant que PA, assure la transmission reglementaire a l'administration fiscale. Vous n'avez rien d'autre a faire.",
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

        {/* Comment ca marche */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Comment ca marche</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { num: "01", title: "Connectez votre token Pennylane", desc: "Dans Parametres > Plateforme Agreee, collez votre token API Pennylane. La connexion est immediate. Vous pouvez deconnecter a tout moment." },
              { num: "02", title: "Generez votre Factur-X", desc: "Depuis la liste des factures, cliquez sur le bouton FX. Devizly genere un PDF/A-3 conforme avec le XML CII embarque, valide contre le XSD officiel." },
              { num: "03", title: "Envoyez a Pennylane", desc: "Cliquez sur le bouton PA. La facture est transmise a Pennylane via son API. Votre expert-comptable la recoit instantanement, et les ecritures comptables sont generees automatiquement." },
            ].map((step) => (
              <div key={step.num} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-sm font-bold text-violet-400">{step.num}</span>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pour les experts-comptables */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Pour les experts-comptables</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <Users className="mt-1 h-6 w-6 shrink-0 text-violet-400" />
              <div>
                <h3 className="mb-2 font-semibold">
                  Recommandez Devizly a vos clients
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-400">
                  Si vos clients utilisent Devizly, leurs factures arrivent
                  automatiquement dans votre espace Pennylane au format
                  Factur-X. Plus de relances pour recuperer les pieces, plus
                  de saisie manuelle, plus de scan PDF.
                </p>
                <p className="text-sm leading-relaxed text-slate-400">
                  Le format Factur-X embarque les donnees structurees : Pennylane
                  extrait automatiquement le numero de facture, les montants HT/TTC,
                  la TVA, les informations client. Les ecritures comptables sont
                  pre-remplies — il ne reste qu'a valider.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ce que recoit Pennylane */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Ce que recoit Pennylane</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Quand vous envoyez une facture depuis Devizly, Pennylane recoit
            un fichier PDF/A-3 contenant :
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "La facture PDF avec le template Devizly (branding, logo, mentions legales)",
              "Le XML CII avec toutes les donnees structurees (vendeur, client, lignes, TVA, totaux)",
              "Les informations de paiement (IBAN, BIC, echeance)",
              "Le numero de devis d'origine (reference croisee devis/facture)",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-300">
                <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Pennylane detecte automatiquement le XML embarque dans le PDF et
            l'utilise pour generer les ecritures comptables — pas besoin d'OCR,
            pas d'erreur d'interpretation.
          </p>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="mb-8 text-2xl font-bold">Questions frequentes</h2>
          <div className="space-y-0">
            {(faqSchema.mainEntity as Array<{ "@type": string; name: string; acceptedAnswer: { text: string } }>).map((faq) => (
              <details
                key={faq.name}
                className="group border-b border-white/10"
              >
                <summary className="flex w-full cursor-pointer items-center justify-between py-5 text-left select-none [&::-webkit-details-marker]:hidden list-none">
                  <span className="pr-4 text-sm font-medium sm:text-base">
                    {faq.name}
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-slate-500 transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pb-5">
                  <p className="text-sm leading-relaxed text-slate-400">
                    {faq.acceptedAnswer.text}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <CTABanner />
      </article>
    </>
  );
}
