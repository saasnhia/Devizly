"use client";

import Link from "next/link";
import { FileCheck, ShieldCheck, Send, Globe, ArrowRight } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

interface ComplianceCard {
  Icon: typeof FileCheck;
  iconBg: string;
  iconText: string;
  title: string;
  description: string;
  cornerBadge: string;
}

const CARDS: ComplianceCard[] = [
  {
    Icon: FileCheck,
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-400",
    title: "Factur-X conforme EN 16931",
    description:
      "Chaque facture est générée au format Factur-X BASIC : PDF/A-3 avec XML CII embarqué, conforme à la norme européenne EN 16931.",
    cornerBadge: "PDF/A-3 + XML",
  },
  {
    Icon: ShieldCheck,
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-400",
    title: "Validé par le FNFE-MPE",
    description:
      "Vos factures passent les 4 contrôles du validateur officiel du Forum National de la Facture Électronique. Vérifiable à tout moment.",
    cornerBadge: "Fully Valid",
  },
  {
    Icon: Send,
    iconBg: "bg-sky-500/15",
    iconText: "text-sky-400",
    title: "Transmission via SUPER PDP",
    description:
      "SUPER PDP, Plateforme Agréée immatriculée par la DGFiP, est connectée directement à Devizly. Connectez votre entreprise depuis vos paramètres.",
    cornerBadge: "PA immatriculée DGFiP",
  },
  {
    Icon: Globe,
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-400",
    title: "E-reporting B2C",
    description:
      "Vos ventes aux particuliers sont enregistrées automatiquement à chaque paiement, prêtes à être transmises via votre plateforme agréée.",
    cornerBadge: "B2C & international",
  },
];

export function ComplianceSection() {
  const ref = useReveal<HTMLElement>();
  const gridRef = useReveal<HTMLDivElement>(0.2);

  return (
    <section ref={ref} className="reveal-fade py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#818cf8]">
          Réforme de la facturation électronique
        </p>

        <h2
          className="mx-auto max-w-2xl text-center font-bold tracking-tight text-white"
          style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
        >
          Conforme d&egrave;s aujourd&apos;hui &mdash;{" "}
          <span className="font-serif italic text-[#818cf8]">
            en avance sur l&apos;&eacute;ch&eacute;ance
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-base text-slate-400">
          L&apos;&eacute;mission de factures &eacute;lectroniques devient
          obligatoire en septembre 2027 pour les TPE/PME. Devizly vous y
          pr&eacute;pare sans effort suppl&eacute;mentaire.
        </p>

        <div
          ref={gridRef}
          className="steps-grid mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {CARDS.map((card, i) => (
            <div
              key={card.title}
              className="step-card card-lift-sm relative rounded-2xl border border-white/[0.08] bg-[#111116] p-6"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <card.Icon className={`h-5 w-5 ${card.iconText}`} />
                </div>
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                  {card.cornerBadge}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/facture-electronique-2026"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#818cf8] transition-colors hover:text-[#a5b4fc]"
          >
            Comprendre la réforme 2026-2027
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
