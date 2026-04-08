"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SmoothScroll } from "./smooth-scroll";
import { CustomCursor } from "./custom-cursor";
import { SectionDivider } from "./section-divider";
import { EditorialNav } from "./sections/editorial-nav";
import { EditorialHero } from "./sections/editorial-hero";
import { ValueProposition } from "./sections/value-proposition";
import { DemoWrapper } from "./sections/demo-wrapper";
import { StatsProcess } from "./sections/stats-process";
import { EditorialPricing } from "./sections/editorial-pricing";
import { FaqSection } from "./sections/faq-section";
import { BlogSection } from "./sections/blog-section";
import { CtaFinal } from "./sections/cta-final";
import { MinimalFooter } from "./sections/minimal-footer";
import { ChatWidget } from "./sections/chat-widget";
import { VideoModal } from "./sections/video-modal";
import type { RecentPost } from "./data/landing-data";

export function LandingPage({ recentPosts = [] }: { recentPosts?: RecentPost[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090a]" />}>
      <LandingPageInner recentPosts={recentPosts} />
    </Suspense>
  );
}

function LandingPageInner({ recentPosts }: { recentPosts: RecentPost[] }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const searchParams = useSearchParams();
  const segment = searchParams.get("for") || "";

  return (
    <SmoothScroll>
      <div className="aurora-page grain">
        <CustomCursor />
        <Link href="/pricing" className="block w-full bg-[#0d0d14] border-b border-[#5B5BD6]/20 py-2 px-3 text-center text-xs hover:bg-[#111120] transition-colors cursor-pointer z-50 relative">
          <span className="text-slate-400">⭐ Offre Fondateur</span>
          <span className="text-slate-500 mx-1">—</span>
          <span className="text-slate-400 line-through mr-1">19€/mois</span>
          <span className="text-white font-semibold">9€/mois à vie</span>
          <span className="text-slate-500 mx-1">·</span>
          <span className="text-slate-400">100 premières places</span>
          <span className="text-[#5B5BD6] font-semibold ml-2">En profiter →</span>
        </Link>
        <EditorialNav />
        <EditorialHero segment={segment} />
        <SectionDivider />
        <ValueProposition />
        <SectionDivider />
        <DemoWrapper />
        <SectionDivider />
        <StatsProcess />
        <SectionDivider />
        <EditorialPricing />
        <SectionDivider />
        <FaqSection />
        <BlogSection recentPosts={recentPosts} />
        <SectionDivider />
        <CtaFinal onVideoOpen={() => setVideoOpen(true)} />
        <MinimalFooter />
        <ChatWidget />
        <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
      </div>
    </SmoothScroll>
  );
}
