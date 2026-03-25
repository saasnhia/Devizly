import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Devizly",
  description:
    "Politique de confidentialité de Devizly. Traitement des données personnelles conforme RGPD, hébergement européen Supabase, durées de conservation, droits d'accès et suppression.",
  alternates: { canonical: "https://devizly.fr/confidentialite" },
};

const SECTIONS = [
  { id: "section-1", label: "Responsable du traitement" },
  { id: "section-2", label: "Données collectées" },
  { id: "section-3", label: "Intelligence artificielle — Mistral AI" },
  { id: "section-4", label: "Sous-traitants" },
  { id: "section-5", label: "Durée de conservation" },
  { id: "section-6", label: "Vos droits" },
  { id: "section-7", label: "Sécurité" },
  { id: "section-8", label: "Transferts hors UE" },
  { id: "section-9", label: "Modifications" },
] as const;

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl">
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Politique de confidentialité
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
            Données hébergées en France
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            Aucune donnée vendue à des tiers
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            Vos droits RGPD respectés
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

      {/* Section 1 — Responsable du traitement */}
      <h2
        id="section-1"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        1. Responsable du traitement
      </h2>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-700">
                Raison sociale
              </td>
              <td className="px-4 py-2.5 text-slate-600">NBHC</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-700">
                Forme juridique
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                Société par actions simplifiée (SAS)
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-700">
                Capital social
              </td>
              <td className="px-4 py-2.5 text-slate-600">500,00 &euro;</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-700">
                Siège social
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                55 Rue Henri Clément, 71100 Saint-Rémy
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-700">
                SIREN
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                102 637 899 — RCS Chalon-sur-Saône
              </td>
            </tr>
            <tr>
              <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-700">
                Email DPO
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                <a
                  href="mailto:privacy@devizly.fr"
                  className="text-violet-600 hover:text-violet-500"
                >
                  privacy@devizly.fr
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2 — Données collectées */}
      <h2
        id="section-2"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        2. Données collectées
      </h2>
      <p className="leading-relaxed text-slate-600">
        Devizly s&apos;engage à protéger la vie privée de ses utilisateurs
        conformément au Règlement Général sur la Protection des Données (RGPD)
        et à la loi Informatique et Libertés.
      </p>

      <h3 className="mt-8 mb-3 text-base font-semibold text-slate-700">
        2.1 Données des utilisateurs (freelancers)
      </h3>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Donnée
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Finalité
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Base légale
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Email, nom, prénom
              </td>
              <td className="px-4 py-3 text-slate-600">
                Création et gestion du compte
              </td>
              <td className="px-4 py-3 text-slate-600">
                Exécution du contrat
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                SIRET, adresse professionnelle
              </td>
              <td className="px-4 py-3 text-slate-600">
                Mentions obligatoires sur devis/factures
              </td>
              <td className="px-4 py-3 text-slate-600">
                Obligation légale
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Données de connexion (IP, user-agent)
              </td>
              <td className="px-4 py-3 text-slate-600">
                Sécurité, détection de fraude
              </td>
              <td className="px-4 py-3 text-slate-600">
                Intérêt légitime
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 mb-3 text-base font-semibold text-slate-700">
        2.2 Données des clients finaux
      </h3>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Donnée
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Finalité
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Base légale
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Nom, email, téléphone
              </td>
              <td className="px-4 py-3 text-slate-600">
                Envoi de devis et factures
              </td>
              <td className="px-4 py-3 text-slate-600">
                Intérêt légitime du freelancer
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">Adresse</td>
              <td className="px-4 py-3 text-slate-600">
                Mentions obligatoires facturation
              </td>
              <td className="px-4 py-3 text-slate-600">
                Obligation légale
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Signature électronique
              </td>
              <td className="px-4 py-3 text-slate-600">
                Preuve d&apos;acceptation du devis
              </td>
              <td className="px-4 py-3 text-slate-600">
                Exécution du contrat
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Consultation de devis (date, IP)
              </td>
              <td className="px-4 py-3 text-slate-600">Suivi de lecture</td>
              <td className="px-4 py-3 text-slate-600">
                Intérêt légitime
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 mb-3 text-base font-semibold text-slate-700">
        2.3 Données de paiement
      </h3>
      <p className="leading-relaxed text-slate-600">
        Les données de carte bancaire sont traitées exclusivement par{" "}
        <strong>Stripe</strong> (certifié PCI-DSS niveau 1). Devizly ne stocke
        jamais de numéro de carte bancaire.
      </p>

      {/* Section 3 — Intelligence artificielle */}
      <h2
        id="section-3"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        3. Intelligence artificielle — Mistral AI
      </h2>
      <p className="leading-relaxed text-slate-600">
        Devizly utilise l&apos;API Mistral AI pour la génération de devis. Voici
        les garanties appliquées :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Hébergement :</strong> 100% en France (serveurs Mistral AI)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Anonymisation :</strong> les données envoyées à Mistral sont
            anonymisées — aucun nom de client, email ou donnée nominative
            n&apos;est transmis. Seules les descriptions de prestations et
            paramètres commerciaux sont envoyés.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Pas d&apos;entraînement :</strong> les données transmises à
            Mistral AI ne sont{" "}
            <strong>pas utilisées pour l&apos;entraînement</strong> de ses
            modèles, conformément aux conditions de leur API professionnelle.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Rétention :</strong> Mistral AI ne conserve pas les données
            au-delà du traitement de la requête.
          </span>
        </li>
      </ul>

      {/* Green callout: IA hébergée en France */}
      <div className="my-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-5">
        <p className="font-semibold text-green-800">
          IA hébergée en France
        </p>
        <p className="mt-1 text-sm text-green-700">
          Les données envoyées à Mistral AI sont anonymisées et ne sont jamais
          utilisées pour l&apos;entraînement des modèles.
        </p>
      </div>

      {/* Section 4 — Sous-traitants */}
      <h2
        id="section-4"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        4. Sous-traitants
      </h2>
      <p className="mb-4 leading-relaxed text-slate-600">
        Devizly fait appel aux sous-traitants suivants pour le traitement de
        données personnelles. Des <strong>clauses contractuelles types</strong>{" "}
        (CCT) sont en place pour chaque sous-traitant situé hors de l&apos;UE.
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Sous-traitant
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Fonction
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Localisation
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Garanties
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Supabase
              </td>
              <td className="px-4 py-3 text-slate-600">
                Base de données, authentification
              </td>
              <td className="px-4 py-3 text-slate-600">
                UE (AWS eu-west)
              </td>
              <td className="px-4 py-3 text-slate-600">
                DPA, chiffrement au repos et en transit
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Vercel
              </td>
              <td className="px-4 py-3 text-slate-600">
                Hébergement application
              </td>
              <td className="px-4 py-3 text-slate-600">
                International (CDN)
              </td>
              <td className="px-4 py-3 text-slate-600">
                DPA, clauses contractuelles types
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Stripe
              </td>
              <td className="px-4 py-3 text-slate-600">
                Paiement en ligne
              </td>
              <td className="px-4 py-3 text-slate-600">International</td>
              <td className="px-4 py-3 text-slate-600">
                PCI-DSS niveau 1, DPA, clauses contractuelles types
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Mistral AI
              </td>
              <td className="px-4 py-3 text-slate-600">
                Génération de devis par IA
              </td>
              <td className="px-4 py-3 text-slate-600">France</td>
              <td className="px-4 py-3 text-slate-600">
                API professionnelle, pas d&apos;entraînement sur les données
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Resend
              </td>
              <td className="px-4 py-3 text-slate-600">
                Envoi d&apos;emails transactionnels
              </td>
              <td className="px-4 py-3 text-slate-600">International</td>
              <td className="px-4 py-3 text-slate-600">
                DPA, clauses contractuelles types
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Upstash
              </td>
              <td className="px-4 py-3 text-slate-600">
                Rate limiting (Redis)
              </td>
              <td className="px-4 py-3 text-slate-600">UE</td>
              <td className="px-4 py-3 text-slate-600">
                DPA, données éphémères uniquement
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 5 — Durée de conservation */}
      <h2
        id="section-5"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        5. Durée de conservation
      </h2>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Données
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Durée
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Compte utilisateur
              </td>
              <td className="px-4 py-3 text-slate-600">
                Durée du compte + 3 ans après suppression
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Devis et factures
              </td>
              <td className="px-4 py-3 text-slate-600">
                10 ans (obligation légale comptable)
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Données de paiement
              </td>
              <td className="px-4 py-3 text-slate-600">
                13 mois (Stripe, obligation PCI)
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Logs de connexion
              </td>
              <td className="px-4 py-3 text-slate-600">12 mois</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">
                Données de prospects (formulaire)
              </td>
              <td className="px-4 py-3 text-slate-600">
                3 ans sans interaction
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 6 — Vos droits */}
      <h2
        id="section-6"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        6. Vos droits
      </h2>
      <p className="leading-relaxed text-slate-600">
        Conformément au RGPD, vous disposez des droits suivants :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Accès :</strong> obtenir une copie de vos données
            personnelles
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Rectification :</strong> corriger des données inexactes
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Effacement :</strong> demander la suppression de vos données
            (sous réserve des obligations légales de conservation)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Portabilité :</strong> recevoir vos données dans un format
            structuré (CSV)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Opposition :</strong> vous opposer au traitement fondé sur
            l&apos;intérêt légitime
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Limitation :</strong> demander la limitation du traitement
          </span>
        </li>
      </ul>

      {/* Blue info callout: Contact privacy */}
      <div className="my-6 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-5">
        <p className="font-semibold text-blue-800">
          Exercer vos droits
        </p>
        <p className="mt-1 text-sm text-blue-700">
          Pour exercer vos droits, contactez-nous à :{" "}
          <a
            href="mailto:privacy@devizly.fr"
            className="font-medium underline"
          >
            privacy@devizly.fr
          </a>
        </p>
      </div>

      <p className="leading-relaxed text-slate-600">
        Vous pouvez également introduire une réclamation auprès de la CNIL :{" "}
        <a
          href="https://www.cnil.fr/fr/plaintes"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:text-violet-500"
        >
          www.cnil.fr
        </a>
      </p>

      {/* Section 7 — Sécurité */}
      <h2
        id="section-7"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        7. Sécurité
      </h2>
      <p className="leading-relaxed text-slate-600">
        Devizly met en oeuvre les mesures techniques suivantes :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Chiffrement HTTPS/TLS pour toutes les communications
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Chiffrement au repos des données en base (Supabase/AWS)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Row Level Security (RLS) — chaque utilisateur n&apos;accède
            qu&apos;à ses propres données
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Authentification sécurisée (Supabase Auth, hachage bcrypt)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Rate limiting sur les endpoints publics (Upstash Redis)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Tokens de partage à usage unique pour les devis partagés
          </span>
        </li>
      </ul>

      {/* Section 8 — Transferts hors UE */}
      <h2
        id="section-8"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        8. Transferts hors UE
      </h2>
      <p className="leading-relaxed text-slate-600">
        Certains sous-traitants (Vercel, Stripe, Resend) opèrent
        internationalement. Des <strong>clauses contractuelles types</strong>{" "}
        (CCT) approuvées par la Commission européenne encadrent ces transferts
        conformément aux articles 46 et 49 du RGPD.
      </p>

      {/* Section 9 — Modifications */}
      <h2
        id="section-9"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        9. Modifications
      </h2>
      <p className="leading-relaxed text-slate-600">
        Cette politique peut être mise à jour. En cas de modification
        substantielle, les utilisateurs seront informés par email. La date de
        dernière mise à jour figure en haut de cette page.
      </p>

      {/* Footer box */}
      <div className="mt-16 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">
          Pour toute question relative à vos données :{" "}
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
