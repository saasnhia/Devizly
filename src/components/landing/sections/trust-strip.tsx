"use client";

import { useReveal } from "../hooks/useReveal";

const items = [
  { label: "SIRET", italic: false },
  { label: "TVA", italic: false },
  { label: "eIDAS", italic: true },
  { label: "Factur-X", italic: true },
  { label: "RGPD", italic: false },
  { label: "CGI 293B", italic: true },
  { label: "DGFiP", italic: false },
];

export function TrustStrip() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="reveal-fade border-y border-white/[0.06] py-6"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          Conforme aux exigences fran&ccedil;aises
        </p>
        <div className="flex items-center justify-center gap-6 overflow-x-auto snap-x snap-mandatory sm:gap-10">
          {items.map((item) => (
            <span
              key={item.label}
              className={`shrink-0 snap-center text-sm tracking-wide text-slate-400 ${
                item.italic ? "font-serif italic" : ""
              }`}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
