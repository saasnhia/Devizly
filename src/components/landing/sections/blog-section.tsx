"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import type { RecentPost } from "../data/landing-data";

export function BlogSection({ recentPosts }: { recentPosts: RecentPost[] }) {
  if (!recentPosts.length) return null;

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="reveal-up mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Blog</h2>
          <Link
            href="/blog"
            className="group flex items-center gap-1.5 text-sm text-[#5B5BD6] hover:underline"
          >
            Voir tous les articles
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glow-card reveal-up group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-[#5B5BD6]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#818cf8]">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white group-hover:text-[#818cf8] transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">{post.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
