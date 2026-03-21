import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { JsonLd } from "@/components/seo/json-ld";
import { DevizlyLogo } from "@/components/devizly-logo";
import { ArrowLeft, ArrowRight, Clock, Tag, ChevronRight, Sparkles } from "lucide-react";

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
  const related = allPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Devizly" },
    publisher: {
      "@type": "Organization",
      name: "Devizly",
      url: "https://devizly.fr",
    },
    mainEntityOfPage: `https://devizly.fr/blog/${slug}`,
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={articleSchema} />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="transition-transform hover:scale-105">
            <DevizlyLogo width={120} height={32} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              Blog
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

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-slate-400">
          <Link href="/" className="transition-colors hover:text-slate-700">
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="transition-colors hover:text-slate-700">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-slate-500">{post.title}</span>
        </nav>

        {/* ── Article header ── */}
        <header className="mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
            <Tag className="h-3 w-3" />
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-slate-500">
            {post.description}
          </p>
          <div className="mt-5 flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">
                DZ
              </div>
              <span className="font-medium text-slate-600">Devizly</span>
            </div>
            <span className="text-slate-300">·</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>
          <div className="mt-6 h-px bg-slate-100" />
        </header>

        {/* ── MDX content ── */}
        <article className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-3 prose-h3:text-lg prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:text-[16px] prose-a:text-violet-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-800 prose-li:text-slate-600 prose-li:text-[16px] prose-li:leading-[1.8] prose-ul:my-4 prose-ol:my-4 prose-blockquote:border-violet-300 prose-blockquote:bg-violet-50/50 prose-blockquote:py-1 prose-blockquote:px-1 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none">
          <MDXRemote source={post.content} />
        </article>

        {/* ── Devizly tip box ── */}
        <div className="mt-10 flex items-start gap-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Devizly génère vos devis conformes automatiquement
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Toutes les mentions légales obligatoires sont incluses — SIRET, TVA,
              conditions de paiement, validité. L&apos;IA Mistral structure votre devis
              en 30 secondes.
            </p>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mt-10 rounded-2xl border bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Créez votre premier devis gratuit
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-500">
            30 secondes avec l&apos;IA. Signature électronique. Paiement Stripe.
            Sans engagement — sans CB.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 hover:shadow-violet-500/40"
          >
            Essayer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Back */}
        <Link
          href="/blog"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-violet-600 transition-colors hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Tous les articles
        </Link>

        {/* ── Related ── */}
        {related.length > 0 && (
          <section className="mt-14 border-t pt-10">
            <h2 className="text-xl font-bold text-slate-900">À lire aussi</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group rounded-xl border bg-white p-5 transition-all hover:border-violet-200 hover:shadow-md"
                >
                  <span className="text-[10px] font-medium text-violet-500">
                    {r.category}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-violet-600">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(r.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" · "}
                    {r.readingTime}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-slate-400">
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
