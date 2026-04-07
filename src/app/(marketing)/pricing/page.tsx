"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, X, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

/* ── Real feature gates (audited from codebase) ────── */

type PlanFeature = {
  text: string;
  free: boolean;
  pro: boolean;
  business: boolean;
};

const comparisonFeatures: PlanFeature[] = [
  { text: "Devis par mois", free: false, pro: false, business: false }, // special row
  // Free features (no gate in code)
  { text: "Génération IA", free: true, pro: true, business: true },
  { text: "Templates Devizly (10+)", free: true, pro: true, business: true },
  { text: "Gestion clients", free: true, pro: true, business: true },
  { text: "Partage par lien + QR Code", free: true, pro: true, business: true },
  { text: "Versioning devis", free: true, pro: true, business: true },
  { text: "Signature électronique eIDAS", free: true, pro: true, business: true },
  { text: "Acompte Stripe (30/50%)", free: true, pro: true, business: true },
  { text: "Calendly intégré", free: true, pro: true, business: true },
  { text: "Export PDF", free: true, pro: true, business: true },
  { text: "Analytics devis", free: true, pro: true, business: true },
  // Pro gates (plan !== "free")
  { text: "Facturation automatique", free: false, pro: true, business: true },
  { text: "Relances automatiques J+2/5/7", free: false, pro: true, business: true },
  { text: "Templates relances personnalisés", free: false, pro: true, business: true },
  { text: "Envoi contrats", free: false, pro: true, business: true },
  // Business gates (plan === "business")
  { text: "Lead forms (5+ types)", free: false, pro: false, business: true },
  { text: "Contrats récurrents", free: false, pro: false, business: true },
  { text: "Gestion d'équipe", free: false, pro: false, business: true },
  { text: "Export CSV comptable", free: false, pro: false, business: true },
  { text: "Export FEC", free: false, pro: false, business: true },
  { text: "Branding personnalisé", free: false, pro: false, business: true },
  { text: "Support prioritaire 24h", free: false, pro: false, business: true },
];

const devisLimits: Record<string, string> = {
  free: "3",
  pro: "Illimités",
  business: "Illimités",
};

const plans = [
  {
    id: "free" as const,
    name: "Gratuit",
    monthlyPrice: "0",
    annualPrice: "0",
    description: "Pour tester sans engagement",
    cta: "Commencer gratuitement",
    priceId: null,
    popular: false,
    features: [
      "3 devis par mois",
      "Génération IA",
      "Signature électronique eIDAS",
      "Acompte Stripe",
      "Calendly intégré",
      "Export PDF",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    monthlyPrice: "19",
    annualPrice: "15",
    description: "Pour les indépendants actifs",
    cta: "Choisir Pro",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || null,
    popular: true,
    features: [
      "Devis illimités",
      "Tout le plan Gratuit",
      "Facturation automatique",
      "Relances J+2, J+5, J+7",
      "Templates relances",
      "Envoi contrats",
    ],
  },
  {
    id: "business" as const,
    name: "Business",
    monthlyPrice: "39",
    annualPrice: "31",
    description: "Pour les agences et pros exigeants",
    cta: "Choisir Business",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS || null,
    popular: false,
    features: [
      "Tout le plan Pro",
      "Lead forms (5+ types)",
      "Contrats récurrents",
      "Gestion d'équipe (5)",
      "Export CSV + FEC",
      "Branding personnalisé",
      "Support prioritaire 24h",
    ],
  },
];

const faqs = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader à tout moment. Le changement prend effet immédiatement, au prorata du temps restant.",
  },
  {
    q: "Comment fonctionne le plan gratuit ?",
    a: "Le plan Gratuit offre 3 devis par mois, pour toujours, sans carte bancaire. Passez Pro pour un nombre illimité de devis.",
  },
  {
    q: "Que se passe-t-il si je dépasse mon quota ?",
    a: "Vous recevrez une notification et pourrez upgrader votre plan en un clic. Vos devis existants restent accessibles.",
  },
  {
    q: "Comment annuler mon abonnement ?",
    a: 'Depuis la page Paramètres ou via le bouton "Gérer l\'abonnement" ci-dessus. L\'annulation prend effet à la fin de la période en cours.',
  },
];

const IS_BETA = process.env.NEXT_PUBLIC_BETA_MODE === "true";

/* ── Component ───────────────────────────────────── */

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      if (data?.subscription_status) setCurrentPlan(data.subscription_status);
    }
    loadProfile();

  }, []);

  async function handleCheckout(priceId: string, planId: string) {
    setLoadingPlan(planId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Erreur de paiement");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handlePortal() {
    setLoadingPlan("portal");
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">

        {/* ── Founder banner ── */}
        <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
          <span className="text-sm font-semibold text-yellow-400">
            &#11088; Offre Fondateur
          </span>
          <span className="text-sm text-yellow-400/70">
            — Les 100 premiers abonnés Pro : 9&euro;/mois à vie
          </span>
        </div>

        {/* ── Header ── */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-[-0.02em] text-white">
            Choisissez le plan adapté à votre activité
          </h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-slate-400">
            Commencez gratuitement. Évoluez quand vous êtes prêt.
          </p>
        </div>

        {/* ── Beta notice ── */}
        {IS_BETA && (
          <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-violet-500/30 bg-violet-500/10 p-4 text-center text-sm text-violet-300">
            Devizly est en accès anticipé gratuit. Les plans Pro et Business seront disponibles prochainement.
          </div>
        )}

        {/* ── Toggle ── */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="inline-flex rounded-lg bg-[#1a1a2e] p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                !isAnnual ? "bg-[#5B5BD6] text-white" : "text-slate-400"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                isAnnual ? "bg-[#5B5BD6] text-white" : "text-slate-400"
              }`}
            >
              Annuel
            </button>
          </div>
          {isAnnual && (
            <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-400">
              2 mois offerts
            </span>
          )}
        </div>

        {/* ── Plan cards ── */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isBetaPaid = IS_BETA && plan.id !== "free";

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-6 transition-shadow ${
                  plan.popular
                    ? "border-2 border-[#5B5BD6] bg-gradient-to-br from-[#111116] to-[#13111f] shadow-[0_0_30px_rgba(91,91,214,0.1)]"
                    : "border border-white/[0.08] bg-[#111116]"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && !IS_BETA && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[#5B5BD6] px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      &#11088; Le plus choisi
                    </span>
                  </div>
                )}
                {isCurrent && !plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-green-500/80 px-3 py-1 text-xs font-semibold text-white">
                      Plan actuel
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{plan.description}</p>

                <div className="mt-5">
                  <span className="text-5xl font-bold text-white">{price}&euro;</span>
                  {price !== "0" && (
                    <span className="text-lg text-slate-400">/mois HT</span>
                  )}
                  {price === "0" && (
                    <p className="mt-1 text-xs text-slate-500">Gratuit pour toujours</p>
                  )}
                  {isAnnual && plan.monthlyPrice !== "0" && (
                    <p className="mt-1 text-xs text-slate-500">
                      soit {Number(plan.annualPrice) * 12}&euro;/an{" "}
                      <span className="font-semibold text-green-400">
                        (-{Math.round((1 - Number(plan.annualPrice) / Number(plan.monthlyPrice)) * 100)}%)
                      </span>
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e]" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  {isBetaPaid ? (
                    <button className="w-full cursor-not-allowed rounded-xl border border-white/10 py-3 text-sm font-semibold text-slate-500" disabled>
                      Bientôt disponible
                    </button>
                  ) : isCurrent ? (
                    currentPlan !== "free" ? (
                      <button
                        onClick={handlePortal}
                        disabled={loadingPlan === "portal"}
                        className="w-full rounded-xl border border-white/20 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.04]"
                      >
                        {loadingPlan === "portal" && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />}
                        Gérer l&apos;abonnement
                      </button>
                    ) : (
                      <button className="w-full rounded-xl border border-white/10 py-3 text-sm font-semibold text-slate-500" disabled>
                        Plan actuel
                      </button>
                    )
                  ) : plan.priceId ? (
                    <button
                      onClick={() => handleCheckout(plan.priceId!, plan.id)}
                      disabled={loadingPlan === plan.id}
                      className={`group w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                        plan.popular
                          ? "bg-[#5B5BD6] text-white hover:bg-[#4f4fbf]"
                          : "border border-[#5B5BD6]/50 text-[#5B5BD6] hover:bg-[#5B5BD6]/10"
                      }`}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      ) : null}
                      {plan.cta}
                      <ArrowRight className="ml-1 inline h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <Link
                      href="/signup"
                      className="flex w-full items-center justify-center rounded-xl border border-white/20 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.04]"
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Trust bar ── */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
          <span>&#10003; Sans carte bancaire</span>
          <span>&#10003; Annulation à tout moment</span>
          <span>&#10003; RGPD &amp; hébergé en France</span>
        </div>

        {/* ── Comparison table ── */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-xl font-bold text-white">
            Comparaison détaillée des plans
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0d0d12]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-5 py-4 text-left text-sm font-medium text-slate-400">
                    Fonctionnalité
                  </th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className={`px-5 py-4 text-center text-sm font-semibold ${
                        p.popular ? "text-[#5B5BD6]" : "text-slate-300"
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Devis limit row */}
                <tr className="border-b border-white/[0.04]">
                  <td className="px-5 py-3 text-slate-300">Devis par mois</td>
                  {plans.map((p) => (
                    <td key={p.id} className="px-5 py-3 text-center font-medium text-white">
                      {devisLimits[p.id]}
                    </td>
                  ))}
                </tr>
                {comparisonFeatures.slice(1).map((f, i) => (
                  <tr
                    key={f.text}
                    className={`border-b border-white/[0.04] ${i % 2 === 1 ? "bg-white/[0.02]" : ""}`}
                  >
                    <td className="px-5 py-3 text-slate-300">{f.text}</td>
                    {(["free", "pro", "business"] as const).map((planId) => (
                      <td key={planId} className="px-5 py-3 text-center">
                        {f[planId] ? (
                          <Check className="mx-auto h-4 w-4 text-[#22c55e]" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-[#475569]" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Price row */}
                <tr className="bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">Prix</td>
                  {plans.map((p) => {
                    const price = isAnnual ? p.annualPrice : p.monthlyPrice;
                    return (
                      <td
                        key={p.id}
                        className={`px-5 py-4 text-center font-bold ${
                          p.popular ? "text-[#5B5BD6]" : "text-white"
                        }`}
                      >
                        {price}&euro;{price !== "0" ? "/mois" : ""}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-xl font-bold text-white">
            Questions fréquentes
          </h2>
          <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-white/[0.06] bg-[#111116] p-5">
                <h3 className="text-sm font-semibold text-white">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Referral section ── */}
        <section className="mt-20 border-t border-white/5 py-12 text-center">
          <p className="text-sm text-slate-400">
            &#127873; Parrainez un ami &rarr; il obtient{" "}
            <span className="font-medium text-white">-50% le premier mois</span>{" "}
            et vous recevez{" "}
            <span className="font-medium text-white">1 mois gratuit</span>
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Votre lien de parrainage est disponible dans vos Paramètres après inscription.
          </p>
        </section>
      </div>
    </div>
  );
}
