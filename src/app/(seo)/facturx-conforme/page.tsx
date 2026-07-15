import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CTABanner } from "@/components/seo/cta-banner";
import { FileText, Shield, Check, ArrowRight, Layers, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Factur-X Conforme : Générez vos factures électroniques en un clic",
  description:
    "Devizly génère des factures Factur-X BASIC conformes (PDF/A-3 + XML CII) validées FNFE-MPE, avec les 4 nouvelles mentions obligatoires 2026 : catégorie d'opération, TVA sur les débits, adresse de livraison, SIREN acheteur. Essai gratuit.",
  alternates: { canonical: "https://devizly.fr/facturx-conforme" },
  openGraph: {
    title: "Factures Factur-X Conformes — Devizly",
    description:
      "Générez des factures Factur-X BASIC en un clic, avec les 4 nouvelles mentions obligatoires 2026. PDF/A-3 + XML CII, validé FNFE-MPE.",
    url: "https://devizly.fr/facturx-conforme",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly — Factur-X conforme" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Factures Factur-X Conformes — Devizly",
    description: "PDF/A-3 + XML CII + 4 nouvelles mentions 2026. Validé FNFE-MPE. Essai gratuit.",
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
        text: "Factur-X est le standard franco-allemand de facturation électronique. C'est un fichier PDF/A-3 qui contient à la fois la facture lisible par un humain (le PDF) et les données structurées lisibles par un logiciel (un fichier XML au format CII embarqué dans le PDF). Ce double format permet le traitement automatique par les logiciels comptables tout en restant lisible par vos clients.",
      },
    },
    {
      "@type": "Question",
      name: "Quel profil Factur-X utilise Devizly ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Devizly génère des factures au profil BASIC, qui est le profil recommandé pour les TPE, PME et micro-entrepreneurs. Le profil BASIC contient toutes les informations nécessaires pour la conformité fiscale : identification vendeur/acheteur, lignes de facturation, TVA, totaux, conditions de paiement. C'est le profil minimum accepté par la réforme 2026.",
      },
    },
    {
      "@type": "Question",
      name: "Comment valider qu'une facture est conforme Factur-X ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vous pouvez valider n'importe quelle facture Factur-X sur le site du Forum National de la Facture Électronique (FNFE-MPE) à l'adresse services.fnfe-mpe.org. Le validateur vérifie la structure PDF/A-3, les métadonnées XMP, la validité XSD du XML et la conformité Schematron. Toutes les factures générées par Devizly passent ces 4 validations avec le statut Fully Valid.",
      },
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Générateur Factur-X",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Générateur de factures Factur-X BASIC conformes pour freelances et artisans.",
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
            Générez vos factures Factur-X<br className="hidden sm:block" />
            <span className="text-violet-400"> conformes en un clic</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Devizly transforme vos factures en documents Factur-X conformes
            au standard BASIC — PDF/A-3 avec XML CII embarqué. Vos factures
            passent les 4 validations du FNFE-MPE sans que vous ayez à y penser.
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

        {/* Qu'est-ce que Factur-X */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Qu'est-ce que Factur-X ?</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Factur-X est le standard de facturation électronique développé
            conjointement par la France (FNFE-MPE) et l'Allemagne (FeRD).
            Il combine deux éléments dans un seul fichier :
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
              <h3 className="mb-2 font-semibold">Le XML structuré</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Un fichier XML au format CII (Cross-Industry Invoice)
                embarqué dans le PDF. Il contient les mêmes données dans
                un format lisible par les logiciels comptables, l'administration
                fiscale et les Plateformes Agréées.
              </p>
            </div>
          </div>
          <p className="mt-6 text-base leading-relaxed text-slate-300">
            Le format final est un <strong>PDF/A-3</strong> — une norme ISO
            qui garantit la pérennité du document (polices embarquées, profil
            colorimétrique sRGB, pas de contenu dynamique). C'est le seul
            format accepté pour les factures électroniques en France à partir
            de 2026.
          </p>
        </section>

        {/* Les profils Factur-X */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Les profils Factur-X</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Factur-X définit 5 niveaux de détail croissants. Plus le profil
            est élevé, plus le XML contient d'informations. Pour la réforme
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
                  { name: "MINIMUM", usage: "Données minimales (pas de lignes de détail)", ok: false },
                  { name: "BASIC WL", usage: "Sans lignes de détail", ok: false },
                  { name: "BASIC", usage: "Lignes + TVA + paiement — pour TPE/PME", ok: true, highlight: true },
                  { name: "EN 16931", usage: "Norme européenne complète", ok: true },
                  { name: "EXTENDED", usage: "Données détaillées (grands comptes)", ok: true },
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
            bon équilibre entre simplicité et conformité.
          </p>
        </section>

        {/* Comment Devizly génère vos Factur-X */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            Comment Devizly génère vos Factur-X
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { num: "01", title: "Facture créée depuis votre devis", desc: "Quand votre client signe et paie, Devizly crée automatiquement la facture avec toutes les mentions obligatoires (SIRET, TVA, conditions de paiement)." },
              { num: "02", title: "Génération Factur-X en un clic", desc: "Depuis le tableau de bord Factures, cliquez sur le bouton FX. Devizly génère le XML CII, l'embarque dans un PDF/A-3 avec le template Devizly, et valide le tout contre le XSD officiel." },
              { num: "03", title: "Téléchargez ou transmettez via SUPER PDP", desc: "Le PDF Factur-X est stocké dans votre espace sécurisé. Téléchargez-le, ou transmettez-le en un clic via SUPER PDP, Plateforme Agréée immatriculée DGFiP, une fois votre entreprise connectée depuis vos paramètres." },
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
            Chaque facture générée par Devizly passe les 4 contrôles du
            validateur officiel du Forum National de la Facture Électronique :
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Métadonnées XMP", desc: "Identification Factur-X dans les métadonnées PDF" },
              { label: "Validation XSD", desc: "Structure XML conforme au schéma CII officiel" },
              { label: "Validation Schematron", desc: "Règles métier EN 16931 respectées" },
              { label: "Conformité PDF/A-3", desc: "Polices embarquées, profil colorimétrique, pas de contenu dynamique" },
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
            les 4 contrôles. Vous pouvez vérifier vous-même sur{" "}
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

        {/* Les 4 nouvelles mentions obligatoires */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            Les 4 nouvelles mentions obligatoires 2026
          </h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            La réforme ajoute 4 mentions obligatoires sur toutes les factures
            à partir du 1er septembre 2026. Devizly les intègre directement
            dans le XML et le PDF de vos factures Factur-X.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Catégorie de l'opération", desc: "Vente de biens, prestation de services ou opération mixte." },
              { label: "TVA sur les débits", desc: "Mention spécifique si vous avez opté pour ce régime plutôt que l'encaissement." },
              { label: "Adresse de livraison", desc: "Utile pour le BTP : l'adresse du chantier quand elle diffère de celle du client." },
              { label: "SIREN de l'acheteur", desc: "Identifiant de votre client professionnel, dérivé automatiquement de son SIRET." },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="mb-8 text-2xl font-bold">Questions fréquentes</h2>
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
