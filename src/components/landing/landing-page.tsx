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
        <Link href="/pricing" className="relative z-50 hidden w-full cursor-pointer border-b border-[#5B5BD6]/20 bg-[#0d0d14] px-4 py-2 text-center text-xs transition-colors hover:bg-[#111120] sm:block">
          <span className="text-slate-400">&#11088; Offre Fondateur</span>
          <span className="mx-2 font-medium text-white">100 premiers Pro : 9&euro;/mois à vie</span>
          <span className="font-semibold text-[#5B5BD6]">En profiter &rarr;</span>
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
