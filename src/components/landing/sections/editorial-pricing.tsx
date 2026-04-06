"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { plans } from "../data/landing-data";
import { MagneticButton } from "../magnetic-button";

gsap.registerPlugin(ScrollTrigger);

function PricingLine({ plan, index }: { plan: (typeof plans)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          delay: index * 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Pro border draw animation
      if (plan.popular && borderRef.current) {
        gsap.fromTo(
          borderRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.8,
            delay: index * 0.2 + 0.3,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });
    return () => ctx.revert();
  }, [index, plan.popular]);

  return (
    <div
      ref={ref}
      className={`pricing-line glow-card relative flex flex-col gap-4 border-b border-white/[0.06] py-6 sm:flex-row sm:items-center sm:gap-6 overflow-hidden ${
        plan.popular ? "pl-6" : ""
      }`}
      style={{ opacity: 0 }}
    >
      {/* Shimmer overlay */}
      <div className="pricing-shimmer-overlay pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#5B5BD6]/[0.06] to-transparent" style={{ transform: "translateX(-100%)" }} />

      {/* Pro border animated */}
      {plan.popular && (
        <div
          ref={borderRef}
          className="absolute left-0 top-0 h-full w-0.5 bg-[#5B5BD6] origin-top"
          style={{ transform: "scaleY(0)" }}
        />
      )}

      {/* Name + price */}
      <div className="shrink-0 sm:w-48 relative z-[1]">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">{plan.name}</span>
          {plan.popular && (
            <span className="rounded-full bg-[#5B5BD6]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#818cf8]">
              Populaire
            </span>
          )}
        </div>
        {plan.price > 0 ? (
          <p className="mt-0.5 text-sm text-slate-400">
            {plan.price}&euro;{plan.period}
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-slate-500">{plan.description}</p>
        )}
      </div>

      {/* Features inline */}
      <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1.5 relative z-[1]">
        {plan.features.map((f) => (
          <span key={f} className="flex items-center gap-1 text-sm text-slate-400">
            <Check className="h-3 w-3 text-[#5B5BD6]" />
            {f}
          </span>
        ))}
      </div>

      {/* CTA */}
      {plan.popular ? (
        <MagneticButton
          as="a"
          href={plan.href}
          className={`group inline-flex shrink-0 items-center gap-1.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all bg-[#5B5BD6] text-white hover:bg-[#4B4BC6] relative z-[1]`}
        >
          {plan.cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </MagneticButton>
      ) : (
        <Link
          href={plan.href}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all border border-white/10 text-white hover:border-white/20 hover:bg-white/[0.03] relative z-[1]"
        >
          {plan.cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function EditorialPricing() {
  return (
    <section id="tarifs" className="py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Headline */}
        <h2 className="reveal-up mb-16 text-center text-4xl font-bold tracking-tight text-white lg:text-5xl">
          Gratuit pour démarrer.{" "}
          <span className="text-[#5B5BD6]">19&euro;/mois</span> pour tout débloquer.
        </h2>

        {/* Plan lines */}
        <div className="space-y-0">
          {plans.map((plan, i) => (
            <PricingLine key={plan.name} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
