"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

export function CtaFinal() {
  const ref = useReveal<HTMLElement>(0.1);

  return (
    <section ref={ref} className="reveal-fade relative pt-36 pb-32 lg:pt-40 lg:pb-40 scroll-mt-20">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          style={{
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(99,102,241,0.10), transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2
          className="font-bold text-white"
          style={{ fontSize: "clamp(32px, 8vw, 72px)" }}
        >
          Le prochain devis,
          <br />
          <span className="font-serif italic text-[#818cf8]">sign&eacute; ce soir.</span>
        </h2>

        <p className="mt-6 text-slate-400">
          Sans carte bancaire. Sans engagement.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#5B5BD6] px-10 py-5 text-lg font-semibold text-white transition-all hover:bg-[#4B4BC6] hover:shadow-[0_0_48px_rgba(91,91,214,0.4)]"
          >
            Cr&eacute;er mon compte gratuit
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
          >
            Voir la d&eacute;mo
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Sans carte bancaire &middot; Acc&egrave;s imm&eacute;diat &middot; Support fran&ccedil;ais
        </p>
      </div>
    </section>
  );
}
