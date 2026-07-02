import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CTABanner } from "@/components/seo/cta-banner";
import { CreditCard, Shield, Undo2, Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Paiement BTP en plusieurs fois — Échéancier devis | Devizly",
  description:
    "Créez un échéancier de paiement sur vos devis BTP : acompte 30%, situation intermédiaire, solde à réception. Retenue de garantie 5%. Remboursement en 1 clic.",
  alternates: { canonical: "https://devizly.fr/paiement-btp" },
  openGraph: {
    title: "Paiement BTP en plusieurs fois — Devizly",
    description:
      "Échéancier de paiement sur vos devis BTP : acompte, situation, solde. Retenue de garantie 5%, remboursement en 1 clic.",
    url: "https://devizly.fr/paiement-btp",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly — Paiement BTP en plusieurs fois" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paiement BTP en plusieurs fois — Devizly",
    description: "Échéancier acompte/situation/solde, retenue de garantie 5%, remboursement en 1 clic.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Comment facturer un chantier en plusieurs fois ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sur Devizly, activez le toggle « Paiement en plusieurs fois » sur votre devis, puis choisissez un preset (2 fois 50/50, 3 fois BTP 30/40/30) ou personnalisez vos propres étapes et pourcentages. Chaque étape devient une ligne de votre échéancier avec son propre montant, calculé automatiquement depuis le total du devis. Une fois le devis signé, vous facturez chaque étape séparément depuis le tableau de bord avec le bouton « Facturer cette étape » — cela crée une facture dédiée avec son propre lien de paiement Stripe, mentionnant l'étape concernée (par exemple « Acompte 1/3 — 30% »).",
      },
    },
    {
      "@type": "Question",
      name: "Qu'est-ce que la retenue de garantie BTP ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La retenue de garantie permet à un client de conserver 5% du montant total des travaux pendant 1 an après la réception du chantier, conformément au décret n°72-388 du 22 mai 1972. Elle sert à couvrir d'éventuelles malfaçons constatées après réception. Sur Devizly, il suffit de cocher la case « Retenue de garantie 5% » lors de la création de l'échéancier : le montant de la dernière étape (le solde) est automatiquement réduit de 5%, et la mention légale apparaît sur la facture correspondante.",
      },
    },
    {
      "@type": "Question",
      name: "Comment rembourser un client sur Devizly ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Depuis le tableau de bord Factures, cliquez sur « Rembourser » sur n'importe quelle facture payée. Une fenêtre de confirmation s'ouvre : vous choisissez le montant (total ou partiel, pré-rempli avec le montant restant), un motif (chantier annulé, litige client, erreur de facturation, autre), puis confirmez. Devizly déclenche le remboursement Stripe — y compris si vous encaissez via Stripe Connect — met à jour le statut de la facture et envoie un email de confirmation automatique à votre client.",
      },
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Paiement BTP en plusieurs fois",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Échéancier de paiement multi-étapes pour artisans du BTP, avec retenue de garantie et remboursement en 1 clic.",
  url: "https://devizly.fr/paiement-btp",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: "https://devizly.fr" },
    { "@type": "ListItem", position: 2, name: "Devis bâtiment gratuit", item: "https://devizly.fr/devis-batiment-gratuit" },
    { "@type": "ListItem", position: 3, name: "Paiement BTP en plusieurs fois", item: "https://devizly.fr/paiement-btp" },
  ],
};

export default function PaiementBtpPage() {
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <article className="space-y-16">
        {/* Hero */}
        <header className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <CreditCard className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Fait pour le bâtiment</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Paiement BTP en plusieurs fois<br className="hidden sm:block" />
            <span className="text-violet-400"> directement sur vos devis</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Acompte à la signature, situation intermédiaire, solde à réception.
            Devizly génère l&apos;échéancier, calcule chaque montant et crée
            une facture avec son lien de paiement Stripe à chaque étape.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500"
            >
              Essayer gratuitement — 3 devis/mois offerts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/devis-batiment-gratuit"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              Voir le logiciel de devis bâtiment &rarr;
            </Link>
          </div>
        </header>

        {/* Pourquoi un échéancier */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Pourquoi un échéancier de paiement BTP ?</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Sur un chantier, encaisser 100% du montant à la fin des travaux
            met votre trésorerie en danger : vous avancez les fournitures et
            la main-d&apos;œuvre pendant des semaines, parfois des mois, sans
            aucune rentrée d&apos;argent. Le découpage <strong>30% à la
            signature, 40% à mi-chantier, 30% à la réception</strong> est le
            standard du bâtiment — il sécurise votre trésorerie tout en
            restant acceptable pour le client, qui ne paie que ce qui a été
            réalisé.
          </p>
          <p className="text-base leading-relaxed text-slate-300">
            Le problème, en pratique : gérer cet échéancier à la main
            (calcul des montants, relance pour chaque étape, suivi de qui a
            payé quoi) prend du temps et génère des erreurs. C&apos;est
            exactement ce que Devizly automatise.
          </p>
        </section>

        {/* Comment ça marche */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Comment ça marche avec Devizly</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                num: "01",
                title: "Activez l'échéancier sur le devis",
                desc: "Un toggle « Paiement en plusieurs fois » sur la page de devis. Choisissez un preset (2 fois, 3 fois BTP 30/40/30) ou personnalisez vos étapes et pourcentages.",
              },
              {
                num: "02",
                title: "Chaque montant est calculé automatiquement",
                desc: "Le montant de chaque étape est calculé depuis le total TTC du devis. Vous voyez immédiatement combien représente chaque acompte, situation ou solde.",
              },
              {
                num: "03",
                title: "Facturez étape par étape",
                desc: "Une fois le devis signé, cliquez sur « Facturer cette étape » quand vous en avez besoin. Devizly crée la facture et le lien de paiement Stripe correspondant, avec la mention de l'étape (« Acompte 1/3 — 30% »).",
              },
            ].map((step) => (
              <div key={step.num} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-sm font-bold text-violet-400">{step.num}</span>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Le tableau de bord affiche une barre de progression par devis :
            montant encaissé, montant restant, statut de chaque étape
            (à facturer, facture envoyée, payée, en retard).
          </p>
        </section>

        {/* Retenue de garantie */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Retenue de garantie 5%</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <Shield className="mt-1 h-6 w-6 shrink-0 text-violet-400" />
              <div>
                <h3 className="mb-2 font-semibold">Décret n&deg;72-388 du 22 mai 1972</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Le client peut retenir 5% du montant total des travaux pendant
                  1 an après la réception, pour couvrir d&apos;éventuelles
                  malfaçons. Cochez simplement « Retenue de garantie 5% » lors
                  de la création de votre échéancier — Devizly réduit
                  automatiquement le montant de la dernière étape (le solde) et
                  ajoute la mention légale sur la facture correspondante. Vous
                  n&apos;avez rien à calculer à la main.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Remboursement */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Remboursement en 1 clic</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <Undo2 className="mb-3 h-6 w-6 text-violet-400" />
              <h3 className="mb-2 font-semibold">Total ou partiel</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Chantier annulé, litige avec le client, erreur de
                facturation : depuis le tableau de bord, un bouton
                « Rembourser » sur chaque facture payée. Montant total ou
                partiel, motif à sélectionner, confirmation en un clic —
                y compris si vous encaissez via Stripe Connect.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <Check className="mb-3 h-6 w-6 text-violet-400" />
              <h3 className="mb-2 font-semibold">Client informé automatiquement</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Un email de confirmation part automatiquement au client dès
                que le remboursement est déclenché — montant, motif et délai
                de recréditement (5 à 10 jours ouvrés). Rien à rédiger.
              </p>
            </div>
          </div>
        </section>

        {/* Cross-link vers conformité */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Et la conformité facturation ?</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Chaque facture générée pour une étape de votre échéancier reste
            compatible avec les exigences de la{" "}
            <Link href="/facture-electronique-2026" className="text-violet-400 hover:underline">
              réforme facturation électronique 2026
            </Link>{" "}
            et peut être générée au format{" "}
            <Link href="/facturx-conforme" className="text-violet-400 hover:underline">
              Factur-X conforme
            </Link>. Si vous facturez aussi des particuliers, ces
            transactions sont automatiquement prises en compte pour l&apos;
            <Link href="/e-reporting-b2c" className="text-violet-400 hover:underline">
              e-reporting B2C
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
          title="Prêt à sécuriser votre trésorerie de chantier ?"
          subtitle="Échéancier, retenue de garantie et remboursements — gratuit jusqu'à 3 devis/mois."
          cta="Essayer gratuitement"
        />
      </article>
    </>
  );
}
