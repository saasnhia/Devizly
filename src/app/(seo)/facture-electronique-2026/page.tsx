import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CTABanner } from "@/components/seo/cta-banner";
import { Calendar, Shield, Zap, ArrowRight, FileText, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "Facturation Electronique 2026 : Preparez-vous avec Devizly",
  description:
    "La reforme de la facturation electronique demarre en septembre 2026. Devizly genere automatiquement vos factures Factur-X conformes (PDF/A-3, valide FNFE-MPE) et les envoie a votre expert-comptable via Pennylane. Pret des maintenant.",
  alternates: { canonical: "https://devizly.fr/facture-electronique-2026" },
  openGraph: {
    title: "Facturation Electronique 2026 — Devizly",
    description:
      "Preparez-vous a la reforme avec Devizly : Factur-X automatique, conformite FNFE-MPE, integration Pennylane.",
    url: "https://devizly.fr/facture-electronique-2026",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly — Facturation electronique 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Facturation Electronique 2026 — Devizly",
    description: "Factur-X automatique + Pennylane. Pret pour la reforme.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quand la facturation electronique devient-elle obligatoire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A partir du 1er septembre 2026, toutes les entreprises assujetties a la TVA devront etre capables de recevoir des factures electroniques. Les grandes entreprises et ETI devront emettre des ce date. Les PME et micro-entreprises auront jusqu'a septembre 2027 pour emettre.",
      },
    },
    {
      "@type": "Question",
      name: "Qu'est-ce qu'une Plateforme Agreee (PA) ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une Plateforme Agreee est un intermediaire immatricule par la DGFiP qui assure la transmission des factures electroniques entre les entreprises et l'administration fiscale. Pennylane est une PA. Devizly agit comme Operateur de Dematerialisation (OD) et transmet vos factures a votre PA.",
      },
    },
    {
      "@type": "Question",
      name: "Devizly est-il pret pour la reforme 2026 ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Devizly genere des factures au format Factur-X BASIC (PDF/A-3 avec XML CII embarque), validees par le validateur officiel FNFE-MPE. Vos factures peuvent etre envoyees automatiquement a Pennylane, Plateforme Agreee immatriculee DGFiP.",
      },
    },
    {
      "@type": "Question",
      name: "Dois-je changer de logiciel pour etre conforme ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Si vous utilisez deja Devizly pour vos devis et factures, vous etes automatiquement conforme. La generation Factur-X est integree — il suffit de cliquer sur un bouton dans le tableau de bord pour generer et envoyer vos factures conformes.",
      },
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Facturation electronique Factur-X",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Logiciel de facturation electronique Factur-X pour freelances et artisans. Conforme reforme 2026.",
  url: "https://devizly.fr/facture-electronique-2026",
};

export default function FactureElectronique2026Page() {
  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      <article className="space-y-16">
        {/* Hero */}
        <header className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
            <Calendar className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Septembre 2026</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Facturation electronique 2026 :<br className="hidden sm:block" />
            <span className="text-violet-400"> preparez-vous avec Devizly</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            La reforme entre en vigueur en septembre 2026. Toutes les entreprises
            devront recevoir — puis emettre — leurs factures au format electronique
            structure. Devizly vous y prepare des maintenant, sans effort supplementaire.
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

        {/* Calendrier de la reforme */}
        <section>
          <h2 className="mb-8 text-2xl font-bold">Le calendrier de la reforme</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                  1er sept. 2026
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Reception obligatoire</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Toutes les entreprises assujetties a la TVA — y compris les TPE,
                micro-entrepreneurs et auto-entrepreneurs — devront etre capables
                de recevoir des factures electroniques au format structure. Les
                grandes entreprises et ETI devront aussi emettre des cette date.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-400">
                  1er sept. 2027
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Emission obligatoire PME</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Les PME, TPE et micro-entreprises devront emettre leurs factures
                au format electronique structure (Factur-X, UBL ou CII). C'est
                cette echeance qui concerne la majorite des utilisateurs Devizly :
                artisans, freelances, consultants, prestataires de services.
              </p>
            </div>
          </div>
        </section>

        {/* Qui est concerne */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Qui est concerne ?</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Toutes les entreprises etablies en France et assujetties a la TVA
            sont concernees. Cela inclut les micro-entrepreneurs, meme ceux
            en franchise de TVA (article 293 B du CGI). La seule exception
            concerne les entreprises non assujetties (certaines associations,
            collectivites publiques).
          </p>
          <p className="text-base leading-relaxed text-slate-300">
            Concretement, si vous emettez des factures aujourd'hui — que ce
            soit en tant que plombier, developpeur web, graphiste ou consultant
            — vous devrez passer au format electronique. C'est exactement ce
            que Devizly automatise pour vous.
          </p>
        </section>

        {/* Le role des PA */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            Le role des Plateformes Agreees
          </h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            La reforme impose de transiter par une <strong>Plateforme Agreee
            (PA)</strong> immatriculee par la DGFiP. C'est cette plateforme
            qui assure la transmission legale de vos factures a l'administration
            fiscale et a vos clients.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <Building className="mt-1 h-6 w-6 shrink-0 text-violet-400" />
              <div>
                <h3 className="mb-2 font-semibold">Devizly + Pennylane</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Devizly agit comme <strong>Operateur de Dematerialisation
                  (OD)</strong> : il genere vos factures au format Factur-X et
                  les transmet a votre Plateforme Agreee. Nous avons choisi
                  <strong> Pennylane</strong> — PA immatriculee DGFiP, utilisee
                  par des milliers d'experts-comptables en France. La connexion
                  se fait en un clic dans vos parametres.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comment Devizly vous prepare */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Comment Devizly vous prepare</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { num: "01", title: "Creez vos devis comme d'habitude", desc: "Rien ne change dans votre workflow. L'IA genere le devis, votre client signe et paie. La facture est creee automatiquement." },
              { num: "02", title: "Generez le Factur-X en un clic", desc: "Depuis le tableau de bord, cliquez sur le bouton FX. Devizly genere un PDF/A-3 avec le XML CII embarque, valide par le validateur officiel FNFE-MPE." },
              { num: "03", title: "Envoyez a Pennylane", desc: "Si votre compte Pennylane est connecte, la facture est transmise en un clic. Votre expert-comptable recoit la facture et les ecritures comptables sont generees automatiquement." },
            ].map((step) => (
              <div key={step.num} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-sm font-bold text-violet-400">{step.num}</span>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Avantages */}
        <section>
          <h2 className="mb-8 text-2xl font-bold">Pourquoi choisir Devizly</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Factur-X automatique",
                desc: "Generation Factur-X BASIC conforme, validee FNFE-MPE. Pas de configuration, pas de plugin a installer.",
              },
              {
                icon: Shield,
                title: "Conformite garantie",
                desc: "PDF/A-3 avec XML CII embarque. Profil BASIC conforme EN 16931. Validable a tout moment sur le site FNFE-MPE.",
              },
              {
                icon: Zap,
                title: "Integration Pennylane",
                desc: "Connectez votre token en 30 secondes. Vos factures arrivent directement dans le dashboard de votre comptable.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <item.icon className="mb-3 h-6 w-6 text-violet-400" />
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
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
