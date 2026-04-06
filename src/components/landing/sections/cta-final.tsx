"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaFinal({ onVideoOpen }: { onVideoOpen: () => void }) {
  return (
    <section className="relative py-32 lg:py-40">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 600px 400px at 50% 50%, rgba(91,91,214,0.06), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="reveal-up text-5xl font-bold text-white lg:text-7xl">
          Votre prochain devis,
          <br />
          <span className="text-[#5B5BD6]">en 30 secondes.</span>
        </h2>
        <p className="reveal-up mt-6 text-slate-400">
          Sans carte bancaire. Sans engagement.
        </p>
        <div className="reveal-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#5B5BD6] px-10 py-5 text-lg font-semibold text-white transition-all hover:bg-[#4B4BC6] hover:shadow-[0_0_48px_rgba(91,91,214,0.4)]"
          >
            Créer mon compte gratuit
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            onClick={onVideoOpen}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
          >
            Voir la démo
          </button>
        </div>
        <p className="reveal-up mt-6 text-sm text-slate-500">
          Sans carte bancaire &middot; Accès immédiat &middot; Support français
        </p>
      </div>
    </section>
  );
}
