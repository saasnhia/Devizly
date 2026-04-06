"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const lenis = new Lenis({
      duration: prefersReduced ? 0 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReduced,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Animate all reveal elements
    if (!prefersReduced) {
      const reveals = document.querySelectorAll(
        ".reveal-up, .reveal-left, .reveal-right, .reveal-scale"
      );
      reveals.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    } else {
      // Instantly show all reveal elements
      document
        .querySelectorAll(
          ".reveal-up, .reveal-left, .reveal-right, .reveal-scale"
        )
        .forEach((el) => {
          (el as HTMLElement).style.opacity = "1";
          (el as HTMLElement).style.transform = "none";
        });
    }

    // Glow card mouse tracking
    const glowCards = document.querySelectorAll(".glow-card");
    const handlers: Array<{ el: Element; handler: (e: Event) => void }> = [];
    glowCards.forEach((card) => {
      const handler = (e: Event) => {
        const me = e as MouseEvent;
        const rect = (card as HTMLElement).getBoundingClientRect();
        (card as HTMLElement).style.setProperty(
          "--mouse-x",
          `${me.clientX - rect.left}px`
        );
        (card as HTMLElement).style.setProperty(
          "--mouse-y",
          `${me.clientY - rect.top}px`
        );
      };
      card.addEventListener("mousemove", handler);
      handlers.push({ el: card, handler });
    });

    return () => {
      handlers.forEach(({ el, handler }) =>
        el.removeEventListener("mousemove", handler)
      );
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <>{children}</>;
}
