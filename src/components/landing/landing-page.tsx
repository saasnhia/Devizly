"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DevizlyLogo } from "@/components/devizly-logo";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { DemoSection } from "@/components/landing/demo-section";
import { BetaBanner } from "@/components/landing/beta-banner";
import {
  Check,
  ArrowRight,
  Shield,
  Zap,
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
  Play,
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

const stats = [
  { value: 30, suffix: "s", label: "pour créer un devis" },
  { value: 10, suffix: "s", label: "pour signer en ligne" },
  { value: 48, suffix: "h", label: "pour recevoir le paiement" },
  { value: 100, suffix: "%", label: "hébergé en France" },
];

const features = [
  {
    icon: Bot,
    title: "IA Mistral française",
    description:
      "Décrivez votre prestation en langage naturel. L'IA structure votre devis et propose des prix marché comme point de départ — vous ajustez librement chaque ligne, chaque tarif. 100% hébergé en France.",
  },
  {
    icon: PenTool,
    title: "Signature électronique",
    description:
      "Votre client signe depuis son téléphone. Valeur juridique, zéro friction.",
  },
  {
    icon: LayoutDashboard,
    title: "Pipeline Kanban",
    description:
      "Visualisez chaque opportunité : prospect → envoyé → signé → payé. Drag & drop intuitif.",
  },
  {
    icon: Receipt,
    title: "Facturation automatique",
    description:
      "À la signature, la facture est générée, numérotée et envoyée. Export CSV compatible comptable.",
  },
  {
    icon: CreditCard,
    title: "Acompte Stripe intégré",
    description:
      "Acompte 30/50%, paiement par carte. Fonds sur votre compte en 48h via Stripe Connect.",
  },
  {
    icon: Send,
    title: "Relances automatiques",
    description:
      "J+2, J+5, J+7 — vos clients sont relancés automatiquement. Vous ne levez pas le petit doigt.",
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

/* ══════════════════════════════════════════════════
   SEGMENT CTA MAPPING (A4)
   ══════════════════════════════════════════════════ */

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
  const [quotesCount, setQuotesCount] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatShown, setChatShown] = useState(false);

  // Segment personalization (A4)
  const searchParams = useSearchParams();
  const segment = searchParams.get("for") || "";
  const copy = segmentCopy[segment] || null;

  // Scroll detection for navbar
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch live quote count
  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then((d: { quotes_count: number }) => setQuotesCount(d.quotes_count))
      .catch(() => {});
  }, []);

  // Proactive chat: show after 30s
  useEffect(() => {
    if (chatShown) return;
    const timer = setTimeout(() => {
      setChatShown(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [chatShown]);

  const isBeta = process.env.NEXT_PUBLIC_BETA_MODE === "true";

  return (
    <div
      className="min-h-screen bg-[#08090a] text-[#e8e9f0]"
      style={{ fontFeatureSettings: '"ss01", "cv01", "cv02"' }}
    >
      {/* ══════════════════════════════════════════════
          BETA BANNER
          ══════════════════════════════════════════════ */}
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

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="#fonctionnalites" className="text-[#8b8fa8] transition-opacity duration-200 hover:text-[#e8e9f0]">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-[#8b8fa8] transition-opacity duration-200 hover:text-[#e8e9f0]">
              Tarifs
            </a>
            <a href="#faq" className="text-[#8b8fa8] transition-opacity duration-200 hover:text-[#e8e9f0]">
              FAQ
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-[#8b8fa8] transition-opacity duration-200 hover:text-[#e8e9f0]"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#5e6ad2] px-5 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              Essayer gratuitement
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-white/[0.06] bg-[#08090a]/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                <a href="#fonctionnalites" className="text-[#8b8fa8] hover:text-[#e8e9f0]" onClick={() => setMobileMenuOpen(false)}>
                  Fonctionnalités
                </a>
                <a href="#tarifs" className="text-[#8b8fa8] hover:text-[#e8e9f0]" onClick={() => setMobileMenuOpen(false)}>
                  Tarifs
                </a>
                <a href="#faq" className="text-[#8b8fa8] hover:text-[#e8e9f0]" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </a>
                <Link href="/login" className="text-[#8b8fa8] hover:text-[#e8e9f0]">
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#5e6ad2] px-5 py-2.5 text-center text-sm font-medium text-white"
                >
                  Essayer gratuitement
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO — 2 colonnes (texte | mockup)
          ══════════════════════════════════════════════ */}
      <section className="pb-16 pt-28 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Text */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
                {copy ? copy.badge : "Propulsé par l\u2019IA Mistral — hébergée en France"}
              </p>

              <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {copy ? (
                  <>
                    {copy.hero}.{" "}
                    <br className="hidden sm:block" />
                    <span className="text-[#5e6ad2]">Signez. Encaissez.</span>
                  </>
                ) : (
                  <>
                    Créez des devis.{" "}
                    <br className="hidden sm:block" />
                    Signez. Encaissez.{" "}
                    <span className="text-[#5e6ad2]">En 2 minutes.</span>
                  </>
                )}
              </h1>

              <p className="mt-6 max-w-md text-lg leading-relaxed text-[#8b8fa8]">
                L&apos;IA structure vos devis et propose des prix marché — vous
                ajustez tout à vos tarifs. Vos clients signent et paient en ligne.
                Relances auto, facturation PDF, pipeline Kanban — tout est inclus.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#5e6ad2] px-8 py-3.5 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                >
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-8 py-3.5 text-base font-medium text-[#e8e9f0] transition-opacity duration-200 hover:opacity-80"
                >
                  <Play className="h-4 w-4 text-[#5e6ad2]" />
                  Voir la démo (90s)
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#8b8fa8]">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#5e6ad2]" />
                  Sans carte bancaire
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#5e6ad2]" />
                  Plan gratuit inclus
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#5e6ad2]" />
                  Annulable à tout moment
                </span>
              </div>
            </div>

            {/* Right — Carousel */}
            <div>
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LOGO TICKER (professions)
          ══════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
            Utilisé par les indépendants de tous métiers
          </p>
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#08090a] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#08090a] to-transparent" />

            <div className="animate-ticker flex gap-12 whitespace-nowrap">
              {[...professions, ...professions].map((p, i) => (
                <span key={i} className="text-sm font-medium text-[#8b8fa8]/60">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker {
            animation: ticker 30s linear infinite;
          }
        `}</style>
      </section>

      {/* ══════════════════════════════════════════════
          STATS
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold tracking-[-0.03em] text-[#e8e9f0] sm:text-5xl">
                {stat.value}{stat.suffix}
              </p>
              <p className="mt-2 text-sm text-[#8b8fa8]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DEMO INTERACTIVE
          ══════════════════════════════════════════════ */}
      <DemoSection />

      {/* ══════════════════════════════════════════════
          FEATURES — layout alterné gauche/droite
          ══════════════════════════════════════════════ */}
      <section id="fonctionnalites" className="border-t border-white/[0.06] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
            Fonctionnalités
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            Tout ce qu&apos;il faut pour{" "}
            <span className="text-[#5e6ad2]">convertir plus vite</span>
          </h2>
          <p className="mt-4 max-w-xl text-[#8b8fa8]">
            De la génération IA à l&apos;encaissement Stripe, Devizly couvre
            tout le cycle du devis.
          </p>

          <div className="mt-16">
            {features.map((feat, i) => (
              <div key={feat.title} className="border-t border-white/[0.06] py-10 md:py-14">
                <div className={`md:max-w-[55%] ${i % 2 === 1 ? "md:ml-auto" : ""}`}>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-[#0f0f10]">
                    <feat.icon className="h-5 w-5 text-[#5e6ad2]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#e8e9f0]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8b8fa8]">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3 ÉTAPES — layout alterné avec mockups
          ══════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.06] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
            Comment ça marche
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl md:text-5xl">
            3 étapes. Zéro prise de tête.
          </h2>
          <p className="mt-4 max-w-md text-[#8b8fa8]">
            De la description à l&apos;encaissement, tout est automatisé.
          </p>

          {/* Step 1 — text left, mockup right */}
          <div className="mt-16 grid items-start gap-8 border-t border-white/[0.06] py-12 md:grid-cols-2">
            <div>
              <span className="text-xs font-bold tracking-[3px] text-[#5e6ad2]">01</span>
              <h3 className="mt-3 text-xl font-bold text-[#e8e9f0]">
                Décrivez votre prestation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8b8fa8]">
                L&apos;IA comprend votre métier, structure le devis et propose
                des prix marché.
              </p>
              <p className="mt-2 text-xs font-medium text-[#5e6ad2]">
                Vous ajustez chaque ligne à vos tarifs.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-4">
              <div className="flex items-center gap-1.5 pb-3">
                <div className="h-2 w-2 rounded-full bg-[#8b8fa8]/30" />
                <div className="h-2 w-2 rounded-full bg-[#8b8fa8]/30" />
                <div className="h-2 w-2 rounded-full bg-[#8b8fa8]/30" />
              </div>
              <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-[#8b8fa8]">
                Site vitrine 5 pages pour un restaurant...
              </div>
              <div className="space-y-1.5">
                {[
                  { d: "Design UX/UI (maquettes)", p: "1 200 €" },
                  { d: "Développement Next.js", p: "2 800 €" },
                  { d: "Hébergement + déploiement", p: "350 €" },
                ].map((line) => (
                  <div key={line.d} className="flex items-center justify-between rounded-md bg-white/[0.02] px-2.5 py-1.5 text-[11px]">
                    <span className="text-[#8b8fa8]">{line.d}</span>
                    <span className="font-semibold text-[#e8e9f0]">{line.p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-3/4 rounded-full bg-[#5e6ad2]" />
              </div>
            </div>
          </div>

          {/* Step 2 — mockup left, text right */}
          <div className="grid items-start gap-8 border-t border-white/[0.06] py-12 md:grid-cols-2">
            <div className="order-2 md:order-1 rounded-xl border border-white/[0.06] bg-[#0f0f10] p-4">
              <p className="mb-2 text-center text-[10px] font-semibold text-[#e8e9f0]">
                Partager le devis
              </p>
              <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-[#5e6ad2]/30 bg-[#5e6ad2]/10 px-2.5 py-2">
                <span className="flex-1 truncate font-mono text-[10px] text-[#5e6ad2]/80">
                  devizly.fr/devis/a3f8c2e1...
                </span>
                <div className="flex h-5 w-5 items-center justify-center rounded bg-white/[0.06] text-[8px] text-[#8b8fa8]">📋</div>
              </div>
              <div className="flex gap-2">
                {[
                  { icon: "💬", label: "WhatsApp", bg: "bg-white/[0.04]" },
                  { icon: "✉️", label: "Email", bg: "bg-white/[0.06] ring-1 ring-white/[0.06]" },
                  { icon: "📱", label: "SMS", bg: "bg-white/[0.04]" },
                ].map((btn) => (
                  <div key={btn.label} className={`flex flex-1 flex-col items-center gap-1 rounded-lg ${btn.bg} py-2`}>
                    <span className="text-sm">{btn.icon}</span>
                    <span className="text-[8px] font-semibold text-[#8b8fa8]">{btn.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-[8px] text-[#8b8fa8]">
                Le client consulte, signe ou refuse en ligne
              </p>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-xs font-bold tracking-[3px] text-[#5e6ad2]">02</span>
              <h3 className="mt-3 text-xl font-bold text-[#e8e9f0]">
                Partagez en 1 clic
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8b8fa8]">
                Lien, QR Code, Email ou WhatsApp. Le client consulte, signe ou
                refuse en ligne.
              </p>
              <p className="mt-2 text-xs font-medium text-[#5e6ad2]">
                envoyé → consulté → signé → payé
              </p>
            </div>
          </div>

          {/* Step 3 — text left, mockup right */}
          <div className="grid items-start gap-8 border-t border-white/[0.06] py-12 md:grid-cols-2">
            <div>
              <span className="text-xs font-bold tracking-[3px] text-[#5e6ad2]">03</span>
              <h3 className="mt-3 text-xl font-bold text-[#e8e9f0]">
                Encaissez automatiquement
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8b8fa8]">
                Votre client signe et paie depuis son navigateur — sans créer de
                compte.
              </p>
              <p className="mt-2 text-xs font-medium text-[#5e6ad2]">
                Facture générée, relances auto J+2, J+5, J+7.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-4">
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#8b8fa8]">
                  Montant TTC
                </p>
                <p className="mt-1 text-2xl font-bold text-[#e8e9f0]">
                  2 850,00 €
                </p>
                <div className="mx-auto mt-3 w-full rounded-lg bg-[#5e6ad2] px-4 py-2 text-center text-xs font-semibold text-white">
                  Payer maintenant
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[#5e6ad2]">
                  <Check className="h-3 w-3" />
                  <span>Facture auto-générée</span>
                </div>
              </div>
              <div className="mt-2 flex justify-center gap-2">
                {["J+2", "J+5", "J+7"].map((d) => (
                  <span
                    key={d}
                    className="rounded bg-white/[0.03] px-2 py-0.5 text-[9px] font-medium text-[#8b8fa8]"
                  >
                    Relance {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#5e6ad2] px-8 py-3.5 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              Essayer maintenant — c&apos;est gratuit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SOCIAL PROOF (live counter)
          ══════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.06] py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-8 sm:p-14">
            <Zap className="mb-4 h-10 w-10 text-[#5e6ad2]" />
            <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              Gagnez 5 heures par semaine
            </h2>
            <p className="mt-4 max-w-lg text-base text-[#8b8fa8]">
              Un devis classique prend 30 à 45 minutes sous Excel. Avec
              Devizly, l&apos;IA propose une structure et des prix marché en
              30 secondes — vous personnalisez, ajustez vos tarifs, et envoyez.
            </p>

            {quotesCount > 0 && (
              <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-5 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5e6ad2] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5e6ad2]" />
                </span>
                <span className="text-sm font-medium text-[#8b8fa8]">
                  {quotesCount.toLocaleString("fr-FR")}+ devis générés par la
                  communauté
                </span>
              </div>
            )}

            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold tracking-[-0.03em] text-[#e8e9f0]">30s</p>
                <p className="mt-1 text-xs text-[#8b8fa8]">par devis</p>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-[-0.03em] text-[#e8e9f0]">3x</p>
                <p className="mt-1 text-xs text-[#8b8fa8]">plus de signatures</p>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-[-0.03em] text-[#e8e9f0]">48h</p>
                <p className="mt-1 text-xs text-[#8b8fa8]">paiement reçu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════ */}
      <section id="tarifs" className="border-t border-white/[0.06] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
            Tarifs
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Commencez gratuitement, évoluez à votre rythme
          </h2>
          <p className="mt-4 max-w-lg text-[#8b8fa8]">
            Pas de surprise. Pas d&apos;engagement. Changez de plan à tout
            moment.
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
                  {plan.period && (
                    <span className="text-[#8b8fa8]">{plan.period}</span>
                  )}
                  {plan.price === 0 && (
                    <p className="mt-1 text-xs text-[#8b8fa8]">
                      Gratuit pour toujours
                    </p>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#8b8fa8]">
                      <Check className="h-4 w-4 shrink-0 text-[#5e6ad2]" />
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
          FAQ — lignes simples avec border-bottom
          ══════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-white/[0.06] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
            FAQ
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
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
        <section className="border-t border-white/[0.06] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-[#8b8fa8]">
              <BookOpen className="h-3.5 w-3.5" />
              Blog
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
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
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-xl border border-white/[0.06] bg-[#0f0f10] p-10 sm:p-16">
            <FileText className="mb-4 h-10 w-10 text-[#5e6ad2]" />
            <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
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
                Commencer gratuitementement
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <p className="mt-4 text-sm text-[#8b8fa8]">
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
              <a href="#fonctionnalites" className="transition-opacity duration-200 hover:text-[#e8e9f0]">
                Fonctionnalités
              </a>
              <a href="#tarifs" className="transition-opacity duration-200 hover:text-[#e8e9f0]">
                Tarifs
              </a>
              <a href="#faq" className="transition-opacity duration-200 hover:text-[#e8e9f0]">
                FAQ
              </a>
              <Link href="/blog" className="transition-opacity duration-200 hover:text-[#e8e9f0]">
                Blog
              </Link>
              <Link href="/login" className="transition-opacity duration-200 hover:text-[#e8e9f0]">
                Connexion
              </Link>
            </div>

            {/* Solutions SEO */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#8b8fa8]/50">
              <span className="font-medium text-[#8b8fa8]/70">Solutions :</span>
              <Link href="/logiciel-devis-artisan" className="transition-opacity duration-200 hover:text-[#8b8fa8]">Logiciel devis artisan</Link>
              <Link href="/devis-auto-entrepreneur" className="transition-opacity duration-200 hover:text-[#8b8fa8]">Devis auto-entrepreneur</Link>
              <Link href="/logiciel-facturation-freelance" className="transition-opacity duration-200 hover:text-[#8b8fa8]">Facturation freelance</Link>
              <Link href="/devis-batiment-gratuit" className="transition-opacity duration-200 hover:text-[#8b8fa8]">Devis bâtiment</Link>
              <Link href="/creer-devis-en-ligne" className="transition-opacity duration-200 hover:text-[#8b8fa8]">Créer devis en ligne</Link>
              <Link href="/generateur-devis-ia" className="transition-opacity duration-200 hover:text-[#8b8fa8]">Générateur devis IA</Link>
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
              <Link href="/mentions-legales" className="transition-opacity duration-200 hover:text-[#8b8fa8]">
                Mentions légales
              </Link>
              <Link href="/cgv" className="transition-opacity duration-200 hover:text-[#8b8fa8]">
                CGV
              </Link>
              <Link href="/cgu" className="transition-opacity duration-200 hover:text-[#8b8fa8]">
                CGU
              </Link>
              <Link href="/confidentialite" className="transition-opacity duration-200 hover:text-[#8b8fa8]">
                Confidentialité
              </Link>
              <Link href="/cookies" className="transition-opacity duration-200 hover:text-[#8b8fa8]">
                Cookies
              </Link>
              <Link href="/securite" className="transition-opacity duration-200 hover:text-[#8b8fa8]">
                Sécurité
              </Link>
            </div>
            <p className="text-xs text-[#8b8fa8]/50">
              &copy; {new Date().getFullYear()} NBHC SAS — SIREN 102 637 899 — 55 Rue Henri Clément, 71100 Saint-Rémy
            </p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════
          VIDEO DEMO MODAL (A1)
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
          PROACTIVE CHAT WIDGET (A2)
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
