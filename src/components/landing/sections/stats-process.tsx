"use client";

import { useRef } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { steps } from "../data/landing-data";

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <div ref={ref} className="reveal-up flex-1 px-6 py-4 text-center">
      <p className="text-5xl font-bold text-white lg:text-7xl">
        {inView ? <CountUp end={value} duration={2} /> : "0"}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}

export function StatsProcess() {
  const timelineRef = useRef<HTMLDivElement>(null);

  return (
    <section id="fonctionnalites">
      {/* Stats strip */}
      <div className="border-y border-white/[0.05] py-16 lg:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 px-6 sm:flex-row sm:gap-0 sm:divide-x sm:divide-white/10">
          <Stat value={30} suffix="s" label="Pour créer un devis" />
          <Stat value={0} suffix="€" label="Pour démarrer" />
          <Stat value={100} suffix="%" label="Légalement conforme" />
        </div>
      </div>

      {/* Process timeline */}
      <div className="py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="reveal-up mb-16 text-center text-3xl font-bold text-white">
            3 étapes. 2 minutes. C&apos;est tout.
          </h2>

          {/* Timeline */}
          <div ref={timelineRef} className="relative">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-4 hidden h-px bg-white/10 sm:block" />

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="reveal-up relative text-center" style={{ transitionDelay: `${i * 0.15}s` }}>
                    {/* Dot */}
                    <div className="mx-auto mb-6 flex h-8 w-8 items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-[#5B5BD6] shadow-[0_0_12px_rgba(91,91,214,0.5)]" />
                    </div>
                    <Icon className="mx-auto mb-3 h-6 w-6 text-[#5B5BD6]" />
                    <p className="mb-2 text-sm font-bold text-white">{step.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="reveal-up mt-12 text-center text-xl italic text-slate-400">
            2 minutes du début à la fin.
          </p>
        </div>
      </div>
    </section>
  );
}
