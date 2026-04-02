"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, PenTool } from "lucide-react";

/*
  Animation phases:
  0 = show document (idle)
  1 = highlight "Signer" button
  2 = show signature canvas + draw
  3 = signed badge
  4 = pause → reset
*/
type Phase = 0 | 1 | 2 | 3 | 4;

const SIGNATURE_PATH =
  "M 10 35 C 20 10, 40 10, 50 30 S 70 55, 90 35 S 110 5, 130 25 C 140 35, 150 30, 160 20";

export function SignatureMockup() {
  const [phase, setPhase] = useState<Phase>(0);
  const [pathLength, setPathLength] = useState(0);
  const [drawProgress, setDrawProgress] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setPhase(0);
    setDrawProgress(0);
  }, []);

  // Measure path length
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    switch (phase) {
      case 0:
        timer.current = setTimeout(() => setPhase(1), 1800);
        break;
      case 1:
        timer.current = setTimeout(() => setPhase(2), 1200);
        break;
      case 2:
        // Animate signature drawing
        if (drawProgress < 100) {
          timer.current = setTimeout(
            () => setDrawProgress((p) => Math.min(p + 2, 100)),
            20
          );
        } else {
          timer.current = setTimeout(() => setPhase(3), 500);
        }
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
  }, [phase, drawProgress, reset]);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-4">
      {/* Document header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#8b8fa8]">
            Devis DEV-2026-042
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#e8e9f0]">
            Site e-commerce restaurant
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#e8e9f0]">6 100 €</p>
          <p className="text-[10px] text-[#8b8fa8]">TTC</p>
        </div>
      </div>

      {/* Mini line items */}
      <div className="mb-4 space-y-1 border-t border-white/[0.06] pt-3">
        {["Design UX/UI", "Développement", "Hébergement"].map((item) => (
          <div
            key={item}
            className="flex justify-between text-[10px] text-[#8b8fa8]"
          >
            <span>{item}</span>
            <span className="h-2 w-12 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>

      {/* Signature area */}
      {phase < 2 && (
        <button
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all duration-300 ${
            phase === 1
              ? "bg-[#5B5BD6] text-white"
              : "border border-white/[0.06] bg-white/[0.03] text-[#8b8fa8]"
          }`}
        >
          <PenTool className="h-3.5 w-3.5" />
          Signer ce devis
        </button>
      )}

      {phase >= 2 && phase < 3 && (
        <div className="rounded-lg border border-[#5B5BD6]/30 bg-[#08090a] p-3">
          <p className="mb-2 text-[10px] text-[#8b8fa8]">Votre signature :</p>
          <svg viewBox="0 0 170 50" className="h-12 w-full">
            <path
              ref={pathRef}
              d={SIGNATURE_PATH}
              fill="none"
              stroke="#5B5BD6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={pathLength || 400}
              strokeDashoffset={
                pathLength ? pathLength * (1 - drawProgress / 100) : 400
              }
              style={{ transition: "stroke-dashoffset 20ms linear" }}
            />
          </svg>
        </div>
      )}

      {phase >= 3 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-[#3dd68c]/30 bg-[#3dd68c]/10 py-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#3dd68c]">
            <Check className="h-4 w-4" />
            Signé électroniquement
          </div>
          <p className="text-[10px] text-[#3dd68c]/70">
            Valeur légale eIDAS — 25 mars 2026 à 14:32
          </p>
        </div>
      )}

      {/* Client info */}
      <div className="mt-3 flex items-center gap-2 text-[10px] text-[#8b8fa8]">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5B5BD6]/20 text-[8px] font-bold text-[#5B5BD6]">
          SP
        </div>
        Sophie Petit · sophie@email.com
      </div>
    </div>
  );
}
