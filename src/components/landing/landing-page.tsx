"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
   DATA
   ══════════════════════════════════════════════════ */

const heroWords = ["artisans", "freelances", "indépendants", "consultants", "créatifs"];

const professions = [
  "Développeurs Web", "Architectes", "Consultants", "Photographes",
  "Graphistes", "Artisans", "Coaches", "Formateurs", "Traducteurs",
  "Community Managers", "Rédacteurs", "Vidéastes", "Électriciens",
  "Plombiers", "Menuisiers",
];

const steps = [
  {
    num: "01",
    icon: Bot,
    title: "Décrivez votre prestation",
    description: "En quelques mots, l'IA structure votre devis avec des prix marché. Vous ajustez tout librement.",
  },
  {
    num: "02",
    icon: Send,
    title: "Envoyez et faites signer",
    description: "Votre client reçoit un lien, consulte le devis et signe électroniquement depuis son navigateur.",
  },
  {
    num: "03",
    icon: CreditCard,
    title: "Encaissez immédiatement",
    description: "Acompte Stripe intégré. Votre client paie en ligne, les fonds arrivent sous 48h.",
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
   SCROLL REVEAL HOOK
   ══════════════════════════════════════════════════ */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`aurora-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════ */

function RotatingWord() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % heroWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block" style={{ minWidth: "220px", height: "1.2em" }}>
      {heroWords.map((word, i) => (
        <span
          key={word}
          className="absolute left-0 top-0 font-bold text-[#5B5BD6] transition-all duration-500"
          style={{
            opacity: activeIndex === i ? 1 : 0,
            transform: activeIndex === i ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {word}
        </span>
      ))}
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
          className={`ml-4 h-5 w-5 shrink-0 text-[#6b6d80] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-[#8b8d9e] sm:text-base">
            {answer}
          </p>
        </div>
      </div>
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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (chatShown) return;
    const t = setTimeout(() => setChatShown(true), 30000);
    return () => clearTimeout(t);
  }, [chatShown]);

  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);
  const isBeta = process.env.NEXT_PUBLIC_BETA_MODE === "true";

  return (
    <div className="aurora-page">
      {/* ══════════════════════════════════════════════
          GLOBAL CSS — Aurora animations
          ══════════════════════════════════════════════ */}
      <style jsx global>{`
        /* ---------- Aurora blobs ---------- */
        @keyframes blobMove1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(60px, -40px) scale(1.15); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes blobMove2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-50px, 50px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes blobMove3 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(30px, 30px) scale(1.2); }
          100% { transform: translate(0, 0) scale(1); }
        }

        /* ---------- Float mockup ---------- */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        /* ---------- Shimmer CTA ---------- */
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* ---------- Gradient animated bg ---------- */
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* ---------- Ticker ---------- */
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ---------- Word rotation ---------- */
        .aurora-word-wrap {
          display: inline-block;
          position: relative;
          min-width: 220px;
          height: 1.15em;
          overflow: hidden;
          vertical-align: bottom;
          text-align: left;
        }
        @media (min-width: 640px) {
          .aurora-word-wrap { min-width: 300px; }
        }
        .aurora-word {
          position: absolute;
          left: 0;
          top: 0;
          white-space: nowrap;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          color: #5B5BD6;
        }
        .aurora-word-in  { transform: translateY(0); opacity: 1; }
        .aurora-word-out { transform: translateY(-100%); opacity: 0; }

        /* ---------- Scroll reveal ---------- */
        .aurora-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .aurora-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ---------- Page base ---------- */
        .aurora-page {
          color: #eeeef0;
          min-height: 100vh;
          font-feature-settings: "ss01", "cv01", "cv02";
          position: relative;
        }

        /* ---------- Bento card base ---------- */
        .bento-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 32px;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.25s ease;
          overflow: hidden;
          position: relative;
          min-height: 380px;
        }
        .bento-card-compact {
          min-height: auto;
        }
        .bento-card:hover {
          transform: scale(1.02);
          border-color: rgba(91,91,214,0.35);
        }

        /* ---------- Shimmer button ---------- */
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255,255,255,0.12) 50%,
            transparent 70%
          );
          transform: translateX(-100%);
        }
        .btn-shimmer:hover::before {
          animation: shimmer 0.8s ease forwards;
        }

        /* ---------- Glass card ---------- */
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
        }

        /* ---------- Grain overlay ---------- */
        .hero-grain::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          background-repeat: repeat;
          pointer-events: none;
          z-index: 1;
        }

        /* ---------- COUCHE 1: Dot grid ---------- */
        .hero-dotgrid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          z-index: 1;
        }
        /* Vignette fade on dot grid edges */
        .hero-dotgrid::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 40%, transparent 40%, #08090a 80%);
          pointer-events: none;
        }

        /* ---------- COUCHE 2: Scan line ---------- */
        @keyframes scanLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .hero-scanline {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(91,91,214,0.6), transparent);
          animation: scanLine 8s linear infinite;
          pointer-events: none;
          z-index: 2;
        }

        /* ---------- Reduced motion ---------- */
        @media (prefers-reduced-motion: reduce) {
          .aurora-reveal { transition: none; opacity: 1; transform: none; }
          .aurora-word { transition: none; }
          .btn-shimmer::before { animation: none !important; }
        }
      `}</style>

      <BetaBanner />

      {/* ══════════════════════════════════════════════
          SECTION 1 — NAV
          ══════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[#08090a]/70 backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80">
            <DevizlyLogo width={130} height={34} className="text-white" />
            {isBeta && (
              <span className="rounded bg-[#5B5BD6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                beta
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="#fonctionnalites" className="text-[#8b8d9e] transition-colors hover:text-white">Fonctionnalités</a>
            <a href="#tarifs" className="text-[#8b8d9e] transition-colors hover:text-white">Tarifs</a>
            <Link href="/blog" className="text-[#8b8d9e] transition-colors hover:text-white">Blog</Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-[#8b8d9e] transition-colors hover:text-white">
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="btn-shimmer rounded-xl bg-[#5B5BD6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(91,91,214,0.3)] transition-all hover:shadow-[0_0_32px_rgba(91,91,214,0.45)] hover:brightness-110"
            >
              Essayer gratuitement
              <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" />
            </Link>
          </div>

          <button className="text-white md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-b border-white/[0.06] bg-[#08090a]/95 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-4 px-6 py-6">
              <a href="#fonctionnalites" className="text-[#8b8d9e] hover:text-white" onClick={closeMobile}>Fonctionnalités</a>
              <a href="#tarifs" className="text-[#8b8d9e] hover:text-white" onClick={closeMobile}>Tarifs</a>
              <Link href="/blog" className="text-[#8b8d9e] hover:text-white" onClick={closeMobile}>Blog</Link>
              <Link href="/login" className="text-[#8b8d9e] hover:text-white">Se connecter</Link>
              <Link href="/signup" className="rounded-xl bg-[#5B5BD6] px-5 py-2.5 text-center text-sm font-semibold text-white">
                Essayer gratuitement
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════════
          SECTION 2 — HERO IMMERSIF
          ══════════════════════════════════════════════ */}
      <section className="hero-grain relative overflow-hidden pb-0 pt-28 sm:pt-36">
        {/* COUCHE 1 — Dot grid with vignette */}
        <div className="hero-dotgrid" />

        {/* COUCHE 2 — Scan line */}
        <div className="hero-scanline" />

        {/* COUCHE 3 — Central glow under title */}
        <div
          className="pointer-events-none absolute left-1/2 top-[280px] -translate-x-1/2"
          style={{
            width: "600px",
            height: "300px",
            background: "radial-gradient(ellipse, rgba(91,91,214,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            zIndex: 0,
          }}
        />

        {/* Aurora blobs */}
        <div
          className="pointer-events-none absolute right-[-10%] top-[-15%] h-[500px] w-[500px] rounded-full opacity-[0.25]"
          style={{
            background: "radial-gradient(circle, #5B5BD6 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "blobMove1 25s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-[10%] left-[-8%] h-[450px] w-[450px] rounded-full opacity-[0.2]"
          style={{
            background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "blobMove2 28s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        />
        <div
          className="pointer-events-none absolute left-[30%] top-[20%] h-[400px] w-[400px] rounded-full opacity-[0.15]"
          style={{
            background: "radial-gradient(circle, #6366F1 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "blobMove3 22s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        />

        <div className="relative z-[2] mx-auto max-w-6xl px-4 sm:px-6">
          {/* Badge */}
          <Reveal className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5B5BD6]/30 bg-[#5B5BD6]/10 px-4 py-1.5 text-[13px] font-medium text-[#5B5BD6]">
              <Zap className="h-3.5 w-3.5" />
              {copy ? copy.badge : "Propulsé par l\u2019IA — hébergé en France"}
            </span>
          </Reveal>

          {/* H1 massive */}
          <Reveal delay={100}>
            <h1
              className="mx-auto mt-8 max-w-5xl text-center font-black leading-[1.02] tracking-[-0.045em]"
              style={{ fontSize: "clamp(2.8rem, 8vw, 5.5rem)" }}
            >
              {copy ? (
                <>
                  {copy.hero}, signés
                  <br className="hidden sm:block" /> et payés en 30s
                </>
              ) : (
                <>
                  Vos devis, signés
                  <br className="hidden sm:block" />
                  et payés en 30s
                </>
              )}
            </h1>
          </Reveal>

          {/* Rotating word line */}
          <Reveal delay={150}>
            <div className="mx-auto mt-4 flex w-full items-center justify-center">
              <div
                className="flex items-center justify-center gap-[0.35em] font-semibold text-slate-300"
                style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)" }}
              >
                <span className="whitespace-nowrap">Le logiciel de devis pour les</span>
                <RotatingWord />
              </div>
            </div>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-[560px] text-center text-lg leading-[1.6] text-[#8b8d9e]">
              L&apos;IA structure vos devis, vos clients signent et paient en ligne.
              Relances automatiques, facturation, pipeline Kanban — tout est inclus.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={300}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="btn-shimmer group inline-flex items-center gap-2 rounded-xl bg-[#5B5BD6] px-8 py-4 text-base font-bold text-white shadow-[0_0_48px_rgba(91,91,214,0.4)] transition-all hover:shadow-[0_0_64px_rgba(91,91,214,0.55)] hover:brightness-110"
              >
                Créer mon premier devis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => {
                  document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-base font-medium text-[#eeeef0] backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3dd68c] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3dd68c]" />
                </span>
                Démo en direct
              </button>
            </div>
          </Reveal>

          {/* Trust badges */}
          <Reveal delay={400}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#8b8d9e]">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#3dd68c]" /> Sans CB
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#3dd68c]" /> RGPD
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#3dd68c]" /> IA française
              </span>
            </div>
          </Reveal>

          {/* Floating mockup */}
          <Reveal delay={450}>
            <div
              className="mt-16 sm:mt-20"
              style={{ animation: "float 4s ease-in-out infinite" }}
            >
              <div className="glass overflow-hidden p-0">
                <DevisGeneratorMockup />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TICKER MÉTIERS
          ══════════════════════════════════════════════ */}
      <section className="mt-20 py-5 sm:mt-28">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#08090a] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#08090a] to-transparent" />
          <div className="flex gap-8 whitespace-nowrap" style={{ animation: "ticker 35s linear infinite" }}>
            {[...professions, ...professions].map((p, i) => (
              <span key={i} className="text-[12px] tracking-[0.05em] text-white/20">
                {i > 0 && <span className="mr-8">·</span>}
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — BENTO GRID FEATURES
          ══════════════════════════════════════════════ */}
      <section id="fonctionnalites" className="aurora-features-bg border-t border-white/[0.04] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5B5BD6]">
              Fonctionnalités
            </p>
            <h2
              className="mt-4 font-bold tracking-[-0.03em]"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              Tout ce qu&apos;il faut pour<br className="hidden sm:block" /> transformer vos devis en revenus
            </h2>
          </Reveal>

          {/* Top row — 3 main feature cards */}
          <div className="mt-14 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {/* Card 1 — Génération IA */}
            <Reveal delay={0}>
              <div className="bento-card justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-[#5B5BD6]">Génération IA</span>
                  <h3 className="mt-3 mb-2 text-xl font-bold tracking-tight">Devis IA en 30 secondes</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Décrivez votre prestation, l&apos;IA structure le devis avec des prix marché.
                  </p>
                </div>
                <div className="mt-6 flex flex-1 flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.05] p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <span className="text-sm text-slate-400">Décrivez votre prestation...</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-2 w-3/4 rounded bg-[#5B5BD6]/40" />
                    <div className="h-2 w-full rounded bg-white/10" />
                    <div className="h-2 w-5/6 rounded bg-white/10" />
                  </div>
                  <div className="mt-auto pt-3">
                    <div className="w-fit rounded-lg bg-[#5B5BD6] px-4 py-2 text-xs font-medium text-white">
                      Générer avec l&apos;IA
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Card 2 — Signature eIDAS */}
            <Reveal delay={100}>
              <div className="bento-card justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-[#5B5BD6]">Signature</span>
                  <h3 className="mt-3 mb-2 text-xl font-bold tracking-tight">Signature électronique eIDAS</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Votre client signe depuis son téléphone. Valeur juridique eIDAS, horodatage certifié.
                  </p>
                </div>
                <div className="mt-6 flex-1 overflow-hidden">
                  <SignatureMockup />
                </div>
              </div>
            </Reveal>

            {/* Card 3 — Paiement Stripe */}
            <Reveal delay={200}>
              <div className="bento-card justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-[#5B5BD6]">Paiement</span>
                  <h3 className="mt-3 mb-2 text-xl font-bold tracking-tight">Acompte Stripe direct</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Acompte 30/50% par carte. Fonds sur votre compte en 48h via Stripe Connect.
                  </p>
                </div>
                <div className="mt-6 flex-1 overflow-hidden">
                  <PaymentMockup />
                </div>
              </div>
            </Reveal>
          </div>

          {/* Bottom row — secondary features */}
          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {/* Card 4 — Relances */}
            <Reveal delay={100}>
              <div className="bento-card justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-[#5B5BD6]">Relances</span>
                  <h3 className="mt-3 mb-2 text-xl font-bold tracking-tight">Relances J+2, J+5, J+7</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Vos clients sont relancés automatiquement. Vous ne levez pas le petit doigt.
                  </p>
                </div>
                <div className="mt-6 flex-1 overflow-hidden">
                  <RelancesMockup />
                </div>
              </div>
            </Reveal>

            {/* Card 5 — Pipeline */}
            <Reveal delay={200}>
              <div className="bento-card justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-[#5B5BD6]">Pipeline</span>
                  <h3 className="mt-3 mb-2 text-xl font-bold tracking-tight">Pipeline Kanban visuel</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Prospect → envoyé → signé → payé. Votre CA en temps réel.
                  </p>
                </div>
                <div className="mt-6 flex-1 overflow-hidden">
                  <KanbanMockup />
                </div>
              </div>
            </Reveal>

            {/* Card 6 — Facturation + Calendly */}
            <Reveal delay={300}>
              <div className="bento-card justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-widest text-[#5B5BD6]">Facturation</span>
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">Nouveau</span>
                  </div>
                  <h3 className="mt-3 mb-2 text-xl font-bold tracking-tight">Facturation auto + Calendly</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Facture générée à la signature, export CSV. Calendly intégré pour planifier le kick-off.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5B5BD6]/10">
                    <Receipt className="h-6 w-6 text-[#5B5BD6]" />
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5B5BD6]/10">
                    <CalendarCheck className="h-6 w-6 text-[#5B5BD6]" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
          ══════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.04] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5B5BD6]">
                Comment ça marche
              </p>
              <h2
                className="mt-4 font-bold tracking-[-0.03em]"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
              >
                3 étapes. 2 minutes. C&apos;est tout.
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            {/* Connector line */}
            <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px md:block"
              style={{
                background: "linear-gradient(90deg, transparent 10%, rgba(91,91,214,0.25) 30%, rgba(91,91,214,0.25) 70%, transparent 90%)",
                backgroundSize: "200% 100%",
                animation: "gradientShift 4s ease infinite",
              }}
            />

            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 120}>
                <div className="relative text-center">
                  {/* Giant number background */}
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 select-none font-black opacity-[0.04]"
                    style={{ fontSize: "8rem", lineHeight: "1", color: "#5B5BD6" }}
                  >
                    {step.num}
                  </div>

                  <div className="relative z-10">
                    <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-[#5B5BD6]/20 bg-[#5B5BD6]/10 shadow-[0_0_32px_rgba(91,91,214,0.15)]">
                      <step.icon className="h-7 w-7 text-[#5B5BD6]" />
                    </div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#5B5BD6]">
                      Étape {step.num}
                    </p>
                    <h3 className="mb-3 text-lg font-bold">{step.title}</h3>
                    <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#8b8d9e]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DEMO LIVE INTERACTIVE
          ══════════════════════════════════════════════ */}
      <section
        id="demo"
        className="border-t border-white/[0.04] py-24 sm:py-32"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(91,91,214,0.08) 0%, transparent 100%)",
        }}
      >
        <DemoSection />
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — PRICING
          ══════════════════════════════════════════════ */}
      <section id="tarifs" className="border-t border-white/[0.04] py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5B5BD6]">Tarifs</p>
              <h2
                className="mt-4 font-bold tracking-[-0.03em]"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
              >
                Commencez gratuitement,<br className="hidden sm:block" /> évoluez à votre rythme
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[#8b8d9e]">
                Pas de surprise. Pas d&apos;engagement. Changez de plan à tout moment.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 100}>
                <div
                  className={`glass relative flex flex-col p-6 transition-all duration-300 hover:scale-[1.02] sm:p-8 ${
                    plan.popular
                      ? "border-[#5B5BD6]/40 shadow-[0_0_40px_rgba(91,91,214,0.12)]"
                      : ""
                  }`}
                  style={plan.popular ? {
                    background: "linear-gradient(135deg, rgba(91,91,214,0.12) 0%, rgba(91,91,214,0.04) 100%)",
                  } : undefined}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#5B5BD6] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(91,91,214,0.4)]">
                      Populaire
                    </div>
                  )}

                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-[#8b8d9e]">{plan.description}</p>

                  <div className="mt-6">
                    <span className="text-4xl font-black tracking-[-0.03em]">
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
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5B5BD6]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`btn-shimmer mt-8 block rounded-xl py-3.5 text-center text-sm font-bold transition-all duration-200 ${
                      plan.popular
                        ? "bg-[#5B5BD6] text-white shadow-[0_0_24px_rgba(91,91,214,0.3)] hover:shadow-[0_0_32px_rgba(91,91,214,0.45)] hover:brightness-110"
                        : "border border-white/[0.08] bg-white/[0.03] text-[#eeeef0] hover:border-white/[0.15] hover:bg-white/[0.06]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <p className="mt-2 text-center text-xs text-[#8b8d9e]">
                    {plan.price === 0 ? "Sans carte bancaire" : "Résiliable à tout moment"}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-white/[0.04] py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5B5BD6]">FAQ</p>
              <h2
                className="mt-4 font-bold tracking-[-0.03em]"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
              >
                Questions fréquentes
              </h2>
            </div>
          </Reveal>
          <div className="mt-12">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 50}>
                <FAQItem question={faq.q} answer={faq.a} />
              </Reveal>
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
            <Reveal>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#5B5BD6]">
                <BookOpen className="h-3.5 w-3.5" />
                Blog
              </div>
              <h2
                className="mt-4 font-bold tracking-[-0.03em]"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
              >
                Derniers articles
              </h2>
              <p className="mt-4 max-w-lg text-[#8b8d9e]">
                Guides pratiques pour freelances, artisans et indépendants.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post, i) => (
                <Reveal key={post.slug} delay={i * 100}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="bento-card group block"
                  >
                    <span className="inline-block rounded-full bg-[#5B5BD6]/10 px-3 py-1 text-xs font-medium text-[#5B5BD6]">
                      {post.category}
                    </span>
                    <h3 className="mt-3 text-lg font-bold leading-snug">
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
                </Reveal>
              ))}
            </div>

            <Reveal delay={300}>
              <div className="mt-10">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#5B5BD6] transition-opacity hover:opacity-80"
                >
                  Voir tous les articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          SECTION 6 — CTA FINAL
          ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-10 sm:p-16"
              style={{
                background: "radial-gradient(ellipse 60% 80% at 70% 20%, rgba(91,91,214,0.15) 0%, rgba(8,9,10,1) 70%)",
              }}
            >
              {/* Accent glow blob */}
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30"
                style={{
                  background: "radial-gradient(circle, #5B5BD6, transparent 70%)",
                  filter: "blur(60px)",
                  animation: "blobMove1 20s ease-in-out infinite alternate",
                  willChange: "transform",
                }}
              />

              <FileText className="relative z-10 mb-6 h-12 w-12 text-[#5B5BD6]" />
              <h2
                className="relative z-10 font-bold tracking-[-0.03em]"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
              >
                Prêt à arrêter de perdre du temps
                <br className="hidden sm:block" /> sur vos devis ?
              </h2>
              <p className="relative z-10 mt-4 max-w-lg text-base text-[#8b8d9e]">
                Créez votre premier devis en 30 secondes avec l&apos;IA.
                Gratuit, sans engagement, sans carte bancaire.
              </p>

              <div className="relative z-10 mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="btn-shimmer group inline-flex items-center gap-2 rounded-xl bg-[#5B5BD6] px-8 py-4 text-base font-bold text-white shadow-[0_0_48px_rgba(91,91,214,0.4)] transition-all hover:shadow-[0_0_64px_rgba(91,91,214,0.55)] hover:brightness-110"
                >
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-base font-medium backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
                >
                  Voir la démo
                </button>
              </div>

              <p className="relative z-10 mt-6 text-sm text-[#8b8d9e]">
                Sans carte bancaire · Accès immédiat · Support français
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <DevizlyLogo width={120} height={32} className="text-white" />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#8b8d9e]">
              <a href="#fonctionnalites" className="transition-colors hover:text-white">Fonctionnalités</a>
              <a href="#tarifs" className="transition-colors hover:text-white">Tarifs</a>
              <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
              <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
              <Link href="/login" className="transition-colors hover:text-white">Connexion</Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#8b8d9e]/50">
              <span className="font-medium text-[#8b8d9e]/70">Solutions :</span>
              <Link href="/logiciel-devis-artisan" className="hover:text-[#8b8d9e]">Logiciel devis artisan</Link>
              <Link href="/devis-auto-entrepreneur" className="hover:text-[#8b8d9e]">Devis auto-entrepreneur</Link>
              <Link href="/logiciel-facturation-freelance" className="hover:text-[#8b8d9e]">Facturation freelance</Link>
              <Link href="/devis-batiment-gratuit" className="hover:text-[#8b8d9e]">Devis bâtiment</Link>
              <Link href="/creer-devis-en-ligne" className="hover:text-[#8b8d9e]">Créer devis en ligne</Link>
              <Link href="/generateur-devis-ia" className="hover:text-[#8b8d9e]">Générateur devis IA</Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8b8d9e]">
              <Shield className="h-3.5 w-3.5" />
              <span>Conforme RGPD</span>
              <span className="mx-1">·</span>
              <span>Hébergé en France</span>
            </div>
          </div>

          <div className="my-8 h-px bg-white/[0.04]" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#8b8d9e]/50">
              <Link href="/mentions-legales" className="hover:text-[#8b8d9e]">Mentions légales</Link>
              <Link href="/cgv" className="hover:text-[#8b8d9e]">CGV</Link>
              <Link href="/cgu" className="hover:text-[#8b8d9e]">CGU</Link>
              <Link href="/confidentialite" className="hover:text-[#8b8d9e]">Confidentialité</Link>
              <Link href="/cookies" className="hover:text-[#8b8d9e]">Cookies</Link>
              <Link href="/securite" className="hover:text-[#8b8d9e]">Sécurité</Link>
            </div>
            <p className="text-xs text-[#8b8d9e]/50">
              &copy; {new Date().getFullYear()} NBHC SAS — SIREN 102 637 899 — 55 Rue Henri Clément, 71100 Saint-Rémy
            </p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════
          VIDEO DEMO MODAL
          ══════════════════════════════════════════════ */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.06] bg-[#08090a]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/[0.06] p-2 text-white transition-opacity hover:opacity-80"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <video autoPlay playsInline controls className="w-full">
              <source src="/marketing/demo-devizly-v2.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          PROACTIVE CHAT WIDGET
          ══════════════════════════════════════════════ */}
      {chatShown && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="glass fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 transition-all hover:scale-[1.02]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B5BD6]/15">
            <MessageCircle className="h-5 w-5 text-[#5B5BD6]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-[#eeeef0]">Une question sur les tarifs ?</p>
            <p className="text-xs text-[#8b8d9e]">Je réponds en 2min</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setChatShown(false); }}
            className="ml-1 rounded-full p-1 text-[#8b8d9e] hover:text-[#eeeef0]"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </button>
      )}

      {chatOpen && (
        <div className="glass fixed bottom-6 right-6 z-50 w-[360px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#5B5BD6]/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B5BD6]/15">
                <MessageCircle className="h-4 w-4 text-[#5B5BD6]" />
              </div>
              <div>
                <p className="text-sm font-semibold">Devizly</p>
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
                className="btn-shimmer w-full rounded-xl bg-[#5B5BD6] py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
