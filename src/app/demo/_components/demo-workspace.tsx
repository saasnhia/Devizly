"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

/* ── Métiers ── */

const DEMO_METIERS = [
  { value: "developpeur", label: "Développeur web", icon: "💻" },
  { value: "graphiste", label: "Graphiste / Designer", icon: "🎨" },
  { value: "plombier", label: "Plombier", icon: "🔧" },
  { value: "electricien", label: "Électricien", icon: "⚡" },
  { value: "menuisier", label: "Menuisier", icon: "🪵" },
  { value: "consultant", label: "Consultant", icon: "📊" },
  { value: "photographe", label: "Photographe", icon: "📷" },
  { value: "redacteur", label: "Rédacteur / Copywriter", icon: "✍️" },
  { value: "coach", label: "Coach / Formateur", icon: "🎯" },
  { value: "artisan", label: "Artisan du bâtiment", icon: "🏗️" },
  { value: "autre", label: "Autre métier", icon: "✏️" },
];

const PLACEHOLDERS: Record<string, string> = {
  developpeur: "Ex : Création d'une landing page Next.js avec formulaire de contact",
  graphiste: "Ex : Identité visuelle complète pour un restaurant (logo, carte, web)",
  plombier: "Ex : Remplacement d'un chauffe-eau 200L et mise aux normes",
  electricien: "Ex : Mise en conformité tableau électrique + 8 prises supplémentaires",
  menuisier: "Ex : Fabrication et pose d'un dressing sur-mesure en chêne",
  consultant: "Ex : Audit stratégique digital pour une PME de 20 salariés",
  photographe: "Ex : Shooting corporate 30 portraits + retouches pour site web",
  redacteur: "Ex : Rédaction de 10 articles SEO de 1500 mots pour un blog tech",
  coach: "Ex : Programme de formation management 3 jours pour 12 personnes",
  artisan: "Ex : Rénovation complète salle de bain 8m² (carrelage, plomberie, peinture)",
};

/* ── Types ── */

interface DemoQuoteLine {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface DemoQuote {
  title: string;
  lines: DemoQuoteLine[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  validityDays: number;
  paymentConditions: string;
  notes: string;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

/* ── Component ── */

export function DemoWorkspace() {
  const [metier, setMetier] = useState("");
  const [customMetier, setCustomMetier] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quote, setQuote] = useState<DemoQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [remaining, setRemaining] = useState(3);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const previewRef = useRef<HTMLDivElement>(null);

  const effectiveMetier = metier === "autre" ? customMetier.trim() : metier;

  // After generation complete, switch to preview on mobile
  useEffect(() => {
    if (quote && window.innerWidth < 960) {
      setActiveTab("preview");
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [quote]);

  async function handleGenerate() {
    if (!effectiveMetier || description.trim().length < 10) return;

    setIsGenerating(true);
    setError(null);
    setQuote(null);

    const MAX_CLIENT_RETRIES = 1;

    try {
      for (let attempt = 0; attempt <= MAX_CLIENT_RETRIES; attempt++) {
        try {
          const res = await fetch("/api/demo/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ metier: effectiveMetier, description }),
          });
          const data = await res.json();

          if (res.status === 429) {
            setShowUpgrade(true);
            setError(data.message);
            return;
          }

          if (!res.ok) {
            if (res.status >= 500 && attempt < MAX_CLIENT_RETRIES) {
              await new Promise((r) => setTimeout(r, 1000));
              continue;
            }
            setError(data.error ?? "Une erreur est survenue. Réessayez.");
            return;
          }

          setQuote(data.quote);
          if (data.remainingGenerations !== undefined) {
            setRemaining(data.remainingGenerations);
          }
          return;
        } catch {
          if (attempt < MAX_CLIENT_RETRIES) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          setError("Connexion impossible. Vérifiez votre connexion internet.");
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }

  const canGenerate = !!effectiveMetier && description.trim().length >= 10 && !isGenerating;

  const statusTag = quote
    ? { label: "Prêt", cls: "bg-green-500/15 text-green-400" }
    : isGenerating
      ? { label: "Génération…", cls: "bg-amber-500/15 text-amber-400" }
      : { label: "En attente", cls: "bg-white/[0.06] text-slate-400" };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Mobile tabs */}
      <div className="mb-4 flex gap-2 lg:hidden">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            activeTab === "form"
              ? "bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30"
              : "bg-white/[0.03] text-slate-400 border border-white/[0.06]"
          }`}
        >
          1. D&eacute;crire
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30"
              : "bg-white/[0.03] text-slate-400 border border-white/[0.06]"
          }`}
        >
          2. Aper&ccedil;u
        </button>
      </div>

      {/* Workspace grid */}
      <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ── LEFT: Form panel ── */}
        <div
          className={`rounded-2xl border border-white/[0.08] bg-[#131318] p-6 ${
            activeTab !== "form" ? "hidden lg:block" : ""
          }`}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              D&eacute;crivez votre prestation
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">&Eacute;tape 1 / 2</span>
              <span className="h-2 w-2 rounded-full bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </div>
          </div>

          {/* Métier field */}
          <div className="mb-5">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Votre m&eacute;tier
              <span className="font-serif text-xs italic font-normal text-[#818cf8]">requis</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_METIERS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMetier(m.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                    m.value === "autre" ? "col-span-2" : ""
                  } ${
                    metier === m.value
                      ? "border-[#6366f1]/40 bg-[#6366f1]/10 font-medium text-[#818cf8] shadow-[0_0_0_3px_rgba(99,102,241,0.08)]"
                      : "border-white/[0.08] text-slate-400 hover:border-[#6366f1]/30 hover:bg-white/[0.02]"
                  }`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
            {metier === "autre" && (
              <input
                type="text"
                placeholder="Décrivez votre métier (ex: photographe, coach, maçon...)"
                value={customMetier}
                onChange={(e) => setCustomMetier(e.target.value)}
                maxLength={50}
                className="mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#6366f1]/50 transition-colors"
              />
            )}
          </div>

          {/* Description field */}
          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              D&eacute;crivez votre prestation
              <span className="font-serif text-xs italic font-normal text-[#818cf8]">requis</span>
            </label>
            <textarea
              placeholder={
                PLACEHOLDERS[metier] ||
                "Décrivez ce que vous allez réaliser pour votre client…"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={4}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#6366f1]/50 transition-colors"
            />
            <div className="mt-1 flex justify-between">
              <span className="text-xs text-slate-500">Minimum 10 caractères</span>
              <span
                className={`text-xs ${description.length > 180 ? "text-orange-400" : "text-slate-500"}`}
              >
                {description.length}/200
              </span>
            </div>
          </div>

          {/* Error */}
          {error && !showUpgrade && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Generate CTA */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#5B5BD6] py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.25)] transition-all hover:shadow-[0_0_32px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                L&rsquo;IA g&eacute;n&egrave;re votre devis&hellip;
              </>
            ) : (
              <>
                &#10022; G&eacute;n&eacute;rer mon devis avec l&rsquo;IA
              </>
            )}
          </button>

          {/* Remaining */}
          {remaining < 3 && !showUpgrade && (
            <p className="mt-3 text-center text-xs text-slate-500">
              {remaining} g&eacute;n&eacute;ration{remaining > 1 ? "s" : ""} gratuite
              {remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}
            </p>
          )}

          {/* Upgrade upsell */}
          {showUpgrade && (
            <div className="mt-4 rounded-lg border border-[#6366f1]/20 bg-[#6366f1]/10 p-4 text-center">
              <p className="mb-2 text-sm font-medium text-[#818cf8]">
                Vous avez utilis&eacute; vos 3 d&eacute;mos gratuites
              </p>
              <p className="mb-3 text-xs text-slate-400">
                Cr&eacute;ez un compte gratuit pour 3 devis/mois, ou passez Pro pour des devis illimit&eacute;s.
              </p>
              <Link
                href="/signup"
                className="inline-block w-full rounded-xl bg-[#5B5BD6] py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-[#4B4BC6]"
              >
                Cr&eacute;er mon compte gratuit &rarr;
              </Link>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-5 flex items-center justify-center gap-4 border-t border-white/[0.04] pt-5">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Lock className="h-3 w-3" /> Aucune donn&eacute;e sauvegard&eacute;e
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <span className="text-green-400">&#10003;</span> IA Mistral
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <span className="text-green-400">&#10003;</span> RGPD conforme
            </span>
          </div>
        </div>

        {/* ── RIGHT: Preview panel ── */}
        <div
          ref={previewRef}
          className={`min-h-[520px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131318] ${
            activeTab !== "preview" ? "hidden lg:block" : ""
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <h3 className="text-sm font-semibold text-white">Aper&ccedil;u du devis</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusTag.cls}`}>
              {statusTag.label}
            </span>
          </div>

          {/* Empty state */}
          {!quote && !isGenerating && (
            <div className="flex min-h-[460px] flex-col items-center justify-center p-8 text-center">
              {/* Document icon with glow */}
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-2xl bg-[#6366f1]/20 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366f1]/10">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[#818cf8]">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 font-medium text-white">
                Votre devis{" "}
                <span className="font-serif italic text-[#818cf8]">appara&icirc;tra ici</span>
              </h3>
              <p className="max-w-xs text-sm text-slate-500">
                Choisissez votre m&eacute;tier, d&eacute;crivez votre prestation,
                et l&rsquo;IA g&eacute;n&egrave;re un devis professionnel en 30 secondes.
              </p>
              {/* Skeleton lines */}
              <div className="mt-6 w-full max-w-xs space-y-2.5 select-none">
                {[75, 60, 85, 50].map((w, i) => (
                  <div key={i} className="shimmer-line relative overflow-hidden">
                    <div
                      className="h-3 rounded bg-white/[0.04]"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generating state */}
          {isGenerating && (
            <div className="flex min-h-[460px] flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-2xl bg-[#6366f1]/20 blur-xl animate-pulse" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366f1]/10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#818cf8]" />
                </div>
              </div>
              <p className="mb-2 font-medium text-white">
                L&rsquo;IA analyse votre prestation&hellip;
              </p>
              <p className="text-sm text-slate-500">G&eacute;n&eacute;ration du devis en cours</p>
              <div className="mt-6 w-full max-w-xs space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex animate-pulse justify-between">
                    <div className="h-3 rounded bg-white/10" style={{ width: `${40 + i * 10}%` }} />
                    <div className="h-3 w-12 rounded bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated quote */}
          {quote && (
            <div className="p-6">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                    Devis de d&eacute;monstration
                  </div>
                  <h3 className="text-lg font-bold leading-tight text-white">
                    {quote.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Valable {quote.validityDays} jours
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">N&deg; DEMO-2026</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {new Date().toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>

              <p className="mb-4 rounded-lg border border-[#6366f1]/20 bg-[#6366f1]/10 px-3 py-2 text-xs text-[#818cf8]">
                &#9999;&#65039; Tout est modifiable &mdash; montants, lignes, conditions &mdash; une fois votre compte cr&eacute;&eacute;.
              </p>

              {/* Lines */}
              <div className="mb-6">
                <div className="mb-2 grid grid-cols-12 px-1 text-xs uppercase tracking-wide text-slate-500">
                  <span className="col-span-6">Prestation</span>
                  <span className="col-span-2 text-center">Qt&eacute;</span>
                  <span className="col-span-2 text-right">P.U. HT</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
                <div className="space-y-1">
                  {quote.lines.map((line, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 rounded px-1 py-2 text-sm transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="col-span-6 text-slate-200">{line.description}</span>
                      <span className="col-span-2 text-center text-slate-500">
                        {line.quantity} {line.unit}
                      </span>
                      <span className="col-span-2 text-right text-slate-500">{fmt(line.unitPrice)}&euro;</span>
                      <span className="col-span-2 text-right font-medium text-white">{fmt(line.total)}&euro;</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-1 border-t border-white/[0.06] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sous-total HT</span>
                  <span className="text-slate-300">{fmt(quote.subtotal)}&euro;</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">TVA {quote.vatRate}%</span>
                  <span className="text-slate-300">{fmt(quote.vatAmount)}&euro;</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-white/[0.06] pt-2 text-base font-bold">
                  <span className="text-white">Total TTC</span>
                  <span className="text-[#818cf8]">{fmt(quote.total)}&euro;</span>
                </div>
              </div>

              {/* Conditions */}
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <p className="text-xs text-slate-500">&#128179; {quote.paymentConditions}</p>
                {quote.notes && (
                  <p className="mt-1 text-xs text-slate-500">&#128221; {quote.notes}</p>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6 border-t border-white/[0.06] pt-5">
                <p className="mb-3 text-center text-sm font-medium text-slate-300">
                  Envoyez ce devis &agrave; votre client en 1 clic
                </p>
                <Link
                  href="/signup"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B5BD6] py-3 text-sm font-semibold text-white transition-all hover:bg-[#4B4BC6]"
                >
                  Cr&eacute;er mon compte gratuit
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Sans CB &middot; 3 devis/mois gratuits &middot; R&eacute;siliable &agrave; tout moment
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
