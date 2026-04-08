import Link from "next/link";
import { DevizlyLogo } from "@/components/devizly-logo";

const productLinks = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "/blog" },
  { label: "Démo", href: "/demo" },
];

const solutionLinks = [
  { label: "Logiciel devis artisan", href: "/logiciel-devis-artisan" },
  { label: "Devis auto-entrepreneur", href: "/devis-auto-entrepreneur" },
  { label: "Facturation freelance", href: "/logiciel-facturation-freelance" },
  { label: "Devis bâtiment", href: "/devis-batiment-gratuit" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV", href: "/cgv" },
  { label: "CGU", href: "/cgu" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Cookies", href: "/cookies" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => {
          const isAnchor = link.href.startsWith("#");
          const Tag = isAnchor ? "a" : Link;
          return (
            <li key={link.label}>
              <Tag
                href={link.href}
                className="text-[13px] text-[#8b8d9e] transition-colors hover:text-white"
              >
                {link.label}
              </Tag>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MinimalFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-6 pb-10 pt-[60px]">
      <div className="mx-auto max-w-6xl">
        {/* Grid */}
        <div className="grid grid-cols-2 gap-10 sm:gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              <DevizlyLogo width={120} height={32} className="text-white" />
            </Link>
            <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-[#8b8d9e]">
              Devis, signature et paiement &mdash; un seul outil, pens&eacute;
              pour les ind&eacute;pendants fran&ccedil;ais. &Eacute;dit&eacute; par SAS NBHC.
            </p>
          </div>

          {/* Produit */}
          <FooterColumn title="Produit" links={productLinks} />

          {/* Solutions */}
          <FooterColumn title="Solutions" links={solutionLinks} />

          {/* Légal */}
          <FooterColumn title="Légal" links={legalLinks} />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.04] pt-7 sm:flex-row">
          <p className="text-xs text-[#8b8d9e]/50">
            &copy; {new Date().getFullYear()} NBHC SAS &middot; SIREN 102 637 899 &middot; 55 Rue Henri Cl&eacute;ment, 71100 Saint-R&eacute;my
          </p>
          <p className="text-xs text-[#8b8d9e]/50">
            &#127467;&#127479; H&eacute;berg&eacute; en France &middot; Conforme RGPD
          </p>
        </div>
      </div>
    </footer>
  );
}
