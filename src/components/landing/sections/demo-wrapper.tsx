"use client";

import { DemoSection } from "@/components/landing/demo-section";

export function DemoWrapper() {
  return (
    <section id="demo" className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="reveal-scale overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f12] p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Essayez maintenant — sans inscription
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5B5BD6]/30 bg-[#5B5BD6]/10 px-3 py-1 text-xs font-medium text-[#818cf8]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
              </span>
              Démo en direct
            </span>
          </div>
          <DemoSection />
        </div>
      </div>
    </section>
  );
}
