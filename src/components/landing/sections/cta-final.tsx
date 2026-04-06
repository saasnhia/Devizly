"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "../magnetic-button";

gsap.registerPlugin(ScrollTrigger);

export function CtaFinal({ onVideoOpen }: { onVideoOpen: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !titleRef.current) return;

    const ctx = gsap.context(() => {
      // Word by word reveal
      const words = titleRef.current!.querySelectorAll(".cta-word");
      gsap.fromTo(
        words,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const line1 = "Votre prochain devis,";
  const line2 = "en 30 secondes.";

  return (
    <section ref={sectionRef} className="relative py-32 lg:py-40">
      {/* 7. Breathing glow background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="breathing-glow"
          style={{
            width: "600px",
            height: "400px",
            background: "radial-gradient(ellipse at center, rgba(91,91,214,0.10), transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Title — word by word */}
        <h2
          ref={titleRef}
          className="text-5xl font-bold text-white lg:text-7xl"
        >
          {line1.split(" ").map((word, i) => (
            <span key={i} className="cta-word inline-block opacity-0 mr-[0.3em]">
              {word}
            </span>
          ))}
          <br />
          {line2.split(" ").map((word, i) => (
            <span
              key={`l2-${i}`}
              className={`cta-word inline-block opacity-0 mr-[0.3em] ${
                i >= 2 ? "text-[#5B5BD6]" : ""
              }`}
            >
              {word}
            </span>
          ))}
        </h2>

        <p className="reveal-up mt-6 text-slate-400">
          Sans carte bancaire. Sans engagement.
        </p>

        <div className="reveal-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* CTA with ring pulse */}
          <div className="relative">
            <div className="cta-ring-pulse absolute -inset-1 rounded-xl border border-[#5B5BD6]/30" />
            <MagneticButton
              as="a"
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#5B5BD6] px-10 py-5 text-lg font-semibold text-white transition-all hover:bg-[#4B4BC6] hover:shadow-[0_0_48px_rgba(91,91,214,0.4)]"
            >
              Créer mon compte gratuit
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </div>
          <button
            onClick={onVideoOpen}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
          >
            Voir la démo
          </button>
        </div>

        <p className="reveal-up mt-6 text-sm text-slate-500">
          Sans carte bancaire &middot; Accès immédiat &middot; Support français
        </p>
      </div>
    </section>
  );
}
