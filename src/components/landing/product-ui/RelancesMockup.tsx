"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Send, Clock } from "lucide-react";

/*
  Timeline animation:
  4 steps light up sequentially.
  Phase 0 = J+0 active (envoyé)
  Phase 1 = J+2 fires
  Phase 2 = J+5 fires
  Phase 3 = J+7 fires → client opens
  Phase 4 = pause → reset
*/

interface Step {
  day: string;
  label: string;
  detail: string;
}

const STEPS: Step[] = [
  { day: "J+0", label: "Devis envoyé", detail: "Email envoyé à sophie@email.com" },
  { day: "J+2", label: "Relance douce", detail: "Rappel automatique envoyé" },
  { day: "J+5", label: "Relance ferme", detail: "2ème rappel avec échéance" },
  { day: "J+7", label: "Dernière relance", detail: "Client a ouvert le devis ✓" },
];

export function RelancesMockup() {
  const [activeStep, setActiveStep] = useState(0);
  const [phase, setPhase] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setActiveStep(0);
    setPhase(0);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (phase < STEPS.length) {
      setActiveStep(phase);
      const delay = phase === 0 ? 2000 : 1800;
      timer.current = setTimeout(() => setPhase((p) => p + 1), delay);
    } else {
      // All steps done, pause then reset
      timer.current = setTimeout(reset, 3500);
    }

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phase, reset]);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-4">
      <div className="mb-4 text-xs font-medium uppercase tracking-widest text-[#8b8fa8]">
        Relances automatiques
      </div>

      {/* Client context */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#08090a] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5e6ad2]/20 text-[9px] font-bold text-[#5e6ad2]">
            SP
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#e8e9f0]">Sophie Petit</p>
            <p className="text-[9px] text-[#8b8fa8]">Site e-commerce · 6 100 €</p>
          </div>
        </div>
        <span className="rounded bg-[#5e6ad2]/15 px-1.5 py-0.5 text-[9px] font-medium text-[#5e6ad2]">
          Envoyé
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {STEPS.map((step, i) => {
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.day} className="flex gap-3">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    isActive
                      ? isCurrent && !isLast
                        ? "border-[#5e6ad2] bg-[#5e6ad2]"
                        : isLast && isActive
                          ? "border-[#3dd68c] bg-[#3dd68c]"
                          : "border-[#5e6ad2] bg-[#5e6ad2]"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {isActive && (
                    isLast && i <= activeStep ? (
                      <Check className="h-3 w-3 text-white" />
                    ) : (
                      <Send className="h-2.5 w-2.5 text-white" />
                    )
                  )}
                  {!isActive && (
                    <Clock className="h-2.5 w-2.5 text-[#8b8fa8]/50" />
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-[2px] flex-1 transition-colors duration-500 ${
                      i < activeStep ? "bg-[#5e6ad2]" : "bg-white/[0.06]"
                    }`}
                    style={{ minHeight: 24 }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold transition-colors duration-500 ${
                      isActive ? "text-[#5e6ad2]" : "text-[#8b8fa8]/50"
                    }`}
                  >
                    {step.day}
                  </span>
                  <span
                    className={`text-[11px] font-medium transition-colors duration-500 ${
                      isActive ? "text-[#e8e9f0]" : "text-[#8b8fa8]/50"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {isActive && (
                  <p className="mt-0.5 text-[10px] text-[#8b8fa8]">
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
