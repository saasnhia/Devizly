"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";

interface PromoCountdownProps {
  code: string;
  /** Timestamp d'expiration en ms-epoch (0 = lien invalide). */
  expiresMs: number;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

const PERKS = [
  "Devis illimités",
  "Envoi de contrats",
  "Templates de relances personnalisés",
  "Toutes les features Pro débloquées",
];

export function PromoCountdown({ code, expiresMs }: PromoCountdownProps) {
  // null tant que le composant n'est pas monté (évite tout mismatch d'hydratation).
  const [remaining, setRemaining] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      setRemaining(Math.max(0, expiresMs - Date.now()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresMs]);

  const noOffer = !code || expiresMs <= 0;
  const expired = remaining !== null && remaining <= 0;
  const disabled = noOffer || expired || loading;

  const totalSec = remaining === null ? 0 : Math.floor(remaining / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponible — ignoré */
    }
  }, [code]);

  const handleActivate = useCallback(async () => {
    if (disabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
          promoCode: code,
        }),
      });

      // Pas de session -> on renvoie vers le login puis retour sur cette page.
      if (res.status === 401) {
        const here = window.location.pathname + window.location.search;
        window.location.href = `/login?next=${encodeURIComponent(here)}`;
        return;
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error || "Impossible de démarrer l'essai. Réessayez.");
    } catch {
      setError("Erreur de connexion. Réessayez.");
    }
    setLoading(false);
  }, [code, disabled]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06060b] px-4 py-12">
      {/* Halos d'ambiance */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-[#5B5BD6]/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 h-[360px] w-[420px] rounded-full bg-[#22D3A5]/15 blur-[120px]"
      />

      {/* Carte glassmorphism */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        {/* Badge */}
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-xs font-semibold tracking-wide text-amber-200">
            {expired ? "Offre expirée" : "Offre expire bientôt"}
          </span>
        </div>

        {/* Titre */}
        <h1 className="mt-6 text-center text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl">
          2 semaines
          <br />
          <span className="bg-gradient-to-r from-[#5B5BD6] via-[#7c7cf0] to-[#22D3A5] bg-clip-text text-transparent">
            offertes
          </span>
        </h1>
        <p className="mt-3 text-center text-sm text-slate-400">
          sur le plan Pro Devizly
        </p>

        {/* Countdown */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {[
            { v: hrs, label: "HRS" },
            { v: min, label: "MIN" },
            { v: sec, label: "SEC" },
          ].map((b, i) => (
            <div key={b.label} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl border text-3xl font-bold tabular-nums ${
                    expired
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : "border-white/10 bg-white/[0.03] text-white"
                  }`}
                >
                  {remaining === null ? "--" : pad(b.v)}
                </div>
                <span className="mt-2 text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                  {b.label}
                </span>
              </div>
              {i < 2 && (
                <span className="-mt-5 text-2xl font-bold text-slate-600">:</span>
              )}
            </div>
          ))}
        </div>

        {expired && (
          <p className="mt-5 text-center text-sm font-semibold text-red-400">
            {noOffer
              ? "Lien promo invalide ou incomplet."
              : "Cette offre a expiré — le code n'est plus valable."}
          </p>
        )}

        {/* Perks */}
        <ul className="mt-7 space-y-2">
          {PERKS.map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-2.5 text-sm text-slate-300"
            >
              <Check className="h-4 w-4 shrink-0 text-[#22D3A5]" />
              {perk}
            </li>
          ))}
        </ul>

        {/* Code promo */}
        <div className="mt-7">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Votre code personnel
          </p>
          <div className="flex items-stretch gap-2">
            <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 font-mono text-base font-semibold tracking-wider text-white">
              {code || "—"}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!code}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-[#22D3A5]" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copier
                </>
              )}
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleActivate}
          disabled={disabled}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B5BD6] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#5B5BD6]/25 transition-all hover:bg-[#4f4fbf] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {expired ? "Offre expirée" : "Activer mon essai Pro gratuit →"}
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-400">{error}</p>
        )}

        <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">
          Après les 2 semaines, facturation 9&euro;/mois (Offre Fondateur).
          Annulez à tout moment avant la fin de l&apos;essai.
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 underline-offset-2 transition-colors hover:text-slate-300 hover:underline"
          >
            Non merci
          </Link>
        </div>
      </div>
    </main>
  );
}
