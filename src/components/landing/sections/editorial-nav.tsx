"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DevizlyLogo } from "@/components/devizly-logo";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Démo", href: "/demo" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "/blog" },
];

export function EditorialNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className="relative z-40 w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <DevizlyLogo width={120} height={32} className="text-white" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = link.href.startsWith("/") && pathname === link.href;
            const cls = `text-sm transition-colors hover:text-white ${
              isActive ? "text-white font-medium" : "text-slate-400"
            }`;
            return link.href.startsWith("/") ? (
              <Link key={link.label} href={link.href} className={cls}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className={cls}>
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-[#5B5BD6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#4B4BC6]"
          >
            Essayer gratuitement &rarr;
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
          aria-label="Menu"
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={`block h-0.5 w-5 bg-white transition-all duration-300 origin-center ${
                mobileOpen ? "translate-y-[4px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-all duration-300 origin-center ${
                mobileOpen ? "-translate-y-[4px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 top-0 z-40 bg-[#08090a]/98 backdrop-blur-xl transition-opacity duration-300 md:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8 px-8">
          {NAV_LINKS.map((link) => {
            const Tag = link.href.startsWith("/") ? Link : "a";
            return (
              <Tag
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-medium text-white transition-colors hover:text-[#818cf8]"
              >
                {link.label}
              </Tag>
            );
          })}
          <div className="mt-4 flex w-full max-w-xs flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-white/10 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-white/[0.04]"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-[#5B5BD6] py-3 text-center text-sm font-semibold text-white transition-all hover:bg-[#4B4BC6]"
            >
              Essayer gratuitement &rarr;
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
