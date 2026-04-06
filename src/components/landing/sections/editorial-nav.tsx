"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DevizlyLogo } from "@/components/devizly-logo";
import { Menu, X } from "lucide-react";

export function EditorialNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
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
        scrolled
          ? "bg-[#08090a]/80 backdrop-blur-xl border-b border-white/[0.04]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <DevizlyLogo width={120} height={32} className="text-white" />
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
          <Link href="/login" className="text-sm text-slate-400 transition-colors hover:text-white">
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-[#5B5BD6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#4B4BC6]"
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
