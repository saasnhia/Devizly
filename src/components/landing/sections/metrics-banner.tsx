"use client";

import { useReveal } from "../hooks/useReveal";

const metrics = [
  { value: "30", suffix: "s", label: "Pour créer un devis" },
  { value: "0", suffix: "€", label: "Pour démarrer" },
  { value: "100", suffix: "%", label: "Légalement conforme" },
];

export function MetricsBanner() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="reveal-fade border-y border-white/[0.05] py-16 lg:py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 px-6 sm:flex-row sm:gap-0">
        {metrics.map((m, i) => (
          <div key={m.label} className="flex flex-1 items-center">
            {i > 0 && (
              <div className="mx-auto hidden h-16 w-px bg-white/10 sm:block" />
            )}
            <div className="flex-1 px-6 py-4 text-center">
              <p
                className="font-serif italic font-bold text-white"
                style={{
                  fontSize: "clamp(44px, 12vw, 72px)",
                  background: "linear-gradient(to bottom right, #fff, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {m.value}
                <span className="text-[0.6em]">{m.suffix}</span>
              </p>
              <p className="mt-2 text-sm text-slate-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
