import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { METIERS } from "@/lib/seo/metiers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://devizly.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const blogPosts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const metierPages = METIERS.map((m) => ({
    url: `${SITE_URL}/logiciel-devis/${m.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    // Core pages
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },

    // SEO long-tail pages
    { url: `${SITE_URL}/logiciel-devis-artisan`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/devis-auto-entrepreneur`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/logiciel-facturation-freelance`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/devis-batiment-gratuit`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/creer-devis-en-ligne`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/generateur-devis-ia`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Programmatic SEO — metiers
    ...metierPages,

    // Blog
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...blogPosts,

    // Legal pages
    { url: `${SITE_URL}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/securite`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
