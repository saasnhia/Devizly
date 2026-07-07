"use client";

import { Lock, Layers, Shield, Undo2 } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

interface TreasuryCard {
  Icon: typeof Lock;
  iconBg: string;
  iconText: string;
  title: string;
  description: string;
  cornerBadge: string;
}

const CARDS: TreasuryCard[] = [
  {
    Icon: Lock,
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-400",
    title: "Séquestre de paiement",
    description:
      "Votre client paie, les fonds sont bloqués. Vous confirmez la livraison, l'argent est libéré. Zéro risque d'impayé.",
    cornerBadge: "Comme Malt",
  },
  {
    Icon: Layers,
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-400",
    title: "Paiement en plusieurs fois",
    description:
      "30% acompte, 40% mi-chantier, 30% solde. Chaque étape génère sa facture et son lien de paiement.",
    cornerBadge: "Standard BTP",
  },
  {
    Icon: Shield,
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-400",
    title: "Retenue de garantie 5%",
    description:
      "Conformément au décret n°72-388. Le montant est automatiquement calculé et facturé séparément après 1 an.",
    cornerBadge: "Conforme",
  },
  {
    Icon: Undo2,
    iconBg: "bg-slate-500/15",
    iconText: "text-slate-300",
    title: "Remboursement en 1 clic",
    description:
      "Chantier annulé ? Remboursez votre client en 1 clic depuis le dashboard. Total ou partiel, email automatique.",
    cornerBadge: "Stripe Connect",
  },
];

export function TreasurySection() {
  const ref = useReveal<HTMLElement>();
  const gridRef = useReveal<HTMLDivElement>(0.2);

  return (
    <section ref={ref} className="reveal-fade py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section label */}
        <p className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#818cf8]">
          Paiements sécurisés
        </p>

        {/* Heading */}
        <h2
          className="mx-auto max-w-2xl text-center font-bold tracking-tight text-white"
          style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
        >
          Prot&eacute;gez votre tr&eacute;sorerie &mdash;{" "}
          <span className="font-serif italic text-[#818cf8]">
            chaque euro est s&eacute;curis&eacute;
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-base text-slate-400">
          Devizly prot&egrave;ge les artisans et leurs clients avec des outils
          de paiement con&ccedil;us pour le BTP.
        </p>

        {/* Cards grid */}
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
      </div>
    </section>
  );
}
