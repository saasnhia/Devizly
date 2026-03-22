import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGU — Conditions Générales d'Utilisation | Devizly",
  description:
    "Conditions Générales d'Utilisation de Devizly — règles d'utilisation de la plateforme.",
  alternates: { canonical: "https://devizly.fr/cgu" },
};

const SECTIONS = [
  { id: "section-1", label: "Acceptation des conditions" },
  { id: "section-2", label: "Description du service" },
  { id: "section-3", label: "Inscription et compte" },
  { id: "section-4", label: "Obligations de l'utilisateur" },
  { id: "section-5", label: "Intelligence artificielle" },
  { id: "section-6", label: "Propriété des données" },
  { id: "section-7", label: "Disponibilité du service" },
  { id: "section-8", label: "Limitation de responsabilité" },
  { id: "section-9", label: "Suspension et résiliation" },
  { id: "section-10", label: "Modification des CGU" },
  { id: "section-11", label: "Droit applicable" },
] as const;

export default function CGUPage() {
  return (
    <div className="max-w-3xl">
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Conditions Générales d&apos;Utilisation
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
            Vous restez propriétaire de vos données
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            L&apos;IA génère des suggestions — vous validez
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            Résiliable à tout moment
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
        1. Acceptation des conditions
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;utilisation de Devizly implique l&apos;acceptation pleine et
        entière des présentes CGU. Si vous n&apos;acceptez pas ces conditions,
        veuillez ne pas utiliser le service.
      </p>

      {/* Section 2 */}
      <h2
        id="section-2"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        2. Description du service
      </h2>
      <p className="leading-relaxed text-slate-600">
        Devizly est une plateforme SaaS permettant aux freelancers et
        indépendants de :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Générer des devis professionnels à l&apos;aide de l&apos;IA Mistral
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Envoyer, suivre et faire signer des devis en ligne
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Générer automatiquement des factures
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Encaisser des paiements via Stripe
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Gérer un pipeline commercial
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Relancer automatiquement les clients
          </span>
        </li>
      </ul>

      {/* Section 3 */}
      <h2
        id="section-3"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        3. Inscription et compte
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;accès aux services nécessite la création d&apos;un compte.
        L&apos;utilisateur s&apos;engage à :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Fournir des informations exactes et à jour
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Préserver la confidentialité de ses identifiants
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Informer immédiatement Devizly de toute utilisation non autorisée de
            son compte
          </span>
        </li>
      </ul>
      <p className="mt-4 leading-relaxed text-slate-600">
        L&apos;authentification est gérée via Supabase Auth (email/mot de
        passe). L&apos;utilisateur est seul responsable de la sécurité de son
        mot de passe.
      </p>

      {/* Section 4 */}
      <h2
        id="section-4"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        4. Obligations de l&apos;utilisateur
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;utilisateur s&apos;engage à :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Utiliser le service conformément à sa destination (gestion de devis
            et facturation professionnelle)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Ne pas utiliser le service à des fins illicites, frauduleuses ou
            contraires aux bonnes m&oelig;urs
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Vérifier et valider le contenu des devis générés par l&apos;IA avant
            envoi à ses clients
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Respecter la réglementation en vigueur, notamment en matière de
            facturation et de TVA
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Ne pas tenter de contourner les limitations techniques du service
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Ne pas procéder à du scraping, reverse-engineering ou toute forme
            d&apos;extraction automatisée
          </span>
        </li>
      </ul>

      {/* Section 5 */}
      <h2
        id="section-5"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        5. Intelligence artificielle
      </h2>
      <p className="leading-relaxed text-slate-600">
        Devizly utilise le modèle Mistral AI, hébergé en France, pour assister
        la génération de devis. L&apos;utilisateur reconnaît que :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Les suggestions de l&apos;IA sont fournies à titre indicatif
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            L&apos;utilisateur reste seul responsable du contenu final de ses
            devis
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Les données envoyées à Mistral AI sont anonymisées (aucune donnée
            nominative client n&apos;est transmise)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Les données ne sont pas utilisées par Mistral AI pour
            l&apos;entraînement de ses modèles
          </span>
        </li>
      </ul>

      {/* Amber callout: IA */}
      <div className="my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
        <p className="font-semibold text-amber-800">
          Important : Suggestions IA
        </p>
        <p className="mt-1 text-sm text-amber-700">
          L&apos;IA génère des suggestions, vous restez responsable de la
          vérification.
        </p>
      </div>

      {/* Section 6 */}
      <h2
        id="section-6"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        6. Propriété des données
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;utilisateur reste propriétaire de toutes les données qu&apos;il
        saisit dans Devizly (informations clients, devis, factures). En cas de
        résiliation, l&apos;utilisateur peut exporter ses données au format CSV
        avant la fermeture de son compte.
      </p>

      {/* Green callout: Export */}
      <div className="my-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-5">
        <p className="font-semibold text-green-800">
          Vos données vous appartiennent
        </p>
        <p className="mt-1 text-sm text-green-700">
          Export CSV disponible à tout moment.
        </p>
      </div>

      {/* Section 7 */}
      <h2
        id="section-7"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        7. Disponibilité du service
      </h2>
      <p className="leading-relaxed text-slate-600">
        Devizly s&apos;efforce d&apos;assurer une disponibilité du service
        24h/24 et 7j/7. Toutefois, l&apos;éditeur ne garantit pas une
        disponibilité ininterrompue et ne pourra être tenu responsable en cas
        de :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Maintenance programmée (avec notification préalable lorsque possible)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Panne des fournisseurs tiers (Supabase, Vercel, Stripe, Mistral AI)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">Cas de force majeure</span>
        </li>
      </ul>

      {/* Section 8 */}
      <h2
        id="section-8"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        8. Limitation de responsabilité
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;éditeur ne pourra être tenu responsable des dommages indirects
        résultant de l&apos;utilisation ou de l&apos;impossibilité
        d&apos;utiliser le service. La responsabilité totale de l&apos;éditeur
        est limitée au montant des sommes versées par l&apos;utilisateur au
        cours des 12 derniers mois.
      </p>

      {/* Section 9 */}
      <h2
        id="section-9"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        9. Suspension et résiliation
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;éditeur se réserve le droit de suspendre ou supprimer un compte
        utilisateur en cas de :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Violation des présentes CGU
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Utilisation frauduleuse ou abusive du service
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Non-paiement de l&apos;abonnement
          </span>
        </li>
      </ul>

      {/* Section 10 */}
      <h2
        id="section-10"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        10. Modification des CGU
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout
        moment. Les utilisateurs seront informés par email des modifications
        substantielles. La poursuite de l&apos;utilisation du service après
        modification vaut acceptation des nouvelles CGU.
      </p>

      {/* Section 11 */}
      <h2
        id="section-11"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        11. Droit applicable
      </h2>
      <p className="leading-relaxed text-slate-600">
        Les présentes CGU sont soumises au droit français. Tout litige sera
        soumis au Tribunal de Commerce de Chalon-sur-Saône.
      </p>

      {/* Footer note */}
      <div className="mt-16 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">
          Pour toute question concernant ces conditions :{" "}
          <a
            href="mailto:contact@devizly.fr"
            className="font-medium text-violet-600 hover:text-violet-500"
          >
            contact@devizly.fr
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
