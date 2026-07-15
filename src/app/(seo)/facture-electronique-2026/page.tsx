import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CTABanner } from "@/components/seo/cta-banner";
import { Calendar, Shield, Zap, ArrowRight, FileText, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "Facturation Électronique 2026 : Préparez-vous avec Devizly",
  description:
    "La réforme de la facturation électronique démarre en septembre 2026. Devizly génère automatiquement vos factures Factur-X conformes (PDF/A-3, validé FNFE-MPE), gère l'e-reporting B2C et se connecte à SUPER PDP, Plateforme Agréée immatriculée DGFiP. Prêt dès maintenant.",
  alternates: { canonical: "https://devizly.fr/facture-electronique-2026" },
  openGraph: {
    title: "Facturation Électronique 2026 — Devizly",
    description:
      "Préparez-vous à la réforme avec Devizly : Factur-X automatique, e-reporting B2C, conformité FNFE-MPE, transmission via SUPER PDP.",
    url: "https://devizly.fr/facture-electronique-2026",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly — Facturation électronique 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Facturation Électronique 2026 — Devizly",
    description: "Factur-X automatique + e-reporting B2C + SUPER PDP. Prêt pour la réforme.",
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quand la facturation électronique devient-elle obligatoire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "À partir du 1er septembre 2026, toutes les entreprises assujetties à la TVA devront être capables de recevoir des factures électroniques. Les grandes entreprises et ETI devront émettre dès cette date. Les PME et micro-entreprises auront jusqu'à septembre 2027 pour émettre.",
      },
    },
    {
      "@type": "Question",
      name: "Qu'est-ce qu'une Plateforme Agréée (PA) ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une Plateforme Agréée est un intermédiaire immatriculé par la DGFiP qui assure la transmission des factures électroniques entre les entreprises et l'administration fiscale. SUPER PDP est une Plateforme Agréée immatriculée DGFiP. Devizly y est directement connecté : depuis le tableau de bord, vous transmettez vos factures Factur-X en un clic.",
      },
    },
    {
      "@type": "Question",
      name: "Devizly est-il prêt pour la réforme 2026 ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Devizly génère des factures au format Factur-X BASIC (PDF/A-3 avec XML CII embarqué), validées par le validateur officiel FNFE-MPE. Une fois votre entreprise connectée à SUPER PDP, Plateforme Agréée immatriculée DGFiP, vous transmettez vos factures en un clic depuis le tableau de bord.",
      },
    },
    {
      "@type": "Question",
      name: "Dois-je changer de logiciel pour être conforme ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. Si vous utilisez déjà Devizly pour vos devis et factures, vous êtes automatiquement conforme. La génération Factur-X est intégrée — il suffit de cliquer sur un bouton dans le tableau de bord pour générer et envoyer vos factures conformes.",
      },
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Facturation électronique Factur-X",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Logiciel de facturation électronique Factur-X pour freelances et artisans. Conforme réforme 2026.",
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
            Facturation électronique 2026 :<br className="hidden sm:block" />
            <span className="text-violet-400"> préparez-vous avec Devizly</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            La réforme entre en vigueur en septembre 2026. Toutes les entreprises
            devront recevoir — puis émettre — leurs factures au format électronique
            structuré. Devizly vous y prépare dès maintenant, sans effort supplémentaire.
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

        {/* Calendrier de la réforme */}
        <section>
          <h2 className="mb-8 text-2xl font-bold">Le calendrier de la réforme</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                  1er sept. 2026
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Réception obligatoire</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Toutes les entreprises assujetties à la TVA — y compris les TPE,
                micro-entrepreneurs et auto-entrepreneurs — devront être capables
                de recevoir des factures électroniques au format structuré. Les
                grandes entreprises et ETI devront aussi émettre dès cette date.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-400">
                  1er sept. 2027
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Émission obligatoire PME</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Les PME, TPE et micro-entreprises devront émettre leurs factures
                au format électronique structuré (Factur-X, UBL ou CII). C'est
                cette échéance qui concerne la majorité des utilisateurs Devizly :
                artisans, freelances, consultants, prestataires de services.
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Devizly est un outil d&apos;<strong>émission</strong> de factures :
            il vous prépare à l&apos;échéance de septembre 2027. L&apos;obligation
            de <strong>réception</strong> (1er septembre 2026) passe par votre
            propre Plateforme Agréée ou votre expert-comptable — Devizly ne
            couvre pas la réception de vos factures fournisseurs.
          </p>
        </section>

        {/* Qui est concerné */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Qui est concerné ?</h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            Toutes les entreprises établies en France et assujetties à la TVA
            sont concernées. Cela inclut les micro-entrepreneurs, même ceux
            en franchise de TVA (article 293 B du CGI). La seule exception
            concerne les entreprises non assujetties (certaines associations,
            collectivités publiques).
          </p>
          <p className="text-base leading-relaxed text-slate-300">
            Concrètement, si vous émettez des factures aujourd'hui — que ce
            soit en tant que plombier, développeur web, graphiste ou consultant
            — vous devrez passer au format électronique. C'est exactement ce
            que Devizly automatise pour vous.
          </p>
        </section>

        {/* Le rôle des PA */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            Le rôle des Plateformes Agréées
          </h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300">
            La réforme impose de transiter par une <strong>Plateforme Agréée
            (PA)</strong> immatriculée par la DGFiP. C'est cette plateforme
            qui assure la transmission légale de vos factures à l'administration
            fiscale et à vos clients.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <Building className="mt-1 h-6 w-6 shrink-0 text-violet-400" />
              <div>
                <h3 className="mb-2 font-semibold">Devizly + SUPER PDP</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Devizly génère vos factures au format Factur-X et les
                  transmet via <strong>SUPER PDP</strong>, une Plateforme
                  Agréée immatriculée par la DGFiP. Connectez votre entreprise
                  depuis vos paramètres — aucun identifiant ne transite par
                  Devizly, l&apos;autorisation se fait directement chez SUPER
                  PDP. Depuis le tableau de bord Factures, transmettez ensuite
                  chaque facture Factur-X en un clic.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* E-reporting B2C */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Et vos ventes aux particuliers ?</h2>
          <p className="text-base leading-relaxed text-slate-300">
            La facturation électronique ne couvre que les transactions B2B.
            Si vous facturez aussi des particuliers ou des clients à
            l&apos;international, une obligation distincte s&apos;applique :
            l&apos;<Link href="/e-reporting-b2c" className="text-violet-400 hover:underline">e-reporting B2C</Link>.
            Devizly enregistre automatiquement ces transactions pour vous.
          </p>
        </section>

        {/* Comment Devizly vous prépare */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Comment Devizly vous prépare</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { num: "01", title: "Créez vos devis comme d'habitude", desc: "Rien ne change dans votre workflow. L'IA génère le devis, votre client signe et paie. La facture est créée automatiquement." },
              { num: "02", title: "Générez le Factur-X en un clic", desc: "Depuis le tableau de bord, cliquez sur le bouton FX. Devizly génère un PDF/A-3 avec le XML CII embarqué, validé par le validateur officiel FNFE-MPE." },
              { num: "03", title: "Transmission via SUPER PDP", desc: "Une fois votre entreprise connectée à SUPER PDP depuis vos paramètres, transmettez vos factures Factur-X à votre client en un clic depuis le tableau de bord. Devizly vérifie automatiquement si le client est raccordé à une plateforme agréée : si oui, la facture part par le circuit électronique ; sinon, vous l'envoyez par email comme aujourd'hui." },
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
                desc: "Génération Factur-X BASIC conforme, validée FNFE-MPE. Pas de configuration, pas de plugin à installer.",
              },
              {
                icon: Shield,
                title: "Conformité garantie",
                desc: "PDF/A-3 avec XML CII embarqué. Profil BASIC conforme EN 16931. Validable à tout moment sur le site FNFE-MPE.",
              },
              {
                icon: Zap,
                title: "Transmission via SUPER PDP",
                desc: "Connectez votre entreprise depuis vos paramètres. Envoyez ensuite vos factures Factur-X en un clic vers votre Plateforme Agréée immatriculée DGFiP.",
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
