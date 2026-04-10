"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import { plans } from "../data/landing-data";

function PricingCard({
  plan,
}: {
  plan: (typeof plans)[number];
}) {
  return (
    <div
      className={`relative flex flex-col overflow-visible rounded-2xl p-6 transition-shadow ${
        plan.popular
          ? "border-2 border-[#5B5BD6] bg-gradient-to-br from-[#111116] to-[#13111f] shadow-[0_0_40px_rgba(99,102,241,0.12)]"
          : "border border-white/[0.08] bg-[#111116]"
      }`}
    >
      {/* Popular badge — floats on top border */}
      {plan.popular && (
        <span
          className="absolute right-6 z-10 text-[11px] font-semibold text-white"
          style={{
            top: "-1px",
            transform: "translateY(-50%)",
            background: "linear-gradient(180deg, #818cf8, #6366f1)",
            padding: "5px 14px",
            borderRadius: "9999px",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          }}
        >
          Populaire
        </span>
      )}

      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
      <p className="mt-1 text-sm text-slate-400">{plan.description}</p>

      <div className="mt-5">
        <span className="text-5xl font-bold text-white">
          {plan.price}&euro;
        </span>
        {plan.price > 0 && (
          <span className="text-lg text-slate-400">{plan.period}</span>
        )}
        {plan.price === 0 && (
          <p className="mt-1 text-xs text-slate-500">Gratuit pour toujours</p>
        )}
        {plan.popular && (
          <span className="mt-2 inline-flex items-center rounded-full border border-[#5B5BD6]/20 bg-[#5B5BD6]/10 px-2 py-0.5 text-[10px] font-medium text-[#818cf8]">
            Prêt réforme 2026
          </span>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-slate-200">
            <Check className="h-4 w-4 shrink-0 text-[#22c55e]" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href={plan.href}
          className={`group flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold transition-all ${
            plan.popular
              ? "bg-[#5B5BD6] text-white hover:bg-[#4B4BC6]"
              : "border border-white/10 text-white hover:border-white/20 hover:bg-white/[0.03]"
          }`}
        >
          {plan.cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export function EditorialPricing() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} id="tarifs" className="reveal-fade py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="mb-4 text-center font-bold tracking-tight text-white"
          style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
        >
          Gratuit pour d&eacute;marrer.{" "}
          <span className="text-[#5B5BD6]">19&euro;/mois</span> pour tout d&eacute;bloquer.
        </h2>
        <p className="mx-auto mb-14 max-w-md text-center text-base text-slate-400">
          Commencez gratuitement. &Eacute;voluez quand vous &ecirc;tes pr&ecirc;t.
        </p>

        {/* Cards — Pro first on mobile via order */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={i === 1 ? "order-first md:order-none" : ""}
            >
              <PricingCard plan={plan} />
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
          <span>&#10003; Sans carte bancaire</span>
          <span>&#10003; Annulation &agrave; tout moment</span>
          <span>&#10003; RGPD &amp; h&eacute;berg&eacute; en France</span>
        </div>

        {/* Founder banner */}
        <p className="mt-8 text-center text-sm text-slate-500">
          &#11088;{" "}
          <strong className="text-white">Offre Fondateur</strong> &mdash; Les 100
          premiers abonn&eacute;s Pro obtiennent 9&euro;/mois &agrave; vie.
        </p>
      </div>
    </section>
  );
}
