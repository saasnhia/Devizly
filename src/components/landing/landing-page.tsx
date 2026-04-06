"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SmoothScroll } from "./smooth-scroll";
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
        <EditorialNav />
        <EditorialHero segment={segment} />
        <ValueProposition />
        <DemoWrapper />
        <StatsProcess />
        <EditorialPricing />
        <FaqSection />
        <BlogSection recentPosts={recentPosts} />
        <CtaFinal onVideoOpen={() => setVideoOpen(true)} />
        <MinimalFooter />
        <ChatWidget />
        <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
      </div>
    </SmoothScroll>
  );
}
