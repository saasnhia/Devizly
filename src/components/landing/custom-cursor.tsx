"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Only on md+ (pointer devices)
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    if (!mq.matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      // Dot follows exactly
      gsap.set(dot, { x: e.clientX, y: e.clientY });
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.15);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.15);
      gsap.set(ring, { x: ringPos.current.x, y: ringPos.current.y });
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    // Hover effects
    const interactiveSelector = "a, button, [role='button'], input, textarea, select";
    const glowSelector = ".glow-card, .devis-preview-card";

    const onEnterInteractive = () => {
      gsap.to(ring, { scale: 1.5, borderColor: "rgba(91,91,214,0.8)", duration: 0.3 });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };
    const onLeaveInteractive = () => {
      gsap.to(ring, { scale: 1, borderColor: "rgba(91,91,214,0.4)", duration: 0.3 });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };
    const onEnterGlow = () => {
      gsap.to(ring, { scale: 2, background: "rgba(91,91,214,0.1)", duration: 0.3 });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };
    const onLeaveGlow = () => {
      gsap.to(ring, { scale: 1, background: "transparent", duration: 0.3 });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    const attachHovers = () => {
      document.querySelectorAll(interactiveSelector).forEach((el) => {
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });
      document.querySelectorAll(glowSelector).forEach((el) => {
        el.addEventListener("mouseenter", onEnterGlow);
        el.addEventListener("mouseleave", onLeaveGlow);
      });
    };
    // Delay to let DOM mount
    const tid = setTimeout(attachHovers, 500);

    window.addEventListener("mousemove", onMove);

    return () => {
      clearTimeout(tid);
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMove);
      document.querySelectorAll(interactiveSelector).forEach((el) => {
        el.removeEventListener("mouseenter", onEnterInteractive);
        el.removeEventListener("mouseleave", onLeaveInteractive);
      });
      document.querySelectorAll(glowSelector).forEach((el) => {
        el.removeEventListener("mouseenter", onEnterGlow);
        el.removeEventListener("mouseleave", onLeaveGlow);
      });
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B5BD6] will-change-transform md:block"
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5B5BD6]/40 will-change-transform md:block"
      />
    </>
  );
}
