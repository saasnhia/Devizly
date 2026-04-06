"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { plans } from "../data/landing-data";

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
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glow-card reveal-up flex flex-col gap-4 border-b border-white/[0.06] py-6 sm:flex-row sm:items-center sm:gap-6 ${
                plan.popular ? "border-l-2 border-l-[#5B5BD6] pl-6" : ""
              }`}
            >
              {/* Name + price */}
              <div className="shrink-0 sm:w-48">
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
              <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1.5">
                {plan.features.map((f) => (
                  <span key={f} className="flex items-center gap-1 text-sm text-slate-400">
                    <Check className="h-3 w-3 text-[#5B5BD6]" />
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`group inline-flex shrink-0 items-center gap-1.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-[#5B5BD6] text-white hover:bg-[#4B4BC6]"
                    : "border border-white/10 text-white hover:border-white/20 hover:bg-white/[0.03]"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
