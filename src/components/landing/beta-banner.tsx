"use client";

import { useState } from "react";
import { X } from "lucide-react";

const IS_BETA = process.env.NEXT_PUBLIC_BETA_MODE === "true";

export function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (!IS_BETA || dismissed) return null;

  return (
    <div className="relative z-[60] flex h-10 items-center justify-center bg-gradient-to-r from-amber-50 to-amber-100 px-4 text-center text-sm text-amber-900 sm:h-10 md:text-sm">
      <span className="hidden sm:inline">
        ⚡ Devizly est en accès anticipé — Profitez du plan gratuit dès
        maintenant. Les plans payants arrivent bientôt 🇫🇷
      </span>
      <span className="sm:hidden text-xs">
        ⚡ Accès anticipé — Plan gratuit disponible 🇫🇷
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 rounded p-1 text-amber-700 transition-colors hover:bg-amber-200/60 hover:text-amber-900"
        aria-label="Fermer la bannière"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
