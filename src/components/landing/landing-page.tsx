"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DevizlyLogo } from "@/components/devizly-logo";
import { DemoSection } from "@/components/landing/demo-section";
import { BetaBanner } from "@/components/landing/beta-banner";
import { DevisGeneratorMockup } from "@/components/landing/product-ui/DevisGeneratorMockup";
import { KanbanMockup } from "@/components/landing/product-ui/KanbanMockup";
import { SignatureMockup } from "@/components/landing/product-ui/SignatureMockup";
import { PaymentMockup } from "@/components/landing/product-ui/PaymentMockup";
import { RelancesMockup } from "@/components/landing/product-ui/RelancesMockup";
import {
  Check,
  ArrowRight,
  Shield,
  FileText,
  Receipt,
  LayoutDashboard,
  PenTool,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  Bot,
  Send,
  MessageCircle,
  BookOpen,
} from "lucide-react";

/* ══════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════ */

const professions = [
  "Développeurs Web",
  "Architectes",
  "Consultants",
  "Photographes",
  "Graphistes",
  "Artisans",
  "Coaches",
  "Formateurs",
  "Traducteurs",
  "Community Managers",
  "Rédacteurs",
  "Vidéastes",
];

const featureSections = [
  {
    label: "Génération IA",
    icon: Bot,
    title: "IA Mistral française",
    description:
      "Décrivez votre prestation en langage naturel. L'IA structure votre devis et propose des prix marché comme point de départ — vous ajustez librement chaque ligne, chaque tarif. 100% hébergé en France.",
    mockup: "devis" as const,
  },
  {
    label: "Signature",
    icon: PenTool,
    title: "Signature électronique",
    description:
      "Votre client signe depuis son téléphone. Valeur juridique, zéro friction.",
    mockup: "signature" as const,
  },
  {
    label: "Pipeline",
    icon: LayoutDashboard,
    title: "Pipeline Kanban",
    description:
      "Visualisez chaque opportunité : prospect → envoyé → signé → payé. Drag & drop intuitif.",
    mockup: "kanban" as const,
  },
  {
    label: "Paiement",
    icon: CreditCard,
    title: "Acompte Stripe intégré",
    description:
      "Acompte 30/50%, paiement par carte. Fonds sur votre compte en 48h via Stripe Connect.",
    mockup: "payment" as const,
  },
  {
    label: "Relances",
    icon: Send,
    title: "Relances automatiques",
    description:
      "J+2, J+5, J+7 — vos clients sont relancés automatiquement. Vous ne levez pas le petit doigt.",
    mockup: "relances" as const,
  },
  {
    label: "Facturation",
    icon: Receipt,
    title: "Facturation automatique",
    description:
      "À la signature, la facture est générée, numérotée et envoyée. Export CSV compatible comptable.",
    mockup: null,
  },
];

const plans = [
  {
    name: "Gratuit",
    price: 0,
    period: "",
    description: "Pour tester sans engagement",
    features: [
      "3 devis par mois",
      "Génération IA Mistral",
      "Templates professionnels",
      "QR Code + liens publics",
      "Versioning devis",
    ],
    cta: "Commencer gratuitement",
    popular: false,
    href: "/signup",
  },
  {
    name: "Pro",
    price: 19,
    period: "/mois HT",
    description: "Pour les indépendants actifs",
    features: [
      "Devis illimités",
      "Tout le plan Gratuit",
      "Signature électronique",
      "Acompte Stripe (30/50%)",
      "Tracking ouvertures",
      "Analytics + relances auto",
      "Facturation PDF",
    ],
    cta: "Choisir Pro",
    popular: true,
    href: "/signup?plan=pro",
  },
  {
    name: "Business",
    price: 39,
    period: "/mois HT",
    description: "Pour les agences et pros exigeants",
    features: [
      "Tout le plan Pro",
      "Lead forms (5+ types)",
      "Contrats récurrents",
      "Gestion d'équipe",
      "Export CSV comptable",
      "Branding personnalisé",
      "Support prioritaire 24h",
    ],
    cta: "Choisir Business",
    popular: false,
    href: "/signup?plan=business",
  },
];

const faqs = [
  {
    q: "Est-ce conforme aux exigences légales françaises ?",
    a: "Oui. Devizly génère des devis avec toutes les mentions obligatoires : SIRET, TVA, conditions de paiement, date de validité. L'IA Mistral est hébergée en France — vos données ne quittent jamais l'UE.",
  },
  {
    q: "L'IA décide-t-elle de mes prix ?",
    a: "Non. L'IA propose une structure de devis avec des prix marché comme suggestion de départ. Vous gardez le contrôle total : modifiez chaque ligne, chaque tarif, chaque description avant d'envoyer. C'est vous le professionnel, l'IA est juste là pour vous faire gagner du temps.",
  },
  {
    q: "Combien de devis gratuits par mois ?",
    a: "Le plan Gratuit offre 3 devis par mois, pour toujours, sans carte bancaire. Passez Pro (19€/mois) pour un nombre illimité.",
  },
  {
    q: "Le client a-t-il besoin de créer un compte ?",
    a: "Non. Le client reçoit un lien unique et peut consulter, signer et payer le devis directement depuis son navigateur, sans inscription.",
  },
  {
    q: "Comment fonctionne le paiement intégré ?",
    a: "Devizly utilise Stripe Connect. Votre client paie par carte bancaire. Les fonds arrivent sur votre compte sous 48h. Vous n'avez rien à configurer côté facturation.",
  },
  {
    q: "Puis-je importer mes clients existants ?",
    a: "Vous pouvez ajouter vos clients manuellement ou les recevoir via le formulaire de capture intégré. L'import CSV est prévu prochainement.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Hébergement européen (Supabase EU), chiffrement en transit et au repos, conforme RGPD. L'IA Mistral est 100% hébergée en France.",
  },
  {
    q: "Devizly fonctionne-t-il avec mon logiciel comptable ?",
    a: "Vous pouvez exporter vos factures en CSV compatible avec la plupart des logiciels comptables (Pennylane, Indy, etc.). L'intégration directe arrive bientôt.",
  },
];

const segmentCopy: Record<string, { hero: string; badge: string }> = {
  graphiste: { hero: "Devis pros pour graphistes", badge: "Designers & créatifs" },
  dev: { hero: "Devis pros pour développeurs", badge: "Développeurs web" },
  consultant: { hero: "Devis pros pour consultants", badge: "Consultants & coachs" },
  artisan: { hero: "Devis pros pour artisans", badge: "Artisans & BTP" },
  photographe: { hero: "Devis pros pour photographes", badge: "Photographes" },
  formateur: { hero: "Devis pros pour formateurs", badge: "Formateurs & coachs" },
};

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════ */

function FeatureMockup({ type }: { type: string | null }) {
  switch (type) {
    case "devis":
      return <DevisGeneratorMockup />;
    case "kanban":
      return <KanbanMockup />;
    case "signature":
      return <SignatureMockup />;
    case "payment":
      return <PaymentMockup />;
    case "relances":
      return <RelancesMockup />;
    default:
      // Facturation — simple static mockup
      return (
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-widest text-[#8b8fa8]">
            Facture auto-générée
          </div>
          <div className="space-y-2 rounded-lg border border-white/[0.06] bg-[#08090a] p-3">
            <div className="flex justify-between text-[11px]">
              <span className="font-medium text-[#e8e9f0]">FACT-2026-018</span>
              <span className="text-[#8b8fa8]">25/03/2026</span>
            </div>
            <div className="h-px bg-white/[0.06]" />
            {["Design UX/UI", "Développement Next.js", "Hébergement"].map((l) => (
              <div key={l} className="flex justify-between text-[10px]">
                <span className="text-[#8b8fa8]">{l}</span>
                <span className="h-2 w-10 rounded bg-white/[0.06]" />
              </div>
            ))}
            <div className="h-px bg-white/[0.06]" />
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#e8e9f0]">Total TTC</span>
              <span className="text-[#e8e9f0]">6 100 €</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#3dd68c]">
            <Check className="h-3 w-3" />
            Envoyée automatiquement à la signature
          </div>
          <div className="mt-2 flex gap-2">
            <div className="rounded bg-white/[0.06] px-2 py-1 text-[9px] text-[#8b8fa8]">
              📄 PDF
            </div>
            <div className="rounded bg-white/[0.06] px-2 py-1 text-[9px] text-[#8b8fa8]">
              📊 Export CSV
            </div>
          </div>
        </div>
      );
  }
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-base font-semibold text-[#e8e9f0] transition-opacity duration-200 hover:opacity-80 sm:text-lg"
      >
        {question}
        <ChevronDown
          className={`ml-4 h-5 w-5 shrink-0 text-[#8b8fa8] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[#8b8fa8] sm:text-base">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */

interface RecentPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
}

export function LandingPage({ recentPosts = [] }: { recentPosts?: RecentPost[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090a]" />}>
      <LandingPageInner recentPosts={recentPosts} />
    </Suspense>
  );
}

function LandingPageInner({ recentPosts }: { recentPosts: RecentPost[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatShown, setChatShown] = useState(false);

  const searchParams = useSearchParams();
  const segment = searchParams.get("for") || "";
  const copy = segmentCopy[segment] || null;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (chatShown) return;
    const timer = setTimeout(() => setChatShown(true), 30000);
    return () => clearTimeout(timer);
  }, [chatShown]);

  const isBeta = process.env.NEXT_PUBLIC_BETA_MODE === "true";

  return (
    <div
      className="min-h-screen bg-[#08090a] text-[#e8e9f0]"
      style={{ fontFeatureSettings: '"ss01", "cv01", "cv02"' }}
    >
      <BetaBanner />

      {/* ══════════════════════════════════════════════
          NAVBAR
          ══════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[#08090a]/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80">
            <DevizlyLogo width={130} height={34} className="text-white" />
            {isBeta && (
              <span className="rounded bg-[#5e6ad2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                bêta
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="#fonctionnalites" className="text-[#8b8fa8] transition-opacity duration-150 hover:text-[#e8e9f0]">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-[#8b8fa8] transition-opacity duration-150 hover:text-[#e8e9f0]">
              Tarifs
            </a>
            <a href="#faq" className="text-[#8b8fa8] transition-opacity duration-150 hover:text-[#e8e9f0]">
              FAQ
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-[#8b8fa8] transition-opacity duration-150 hover:text-[#e8e9f0]">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#5e6ad2] px-5 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              Essayer gratuitement
            </Link>
          </div>

          <button className="text-white md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-white/[0.06] bg-[#08090a]/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                <a href="#fonctionnalites" className="text-[#8b8fa8] hover:text-[#e8e9f0]" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
                <a href="#tarifs" className="text-[#8b8fa8] hover:text-[#e8e9f0]" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
                <a href="#faq" className="text-[#8b8fa8] hover:text-[#e8e9f0]" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <Link href="/login" className="text-[#8b8fa8] hover:text-[#e8e9f0]">Connexion</Link>
                <Link href="/signup" className="rounded-lg bg-[#5e6ad2] px-5 py-2.5 text-center text-sm font-medium text-white">
                  Essayer gratuitement
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO IMMERSIF — "Le produit EST la landing"
          H1 massif gauche + sous-titre droite
          DevisGeneratorMockup pleine largeur dessous
          ══════════════════════════════════════════════ */}
      <section className="pb-0 pt-28 sm:pt-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Top: H1 left + subtitle right */}
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
                {copy ? copy.badge : "Propulsé par l\u2019IA Mistral — hébergée en France"}
              </p>
              <h1
                className="mt-5 font-extrabold leading-[1.0] tracking-[-0.04em] text-[#e8e9f0]"
                style={{ fontSize: "clamp(2.8rem, 4.5vw, 5rem)" }}
              >
                {copy ? (
                  <>
                    {copy.hero}, signez et encaissez
                    <br />
                    vos devis en 2 minutes.
                  </>
                ) : (
                  <>
                    Créez, signez et encaissez
                    <br />
                    vos devis en 2 minutes.
                  </>
                )}
              </h1>
            </div>

            <div className="lg:pt-8">
              <p className="max-w-sm text-base leading-relaxed text-[#8b8fa8]">
                L&apos;IA structure vos devis et propose des prix marché — vous
                ajustez tout à vos tarifs. Vos clients signent et paient en ligne.
                Relances auto, facturation PDF, pipeline Kanban — tout est inclus.
              </p>
              <button
                onClick={() => {
                  const el = document.getElementById("demo");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#5e6ad2] transition-opacity duration-150 hover:opacity-80"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5e6ad2] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5e6ad2]" />
                </span>
                Démo en direct
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Product mockup — full width, overflows below fold */}
          <div className="mt-16 overflow-visible sm:mt-20">
            <DevisGeneratorMockup />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TICKER MÉTIERS
          ══════════════════════════════════════════════ */}
      <section className="mt-20 py-5 sm:mt-28">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#08090a] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#08090a] to-transparent" />
          <div className="animate-ticker flex gap-8 whitespace-nowrap">
            {[...professions, ...professions].map((p, i) => (
              <span key={i} className="text-[12px] tracking-[0.05em] text-white/30">
                {i > 0 && <span className="mr-8">·</span>}
                {p}
              </span>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker {
            animation: ticker 35s linear infinite;
          }
        `}</style>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — "inline product" avec mockups animés
          Chaque feature = grande section alternée
          ══════════════════════════════════════════════ */}
      <section id="fonctionnalites">
        {featureSections.map((feat, i) => (
          <div
            key={feat.title}
            className="border-t border-white/[0.06] py-24 sm:py-32"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div
                className={`grid items-center gap-12 lg:grid-cols-[2fr_3fr] ${
                  i % 2 === 1 ? "lg:[direction:rtl]" : ""
                }`}
              >
                {/* Text */}
                <div className={i % 2 === 1 ? "lg:[direction:ltr]" : ""}>
                  <p className="text-[11px] font-medium uppercase tracking-widest text-[#5e6ad2]">
                    {feat.label}
                  </p>
                  <h2
                    className="mt-4 font-bold tracking-[-0.02em]"
                    style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                  >
                    {feat.title}
                  </h2>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-[#8b8fa8]">
                    {feat.description}
                  </p>
                </div>

                {/* Mockup */}
                <div className={`${i % 2 === 1 ? "lg:[direction:ltr]" : ""} w-full`}>
                  <FeatureMockup type={feat.mockup} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════════════
          DÉMO LIVE INTERACTIVE
          Fond avec subtle radial gradient (seule exception)
          ══════════════════════════════════════════════ */}
      <section
        id="demo"
        className="border-t border-white/[0.06] py-24 sm:py-32"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(94,106,210,0.08) 0%, transparent 100%)",
        }}
      >
        <DemoSection />
      </section>

      {/* ══════════════════════════════════════════════
          PRICING — Linear style
          ══════════════════════════════════════════════ */}
      <section id="tarifs" className="border-t border-white/[0.06] py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
            Tarifs
          </p>
          <h2
            className="mt-4 font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
          >
            Commencez gratuitement, évoluez à votre rythme
          </h2>
          <p className="mt-4 max-w-lg text-[#8b8fa8]">
            Pas de surprise. Pas d&apos;engagement. Changez de plan à tout moment.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl border p-6 sm:p-8 ${
                  plan.popular
                    ? "border-[#5e6ad2]/40 bg-[#5e6ad2]/[0.04]"
                    : "border-white/[0.06] bg-[#0f0f10]"
                }`}
              >
                {plan.popular && (
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#5e6ad2]">
                    Populaire
                  </p>
                )}

                <h3 className="text-xl font-bold text-[#e8e9f0]">{plan.name}</h3>
                <p className="mt-1 text-sm text-[#8b8fa8]">{plan.description}</p>

                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-[-0.03em] text-[#e8e9f0]">
                    {plan.price}€
                  </span>
                  {plan.period && <span className="text-[#8b8fa8]">{plan.period}</span>}
                  {plan.price === 0 && (
                    <p className="mt-1 text-xs text-[#8b8fa8]">Gratuit pour toujours</p>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#8b8fa8]">
                      <span className="mt-0.5 text-[#5e6ad2]">—</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-opacity duration-200 hover:opacity-90 ${
                    plan.popular
                      ? "bg-[#5e6ad2] text-white"
                      : "border border-white/[0.06] bg-white/[0.03] text-[#e8e9f0] hover:bg-white/[0.06]"
                  }`}
                >
                  {plan.cta}
                </Link>
                <p className="mt-2 text-center text-xs text-[#8b8fa8]">
                  {plan.price === 0 ? "Sans carte bancaire" : "Résiliable à tout moment"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ — lignes minimalistes
          ══════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-white/[0.06] py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
            FAQ
          </p>
          <h2
            className="mt-4 font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
          >
            Questions fréquentes
          </h2>

          <div className="mt-12">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DERNIERS ARTICLES
          ══════════════════════════════════════════════ */}
      {recentPosts.length > 0 && (
        <section className="border-t border-white/[0.06] py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
              <BookOpen className="h-3.5 w-3.5" />
              Blog
            </div>
            <h2
              className="mt-4 font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              Derniers articles
            </h2>
            <p className="mt-4 max-w-lg text-[#8b8fa8]">
              Guides pratiques pour freelances, artisans et indépendants.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-xl border border-white/[0.06] bg-[#0f0f10] p-6 transition-opacity duration-200 hover:opacity-80"
                >
                  <span className="inline-block rounded bg-[#5e6ad2]/10 px-3 py-1 text-xs font-medium text-[#5e6ad2]">
                    {post.category}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold leading-snug text-[#e8e9f0]">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#8b8fa8]">
                    {post.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-[#8b8fa8]/60">
                    <span>{new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#5e6ad2] transition-opacity duration-200 hover:opacity-80"
              >
                Voir tous les articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          CTA FINAL
          ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-10 sm:p-16">
            <FileText className="mb-4 h-10 w-10 text-[#5e6ad2]" />
            <h2
              className="font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              Prêt à arrêter de perdre du temps
              <br className="hidden sm:block" /> sur vos devis ?
            </h2>
            <p className="mt-4 max-w-lg text-base text-[#8b8fa8]">
              Créez votre premier devis en 30 secondes avec l&apos;IA.
              Gratuit, sans engagement, sans carte bancaire.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#5e6ad2] px-8 py-4 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => setVideoOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-transparent px-8 py-4 text-base font-medium text-[#e8e9f0] transition-opacity duration-200 hover:bg-white/[0.04]"
              >
                Voir la démo
              </button>
            </div>

            <p className="mt-6 text-sm text-[#8b8fa8]">
              Sans carte bancaire · Accès immédiat · Support français
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
              <DevizlyLogo width={120} height={32} className="text-white" />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#8b8fa8]">
              <a href="#fonctionnalites" className="transition-opacity duration-150 hover:text-[#e8e9f0]">Fonctionnalités</a>
              <a href="#tarifs" className="transition-opacity duration-150 hover:text-[#e8e9f0]">Tarifs</a>
              <a href="#faq" className="transition-opacity duration-150 hover:text-[#e8e9f0]">FAQ</a>
              <Link href="/blog" className="transition-opacity duration-150 hover:text-[#e8e9f0]">Blog</Link>
              <Link href="/login" className="transition-opacity duration-150 hover:text-[#e8e9f0]">Connexion</Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#8b8fa8]/50">
              <span className="font-medium text-[#8b8fa8]/70">Solutions :</span>
              <Link href="/logiciel-devis-artisan" className="hover:text-[#8b8fa8]">Logiciel devis artisan</Link>
              <Link href="/devis-auto-entrepreneur" className="hover:text-[#8b8fa8]">Devis auto-entrepreneur</Link>
              <Link href="/logiciel-facturation-freelance" className="hover:text-[#8b8fa8]">Facturation freelance</Link>
              <Link href="/devis-batiment-gratuit" className="hover:text-[#8b8fa8]">Devis bâtiment</Link>
              <Link href="/creer-devis-en-ligne" className="hover:text-[#8b8fa8]">Créer devis en ligne</Link>
              <Link href="/generateur-devis-ia" className="hover:text-[#8b8fa8]">Générateur devis IA</Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8b8fa8]">
              <Shield className="h-3.5 w-3.5" />
              <span>Conforme RGPD</span>
              <span className="mx-1">·</span>
              <span>Hébergé en France</span>
            </div>
          </div>

          <div className="my-8 h-px bg-white/[0.06]" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#8b8fa8]/50">
              <Link href="/mentions-legales" className="hover:text-[#8b8fa8]">Mentions légales</Link>
              <Link href="/cgv" className="hover:text-[#8b8fa8]">CGV</Link>
              <Link href="/cgu" className="hover:text-[#8b8fa8]">CGU</Link>
              <Link href="/confidentialite" className="hover:text-[#8b8fa8]">Confidentialité</Link>
              <Link href="/cookies" className="hover:text-[#8b8fa8]">Cookies</Link>
              <Link href="/securite" className="hover:text-[#8b8fa8]">Sécurité</Link>
            </div>
            <p className="text-xs text-[#8b8fa8]/50">
              &copy; {new Date().getFullYear()} NBHC SAS — SIREN 102 637 899 — 55 Rue Henri Clément, 71100 Saint-Rémy
            </p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════
          VIDEO DEMO MODAL
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-xl border border-white/[0.06] bg-[#08090a]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-full bg-white/[0.06] p-2 text-white transition-opacity duration-200 hover:opacity-80"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
              <video autoPlay playsInline controls className="w-full">
                <source src="/marketing/demo-devizly-v2.mp4" type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          PROACTIVE CHAT WIDGET
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {chatShown && !chatOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0f0f10] px-5 py-3 transition-opacity duration-200 hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5e6ad2]/20">
              <MessageCircle className="h-5 w-5 text-[#5e6ad2]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[#e8e9f0]">Une question sur les tarifs ?</p>
              <p className="text-xs text-[#8b8fa8]">Je réponds en 2min</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setChatShown(false); }}
              className="ml-1 rounded-full p-1 text-[#8b8fa8] hover:text-[#e8e9f0]"
              aria-label="Fermer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f10]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#5e6ad2]/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5e6ad2]/20">
                  <MessageCircle className="h-4 w-4 text-[#5e6ad2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e8e9f0]">Devizly</p>
                  <p className="text-xs text-[#8b8fa8]">Support en ligne</p>
                </div>
              </div>
              <button
                onClick={() => { setChatOpen(false); setChatShown(false); }}
                className="rounded-full p-1.5 text-[#8b8fa8] hover:bg-white/[0.06] hover:text-[#e8e9f0]"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4 rounded-lg bg-white/[0.03] px-4 py-3">
                <p className="text-sm text-[#8b8fa8]">
                  Bonjour ! Une question sur les tarifs ou les fonctionnalités ? Envoyez-nous un message, on répond en moins de 2 minutes.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem("message") as HTMLInputElement;
                  const email = form.elements.namedItem("email") as HTMLInputElement;
                  if (!input.value.trim() || !email.value.trim()) return;
                  fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.value, message: input.value }),
                  }).then(() => {
                    form.reset();
                    setChatOpen(false);
                    setChatShown(false);
                  }).catch(() => {});
                }}
                className="space-y-3"
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Votre email"
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#e8e9f0] placeholder-[#8b8fa8] outline-none focus:border-[#5e6ad2]/50"
                />
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="Votre question..."
                  className="w-full resize-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#e8e9f0] placeholder-[#8b8fa8] outline-none focus:border-[#5e6ad2]/50"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#5e6ad2] py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
