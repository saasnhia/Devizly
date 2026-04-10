import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CTABanner } from "@/components/seo/cta-banner";
import { FileText, Shield, Check, ArrowRight, Layers, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Factur-X Conforme : Generez vos factures electroniques en un clic",
  description:
    "Devizly genere des factures Factur-X BASIC conformes (PDF/A-3 + XML CII) validees FNFE-MPE. Standard obligatoire pour la reforme facturation electronique 2026. Essai gratuit.",
  alternates: { canonical: "https://devizly.fr/facturx-conforme" },
  openGraph: {
    title: "Factures Factur-X Conformes — Devizly",
    description:
      "Generez des factures Factur-X BASIC en un clic. PDF/A-3 + XML CII, valide FNFE-MPE.",
    url: "https://devizly.fr/facturx-conforme",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly — Factur-X conforme" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Factures Factur-X Conformes — Devizly",
    description: "PDF/A-3 + XML CII. Valide FNFE-MPE. Essai gratuit.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu'est-ce que Factur-X ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Factur-X est le standard franco-allemand de facturation electronique. C'est un fichier PDF/A-3 qui contient a la fois la facture lisible par un humain (le PDF) et les donnees structurees lisibles par un logiciel (un fichier XML au format CII embarque dans le PDF). Ce double format permet le traitement automatique par les logiciels comptables tout en restant lisible par vos clients.",
      },
    },
    {
      "@type": "Question",
      name: "Quel profil Factur-X utilise Devizly ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Devizly genere des factures au profil BASIC, qui est le profil recommande pour les TPE, PME et micro-entrepreneurs. Le profil BASIC contient toutes les informations necessaires pour la conformite fiscale : identification vendeur/acheteur, lignes de facturation, TVA, totaux, conditions de paiement. C'est le profil minimum accepte par la reforme 2026.",
      },
    },
    {
      "@type": "Question",
      name: "Comment valider qu'une facture est conforme Factur-X ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vous pouvez valider n'importe quelle facture Factur-X sur le site du Forum National de la Facture Electronique (FNFE-MPE) a l'adresse services.fnfe-mpe.org. Le validateur verifie la structure PDF/A-3, les metadonnees XMP, la validite XSD du XML et la conformite Schematron. Toutes les factures generees par Devizly passent ces 4 validations avec le statut Fully Valid.",
      },
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Generateur Factur-X",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Generateur de factures Factur-X BASIC conformes pour freelances et artisans.",
  url: "https://devizly.fr/facturx-conforme",
};

export default function FacturxConformePage() {
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <article className="space-y-16">
        {/* Hero */}
        <header className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <FileCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Fully Valid FNFE-MPE</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Generez vos factures Factur-X<br className="hidden sm:block" />
            <span className="text-violet-400"> conformes en un clic</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Devizly transforme vos factures en documents Factur-X conformes
            au standard BASIC — PDF/A-3 avec XML CII embarque. Vos factures
            passent les 4 validations du FNFE-MPE sans que vous ayez a y penser.
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
              Comprendre la reforme 2026 &rarr;
            </Link>
          </div>
        </header>

        {/* Qu'est-ce que Factur-X */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Qu'est-ce que Factur-X ?</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Factur-X est le standard de facturation electronique developpe
            conjointement par la France (FNFE-MPE) et l'Allemagne (FeRD).
            Il combine deux elements dans un seul fichier :
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <FileText className="mb-3 h-6 w-6 text-violet-400" />
              <h3 className="mb-2 font-semibold">Le PDF lisible</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                La facture telle que vous la connaissez : mise en page
                professionnelle, logo, tableau des prestations, totaux.
                Lisible par votre client dans n'importe quel lecteur PDF.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <Layers className="mb-3 h-6 w-6 text-violet-400" />
              <h3 className="mb-2 font-semibold">Le XML structure</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Un fichier XML au format CII (Cross-Industry Invoice)
                embarque dans le PDF. Il contient les memes donnees dans
                un format lisible par les logiciels comptables, l'administration
                fiscale et les Plateformes Agreees.
              </p>
            </div>
          </div>
          <p className="mt-6 text-base leading-relaxed text-slate-300">
            Le format final est un <strong>PDF/A-3</strong> — une norme ISO
            qui garantit la perennite du document (polices embarquees, profil
            colorimetrique sRGB, pas de contenu dynamique). C'est le seul
            format accepte pour les factures electroniques en France a partir
            de 2026.
          </p>
        </section>

        {/* Les profils Factur-X */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Les profils Factur-X</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Factur-X definit 5 niveaux de detail croissants. Plus le profil
            est eleve, plus le XML contient d'informations. Pour la reforme
            2026, le profil <strong>BASIC</strong> est le minimum requis.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Profil</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Usage</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-400">Conforme 2026</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "MINIMUM", usage: "Donnees minimales (pas de lignes de detail)", ok: false },
                  { name: "BASIC WL", usage: "Sans lignes de detail", ok: false },
                  { name: "BASIC", usage: "Lignes + TVA + paiement — pour TPE/PME", ok: true, highlight: true },
                  { name: "EN 16931", usage: "Norme europeenne complete", ok: true },
                  { name: "EXTENDED", usage: "Donnees detaillees (grands comptes)", ok: true },
                ].map((p) => (
                  <tr
                    key={p.name}
                    className={`border-b border-white/5 ${p.highlight ? "bg-violet-500/5" : ""}`}
                  >
                    <td className={`px-4 py-2.5 font-medium ${p.highlight ? "text-violet-300" : ""}`}>
                      {p.name}
                      {p.highlight && (
                        <span className="ml-2 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-400">
                          Devizly
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{p.usage}</td>
                    <td className="px-4 py-2.5 text-center">
                      {p.ok ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-400" />
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Les profils MINIMUM et BASIC WL ne contiennent pas assez
            d'informations pour constituer une facture au sens fiscal.
            Devizly utilise le profil <strong>BASIC</strong>, qui est le
            bon equilibre entre simplicite et conformite.
          </p>
        </section>

        {/* Comment Devizly genere vos Factur-X */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            Comment Devizly genere vos Factur-X
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { num: "01", title: "Facture creee depuis votre devis", desc: "Quand votre client signe et paie, Devizly cree automatiquement la facture avec toutes les mentions obligatoires (SIRET, TVA, conditions de paiement)." },
              { num: "02", title: "Generation Factur-X en un clic", desc: "Depuis le tableau de bord Factures, cliquez sur le bouton FX. Devizly genere le XML CII, l'embarque dans un PDF/A-3 avec le template Devizly, et valide le tout contre le XSD officiel." },
              { num: "03", title: "Telechargez ou envoyez a Pennylane", desc: "Le PDF Factur-X est stocke dans votre espace securise. Telechargez-le, ou envoyez-le directement a votre expert-comptable via Pennylane en un clic." },
            ].map((step) => (
              <div key={step.num} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-sm font-bold text-violet-400">{step.num}</span>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Validation FNFE-MPE */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Validation officielle FNFE-MPE</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Chaque facture generee par Devizly passe les 4 controles du
            validateur officiel du Forum National de la Facture Electronique :
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Metadonnees XMP", desc: "Identification Factur-X dans les metadonnees PDF" },
              { label: "Validation XSD", desc: "Structure XML conforme au schema CII officiel" },
              { label: "Validation Schematron", desc: "Regles metier EN 16931 respectees" },
              { label: "Conformite PDF/A-3", desc: "Polices embarquees, profil colorimetrique, pas de contenu dynamique" },
            ].map((check) => (
              <div key={check.label} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-medium">{check.label}</p>
                  <p className="text-sm text-slate-400">{check.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Statut : <strong className="text-emerald-400">Fully Valid</strong> sur
            les 4 controles. Vous pouvez verifier vous-meme sur{" "}
            <a
              href="https://services.fnfe-mpe.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:underline"
            >
              services.fnfe-mpe.org
            </a>.
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
