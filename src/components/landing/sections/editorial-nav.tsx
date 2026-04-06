"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { DevizlyLogo } from "@/components/devizly-logo";
import { Menu, X } from "lucide-react";

export function EditorialNav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      // Hide on scroll down, show on scroll up (only after 100px)
      if (y > 100) {
        setHidden(y > lastScrollY.current && y - lastScrollY.current > 5);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id: string) {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "bg-[#08090a]/80 backdrop-blur-xl border-b border-white/[0.04]"
          : "bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link href="/" className="transition-all hover:opacity-80">
          <DevizlyLogo
            width={120}
            height={32}
            className={`text-white transition-transform duration-300 ${
              scrolled ? "scale-95" : "scale-100"
            }`}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <button onClick={() => scrollTo("fonctionnalites")} className="text-sm text-slate-400 transition-colors hover:text-white">
            Fonctionnalités
          </button>
          <button onClick={() => scrollTo("tarifs")} className="text-sm text-slate-400 transition-colors hover:text-white">
            Tarifs
          </button>
          <Link href="/blog" className="text-sm text-slate-400 transition-colors hover:text-white">
            Blog
          </Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className={`text-slate-400 transition-all hover:text-white ${scrolled ? "text-xs" : "text-sm"}`}>
            Se connecter
          </Link>
          <Link
            href="/signup"
            className={`rounded-xl bg-[#5B5BD6] font-semibold text-white transition-all hover:bg-[#4B4BC6] ${
              scrolled ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"
            }`}
          >
            Essayer gratuitement &rarr;
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2" aria-label="Menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.04] bg-[#08090a]/95 backdrop-blur-xl px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            <button onClick={() => scrollTo("fonctionnalites")} className="text-left text-sm text-slate-300 hover:text-white">
              Fonctionnalités
            </button>
            <button onClick={() => scrollTo("tarifs")} className="text-left text-sm text-slate-300 hover:text-white">
              Tarifs
            </button>
            <Link href="/blog" className="text-sm text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>
              Blog
            </Link>
            <div className="h-px bg-white/[0.06]" />
            <Link href="/login" className="text-sm text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#5B5BD6] px-5 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Essayer gratuitement &rarr;
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
