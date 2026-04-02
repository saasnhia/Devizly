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
  PenTool,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  Bot,
  Send,
  MessageCircle,
  BookOpen,
  Zap,
  Clock,
  CalendarCheck,
} from "lucide-react";

/* ══════════════════════════════════════════════════
   DESIGN TOKENS
   ══════════════════════════════════════════════════ */

const ACCENT = "#5B5BD6";
const ACCENT_LIGHT = "rgba(91,91,214,0.12)";
const BG = "#06060b";
const SURFACE = "#0c0c14";
const SURFACE_2 = "#12121e";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#eeeef0";
const TEXT_MUTED = "#8b8d9e";
const GREEN = "#3dd68c";

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
  "Électriciens",
  "Plombiers",
  "Menuisiers",
];

const heroWords = [
  "freelances",
  "artisans",
  "consultants",
  "créatifs",
  "indépendants",
];

const steps = [
  {
    num: "01",
    icon: Bot,
    title: "Décrivez votre prestation",
    description:
      "En quelques mots, l'IA structure votre devis avec des prix marché. Vous ajustez tout librement.",
  },
  {
    num: "02",
    icon: Send,
    title: "Envoyez et faites signer",
    description:
      "Votre client reçoit un lien, consulte le devis et signe électroniquement depuis son navigateur.",
  },
  {
    num: "03",
    icon: CreditCard,
    title: "Encaissez immédiatement",
    description:
      "Acompte Stripe intégré. Votre client paie en ligne, les fonds arrivent sous 48h.",
  },
];

const featureSections = [
  {
    label: "Génération IA",
    icon: Bot,
    title: "Devis IA en 30 secondes",
    description:
      "Décrivez votre prestation en langage naturel. L'IA structure votre devis et propose des prix marché — vous ajustez chaque ligne, chaque tarif. Hébergé en France, conforme RGPD.",
    mockup: "devis" as const,
    highlight: "30s",
  },
  {
    label: "Signature légale",
    icon: PenTool,
    title: "Signature électronique eIDAS",
    description:
      "Votre client signe depuis son téléphone ou ordinateur. Valeur juridique conforme eIDAS, horodatage certifié, zéro friction.",
    mockup: "signature" as const,
    highlight: "eIDAS",
  },
  {
    label: "Paiement intégré",
    icon: CreditCard,
    title: "Acompte Stripe direct",
    description:
      "Acompte 30% ou 50%, paiement par carte bancaire. Fonds sur votre compte en 48h via Stripe Connect.",
    mockup: "payment" as const,
    highlight: "48h",
  },
  {
    label: "Relances auto",
    icon: Clock,
    title: "Relances J+2, J+5, J+7",
    description:
      "Vos clients sont relancés automatiquement selon un calendrier optimisé. Vous ne levez pas le petit doigt.",
    mockup: "relances" as const,
    highlight: "Auto",
  },
  {
    label: "Calendly",
    icon: CalendarCheck,
    title: "Calendly après signature",
    description:
      "Dès que votre client signe, il peut réserver un créneau directement. L'onboarding démarre sans friction.",
    mockup: "kanban" as const,
    highlight: "Nouveau",
  },
  {
    label: "Facturation",
    icon: Receipt,
    title: "Facturation automatique",
    description:
      "À la signature, la facture est générée, numérotée et envoyée automatiquement. Export CSV compatible comptable.",
    mockup: null,
    highlight: "Auto",
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
      "Génération IA",
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
      "Signature électronique eIDAS",
      "Acompte Stripe (30/50%)",
      "Tracking ouvertures",
      "Relances automatiques",
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
    a: "Oui. Devizly génère des devis avec toutes les mentions obligatoires : SIRET, TVA, conditions de paiement, date de validité. L'IA est hébergée en France — vos données ne quittent jamais l'UE.",
  },
  {
    q: "L'IA décide-t-elle de mes prix ?",
    a: "Non. L'IA propose une structure de devis avec des prix marché comme suggestion de départ. Vous gardez le contrôle total : modifiez chaque ligne, chaque tarif, chaque description avant d'envoyer.",
  },
  {
    q: "Combien de devis gratuits par mois ?",
    a: "Le plan Gratuit offre 3 devis par mois, pour toujours, sans carte bancaire. Passez Pro (19\u00A0€/mois) pour un nombre illimité.",
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
    q: "Mes données sont-elles sécurisées ?",
    a: "Hébergement européen (Supabase EU), chiffrement en transit et au repos, conforme RGPD. L'IA est 100% hébergée en France.",
  },
  {
    q: "Devizly fonctionne-t-il avec mon logiciel comptable ?",
    a: "Vous pouvez exporter vos factures en CSV compatible avec la plupart des logiciels comptables (Pennylane, Indy, etc.).",
  },
  {
    q: "La signature électronique a-t-elle une valeur juridique ?",
    a: "Oui. La signature Devizly est conforme au règlement européen eIDAS. Elle est horodatée, traçable et juridiquement opposable.",
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
      return (
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14] p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-widest text-[#8b8d9e]">
            Facture auto-générée
          </div>
          <div className="space-y-2 rounded-lg border border-white/[0.06] bg-[#06060b] p-3">
            <div className="flex justify-between text-[11px]">
              <span className="font-medium text-[#eeeef0]">FACT-2026-018</span>
              <span className="text-[#8b8d9e]">25/03/2026</span>
            </div>
            <div className="h-px bg-white/[0.06]" />
            {["Design UX/UI", "Développement Next.js", "Hébergement"].map((l) => (
              <div key={l} className="flex justify-between text-[10px]">
                <span className="text-[#8b8d9e]">{l}</span>
                <span className="h-2 w-10 rounded bg-white/[0.06]" />
              </div>
            ))}
            <div className="h-px bg-white/[0.06]" />
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#eeeef0]">Total TTC</span>
              <span className="text-[#eeeef0]">6 100 €</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#3dd68c]">
            <Check className="h-3 w-3" />
            Envoyée automatiquement à la signature
          </div>
          <div className="mt-2 flex gap-2">
            <div className="rounded bg-white/[0.06] px-2 py-1 text-[9px] text-[#8b8d9e]">
              PDF
            </div>
            <div className="rounded bg-white/[0.06] px-2 py-1 text-[9px] text-[#8b8d9e]">
              Export CSV
            </div>
          </div>
        </div>
      );
  }
}

function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block h-[1.15em] w-auto overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={heroWords[index]}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="inline-block"
          style={{ color: ACCENT }}
        >
          {heroWords[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-base font-semibold text-[#eeeef0] transition-colors duration-200 hover:text-[#5B5BD6] sm:text-lg"
      >
        {question}
        <ChevronDown
          className={`ml-4 h-5 w-5 shrink-0 text-[#8b8d9e] transition-transform duration-300 ${
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
            <p className="pb-5 text-sm leading-relaxed text-[#8b8d9e] sm:text-base">
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
    <Suspense fallback={<div className="min-h-screen" style={{ background: BG }} />}>
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
      className="min-h-screen text-[#eeeef0]"
      style={{
        background: BG,
        fontFeatureSettings: '"ss01", "cv01", "cv02"',
      }}
    >
      <BetaBanner />

      {/* ══════════════════════════════════════════════
          NAVBAR — Glassy, minimal
          ══════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b bg-[#06060b]/70 backdrop-blur-2xl"
            : "bg-transparent"
        }`}
        style={{ borderColor: scrolled ? BORDER : "transparent" }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80">
            <DevizlyLogo width={130} height={34} className="text-white" />
            {isBeta && (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: ACCENT }}
              >
                beta
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="#fonctionnalites" className="text-[#8b8d9e] transition-colors duration-150 hover:text-white">
              Fonctionnalites
            </a>
            <a href="#tarifs" className="text-[#8b8d9e] transition-colors duration-150 hover:text-white">
              Tarifs
            </a>
            <a href="#faq" className="text-[#8b8d9e] transition-colors duration-150 hover:text-white">
              FAQ
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-[#8b8d9e] transition-colors duration-150 hover:text-white">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-lg px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:brightness-110"
              style={{ background: ACCENT, boxShadow: `0 0 24px ${ACCENT}33` }}
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
              className="overflow-hidden border-b border-white/[0.06] bg-[#06060b]/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                <a href="#fonctionnalites" className="text-[#8b8d9e] hover:text-white" onClick={() => setMobileMenuOpen(false)}>Fonctionnalites</a>
                <a href="#tarifs" className="text-[#8b8d9e] hover:text-white" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
                <a href="#faq" className="text-[#8b8d9e] hover:text-white" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <Link href="/login" className="text-[#8b8d9e] hover:text-white">Connexion</Link>
                <Link
                  href="/signup"
                  className="rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white"
                  style={{ background: ACCENT }}
                >
                  Essayer gratuitement
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO — Immersive, product-led
          ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pb-0 pt-28 sm:pt-36">
        {/* Radial glow behind hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: "120%",
            height: "600px",
            background: `radial-gradient(ellipse 50% 60% at 50% 0%, ${ACCENT}15 0%, transparent 70%)`,
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium"
              style={{
                borderColor: `${ACCENT}30`,
                background: ACCENT_LIGHT,
                color: ACCENT,
              }}
            >
              <Zap className="h-3.5 w-3.5" />
              {copy ? copy.badge : "Propulse par l\u2019IA — heberge en France"}
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-8 max-w-4xl text-center font-extrabold leading-[1.05] tracking-[-0.04em]"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4.5rem)" }}
          >
            {copy ? (
              <>
                {copy.hero}, signez et encaissez
                <br className="hidden sm:block" /> vos devis en 2 minutes.
              </>
            ) : (
              <>
                Le logiciel de devis
                <br className="hidden sm:block" />
                pour les <RotatingWord />
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-[#8b8d9e] sm:text-xl"
          >
            Creez vos devis avec l&apos;IA, faites signer electroniquement,
            encaissez par carte — le tout en 2 minutes. Relances auto, facturation,
            pipeline Kanban.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{ background: ACCENT, boxShadow: `0 0 40px ${ACCENT}40` }}
            >
              Creer mon premier devis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById("demo");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-base font-medium text-[#eeeef0] transition-colors duration-200 hover:bg-white/[0.06]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: GREEN }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: GREEN }} />
              </span>
              Demo en direct
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#8b8d9e]"
          >
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" style={{ color: GREEN }} />
              Gratuit, sans CB
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" style={{ color: GREEN }} />
              Conforme RGPD
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" style={{ color: GREEN }} />
              IA hebergee en France
            </span>
          </motion.div>

          {/* Product mockup — hero centerpiece */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 sm:mt-20"
          >
            <DevisGeneratorMockup />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TICKER METIERS
          ══════════════════════════════════════════════ */}
      <section className="mt-20 py-5 sm:mt-28">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#06060b] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#06060b] to-transparent" />
          <div className="animate-ticker flex gap-8 whitespace-nowrap">
            {[...professions, ...professions].map((p, i) => (
              <span key={i} className="text-[12px] tracking-[0.05em] text-white/20">
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
          HOW IT WORKS — 3 steps
          ══════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.04] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: ACCENT }}>
              Comment ca marche
            </p>
            <h2
              className="mt-4 font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              3 etapes. 2 minutes. C&apos;est tout.
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+40px)] top-10 hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-white/10 via-white/6 to-transparent md:block" />
                )}

                <div
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: ACCENT_LIGHT }}
                >
                  <step.icon className="h-7 w-7" style={{ color: ACCENT }} />
                </div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                  Etape {step.num}
                </p>
                <h3 className="mb-3 text-lg font-bold text-[#eeeef0]">
                  {step.title}
                </h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#8b8d9e]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — Alternating sections with mockups
          ══════════════════════════════════════════════ */}
      <section id="fonctionnalites">
        {featureSections.map((feat, i) => (
          <div
            key={feat.title}
            className="border-t border-white/[0.04] py-24 sm:py-28"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div
                className={`grid items-center gap-12 lg:grid-cols-[2fr_3fr] ${
                  i % 2 === 1 ? "lg:[direction:rtl]" : ""
                }`}
              >
                {/* Text */}
                <div className={i % 2 === 1 ? "lg:[direction:ltr]" : ""}>
                  <div className="mb-4 flex items-center gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: ACCENT }}>
                      {feat.label}
                    </p>
                    {feat.highlight && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                        style={{ background: ACCENT_LIGHT, color: ACCENT }}
                      >
                        {feat.highlight}
                      </span>
                    )}
                  </div>
                  <h2
                    className="font-bold tracking-[-0.02em]"
                    style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                  >
                    {feat.title}
                  </h2>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-[#8b8d9e]">
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
          DEMO LIVE INTERACTIVE
          ══════════════════════════════════════════════ */}
      <section
        id="demo"
        className="border-t border-white/[0.04] py-24 sm:py-32"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${ACCENT}0a 0%, transparent 100%)`,
        }}
      >
        <DemoSection />
      </section>

      {/* ══════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════ */}
      <section id="tarifs" className="border-t border-white/[0.04] py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: ACCENT }}>
              Tarifs
            </p>
            <h2
              className="mt-4 font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              Commencez gratuitement, evoluez a votre rythme
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[#8b8d9e]">
              Pas de surprise. Pas d&apos;engagement. Changez de plan a tout moment.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="relative flex flex-col rounded-2xl border p-6 transition-colors duration-200 sm:p-8"
                style={{
                  borderColor: plan.popular ? `${ACCENT}50` : BORDER,
                  background: plan.popular ? `${ACCENT}08` : SURFACE,
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
                    style={{ background: ACCENT }}
                  >
                    Populaire
                  </div>
                )}

                <h3 className="text-xl font-bold text-[#eeeef0]">{plan.name}</h3>
                <p className="mt-1 text-sm text-[#8b8d9e]">{plan.description}</p>

                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-[-0.03em] text-[#eeeef0]">
                    {plan.price}€
                  </span>
                  {plan.period && <span className="text-[#8b8d9e]">{plan.period}</span>}
                  {plan.price === 0 && (
                    <p className="mt-1 text-xs text-[#8b8d9e]">Gratuit pour toujours</p>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#8b8d9e]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className="mt-8 block rounded-xl py-3.5 text-center text-sm font-semibold transition-all duration-200 hover:brightness-110"
                  style={
                    plan.popular
                      ? { background: ACCENT, color: "white", boxShadow: `0 0 24px ${ACCENT}33` }
                      : { border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.03)", color: TEXT }
                  }
                >
                  {plan.cta}
                </Link>
                <p className="mt-2 text-center text-xs text-[#8b8d9e]">
                  {plan.price === 0 ? "Sans carte bancaire" : "Resiliable a tout moment"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-white/[0.04] py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: ACCENT }}>
              FAQ
            </p>
            <h2
              className="mt-4 font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              Questions frequentes
            </h2>
          </div>

          <div className="mt-12">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BLOG
          ══════════════════════════════════════════════ */}
      {recentPosts.length > 0 && (
        <section className="border-t border-white/[0.04] py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest" style={{ color: ACCENT }}>
              <BookOpen className="h-3.5 w-3.5" />
              Blog
            </div>
            <h2
              className="mt-4 font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              Derniers articles
            </h2>
            <p className="mt-4 max-w-lg text-[#8b8d9e]">
              Guides pratiques pour freelances, artisans et independants.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-white/[0.06] p-6 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.02]"
                  style={{ background: SURFACE }}
                >
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: ACCENT_LIGHT, color: ACCENT }}
                  >
                    {post.category}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold leading-snug text-[#eeeef0]">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#8b8d9e]">
                    {post.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-[#8b8d9e]/60">
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
                className="inline-flex items-center gap-2 text-sm font-medium transition-opacity duration-200 hover:opacity-80"
                style={{ color: ACCENT }}
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
          <div
            className="relative overflow-hidden rounded-3xl border p-10 sm:p-16"
            style={{
              borderColor: BORDER,
              background: `linear-gradient(135deg, ${SURFACE_2} 0%, ${SURFACE} 100%)`,
            }}
          >
            {/* Accent glow */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
              style={{ background: ACCENT }}
            />

            <FileText className="mb-6 h-12 w-12" style={{ color: ACCENT }} />
            <h2
              className="font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              Pret a arreter de perdre du temps
              <br className="hidden sm:block" /> sur vos devis ?
            </h2>
            <p className="mt-4 max-w-lg text-base text-[#8b8d9e]">
              Creez votre premier devis en 30 secondes avec l&apos;IA.
              Gratuit, sans engagement, sans carte bancaire.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:brightness-110"
                style={{ background: ACCENT, boxShadow: `0 0 40px ${ACCENT}40` }}
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => setVideoOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-transparent px-8 py-4 text-base font-medium text-[#eeeef0] transition-colors duration-200 hover:bg-white/[0.04]"
              >
                Voir la demo
              </button>
            </div>

            <p className="mt-6 text-sm text-[#8b8d9e]">
              Sans carte bancaire · Acces immediat · Support francais
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
              <DevizlyLogo width={120} height={32} className="text-white" />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#8b8d9e]">
              <a href="#fonctionnalites" className="transition-colors duration-150 hover:text-white">Fonctionnalites</a>
              <a href="#tarifs" className="transition-colors duration-150 hover:text-white">Tarifs</a>
              <a href="#faq" className="transition-colors duration-150 hover:text-white">FAQ</a>
              <Link href="/blog" className="transition-colors duration-150 hover:text-white">Blog</Link>
              <Link href="/login" className="transition-colors duration-150 hover:text-white">Connexion</Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#8b8d9e]/50">
              <span className="font-medium text-[#8b8d9e]/70">Solutions :</span>
              <Link href="/logiciel-devis-artisan" className="hover:text-[#8b8d9e]">Logiciel devis artisan</Link>
              <Link href="/devis-auto-entrepreneur" className="hover:text-[#8b8d9e]">Devis auto-entrepreneur</Link>
              <Link href="/logiciel-facturation-freelance" className="hover:text-[#8b8d9e]">Facturation freelance</Link>
              <Link href="/devis-batiment-gratuit" className="hover:text-[#8b8d9e]">Devis batiment</Link>
              <Link href="/creer-devis-en-ligne" className="hover:text-[#8b8d9e]">Creer devis en ligne</Link>
              <Link href="/generateur-devis-ia" className="hover:text-[#8b8d9e]">Generateur devis IA</Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8b8d9e]">
              <Shield className="h-3.5 w-3.5" />
              <span>Conforme RGPD</span>
              <span className="mx-1">·</span>
              <span>Heberge en France</span>
            </div>
          </div>

          <div className="my-8 h-px bg-white/[0.04]" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#8b8d9e]/50">
              <Link href="/mentions-legales" className="hover:text-[#8b8d9e]">Mentions legales</Link>
              <Link href="/cgv" className="hover:text-[#8b8d9e]">CGV</Link>
              <Link href="/cgu" className="hover:text-[#8b8d9e]">CGU</Link>
              <Link href="/confidentialite" className="hover:text-[#8b8d9e]">Confidentialite</Link>
              <Link href="/cookies" className="hover:text-[#8b8d9e]">Cookies</Link>
              <Link href="/securite" className="hover:text-[#8b8d9e]">Securite</Link>
            </div>
            <p className="text-xs text-[#8b8d9e]/50">
              &copy; {new Date().getFullYear()} NBHC SAS — SIREN 102 637 899 — 55 Rue Henri Clement, 71100 Saint-Remy
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
              className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.06]"
              style={{ background: BG }}
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
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-white/[0.06] px-5 py-3 transition-opacity duration-200 hover:opacity-90"
            style={{ background: SURFACE }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: ACCENT_LIGHT }}>
              <MessageCircle className="h-5 w-5" style={{ color: ACCENT }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[#eeeef0]">Une question sur les tarifs ?</p>
              <p className="text-xs text-[#8b8d9e]">Je reponds en 2min</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setChatShown(false); }}
              className="ml-1 rounded-full p-1 text-[#8b8d9e] hover:text-[#eeeef0]"
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
            className="fixed bottom-6 right-6 z-50 w-[360px] overflow-hidden rounded-2xl border border-white/[0.06]"
            style={{ background: SURFACE }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4" style={{ background: ACCENT_LIGHT }}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: ACCENT_LIGHT }}>
                  <MessageCircle className="h-4 w-4" style={{ color: ACCENT }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#eeeef0]">Devizly</p>
                  <p className="text-xs text-[#8b8d9e]">Support en ligne</p>
                </div>
              </div>
              <button
                onClick={() => { setChatOpen(false); setChatShown(false); }}
                className="rounded-full p-1.5 text-[#8b8d9e] hover:bg-white/[0.06] hover:text-[#eeeef0]"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4 rounded-xl bg-white/[0.03] px-4 py-3">
                <p className="text-sm text-[#8b8d9e]">
                  Bonjour ! Une question sur les tarifs ou les fonctionnalites ? Envoyez-nous un message, on repond en moins de 2 minutes.
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
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#eeeef0] placeholder-[#8b8d9e] outline-none focus:border-[#5B5BD6]/50"
                />
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="Votre question..."
                  className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#eeeef0] placeholder-[#8b8d9e] outline-none focus:border-[#5B5BD6]/50"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
                  style={{ background: ACCENT }}
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
