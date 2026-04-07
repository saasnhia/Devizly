"use client";

import { Suspense, useState } from "react";
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
        <div className="flex w-full items-center justify-center gap-2 border-b border-[#5B5BD6]/20 bg-[#0d0d14] px-4 py-2 text-center text-sm">
          <span className="text-slate-400">&#11088; Offre Fondateur</span>
          <span className="text-slate-500">&mdash;</span>
          <span className="font-medium text-white">Les 100 premiers abonnés Pro : 9&euro;/mois à vie</span>
          <a href="/pricing" className="ml-1 font-semibold text-[#5B5BD6] underline underline-offset-2 transition-colors hover:text-[#818cf8]">
            En profiter &rarr;
          </a>
        </div>
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
