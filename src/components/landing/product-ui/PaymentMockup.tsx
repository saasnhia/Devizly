"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, CreditCard } from "lucide-react";

/*
  Phases:
  0 = show options (idle)
  1 = select "Acompte 30%"
  2 = processing
  3 = success
  4 = pause → reset
*/
type Phase = 0 | 1 | 2 | 3 | 4;

const TOTAL = 5650;
const ACOMPTE_30 = Math.round(TOTAL * 0.3);

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function PaymentMockup() {
  const [phase, setPhase] = useState<Phase>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => setPhase(0), []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    switch (phase) {
      case 0:
        timer.current = setTimeout(() => setPhase(1), 2000);
        break;
      case 1:
        timer.current = setTimeout(() => setPhase(2), 1200);
        break;
      case 2:
        timer.current = setTimeout(() => setPhase(3), 1800);
        break;
      case 3:
        timer.current = setTimeout(() => setPhase(4), 3500);
        break;
      case 4:
        timer.current = setTimeout(reset, 1500);
        break;
    }

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phase, reset]);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-4">
      {/* Header */}
      <div className="mb-4 text-center">
        <p className="text-[10px] uppercase tracking-wider text-[#8b8fa8]">
          Montant total TTC
        </p>
        <p className="mt-1 text-2xl font-bold text-[#e8e9f0]">{fmt(TOTAL)} €</p>
        <p className="text-[10px] text-[#8b8fa8]">Devis DEV-2026-042</p>
      </div>

      {/* Payment options */}
      <div className="mb-4 space-y-2">
        {[
          { label: "Acompte 30%", amount: ACOMPTE_30, selected: phase >= 1 },
          { label: "Acompte 50%", amount: Math.round(TOTAL * 0.5), selected: false },
          { label: "Paiement total", amount: TOTAL, selected: false },
        ].map((opt) => (
          <div
            key={opt.label}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all duration-300 ${
              opt.selected
                ? "border-[#5B5BD6] bg-[#5B5BD6]/10 text-[#e8e9f0]"
                : "border-white/[0.06] text-[#8b8fa8]"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 ${
                  opt.selected
                    ? "border-[#5B5BD6] bg-[#5B5BD6]"
                    : "border-white/20"
                }`}
              >
                {opt.selected && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                )}
              </div>
              {opt.label}
            </div>
            <span className="font-semibold">{fmt(opt.amount)} €</span>
          </div>
        ))}
      </div>

      {/* Pay button */}
      {phase < 2 && (
        <div
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all duration-300 ${
            phase >= 1
              ? "bg-[#5B5BD6] text-white"
              : "bg-white/[0.06] text-[#8b8fa8]"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Payer {phase >= 1 ? `${fmt(ACOMPTE_30)} €` : ""}
        </div>
      )}

      {phase === 2 && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-[#5B5BD6] py-2.5 text-xs font-semibold text-white">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Traitement en cours...
        </div>
      )}

      {phase >= 3 && (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-[#3dd68c]/30 bg-[#3dd68c]/10 py-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#3dd68c]">
            <Check className="h-4 w-4" />
            {fmt(ACOMPTE_30)} € reçus
          </div>
          <p className="text-[10px] text-[#3dd68c]/70">
            Fonds sur votre compte sous 48h
          </p>
        </div>
      )}

      {/* Stripe badge */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[#8b8fa8]">
        <span>Sécurisé par</span>
        <span className="font-bold">Stripe</span>
      </div>
    </div>
  );
}
