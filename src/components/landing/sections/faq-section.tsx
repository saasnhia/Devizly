"use client";

import { useReveal } from "../hooks/useReveal";
import { faqs } from "../data/landing-data";

export function FaqSection() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} id="faq" className="reveal-fade py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="mb-12 text-center font-bold text-white"
          style={{ fontSize: "clamp(24px, 5vw, 40px)" }}
        >
          Questions fr&eacute;quentes
        </h2>
        <div className="space-y-0">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group border-b border-white/[0.06]"
            >
              <summary className="flex w-full cursor-pointer items-center justify-between py-5 text-left select-none [&::-webkit-details-marker]:hidden list-none">
                <span className="pr-4 text-sm font-medium text-white sm:text-base">
                  {faq.q}
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center text-slate-500 transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="pb-5">
                <p className="text-sm leading-relaxed text-slate-400">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
