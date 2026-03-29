"use client";

const PROFESSIONS = [
  "Plombiers",
  "Électriciens",
  "Peintres",
  "Maçons",
  "Menuisiers",
  "Couvreurs",
  "Développeurs",
  "Graphistes",
  "Consultants",
  "Photographes",
  "Architectes",
  "Carreleurs",
  "Coachs",
  "Rédacteurs",
  "Formateurs",
];

export function SocialProof() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-8">
      <p className="text-center text-sm font-medium text-slate-400">
        Utilisé par les indépendants de tous métiers
      </p>

      {/* Ticker */}
      <div className="relative mt-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0A0A0F] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0A0A0F] to-transparent" />
        <div className="animate-ticker flex gap-10 whitespace-nowrap">
          {[...PROFESSIONS, ...PROFESSIONS].map((p, i) => (
            <span
              key={i}
              className="text-sm font-medium text-slate-500/70"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          IA Mistral
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          Stripe sécurisé
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          RGPD conforme
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          Hébergé en France
        </span>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
