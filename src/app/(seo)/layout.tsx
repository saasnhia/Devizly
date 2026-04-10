import Link from "next/link";
import { DevizlyLogo } from "@/components/devizly-logo";

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Minimal navbar */}
      <nav className="border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="transition-transform hover:scale-105">
            <DevizlyLogo width={130} height={34} className="text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-slate-300 transition-colors hover:text-white"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        {children}
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-slate-500 sm:px-6">
          <Link href="/" className="transition-colors hover:text-white">Accueil</Link>
          <Link href="/pricing" className="transition-colors hover:text-white">Tarifs</Link>
          <Link href="/logiciel-devis-artisan" className="transition-colors hover:text-white">Devis artisan</Link>
          <Link href="/devis-auto-entrepreneur" className="transition-colors hover:text-white">Auto-entrepreneur</Link>
          <Link href="/logiciel-facturation-freelance" className="transition-colors hover:text-white">Facturation freelance</Link>
          <Link href="/devis-batiment-gratuit" className="transition-colors hover:text-white">Devis bâtiment</Link>
          <Link href="/creer-devis-en-ligne" className="transition-colors hover:text-white">Créer devis en ligne</Link>
          <Link href="/generateur-devis-ia" className="transition-colors hover:text-white">Générateur IA</Link>
          <Link href="/facture-electronique-2026" className="transition-colors hover:text-white">Réforme 2026</Link>
          <Link href="/facturx-conforme" className="transition-colors hover:text-white">Factur-X</Link>
          <Link href="/integration-pennylane" className="transition-colors hover:text-white">Pennylane</Link>
        </div>
        <div className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4 text-xs text-slate-600 sm:px-6">
          <Link href="/logiciel-devis/plombier" className="transition-colors hover:text-slate-400">Devis plombier</Link>
          <Link href="/logiciel-devis/electricien" className="transition-colors hover:text-slate-400">Devis électricien</Link>
          <Link href="/logiciel-devis/peintre" className="transition-colors hover:text-slate-400">Devis peintre</Link>
          <Link href="/logiciel-devis/couvreur" className="transition-colors hover:text-slate-400">Devis couvreur</Link>
          <Link href="/logiciel-devis/macon" className="transition-colors hover:text-slate-400">Devis maçon</Link>
          <Link href="/logiciel-devis/menuisier" className="transition-colors hover:text-slate-400">Devis menuisier</Link>
          <Link href="/logiciel-devis/carreleur" className="transition-colors hover:text-slate-400">Devis carreleur</Link>
          <Link href="/logiciel-devis/climatisation" className="transition-colors hover:text-slate-400">Devis climatisation</Link>
          <Link href="/logiciel-devis/isolation" className="transition-colors hover:text-slate-400">Devis isolation</Link>
          <Link href="/logiciel-devis/renovation" className="transition-colors hover:text-slate-400">Devis rénovation</Link>
        </div>
        <div className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-slate-600 sm:px-6">
          <Link href="/mentions-legales" className="transition-colors hover:text-slate-400">Mentions légales</Link>
          <Link href="/confidentialite" className="transition-colors hover:text-slate-400">Confidentialité</Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Devizly. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
