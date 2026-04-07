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
        <EditorialNav />
        <div className="w-full border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-2.5 text-center">
          <span className="text-sm font-semibold text-yellow-400">&#11088; Offre Fondateur</span>
          <span className="text-sm text-yellow-400/80">
            {" "}— Les 100 premiers abonnés Pro obtiennent 9&euro;/mois à vie.{" "}
          </span>
          <a href="/pricing" className="text-sm font-semibold text-yellow-300 underline underline-offset-2">
            En profiter &rarr;
          </a>
        </div>
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
