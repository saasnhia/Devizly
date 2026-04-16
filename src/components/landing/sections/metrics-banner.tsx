"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "../hooks/useReveal";

const metrics = [
  { value: 30, suffix: "s", label: "Pour créer un devis" },
  { value: 0, suffix: "€", label: "Pour démarrer" },
  { value: 100, suffix: "%", label: "Légalement conforme" },
];

function CountUp({
  target,
  suffix,
  start,
}: {
  target: number;
  suffix: string;
  start: boolean;
}) {
  const [value, setValue] = useState(start ? 0 : target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    // Skip animation for 0 values — just display
    if (target === 0) {
      setValue(0);
      return;
    }
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    const duration = 1400;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [start, target]);

  return (
    <>
      {value}
      <span className="text-[0.6em]">{suffix}</span>
    </>
  );
}

export function MetricsBanner() {
  const ref = useReveal<HTMLElement>();
  const [started, setStarted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="reveal-fade metrics-grid-bg relative border-y border-white/[0.05] py-16 lg:py-20"
    >
      <div
        ref={triggerRef}
        className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 px-6 sm:flex-row sm:gap-0"
      >
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
                <CountUp target={m.value} suffix={m.suffix} start={started} />
              </p>
              <p className="mt-2 text-sm text-slate-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
