import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de cookies | Devizly",
  description:
    "Politique de cookies de Devizly — cookies essentiels uniquement.",
  alternates: { canonical: "https://devizly.fr/cookies" },
};

const SECTIONS = [
  { id: "section-1", label: "Qu'est-ce qu'un cookie ?" },
  { id: "section-2", label: "Cookies utilisés par Devizly" },
  { id: "section-3", label: "Gestion des cookies" },
  { id: "section-4", label: "Base légale" },
  { id: "section-5", label: "Contact" },
] as const;

export default function CookiesPage() {
  return (
    <div className="max-w-3xl">
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Politique de cookies
      </h1>
      <p className="mt-3 text-base text-slate-500">
        Dernière mise à jour : mars 2026 &middot; SAS NBHC
      </p>

      {/* Summary box */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-sm font-semibold text-slate-700">En résumé :</p>
        <ul className="mt-3 space-y-2">
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            Zéro cookie publicitaire
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            Zéro tracking cross-site
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            Cookies strictement nécessaires uniquement
          </li>
        </ul>
      </div>

      {/* Table of contents */}
      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold text-slate-700">Sommaire</p>
        <ol className="mt-3 space-y-1.5">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm text-violet-600 transition-colors hover:text-violet-500"
              >
                {i + 1}. {s.label}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* Section 1 */}
      <h2
        id="section-1"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        1. Qu&apos;est-ce qu&apos;un cookie ?
      </h2>
      <p className="leading-relaxed text-slate-600">
        Un cookie est un petit fichier texte stocké sur votre navigateur
        lorsque vous visitez un site web. Les cookies permettent au site de
        mémoriser vos préférences et de fonctionner correctement.
      </p>

      {/* Section 2 */}
      <h2
        id="section-2"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        2. Cookies utilisés par Devizly
      </h2>

      <h3 className="mt-8 mb-3 text-base font-semibold text-slate-700">
        2.1 Cookies strictement nécessaires
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600">
        Ces cookies sont indispensables au fonctionnement du site et ne peuvent
        pas être désactivés. Conformément à la directive ePrivacy et aux
        recommandations de la CNIL, ils ne nécessitent pas de consentement.
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Cookie
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Finalité
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Durée
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Émetteur
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                sb-*-auth-token
              </td>
              <td className="px-4 py-3 text-slate-600">
                Session d&apos;authentification Supabase
              </td>
              <td className="px-4 py-3 text-slate-600">Session / 7 jours</td>
              <td className="px-4 py-3 text-slate-600">Supabase</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                cookie-consent
              </td>
              <td className="px-4 py-3 text-slate-600">
                Mémorisation du choix de consentement cookies
              </td>
              <td className="px-4 py-3 text-slate-600">6 mois</td>
              <td className="px-4 py-3 text-slate-600">Devizly</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 mb-3 text-base font-semibold text-slate-700">
        2.2 Cookies tiers
      </h3>
      <p className="leading-relaxed text-slate-600">
        Devizly n&apos;utilise <strong>aucun</strong> cookie de :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">Publicité ou remarketing</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">Tracking cross-site</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">Réseaux sociaux</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Analytics (Google Analytics, etc.)
          </span>
        </li>
      </ul>

      {/* Green callout: Zéro tracking */}
      <div className="my-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-5">
        <p className="font-semibold text-green-800">Zéro tracking</p>
        <p className="mt-1 text-sm text-green-700">
          Devizly n&apos;utilise aucun cookie publicitaire, de remarketing, de
          tracking cross-site ou de réseaux sociaux.
        </p>
      </div>

      <h3 className="mt-8 mb-3 text-base font-semibold text-slate-700">
        2.3 Cookies Stripe
      </h3>
      <p className="leading-relaxed text-slate-600">
        Lors d&apos;un paiement, Stripe peut déposer des cookies techniques
        nécessaires à la sécurité de la transaction (détection de fraude). Ces
        cookies sont soumis à la{" "}
        <a
          href="https://stripe.com/fr/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:text-violet-500"
        >
          politique de confidentialité de Stripe
        </a>
        .
      </p>

      {/* Section 3 */}
      <h2
        id="section-3"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        3. Gestion des cookies
      </h2>
      <p className="leading-relaxed text-slate-600">
        Vous pouvez à tout moment gérer ou supprimer les cookies via les
        paramètres de votre navigateur :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Chrome : Paramètres &rarr; Confidentialité et sécurité &rarr;
            Cookies
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Firefox : Paramètres &rarr; Vie privée et sécurité &rarr; Cookies
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Safari : Préférences &rarr; Confidentialité &rarr; Cookies
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Edge : Paramètres &rarr; Cookies et autorisations de site
          </span>
        </li>
      </ul>

      {/* Amber callout: Note */}
      <div className="my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
        <p className="font-semibold text-amber-800">Note</p>
        <p className="mt-1 text-sm text-amber-700">
          La suppression des cookies d&apos;authentification nécessitera une
          reconnexion à votre compte.
        </p>
      </div>

      {/* Section 4 */}
      <h2
        id="section-4"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        4. Base légale
      </h2>
      <p className="leading-relaxed text-slate-600">
        Conformément à l&apos;article 82 de la loi Informatique et Libertés et
        aux lignes directrices de la CNIL du 17 septembre 2020 :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Les cookies strictement nécessaires sont exemptés de consentement
            (article 82 alinéa 2)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Aucun cookie soumis à consentement n&apos;est déposé sur Devizly
          </span>
        </li>
      </ul>

      {/* Section 5 */}
      <h2
        id="section-5"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        5. Contact
      </h2>
      <p className="leading-relaxed text-slate-600">
        Pour toute question relative aux cookies, contactez-nous à :{" "}
        <a
          href="mailto:privacy@devizly.fr"
          className="font-medium text-violet-600 hover:text-violet-500"
        >
          privacy@devizly.fr
        </a>
      </p>

      {/* Footer note */}
      <div className="mt-16 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">
          Pour toute question relative aux cookies :{" "}
          <a
            href="mailto:privacy@devizly.fr"
            className="font-medium text-violet-600 hover:text-violet-500"
          >
            privacy@devizly.fr
          </a>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          NBHC SAS — Capital 500 &euro; — RCS Chalon-sur-Saône — SIREN 102 637
          899
        </p>
      </div>
    </div>
  );
}
