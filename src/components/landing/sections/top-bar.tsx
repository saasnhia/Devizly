"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "devizly:founder-banner-dismissed";

export function TopBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      // sessionStorage unavailable (SSR, private mode) — render normally
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`sticky top-0 z-[60] overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
        dismissed ? "max-h-0 opacity-0" : "max-h-14 opacity-100"
      }`}
      aria-hidden={dismissed}
    >
      <div className="relative w-full bg-gradient-to-r from-[#0d0d14] via-[#12101f] to-[#0d0d14] border-b border-[#5B5BD6]/20 py-2 pl-3 pr-10 text-center text-xs">
        <Link
          href="/pricing"
          className="inline-block transition-opacity hover:opacity-90"
        >
          <span className="text-slate-400">&#11088;</span>{" "}
          {/* Desktop */}
          <span className="hidden sm:inline">
            <span className="text-slate-400">Offre Fondateur</span>
            <span className="text-slate-500 mx-1">&mdash;</span>
            <span className="text-slate-400 line-through mr-1">19&euro;/mois</span>
            <span className="text-white font-semibold">9&euro;/mois &agrave; vie</span>
            <span className="text-slate-500 mx-1">&middot;</span>
            <span className="text-slate-400">100 premi&egrave;res places</span>
            <span className="text-[#5B5BD6] font-semibold ml-2">En profiter &rarr;</span>
          </span>
          {/* Mobile */}
          <span className="sm:hidden">
            <span className="text-white font-semibold">9&euro;/mois &agrave; vie</span>
            <span className="text-slate-500 mx-1">&middot;</span>
            <span className="text-slate-400">100 places</span>
            <span className="text-[#5B5BD6] font-semibold ml-1">&rarr;</span>
          </span>
        </Link>

        <button
          onClick={handleDismiss}
          aria-label="Fermer cette bannière"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
