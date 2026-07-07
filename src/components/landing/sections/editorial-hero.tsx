"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { segmentCopy } from "../data/landing-data";
import { useReveal } from "../hooks/useReveal";

/* ══════════════════════════════════════════════
   Devis 3D — DEV-0020 exact reproduction
   ══════════════════════════════════════════════ */

const QUOTE_LINES = [
  { desc: "Démontage ancien équipement", qty: 1, unit: "", price: 250 },
  { desc: "Pose nouvelle cuisine sur mesure", qty: 1, unit: "", price: 8500 },
  { desc: "Remplacement électricité (NF C 15-100)", qty: 1, unit: "", price: 1200 },
  { desc: "Remplacement plomberie", qty: 1, unit: "", price: 950 },
  { desc: "Pose carrelage sol (20m²)", qty: 20, unit: "", price: 45 },
  { desc: "Pose crédence (10m²)", qty: 10, unit: "", price: 60 },
  { desc: "Peinture murs et plafond", qty: 20, unit: "", price: 25 },
  { desc: "Pose éclairage LED encastré", qty: 6, unit: "", price: 80 },
  { desc: "Pose robinetterie et mitigeur", qty: 1, unit: "", price: 250 },
  { desc: "Finition et nettoyage chantier", qty: 1, unit: "", price: 200 },
];

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function QuoteDocument() {
  const subtotal = QUOTE_LINES.reduce((s, l) => s + l.qty * l.price, 0); // 13830
  const tva = subtotal * 0.2; // 2766
  const total = subtotal + tva; // 16596

  return (
    <div
      className="quote-doc w-full max-w-[340px] rounded-2xl bg-white p-4 text-[11px] leading-relaxed text-[#1a1a1a] lg:max-w-[460px] lg:w-[460px] lg:p-6"
      style={{
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.8) inset, 0 0 0 1px rgba(255,255,255,0.08), 0 40px 100px -20px rgba(0,0,0,0.75), 0 80px 160px -40px rgba(99,102,241,0.35), -30px 30px 90px -20px rgba(99,102,241,0.2)",
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#6366f1]">
            <span className="text-[9px] font-bold text-white">D</span>
          </div>
          <span className="text-xs font-bold text-[#1a1a1a]">Devizly</span>
        </div>
        <span className="rounded-full bg-[#f4f4f5] px-2 py-0.5 text-[9px] font-semibold text-[#71717a]">
          Brouillon
        </span>
      </div>

      <h3 className="mb-0.5 text-sm font-bold text-[#1a1a1a]">
        Devis r&eacute;novation cuisine compl&egrave;te
      </h3>
      <p className="mb-1 text-[10px] text-[#71717a]">Devis n&deg; DEV-0020 &mdash; 08/04/2026</p>
      <p className="mb-4 text-[10px] text-[#71717a]">Valide jusqu&rsquo;au 08/05/2026</p>

      {/* Table */}
      <table className="mb-3 w-full border-collapse text-[9px] sm:text-[10px]">
        <thead>
          <tr className="border-b border-[#e4e4e7]">
            <th className="pb-1.5 text-left font-semibold uppercase tracking-wide text-[#a1a1aa]">Description</th>
            <th className="w-7 pb-1.5 text-center font-semibold uppercase tracking-wide text-[#a1a1aa]">Qté</th>
            <th className="w-[62px] pb-1.5 pr-2 text-right font-semibold uppercase tracking-wide text-[#a1a1aa] whitespace-nowrap">Prix unit.</th>
            <th className="w-[62px] pb-1.5 text-right font-semibold uppercase tracking-wide text-[#a1a1aa] whitespace-nowrap">Total</th>
          </tr>
        </thead>
        <tbody>
          {QUOTE_LINES.map((l) => (
            <tr key={l.desc} className="border-t border-[#f4f4f5]">
              <td className="py-1 pr-2 text-[#3f3f46] break-words">{l.desc}</td>
              <td className="py-1 text-center text-[#71717a]">{l.qty}</td>
              <td className="py-1 pr-2 text-right text-[#71717a] whitespace-nowrap">{fmt(l.price)}&nbsp;&euro;</td>
              <td className="py-1 text-right font-medium text-[#1a1a1a] whitespace-nowrap">{fmt(l.qty * l.price)}&nbsp;&euro;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mb-4 space-y-0.5 text-right text-[10px]">
        <p className="text-[#71717a]">
          Total HT : <span className="font-medium text-[#3f3f46]">{fmt(subtotal)}&nbsp;&euro;</span>
        </p>
        <p className="text-[#71717a]">
          TVA 20% : <span className="font-medium text-[#3f3f46]">{fmt(tva)}&nbsp;&euro;</span>
        </p>
        <p className="mt-1 text-sm font-bold text-[#6366f1]">
          Total TTC : {fmt(total)}&nbsp;&euro;
        </p>
      </div>

      {/* Notes */}
      <div className="mb-4 rounded-lg bg-[#f8f9fb] p-3 text-[9px] leading-relaxed text-[#71717a]">
        Prix HT valable pour un chantier standard en r&eacute;gion parisienne.
        Devis valable 3 mois. Fournitures incluses sauf &eacute;lectrom&eacute;nager.
      </div>

      {/* Buttons */}
      <button className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#e4e4e7] py-2 text-[10px] font-medium text-[#71717a]">
        &darr; T&eacute;l&eacute;charger PDF
      </button>
      <button
        className="mb-2 w-full rounded-lg py-2.5 text-[11px] font-semibold text-white"
        style={{ backgroundColor: "#16a34a", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}
      >
        Payer {fmt(total)}&nbsp;&euro; maintenant
      </button>
      <div className="flex gap-2">
        <button className="flex-1 rounded-lg border border-[#e4e4e7] py-1.5 text-[9px] font-medium text-[#71717a]">
          Acompte 30% &mdash; {fmt(total * 0.3)}&nbsp;&euro;
        </button>
        <button className="flex-1 rounded-lg border border-[#e4e4e7] py-1.5 text-[9px] font-medium text-[#71717a]">
          Acompte 50% &mdash; {fmt(total * 0.5)}&nbsp;&euro;
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Float badges — 4 corners, BTP payment features
   ══════════════════════════════════════════════ */

interface HeroBadge {
  corner: "float-card-a" | "float-card-b" | "float-card-c" | "float-card-d";
  position: string;
  iconBg: string;
  emoji: string;
  title: string;
  subtitle: string;
}

const HERO_BADGES: HeroBadge[] = [
  {
    corner: "float-card-a",
    position: "top-[4%] left-[-6%]",
    iconBg: "bg-emerald-500/15",
    emoji: "\u{1F512}",
    title: "Séquestre sécurisé",
    subtitle: "Fonds bloqués jusqu'à livraison",
  },
  {
    corner: "float-card-c",
    position: "top-[4%] right-[-8%]",
    iconBg: "bg-violet-500/15",
    emoji: "\u{1F4C5}",
    title: "Paiement en 2-3 fois",
    subtitle: "Échéancier BTP personnalisable",
  },
  {
    corner: "float-card-d",
    position: "bottom-[-4%] left-[-6%]",
    iconBg: "bg-amber-500/15",
    emoji: "\u{1F6E1}️",
    title: "Retenue garantie 5%",
    subtitle: "Décret 72-388",
  },
  {
    corner: "float-card-b",
    position: "bottom-[-4%] right-[-8%]",
    iconBg: "bg-slate-500/15",
    emoji: "↩️",
    title: "Remboursement 1 clic",
    subtitle: "Chantier annulé = remboursé",
  },
];

function FloatBadge({ corner, position, iconBg, emoji, title, subtitle }: HeroBadge) {
  return (
    <div
      className={`${corner} absolute ${position} z-10 hidden rounded-xl border border-white/10 bg-[#131318]/90 px-4 py-3 shadow-xl backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5 md:block`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${iconBg}`}>
          <span aria-hidden="true">{emoji}</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{title}</p>
          <p className="text-[10px] text-slate-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Hero section
   ══════════════════════════════════════════════ */

export function EditorialHero({ segment }: { segment?: string }) {
  const seg = segment ? segmentCopy[segment] : undefined;
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ref = useReveal<HTMLElement>(0.05);

  // Parallax mouse — desktop only, respects reduced-motion
  const setupParallax = useCallback(() => {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = sceneRef.current;
    const stage = stageRef.current;
    if (!scene || !stage) return;

    const onMove = (e: MouseEvent) => {
      const r = scene.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.style.animation = "none";
      stage.style.transform = `rotateX(${6 - y * 10}deg) rotateY(${-15 - x * 12}deg) rotateZ(1.5deg)`;
    };

    const onLeave = () => {
      stage.style.animation = "";
      stage.style.transform = "";
    };

    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseleave", onLeave);
    return () => {
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    return setupParallax();
  }, [setupParallax]);

  return (
    <section
      ref={ref}
      className="reveal-fade relative flex min-h-[90vh] items-center overflow-hidden pt-20 md:pt-16"
    >
      {/* Gradient blob */}
      <div
        className="hero-blob pointer-events-none absolute"
        style={{
          width: "800px",
          height: "500px",
          left: "15%",
          top: "20%",
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12), transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
        {/* ── Left column ── */}
        <div>
          {/* Badge */}
          <div className="badge-float mb-6 inline-flex items-center gap-2 rounded-full border border-[#5B5BD6]/30 bg-[#5B5BD6]/10 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5B5BD6] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5B5BD6]" />
            </span>
            <span className="text-xs font-medium text-[#818cf8]">
              {seg ? seg.badge : "Propulsé par l'IA — hébergé en France"}
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-display font-extrabold tracking-[-0.04em] leading-[1.05] text-white"
            style={{ fontSize: "clamp(32px, 8vw, 74px)" }}
          >
            {seg ? (
              seg.hero
            ) : (
              <>
                Vos devis,{" "}
                <span className="font-serif italic text-[#818cf8]">sign&eacute;s</span>
                <br className="hidden sm:block" />
                {" "}et pay&eacute;s en{" "}
                <span className="bg-gradient-to-r from-[#818cf8] to-[#6366f1] bg-clip-text text-transparent">
                  30
                </span>{" "}
                secondes.
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-lg text-base text-slate-400 sm:text-lg">
            L&rsquo;IA structure vos devis. Vos clients signent depuis leur t&eacute;l&eacute;phone.
            L&rsquo;acompte tombe sur votre compte.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="btn-shine group inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B5BD6] px-8 py-4 text-base font-semibold text-white transition-all hover:bg-[#4B4BC6] hover:shadow-[0_0_48px_rgba(91,91,214,0.4)] sm:text-lg"
            >
              <span className="inline-flex items-center gap-2">
                Cr&eacute;er mon premier devis
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-4 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
            >
              Voir la d&eacute;mo
            </Link>
          </div>

          {/* Trust checks — staggered reveal */}
          <div className="stagger-parent in mt-6 flex flex-wrap gap-x-[22px] gap-y-2 text-xs text-slate-500">
            <span className="stagger-item flex items-center gap-1.5">
              <span className="text-green-400">&#10003;</span> Sans carte bancaire
            </span>
            <span className="stagger-item flex items-center gap-1.5">
              <span className="text-green-400">&#10003;</span> RGPD
            </span>
            <span className="stagger-item flex items-center gap-1.5">
              <span className="text-green-400">&#10003;</span> IA française
            </span>
            <span className="stagger-item flex items-center gap-1.5">
              <span className="text-green-400">&#10003;</span> Prêt réforme 2026
            </span>
          </div>
        </div>

        {/* ── Right column: 3D quote scene ── */}
        <div
          ref={sceneRef}
          className="quote-scene relative flex items-center justify-center h-auto py-8 lg:h-[640px] lg:py-0"
          style={{ perspective: "2400px" } as React.CSSProperties}
        >
          <div ref={stageRef} className="quote-stage relative">
            <QuoteDocument />
            {HERO_BADGES.map((badge) => (
              <FloatBadge key={badge.title} {...badge} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
