"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    src: "/landing-screens/hero-ai-builder.webp",
    alt: "Builder IA Devizly — saisissez une description, l'IA génère le devis complet",
    label: "Décrivez votre mission → l'IA structure + propose des prix marché",
    url: "devizly.fr/devis/nouveau",
  },
  {
    src: "/landing-screens/hero-signature.webp",
    alt: "Partage du devis — envoyez par lien, WhatsApp, Email ou SMS",
    label: "Partagez par lien, WhatsApp, Email ou SMS en un clic",
    url: "devizly.fr/devis",
  },
  {
    src: "/landing-screens/hero-pipeline.webp",
    alt: "Pipeline Kanban — suivez chaque devis de prospect à payé",
    label: "Pipeline visuel + CA en temps réel",
    url: "devizly.fr/dashboard",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <div
      className="relative mx-auto max-w-5xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 rounded-t-xl border border-b-0 border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-slate-500">
          {slide.url}
        </div>
      </div>

      {/* Image area */}
      <div className="relative overflow-hidden rounded-b-xl border border-t-0 border-white/10">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={i} className="w-full shrink-0">
              <Image
                src={s.src}
                alt={s.alt}
                width={1400}
                height={780}
                className="w-full"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
          aria-label="Slide précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
          aria-label="Slide suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Caption + dots */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <p className="text-center text-sm font-medium text-slate-400">
          {slide.label}
        </p>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "w-6 bg-violet-500"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Glow behind */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-b from-violet-500/15 via-indigo-500/10 to-transparent blur-2xl" />
    </div>
  );
}
