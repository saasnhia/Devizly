import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function DemoPostCta() {
  return (
    <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
      <div
        className="rounded-[20px] border border-[#6366f1]/20 p-8 text-center sm:p-12"
        style={{
          background:
            "linear-gradient(180deg, rgba(99,102,241,0.08) 0%, #131318 100%)",
        }}
      >
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0 mx-auto"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(99,102,241,0.10), transparent)",
          }}
        />

        <h2
          className="relative font-bold text-white"
          style={{ fontSize: "clamp(24px, 6vw, 32px)" }}
        >
          Convaincu ? <span className="font-serif italic text-[#818cf8]">Cr&eacute;ez votre compte gratuit.</span>
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-sm text-slate-400">
          Gardez vos devis, envoyez-les &agrave; vos clients, recevez signatures et acomptes &mdash; tout en un clic.
        </p>
        <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B5BD6] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[#4B4BC6] sm:w-auto"
          >
            Cr&eacute;er mon compte gratuit
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-4 text-sm font-medium text-white transition-all hover:border-white/[0.15] hover:bg-white/[0.06] sm:w-auto"
          >
            Voir les tarifs
          </Link>
        </div>
      </div>
    </div>
  );
}
