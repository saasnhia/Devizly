import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { METIERS, metierUrl } from "@/lib/seo/metiers";
import { Zap, FileText, Shield, ArrowRight } from "lucide-react";

export function generateStaticParams() {
  return METIERS.map((m) => ({ metier: m.slug }));
}

function getMetier(slug: string) {
  return METIERS.find((m) => m.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ metier: string }>;
}): Promise<Metadata> {
  const { metier: slug } = await params;
  const m = getMetier(slug);
  if (!m) return { title: "Page introuvable" };

  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: metierUrl(m.slug) },
    openGraph: {
      title: `${m.title} — Devizly`,
      description: m.description,
      url: metierUrl(m.slug),
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `Devizly — ${m.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: ["/og-image.png"],
    },
  };
}

export default async function LogicielDevisMetierPage({
  params,
}: {
  params: Promise<{ metier: string }>;
}) {
  const { metier: slug } = await params;
  const m = getMetier(slug);
  if (!m) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: m.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Devizly — Devis ${m.nom}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: m.description,
    url: metierUrl(m.slug),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://devizly.fr",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Logiciel devis artisan",
        item: "https://devizly.fr/logiciel-devis-artisan",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Devis ${m.nom}`,
        item: metierUrl(m.slug),
      },
    ],
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={breadcrumbSchema} />

      <article>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {m.h1}
        </h1>

        {/* Intro — unique per trade */}
        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          {m.intro}
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          {m.contexte}
        </p>

        {/* Mentions obligatoires — specific per trade */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-violet-400">
            Mentions obligatoires sur un devis {m.nom.toLowerCase()}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400">
            {m.mentions}
          </p>
        </div>

        {/* TVA — specific per trade */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-violet-400">
            TVA applicable — {m.nom.toLowerCase()}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400">
            {m.tva}
          </p>
        </div>

        {/* 3 avantages Devizly */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Zap className="mb-3 h-8 w-8 text-violet-400" />
            <h3 className="text-lg font-semibold">Devis en 2 minutes</h3>
            <p className="mt-2 text-sm text-slate-400">
              Décrivez votre chantier, l&apos;IA génère un devis {m.nom.toLowerCase()} structuré
              avec les bons postes et les mentions légales.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <FileText className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="text-lg font-semibold">Conforme et complet</h3>
            <p className="mt-2 text-sm text-slate-400">
              SIRET, TVA, assurances, conditions de paiement — toutes les
              mentions obligatoires sont ajoutées automatiquement.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Shield className="mb-3 h-8 w-8 text-amber-400" />
            <h3 className="text-lg font-semibold">Signature + paiement</h3>
            <p className="mt-2 text-sm text-slate-400">
              Votre client signe en ligne et paie l&apos;acompte par carte. Relances
              automatiques J+2, J+5, J+7.
            </p>
          </div>
        </div>

        {/* FAQ — unique per trade */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>
          <div className="mt-6 space-y-6">
            {m.faq.map((f, i) => (
              <div key={i}>
                <h3 className="text-lg font-semibold text-violet-400">
                  {f.q}
                </h3>
                <p className="mt-2 text-slate-400">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Créez votre premier devis {m.nom.toLowerCase()} maintenant
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Inscription en 30 secondes. Premier devis en 2 minutes. Gratuit, sans CB.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
          >
            Essayer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Internal links — related SEO pages */}
        <div className="mt-12 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Voir aussi :</span>
          {m.relatedPages.map((href, i) => (
            <span key={href} className="flex items-center gap-3">
              {i > 0 && <span className="text-slate-600">·</span>}
              <Link href={href} className="text-violet-400 hover:text-violet-300">
                {href.replace("/logiciel-devis/", "Devis ").replace(/-/g, " ").replace("/logiciel-devis-artisan", "Devis artisan").replace("/devis-batiment-gratuit", "Devis bâtiment").replace("/devis-auto-entrepreneur", "Auto-entrepreneur")}
              </Link>
            </span>
          ))}
        </div>

        {/* Blog links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Articles :</span>
          {m.relatedBlog.map((href, i) => (
            <span key={href} className="flex items-center gap-3">
              {i > 0 && <span className="text-slate-600">·</span>}
              <Link href={href} className="text-emerald-400 hover:text-emerald-300">
                {href
                  .replace("/blog/", "")
                  .replace(/-/g, " ")
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </Link>
            </span>
          ))}
        </div>
      </article>
    </>
  );
}
