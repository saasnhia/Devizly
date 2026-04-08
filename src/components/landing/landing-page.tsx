"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "./sections/top-bar";
import { EditorialNav } from "./sections/editorial-nav";
import { EditorialHero } from "./sections/editorial-hero";
import { TrustStrip } from "./sections/trust-strip";
import { FlowSteps } from "./sections/flow-steps";
import { MetricsBanner } from "./sections/metrics-banner";
import { EditorialPricing } from "./sections/editorial-pricing";
import { FaqSection } from "./sections/faq-section";
import { CtaFinal } from "./sections/cta-final";
import { MinimalFooter } from "./sections/minimal-footer";

export function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090a]" />}>
      <LandingPageInner />
    </Suspense>
  );
}

function LandingPageInner() {
  const searchParams = useSearchParams();
  const segment = searchParams.get("for") || "";

  return (
    <div className="aurora-page grain">
      <TopBar />
      <EditorialNav />
      <main>
        <EditorialHero segment={segment || undefined} />
        <TrustStrip />
        <FlowSteps />
        <MetricsBanner />
        <EditorialPricing />
        <FaqSection />
        <CtaFinal />
        <MinimalFooter />
      </main>
    </div>
  );
}
