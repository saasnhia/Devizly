"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, ArrowRight, Lock } from "lucide-react";

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
  developpeur:
    "Ex : Création d'une landing page Next.js avec formulaire de contact",
  graphiste: "Ex : Identité visuelle complète pour un restaurant (logo, carte, web)",
  plombier:
    "Ex : Remplacement d'un chauffe-eau 200L et mise aux normes",
  electricien:
    "Ex : Mise en conformité tableau électrique + 8 prises supplémentaires",
  menuisier: "Ex : Fabrication et pose d'un dressing sur-mesure en chêne",
  consultant: "Ex : Audit stratégique digital pour une PME de 20 salariés",
  photographe: "Ex : Shooting corporate 30 portraits + retouches pour site web",
  redacteur: "Ex : Rédaction de 10 articles SEO de 1500 mots pour un blog tech",
  coach: "Ex : Programme de formation management 3 jours pour 12 personnes",
  artisan: "Ex : Rénovation complète salle de bain 8m² (carrelage, plomberie, peinture)",
};

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

export function DemoSection() {
  const [metier, setMetier] = useState("");
  const [customMetier, setCustomMetier] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quote, setQuote] = useState<DemoQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [remaining, setRemaining] = useState(3);

  const effectiveMetier = metier === "autre" ? customMetier.trim() : metier;

  async function callDemoApi(): Promise<Response> {
    return fetch("/api/demo/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metier: effectiveMetier, description }),
    });
  }

  async function handleGenerate() {
    if (!effectiveMetier || description.trim().length < 10) return;

    setIsGenerating(true);
    setError(null);
    setQuote(null);

    const MAX_CLIENT_RETRIES = 1;

    try {
      for (let attempt = 0; attempt <= MAX_CLIENT_RETRIES; attempt++) {
        try {
          const res = await callDemoApi();
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

  const canGenerate =
    !!effectiveMetier && description.trim().length >= 10 && !isGenerating;

  return (
    <section id="demo" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400">
            <Sparkles className="h-4 w-4" />
            Démo en direct — sans inscription
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Générez votre premier devis en 30 secondes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-400">
            L&apos;IA Mistral crée un devis professionnel adapté à votre métier.
            Essayez maintenant, sans créer de compte.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* LEFT — Form */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Décrivez votre prestation
            </h3>

            {/* Métier picker */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Votre métier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_METIERS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMetier(m.value)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                      metier === m.value
                        ? "border-violet-500 bg-violet-500/15 font-medium text-violet-300"
                        : "border-white/10 text-slate-400 hover:border-violet-500/40 hover:bg-white/[0.03]"
                    }`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
              {metier === "autre" && (
                <Input
                  type="text"
                  placeholder="Décrivez votre métier (ex: photographe, coach, maçon...)"
                  value={customMetier}
                  onChange={(e) => setCustomMetier(e.target.value)}
                  maxLength={50}
                  className="mt-2 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                />
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Décrivez votre prestation
              </label>
              <Textarea
                placeholder={
                  PLACEHOLDERS[metier] ||
                  "Décrivez ce que vous allez réaliser pour votre client..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={4}
                className="resize-none border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
              />
              <div className="mt-1 flex justify-between">
                <span className="text-xs text-slate-500">
                  Minimum 10 caractères
                </span>
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
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="h-12 w-full bg-violet-600 text-base font-medium text-white hover:bg-violet-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  L&apos;IA génère votre devis...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer mon devis avec l&apos;IA
                </>
              )}
            </Button>

            {/* Remaining counter */}
            {remaining < 3 && !showUpgrade && (
              <p className="mt-3 text-center text-xs text-slate-500">
                {remaining} génération{remaining > 1 ? "s" : ""} gratuite
                {remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}
              </p>
            )}

            {/* Upgrade upsell */}
            {showUpgrade && (
              <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/10 p-4 text-center">
                <p className="mb-2 text-sm font-medium text-violet-300">
                  Vous avez utilisé vos 3 démos gratuites
                </p>
                <p className="mb-3 text-xs text-slate-400">
                  Créez un compte gratuit pour 3 devis/mois, ou passez Pro pour
                  50 devis/mois.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-violet-600 text-white hover:bg-violet-700"
                >
                  <a href="/signup">Créer mon compte gratuit →</a>
                </Button>
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-5 flex items-center justify-center gap-4 border-t border-white/5 pt-5">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Lock className="h-3 w-3" /> Aucune donnée sauvegardée
              </span>
              <span className="text-xs text-slate-500">IA Mistral 🇫🇷</span>
              <span className="text-xs text-slate-500">RGPD conforme</span>
            </div>
          </div>

          {/* RIGHT — Quote preview */}
          <div className="min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {!quote && !isGenerating && (
              <div className="flex min-h-[520px] flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                  <Sparkles className="h-8 w-8 text-violet-400" />
                </div>
                <p className="mb-2 font-medium text-white">
                  Votre devis apparaîtra ici
                </p>
                <p className="max-w-xs text-sm text-slate-500">
                  Choisissez votre métier, décrivez votre prestation, et
                  l&apos;IA génère un devis professionnel en 30 secondes.
                </p>
                {/* Ghost skeleton */}
                <div className="mt-6 w-full max-w-xs select-none opacity-15">
                  <div className="mx-auto mb-2 h-4 w-3/4 rounded bg-white/30" />
                  <div className="mx-auto mb-4 h-3 w-1/2 rounded bg-white/20" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-3 w-1/2 rounded bg-white/20" />
                        <div className="h-3 w-1/6 rounded bg-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="flex min-h-[520px] flex-col items-center justify-center p-8 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                  <Sparkles className="h-8 w-8 animate-pulse text-violet-400" />
                </div>
                <p className="mb-2 font-medium text-white">
                  L&apos;IA analyse votre prestation...
                </p>
                <p className="text-sm text-slate-500">
                  Génération du devis en cours
                </p>
                <div className="mt-6 w-full max-w-xs space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex animate-pulse justify-between">
                      <div
                        className="h-3 rounded bg-white/10"
                        style={{ width: `${40 + i * 10}%` }}
                      />
                      <div className="h-3 w-12 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {quote && (
              <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                      Devis de démonstration
                    </div>
                    <h3 className="text-lg font-bold leading-tight text-white">
                      {quote.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Valable {quote.validityDays} jours
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">N° DEMO-2026</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {new Date().toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>

                <p className="mt-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-300">
                  ✏️ Tout est modifiable — montants, lignes, conditions — une
                  fois votre compte créé.
                </p>

                {/* Lines */}
                <div className="mb-6">
                  <div className="mb-2 grid grid-cols-12 px-1 text-xs uppercase tracking-wide text-slate-500">
                    <span className="col-span-6">Prestation</span>
                    <span className="col-span-2 text-center">Qté</span>
                    <span className="col-span-2 text-right">P.U. HT</span>
                    <span className="col-span-2 text-right">Total</span>
                  </div>
                  <div className="space-y-1">
                    {quote.lines.map((line, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 rounded px-1 py-2 text-sm transition-colors hover:bg-white/[0.03]"
                      >
                        <span className="col-span-6 text-slate-200">
                          {line.description}
                        </span>
                        <span className="col-span-2 text-center text-slate-500">
                          {line.quantity} {line.unit}
                        </span>
                        <span className="col-span-2 text-right text-slate-500">
                          {fmt(line.unitPrice)}€
                        </span>
                        <span className="col-span-2 text-right font-medium text-white">
                          {fmt(line.total)}€
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Sous-total HT</span>
                    <span className="text-slate-300">{fmt(quote.subtotal)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      TVA {quote.vatRate}%
                    </span>
                    <span className="text-slate-300">
                      {fmt(quote.vatAmount)}€
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-bold">
                    <span className="text-white">Total TTC</span>
                    <span className="text-violet-400">
                      {fmt(quote.total)}€
                    </span>
                  </div>
                </div>

                {/* Conditions */}
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-xs text-slate-500">
                    💳 {quote.paymentConditions}
                  </p>
                  {quote.notes && (
                    <p className="mt-1 text-xs text-slate-500">
                      📝 {quote.notes}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="mb-3 text-center text-sm font-medium text-slate-300">
                    Envoyez ce devis à votre client en 1 clic
                  </p>
                  <Button
                    asChild
                    className="w-full bg-violet-600 text-white hover:bg-violet-700"
                  >
                    <a href="/signup">
                      Créer mon compte gratuit
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <p className="mt-2 text-center text-xs text-slate-500">
                    Sans CB · 3 devis/mois gratuits · Résiliable à tout moment
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
