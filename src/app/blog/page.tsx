import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { DevizlyLogo } from "@/components/devizly-logo";
import { ArrowRight, Clock, Tag, TrendingUp, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog Devizly — Guides Freelances et Artisans",
  description:
    "Conseils pratiques pour freelances, artisans et auto-entrepreneurs : devis, facturation, TVA, mentions légales, relances clients et gestion.",
  alternates: { canonical: "https://devizly.fr/blog" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Artisans: "bg-amber-500/20 text-amber-300",
  Freelances: "bg-violet-500/20 text-violet-300",
  "Auto-entrepreneurs": "bg-emerald-500/20 text-emerald-300",
  Juridique: "bg-blue-500/20 text-blue-300",
  "Comptabilité": "bg-rose-500/20 text-rose-300",
};

const FILTER_CATEGORIES = [
  { label: "Tous", slug: "tous" },
  { label: "Devis & Facturation", slug: "devis-facturation" },
  { label: "Juridique", slug: "juridique" },
  { label: "Gestion", slug: "gestion" },
  { label: "Fiscalité", slug: "fiscalite" },
  { label: "IA & Productivité", slug: "ia-productivite" },
] as const;

const CATEGORY_TO_FILTER: Record<string, string> = {
  Artisans: "devis-facturation",
  Freelances: "devis-facturation",
  "Auto-entrepreneurs": "devis-facturation",
  Juridique: "juridique",
  "Comptabilité": "fiscalite",
};

function getFilterSlug(postCategory: string): string {
  return CATEGORY_TO_FILTER[postCategory] ?? "gestion";
}

function matchesFilter(postCategory: string, filter: string): boolean {
  if (!filter || filter === "tous") return true;
  return getFilterSlug(postCategory) === filter;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const activeFilter = cat ?? "tous";

  const allPosts = getAllPosts();
  const filteredPosts = allPosts.filter((p) =>
    matchesFilter(p.category, activeFilter)
  );
  const featured = filteredPosts[0];
  const rest = filteredPosts.slice(1);

  // Sidebar data: popular = first 3 posts overall
  const popularPosts = allPosts.slice(0, 3);

  // Category counts
  const categoryCounts = FILTER_CATEGORIES.filter((c) => c.slug !== "tous").map(
    (c) => ({
      ...c,
      count: allPosts.filter((p) => getFilterSlug(p.category) === c.slug)
        .length,
    })
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="transition-transform hover:scale-105">
            <DevizlyLogo width={120} height={32} className="text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-white"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
            >
              Essayer gratuit
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-medium text-violet-400">Blog</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Ressources{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              &amp; Guides
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
            Conseils pratiques pour gérer et développer votre activité
          </p>
        </div>

        {/* Category filter pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = activeFilter === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={cat.slug === "tous" ? "/blog" : `/blog?cat=${cat.slug}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border border-violet-500/30 bg-violet-500/20 text-violet-300"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Main content + Sidebar */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Left column: posts */}
          <div>
            {/* Featured post */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all hover:border-violet-500/50 hover:bg-white/[0.06] sm:p-10"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      CATEGORY_COLORS[featured.category] ||
                      "bg-slate-500/20 text-slate-300"
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    {featured.category}
                  </span>
                  <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">
                    À la une
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-bold leading-snug transition-colors group-hover:text-violet-300 sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">
                  {featured.description}
                </p>
                <div className="mt-5 flex items-center gap-4 text-sm text-slate-500">
                  <time dateTime={featured.date}>
                    {new Date(featured.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {featured.readingTime}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 transition-colors group-hover:text-violet-300">
                    Lire l&apos;article
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}

            {/* Posts grid */}
            {rest.length > 0 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {rest.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-violet-500/50 hover:bg-white/[0.05]"
                  >
                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        CATEGORY_COLORS[post.category] ||
                        "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {post.category}
                    </span>

                    <h2 className="mt-3 text-base font-semibold leading-snug text-white transition-colors group-hover:text-violet-300">
                      {post.title}
                    </h2>

                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                      {post.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </time>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {filteredPosts.length === 0 && (
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
                <p className="text-slate-400">
                  Aucun article dans cette catégorie pour le moment.
                </p>
                <Link
                  href="/blog"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-400 hover:text-violet-300"
                >
                  Voir tous les articles
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Right sidebar (desktop only) */}
          <aside className="hidden space-y-6 lg:block">
            {/* Articles populaires */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                Articles populaires
              </h3>
              <div className="mt-4 space-y-3">
                {popularPosts.map((post, idx) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="text-sm leading-snug text-slate-300 transition-colors group-hover:text-violet-300">
                      {post.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Catégories */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-semibold text-white">Catégories</h3>
              <div className="mt-3 space-y-2">
                {categoryCounts.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/blog?cat=${cat.slug}`}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <span>{cat.label}</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-500">
                      {cat.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-500/30 p-5">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <p className="mt-3 text-sm font-semibold text-white">
                Essayer Devizly gratuitement
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Générez vos devis en 30 secondes avec l&apos;IA. Sans
                engagement.
              </p>
              <Link
                href="/signup"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
              >
                Commencer
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-8 text-center sm:p-10">
          <h2 className="text-xl font-bold">
            Prêt à gagner du temps sur vos devis ?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            L&apos;IA génère votre devis en 30 secondes. Signature, paiement et
            relances — tout est automatisé.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
          >
            Créer mon premier devis gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-slate-500">
          <Link href="/" className="transition-colors hover:text-white">
            Accueil
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-white">
            Tarifs
          </Link>
          <Link href="/blog" className="transition-colors hover:text-white">
            Blog
          </Link>
          <Link
            href="/mentions-legales"
            className="transition-colors hover:text-white"
          >
            Mentions légales
          </Link>
          <Link
            href="/confidentialite"
            className="transition-colors hover:text-white"
          >
            Confidentialité
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} NBHC SAS — devizly.fr
        </p>
      </footer>
    </div>
  );
}
