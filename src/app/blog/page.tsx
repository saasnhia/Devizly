import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { DevizlyLogo } from "@/components/devizly-logo";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog Devizly — Guides Freelances et Artisans",
  description:
    "Conseils pratiques pour freelances, artisans et auto-entrepreneurs : devis, facturation, TVA, mentions légales, relances clients.",
  alternates: { canonical: "https://devizly.fr/blog" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Artisans: "bg-amber-500/20 text-amber-300",
  Freelances: "bg-violet-500/20 text-violet-300",
  "Auto-entrepreneurs": "bg-emerald-500/20 text-emerald-300",
  Juridique: "bg-blue-500/20 text-blue-300",
  Comptabilité: "bg-rose-500/20 text-rose-300",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

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
            Guides pour freelances{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              et artisans
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
            Devis, facturation, TVA, mentions légales — tout ce qu&apos;il faut
            savoir pour gérer votre activité sereinement.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mt-14 block rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all hover:border-violet-400/40 hover:bg-white/[0.06] sm:p-10"
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  CATEGORY_COLORS[featured.category] || "bg-slate-500/20 text-slate-300"
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
                  day: "numeric", month: "long", year: "numeric",
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
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-violet-400/40 hover:bg-white/[0.05]"
            >
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  CATEGORY_COLORS[post.category] || "bg-slate-500/20 text-slate-300"
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
                    day: "numeric", month: "long",
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
          <Link href="/" className="transition-colors hover:text-white">Accueil</Link>
          <Link href="/pricing" className="transition-colors hover:text-white">Tarifs</Link>
          <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
          <Link href="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link>
          <Link href="/confidentialite" className="transition-colors hover:text-white">Confidentialité</Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} NBHC SAS — devizly.fr
        </p>
      </footer>
    </div>
  );
}
