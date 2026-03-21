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
  Artisans: "bg-amber-50 text-amber-700",
  Freelances: "bg-violet-50 text-violet-700",
  "Auto-entrepreneurs": "bg-emerald-50 text-emerald-700",
  Juridique: "bg-blue-50 text-blue-700",
  Comptabilité: "bg-rose-50 text-rose-700",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="transition-transform hover:scale-105">
            <DevizlyLogo width={120} height={32} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              Essayer gratuit
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-medium text-violet-600">Blog</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Guides pour freelances et artisans
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
            Devis, facturation, TVA, mentions légales — tout ce qu&apos;il faut
            savoir pour gérer votre activité sereinement.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mt-12 flex flex-col overflow-hidden rounded-2xl border bg-slate-50 transition-all hover:border-violet-200 hover:shadow-lg sm:flex-row"
          >
            <div className="flex flex-1 flex-col justify-center p-8 sm:p-10">
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  CATEGORY_COLORS[featured.category] || "bg-slate-100 text-slate-600"
                }`}
              >
                <Tag className="h-3 w-3" />
                {featured.category}
              </span>
              <h2 className="mt-4 text-2xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-violet-600">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {featured.description}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <time dateTime={featured.date}>
                  {new Date(featured.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {featured.readingTime}
                </span>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 transition-colors group-hover:text-violet-700">
                Lire l&apos;article
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        )}

        {/* Posts grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border bg-white p-6 transition-all hover:border-violet-200 hover:shadow-md"
            >
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  CATEGORY_COLORS[post.category] || "bg-slate-100 text-slate-600"
                }`}
              >
                {post.category}
              </span>

              <h2 className="mt-3 text-base font-semibold leading-snug text-slate-800 transition-colors group-hover:text-violet-600">
                {post.title}
              </h2>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                {post.description}
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
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

        {/* CTA */}
        <div className="mt-16 rounded-2xl border bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-bold text-slate-900">
            Prêt à gagner du temps sur vos devis ?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            L&apos;IA génère votre devis en 30 secondes. Signature, paiement et
            relances — tout est automatisé.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Créer mon premier devis gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-slate-400">
          <Link href="/" className="transition-colors hover:text-slate-700">Accueil</Link>
          <Link href="/pricing" className="transition-colors hover:text-slate-700">Tarifs</Link>
          <Link href="/blog" className="transition-colors hover:text-slate-700">Blog</Link>
          <Link href="/mentions-legales" className="transition-colors hover:text-slate-700">Mentions légales</Link>
          <Link href="/confidentialite" className="transition-colors hover:text-slate-700">Confidentialité</Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-300">
          &copy; {new Date().getFullYear()} NBHC SAS — devizly.fr
        </p>
      </footer>
    </div>
  );
}
