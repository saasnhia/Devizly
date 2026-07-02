"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { TipCategory } from "@/lib/tips/tips-engine";

interface TipData {
  id: string;
  title: string;
  message: string;
  action?: { label: string; href: string };
  category: TipCategory;
  targetSelector?: string;
}

const CATEGORY_STYLES: Record<TipCategory, { bg: string; emoji: string }> = {
  onboarding: { bg: "bg-violet-50 border-violet-200", emoji: "🎯" },
  feature: { bg: "bg-blue-50 border-blue-200", emoji: "✨" },
  conseil: { bg: "bg-emerald-50 border-emerald-200", emoji: "💡" },
  news: { bg: "bg-amber-50 border-amber-200", emoji: "🆕" },
};

// Applied to the sidebar/UI element matching data-tip-target — plain
// Tailwind utility classes toggled imperatively (Étape 5).
const HIGHLIGHT_CLASSES = ["ring-2", "ring-primary", "ring-offset-2", "rounded-lg", "animate-pulse"];

export function TipPopup() {
  // Fetched once per mount (page load) — dismissing a tip hides it locally
  // without re-fetching, so the next eligible tip only appears on the next
  // page load, per spec.
  const [tip, setTip] = useState<TipData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tips")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        if (!cancelled && Array.isArray(json.data) && json.data.length > 0) {
          setTip(json.data[0]);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!tip?.targetSelector) return;
    const els = document.querySelectorAll(`[data-tip-target="${tip.targetSelector}"]`);
    els.forEach((el) => el.classList.add(...HIGHLIGHT_CLASSES));
    return () => {
      els.forEach((el) => el.classList.remove(...HIGHLIGHT_CLASSES));
    };
  }, [tip]);

  function handleDismiss() {
    if (!tip) return;
    const tipId = tip.id;
    setTip(null);
    fetch("/api/tips/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipId }),
    }).catch(() => {});
  }

  const style = tip ? CATEGORY_STYLES[tip.category] : null;

  return (
    <AnimatePresence>
      {tip && style && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className={`mb-4 flex items-start gap-3 rounded-lg border p-4 ${style.bg}`}
        >
          <span className="text-xl leading-none">{style.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">{tip.title}</p>
            <p className="mt-0.5 text-sm text-slate-600">{tip.message}</p>
            {tip.action && (
              <Link
                href={tip.action.href}
                className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                {tip.action.label} →
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 text-slate-400 hover:text-slate-600"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
