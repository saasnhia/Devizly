import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug, extractHeadings } from "@/lib/blog";
import { JsonLd } from "@/components/seo/json-ld";
import { DevizlyLogo } from "@/components/devizly-logo";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { mdxComponents } from "@/components/blog/mdx-components";
import { ReadingProgress } from "@/components/seo/reading-progress";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Tag,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    try {
      const post = getPostBySlug(slug);
      return {
        title: post.title,
        description: post.description,
        alternates: { canonical: `https://devizly.fr/blog/${slug}` },
        openGraph: {
          title: post.title,
          description: post.description,
          type: "article",
          publishedTime: post.date,
          url: `https://devizly.fr/blog/${slug}`,
          images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${post.title} — Devizly Blog` }],
        },
        twitter: {
          card: "summary_large_image",
          title: post.title,
          description: post.description,
          images: ["/og-image.png"],
        },
      };
    } catch {
      return { title: "Article introuvable" };
    }
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const allPosts = getAllPosts();
  const sameCategory = allPosts.filter((p) => p.category === post.category && p.slug !== post.slug);
  const related = sameCategory.length >= 3
    ? sameCategory.slice(0, 3)
    : [
        ...sameCategory,
        ...allPosts.filter((p) => p.slug !== post.slug && !sameCategory.some((s) => s.slug === p.slug)),
      ].slice(0, 3);

  const headings = extractHeadings(post.content);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: `${post.date}T00:00:00+01:00`,
    image: {
      "@type": "ImageObject",
      url: "https://devizly.fr/og-image.png",
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Organization",
      name: "Devizly",
      url: "https://devizly.fr",
    },
    publisher: {
      "@type": "Organization",
      name: "Devizly",
      url: "https://devizly.fr",
    },
    mainEntityOfPage: `https://devizly.fr/blog/${slug}`,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <ReadingProgress />
      <JsonLd data={articleSchema} />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="transition-transform hover:scale-105">
            <DevizlyLogo width={120} height={32} className="text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-white"
            >
              Blog
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

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* ── Breadcrumb ── */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-slate-500">
          <Link href="/" className="transition-colors hover:text-white">
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="transition-colors hover:text-white">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="transition-colors hover:text-white">
            {post.category}
          </span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-slate-400">
            {post.title.length > 40
              ? `${post.title.slice(0, 40)}...`
              : post.title}
          </span>
        </nav>

        {/* ── Hero gradient banner ── */}
        <div className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/30 via-indigo-500/20 to-fuchsia-500/10 ring-1 ring-white/10">
          <div className="flex min-h-[200px] flex-col justify-end p-6 sm:min-h-[260px] sm:p-10">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-200 backdrop-blur-sm">
              <Tag className="h-3 w-3" />
              {post.category}
            </span>
            <h1 className="mt-4 max-w-2xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-[42px] lg:leading-[1.15]">
              {post.title}
            </h1>
          </div>
        </div>

        {/* ── Grid: Article + Sidebar ── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          {/* Left column: article */}
          <div className="min-w-0">
            {/* ── Article header ── */}
            <header className="mb-10">
              <p className="text-lg leading-relaxed text-slate-400">
                {post.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">
                    DZ
                  </div>
                  <span className="font-medium text-slate-300">
                    Par Devizly
                  </span>
                </div>
                <span className="text-slate-600">&middot;</span>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <span className="text-slate-600">&middot;</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readingTime}
                </span>
              </div>
              <div className="mt-8 h-px bg-white/10" />
            </header>

            {/* ── MDX content ── */}
            <article
              className="
                prose prose-invert max-w-none

                prose-headings:font-bold
                prose-headings:tracking-tight

                prose-h1:hidden

                prose-h2:mt-10
                prose-h2:mb-4
                prose-h2:pl-4
                prose-h2:text-xl
                prose-h2:border-l-4
                prose-h2:border-[#5B5BD6]
                prose-h2:text-white

                prose-h3:mt-8
                prose-h3:mb-3
                prose-h3:text-lg
                prose-h3:font-semibold

                prose-p:text-base
                prose-p:leading-8
                prose-p:text-slate-300
                prose-p:mb-6

                prose-a:text-violet-400
                prose-a:font-medium
                prose-a:no-underline
                hover:prose-a:text-violet-300
                hover:prose-a:underline

                prose-strong:text-white
                prose-strong:font-semibold

                prose-li:text-base
                prose-li:leading-7
                prose-li:text-slate-300
                prose-li:marker:text-violet-500

                prose-ul:mb-6
                prose-ul:space-y-2
                prose-ul:pl-6
                prose-ol:mb-6
                prose-ol:space-y-2
                prose-ol:pl-6

                prose-code:text-violet-300
                prose-code:bg-violet-500/15
                prose-code:px-1.5
                prose-code:py-0.5
                prose-code:rounded
                prose-code:text-sm
                prose-code:font-mono
                prose-code:before:content-none
                prose-code:after:content-none

                prose-hr:border-white/10
                prose-hr:my-10
              "
            >
              <MDXRemote source={post.content} components={mdxComponents} />
            </article>

            {/* ── Devizly tip ── */}
            <div className="mt-12 flex items-start gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.08] p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Devizly automatise tout ça pour vous
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Toutes les mentions légales obligatoires sont générées
                  automatiquement. L&apos;IA Mistral structure votre devis en 30
                  secondes — signature électronique et paiement Stripe inclus.
                </p>
              </div>
            </div>

            {/* ── Tags ── */}
            <div className="mt-10 flex flex-wrap gap-2">
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
                {post.category}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                Devis
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                Freelance
              </span>
            </div>

            {/* ── Article feedback ── */}
            <div className="mt-8 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-sm text-slate-400">
                Cet article vous a été utile ?
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10"
                >
                  👍 Oui
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm transition-colors hover:border-red-500/50 hover:bg-red-500/10"
                >
                  👎 Non
                </button>
              </div>
            </div>

            {/* ── CTA ── */}
            <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-indigo-500/20 p-8 text-center sm:p-10">
              <h2 className="text-2xl font-bold">
                Créez votre premier devis gratuit
              </h2>
              <p className="mx-auto mt-3 max-w-md text-slate-400">
                30 secondes avec l&apos;IA. Signature électronique. Paiement
                Stripe. Sans engagement — sans CB.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Back */}
            <Link
              href="/blog"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Tous les articles
            </Link>

            {/* ── Related ── */}
            {related.length > 0 && (
              <section className="mt-16 border-t border-white/10 pt-10">
                <h2 className="text-xl font-bold">À lire aussi</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-violet-500/50 hover:bg-white/[0.06]"
                    >
                      <span className="text-[10px] font-medium text-violet-400">
                        {r.category}
                      </span>
                      <h3 className="mt-1 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-violet-300">
                        {r.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(r.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                        {" · "}
                        {r.readingTime}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Right sidebar (desktop only) ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              {/* Table of Contents */}
              <TableOfContents headings={headings} />

              {/* CTA card */}
              <div className="rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-500/30 p-5">
                <Sparkles className="h-5 w-5 text-violet-400" />
                <p className="mt-3 text-sm font-semibold text-white">
                  Essayer Devizly — Gratuit
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Devis IA en 30s. Signature. Paiement. Sans engagement.
                </p>
                <Link
                  href="/signup"
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
                >
                  Commencer
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>
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
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} NBHC SAS — devizly.fr
        </p>
      </footer>
    </div>
  );
}
