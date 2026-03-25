"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  LayoutDashboard,
  Kanban,
  Receipt,
  Users,
  Settings,
  Sparkles,
  Check,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */

const TYPING_TEXT = "Site e-commerce pour restaurant gastronomique avec réservation en ligne";

const QUOTE_LINES = [
  { desc: "Audit & cahier des charges", qty: 1, price: 800 },
  { desc: "Design UX/UI (maquettes)", qty: 1, price: 1200 },
  { desc: "Développement Next.js", qty: 1, price: 2800 },
  { desc: "Module réservation", qty: 1, price: 950 },
  { desc: "Hébergement + déploiement", qty: 1, price: 350 },
];

const TOTAL_HT = QUOTE_LINES.reduce((s, l) => s + l.price * l.qty, 0);
const TVA = Math.round(TOTAL_HT * 0.2);
const TOTAL_TTC = TOTAL_HT + TVA;

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Devis", icon: FileText, active: true },
  { label: "Pipeline", icon: Kanban },
  { label: "Factures", icon: Receipt },
  { label: "Clients", icon: Users },
];

/* ═══════════════════════════════════════════════════
   ANIMATION PHASES
   0 = idle (field empty, waiting)
   1 = typing prompt
   2 = generating (progress bar)
   3 = revealing lines (stagger)
   4 = done (badge shown)
   5 = pause before restart
   ═══════════════════════════════════════════════════ */

type Phase = 0 | 1 | 2 | 3 | 4 | 5;

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function DevisGeneratorMockup() {
  const [phase, setPhase] = useState<Phase>(0);
  const [typedChars, setTypedChars] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setPhase(0);
    setTypedChars(0);
    setProgress(0);
    setVisibleLines(0);
  }, []);

  // Phase orchestrator
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    switch (phase) {
      case 0:
        // Start typing after brief pause
        timerRef.current = setTimeout(() => setPhase(1), 1200);
        break;

      case 1: {
        // Type one character at a time
        if (typedChars < TYPING_TEXT.length) {
          const delay = 30 + Math.random() * 40;
          timerRef.current = setTimeout(() => setTypedChars((c) => c + 1), delay);
        } else {
          timerRef.current = setTimeout(() => setPhase(2), 600);
        }
        break;
      }

      case 2:
        // Progress bar fills
        if (progress < 100) {
          const step = progress < 60 ? 3 : progress < 90 ? 2 : 1;
          const delay = 30 + Math.random() * 20;
          timerRef.current = setTimeout(() => setProgress((p) => Math.min(p + step, 100)), delay);
        } else {
          timerRef.current = setTimeout(() => setPhase(3), 300);
        }
        break;

      case 3:
        // Reveal lines one by one
        if (visibleLines < QUOTE_LINES.length) {
          timerRef.current = setTimeout(() => setVisibleLines((v) => v + 1), 180);
        } else {
          timerRef.current = setTimeout(() => setPhase(4), 400);
        }
        break;

      case 4:
        // Show badge, wait, then restart
        timerRef.current = setTimeout(() => setPhase(5), 4000);
        break;

      case 5:
        timerRef.current = setTimeout(reset, 1500);
        break;
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, typedChars, progress, visibleLines, reset]);

  const displayText = TYPING_TEXT.slice(0, typedChars);

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.05), 0 70px 130px -20px rgba(0,0,0,0.7)",
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 bg-[#1a1a1f] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-3 flex-1 rounded-md bg-white/[0.06] px-3 py-1 text-xs text-[#8b8fa8]">
          devizly.fr/devis/nouveau
        </div>
      </div>

      {/* App frame */}
      <div className="flex h-[420px] bg-[#08090a] sm:h-[480px]">
        {/* Sidebar */}
        <div className="hidden w-[180px] shrink-0 border-r border-white/[0.06] bg-[#111114] sm:block">
          {/* Logo */}
          <div className="flex h-12 items-center px-4">
            <span className="text-sm font-bold text-[#e8e9f0]">Devizly</span>
          </div>

          {/* Nav */}
          <nav className="mt-2 space-y-0.5 px-2">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] ${
                  item.active
                    ? "border-l-[3px] border-[#5e6ad2] bg-[#5e6ad2]/10 font-medium text-[#e8e9f0]"
                    : "border-l-[3px] border-transparent text-[#8b8fa8]"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div className="absolute bottom-3 left-0 w-[180px] px-2">
            <div className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-[#8b8fa8]">
              <Settings className="h-4 w-4" />
              Paramètres
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          {/* Page title */}
          <h3 className="mb-4 text-base font-semibold text-[#e8e9f0] sm:text-lg">
            Nouveau devis
          </h3>

          {/* AI Generation Card */}
          <div className="rounded-lg border border-white/[0.06] bg-[#0f0f10] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#8b8fa8]">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Générer avec l&apos;IA
            </div>

            {/* Input field */}
            <div className="mb-3 min-h-[48px] rounded-md border border-white/[0.06] bg-[#08090a] px-3 py-2.5 text-sm">
              {phase === 0 && (
                <span className="text-[#8b8fa8]/50">
                  Décrivez votre prestation...
                </span>
              )}
              {(phase === 1 || phase >= 2) && (
                <span className="text-[#e8e9f0]">
                  {displayText}
                  {phase === 1 && (
                    <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[#5e6ad2]" />
                  )}
                </span>
              )}
            </div>

            {/* Generate button / Progress */}
            {phase < 2 && (
              <div
                className={`rounded-md border border-white/[0.06] bg-white/[0.03] py-2 text-center text-xs font-medium text-[#8b8fa8] ${
                  phase === 1 && typedChars === TYPING_TEXT.length
                    ? "border-[#5e6ad2]/40 text-[#5e6ad2]"
                    : ""
                }`}
              >
                Générer avec l&apos;IA ✨
              </div>
            )}

            {phase === 2 && (
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs text-[#5e6ad2]">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#5e6ad2] border-t-transparent" />
                  Génération IA en cours...
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-[#5e6ad2] transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quote lines */}
            {phase >= 3 && (
              <div className="mt-3 space-y-1">
                {QUOTE_LINES.slice(0, visibleLines).map((line, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md bg-white/[0.02] px-2.5 py-1.5 text-[11px]"
                    style={{
                      opacity: i < visibleLines ? 1 : 0,
                      transform: i < visibleLines ? "translateY(0)" : "translateY(4px)",
                      transition: "opacity 200ms, transform 200ms",
                    }}
                  >
                    <span className="text-[#8b8fa8]">{line.desc}</span>
                    <span className="font-semibold text-[#e8e9f0]">{fmt(line.price)} €</span>
                  </div>
                ))}

                {/* Totals */}
                {visibleLines === QUOTE_LINES.length && (
                  <div className="mt-2 border-t border-white/[0.06] pt-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#8b8fa8]">Total HT</span>
                      <span className="text-[#8b8fa8]">{fmt(TOTAL_HT)} €</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#8b8fa8]">TVA 20%</span>
                      <span className="text-[#8b8fa8]">{fmt(TVA)} €</span>
                    </div>
                    <div className="mt-1 flex justify-between text-sm font-bold">
                      <span className="text-[#e8e9f0]">Total TTC</span>
                      <span className="text-[#e8e9f0]">{fmt(TOTAL_TTC)} €</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success badge */}
            {phase >= 4 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#3dd68c]">
                <Check className="h-3.5 w-3.5" />
                Devis généré en 8 secondes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
