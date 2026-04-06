"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { segmentCopy } from "../data/landing-data";
import { MagneticButton } from "../magnetic-button";

gsap.registerPlugin(ScrollTrigger);

function DevisPreview() {
  return (
    <div className="devis-preview-card relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[#5B5BD6]/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#5B5BD6]">D</span>
          </div>
          <span className="text-xs font-semibold text-slate-300">Devizly</span>
        </div>
        <span className="text-[10px] text-slate-500">DEV-0042</span>
      </div>

      <div className="mb-5 rounded-lg bg-white/[0.03] px-3 py-2">
        <p className="text-[10px] text-slate-500">Client</p>
        <p className="text-xs font-medium text-slate-300">Restaurant Le Comptoir</p>
        <p className="text-[10px] text-slate-500">contact@lecomptoir.fr</p>
      </div>

      <div className="space-y-2 mb-5">
        {[
          { desc: "Maquettes UI/UX (5 pages)", price: "1 800" },
          { desc: "Développement Next.js", price: "3 200" },
          { desc: "Système de réservation", price: "1 500" },
          { desc: "Mise en ligne + formation", price: "400" },
        ].map((item) => (
          <div key={item.desc} className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{item.desc}</span>
            <span className="text-white font-medium">{item.price} &euro;</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-white/[0.06] mb-3" />
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-semibold text-slate-300">Total TTC</span>
        <span className="text-lg font-bold text-[#5B5BD6]">6 900 &euro;</span>
      </div>

      <div className="rounded-lg border border-dashed border-white/[0.08] p-3 text-center">
        <p className="text-[10px] text-slate-500 mb-1">Signature du client</p>
        <svg viewBox="0 0 200 40" className="mx-auto h-6 w-24 text-slate-400">
          <path d="M10 30 Q30 5 60 25 T120 15 T180 25" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export function EditorialHero({ segment }: { segment: string }) {
  const seg = segmentCopy[segment];
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // 1d. Badge — scale + fade
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6 },
        0
      );

      // 1a. Title mask reveal — line by line
      tl.fromTo(
        line1Ref.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1 },
        0.3
      );
      tl.fromTo(
        line2Ref.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1 },
        0.45
      );

      // Subtitle
      tl.fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.8
      );

      // CTA
      tl.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        1
      );

      // Trust line
      tl.fromTo(
        trustRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        1.1
      );

      // Devis preview fade-in
      tl.fromTo(
        previewRef.current,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 1 },
        0.5
      );

      // 1b. Parallax on DevisPreview
      if (previewRef.current) {
        gsap.to(previewRef.current, {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* 1c. Animated gradient blob */}
      <div
        className="hero-blob pointer-events-none absolute"
        style={{
          width: "800px",
          height: "500px",
          left: "15%",
          top: "25%",
          background: "radial-gradient(ellipse at center, rgba(91,91,214,0.10), transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-5 lg:gap-16">
        {/* Left — Text */}
        <div className="lg:col-span-3">
          {/* Badge */}
          <div ref={badgeRef} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5B5BD6]/30 bg-[#5B5BD6]/10 px-4 py-1.5 opacity-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5B5BD6] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5B5BD6]" />
            </span>
            <span className="text-xs font-medium text-[#818cf8]">
              {seg ? seg.badge : "Propulsé par l'IA — hébergé en France"}
            </span>
          </div>

          {/* Title with mask reveal */}
          <h1
            className="font-display font-extrabold tracking-[-0.04em] leading-[1.0] text-white"
            style={{ fontSize: "clamp(48px, 6vw, 88px)" }}
          >
            {seg ? (
              <span className="overflow-hidden inline-block">
                <span ref={line1Ref} className="inline-block opacity-0">{seg.hero}</span>
              </span>
            ) : (
              <>
                <span className="overflow-hidden inline-block">
                  <span ref={line1Ref} className="inline-block opacity-0">
                    Vos devis, signés
                  </span>
                </span>
                <br />
                <span className="overflow-hidden inline-block">
                  <span ref={line2Ref} className="inline-block opacity-0">
                    et payés en{" "}
                    <span className="text-[#5B5BD6]">30 secondes.</span>
                  </span>
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p ref={subtitleRef} className="mt-6 max-w-lg text-lg text-slate-400 opacity-0">
            L&apos;IA structure vos devis. Vos clients signent depuis leur téléphone.
          </p>

          {/* CTA */}
          <div ref={ctaRef} className="mt-8 opacity-0">
            <MagneticButton
              as="a"
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#5B5BD6] px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-[#4B4BC6] hover:shadow-[0_0_48px_rgba(91,91,214,0.4)]"
            >
              Créer mon premier devis
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </div>

          {/* Trust line */}
          <div ref={trustRef} className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 opacity-0">
            <span>&#10003; Sans carte bancaire</span>
            <span>&#10003; RGPD</span>
            <span>&#10003; IA française</span>
          </div>
        </div>

        {/* Right — Devis Preview with parallax */}
        <div ref={previewRef} className="lg:col-span-2 opacity-0">
          <DevisPreview />
        </div>
      </div>
    </section>
  );
}
