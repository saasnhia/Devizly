import Link from "next/link";
import { DevizlyLogo } from "@/components/devizly-logo";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#06060b] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/[0.06] bg-[#06060b]/80 backdrop-blur-xl">
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
              className="rounded-lg bg-[#5B5BD6] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#5B5BD6]/25 transition-all hover:shadow-[#5B5BD6]/40 hover:brightness-110"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-slate-500 sm:px-6">
          <Link href="/" className="transition-colors hover:text-white">Accueil</Link>
          <Link href="/pricing" className="transition-colors hover:text-white">Tarifs</Link>
          <Link href="/logiciel-devis-artisan" className="transition-colors hover:text-white">Devis artisan</Link>
          <Link href="/devis-auto-entrepreneur" className="transition-colors hover:text-white">Auto-entrepreneur</Link>
          <Link href="/logiciel-facturation-freelance" className="transition-colors hover:text-white">Facturation freelance</Link>
        </div>
        <div className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-slate-600 sm:px-6">
          <Link href="/mentions-legales" className="transition-colors hover:text-slate-400">Mentions legales</Link>
          <Link href="/confidentialite" className="transition-colors hover:text-slate-400">Confidentialite</Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Devizly. Tous droits reserves.
        </p>
      </footer>
    </div>
  );
}
