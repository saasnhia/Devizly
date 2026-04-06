"use client";

import Link from "next/link";
import { DevizlyLogo } from "@/components/devizly-logo";
import { Shield } from "lucide-react";

export function MinimalFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto max-w-6xl px-6">
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
            <span className="mx-1">&middot;</span>
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
  );
}
