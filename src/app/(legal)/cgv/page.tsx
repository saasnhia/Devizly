import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CGV — Conditions Générales de Vente | Devizly",
  description:
    "Conditions Générales de Vente de Devizly — conditions applicables aux abonnements et services.",
  alternates: { canonical: "https://devizly.fr/cgv" },
};

const SECTIONS = [
  { id: "section-1", label: "Présentation et objet" },
  { id: "section-2", label: "Identification du prestataire" },
  { id: "section-3", label: "Plans et tarifs" },
  { id: "section-4", label: "Essai gratuit et souscription" },
  { id: "section-5", label: "Durée et résiliation" },
  { id: "section-6", label: "Garantie satisfait ou remboursé 14 jours" },
  { id: "section-7", label: "Protection des données (RGPD)" },
  { id: "section-8", label: "Propriété intellectuelle" },
  { id: "section-9", label: "Responsabilité" },
  { id: "section-10", label: "Droit applicable" },
] as const;

export default function CGVPage() {
  return (
    <div className="max-w-3xl">
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Conditions Générales de Vente
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
            Essai gratuit sans engagement
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            Résiliation à tout moment, sans frais
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            Remboursement 14 jours si insatisfait
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
        1. Présentation et objet
      </h2>
      <p className="leading-relaxed text-slate-600">
        Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent
        les relations contractuelles entre la société NBHC, éditrice de la
        plateforme Devizly, et tout client professionnel (ci-après « le Client
        ») souscrivant aux services proposés.
      </p>
      <p className="mt-4 leading-relaxed text-slate-600">
        Devizly est une plateforme SaaS de génération de devis assistée par
        intelligence artificielle, de facturation automatisée, de signature
        électronique et de suivi de pipeline commercial, destinée aux
        freelances, artisans et auto-entrepreneurs.
      </p>

      {/* Section 2 */}
      <h2
        id="section-2"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        2. Identification du prestataire
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
              <td className="px-4 py-2.5 text-slate-600">102 637 899</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-700">
                RCS
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                102 637 899 R.C.S. Chalon-sur-Saône
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-700">
                Président
              </td>
              <td className="px-4 py-2.5 text-slate-600">Haroun CHIKH</td>
            </tr>
            <tr>
              <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-700">
                Email
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                <a
                  href="mailto:contact@devizly.fr"
                  className="text-violet-600 hover:text-violet-500"
                >
                  contact@devizly.fr
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 3 */}
      <h2
        id="section-3"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        3. Plans et tarifs
      </h2>
      <p className="mb-4 leading-relaxed text-slate-600">
        Devizly propose les plans suivants :
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Plan
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Prix HT/mois
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Caractéristiques
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">Free</td>
              <td className="px-4 py-3 text-slate-600">0 &euro;</td>
              <td className="px-4 py-3 text-slate-600">
                3 devis/mois, génération IA, gestion clients
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">Pro</td>
              <td className="px-4 py-3 text-slate-600">19 &euro;</td>
              <td className="px-4 py-3 text-slate-600">
                Devis illimités, relances auto, signature, multi-devises
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Business
              </td>
              <td className="px-4 py-3 text-slate-600">39 &euro;</td>
              <td className="px-4 py-3 text-slate-600">
                Illimité, facturation récurrente, leads, support prioritaire
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Les prix s&apos;entendent hors taxes (HT). La TVA applicable sera
        ajoutée au taux en vigueur.
      </p>

      {/* Section 4 */}
      <h2
        id="section-4"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        4. Essai gratuit et souscription
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;inscription sur Devizly est gratuite et permet d&apos;accéder au
        plan Free sans engagement ni carte bancaire requise. Ce plan inclut
        jusqu&apos;à 3 devis par mois avec la génération par intelligence
        artificielle.
      </p>
      <p className="mt-4 leading-relaxed text-slate-600">
        Pour les plans payants (Pro et Business), l&apos;abonnement est souscrit
        en ligne sur le site devizly.fr. Le paiement est effectué par carte
        bancaire via Stripe. L&apos;abonnement est renouvelé automatiquement à
        chaque échéance mensuelle, sauf résiliation préalable par le Client.
      </p>

      {/* Section 5 */}
      <h2
        id="section-5"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        5. Durée et résiliation
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;abonnement est conclu pour une durée indéterminée. Le Client peut
        résilier son abonnement à tout moment depuis les paramètres de son
        compte ou par email à contact@devizly.fr.
      </p>
      <p className="mt-4 leading-relaxed text-slate-600">
        La résiliation prend effet à la fin de la période de facturation en
        cours. Le Client conserve l&apos;accès aux services jusqu&apos;à cette
        date. Aucun remboursement au prorata ne sera effectué pour la période
        restante.
      </p>

      {/* Important callout: Résiliation */}
      <div className="my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
        <p className="font-semibold text-amber-800">
          Important : Résiliation
        </p>
        <p className="mt-1 text-sm text-amber-700">
          Vous pouvez résilier à tout moment depuis votre tableau de bord.
          Aucun frais de résiliation ne sera appliqué.
        </p>
      </div>

      <p className="leading-relaxed text-slate-600">
        L&apos;éditeur se réserve le droit de suspendre ou résilier un compte en
        cas de non-respect des présentes CGV ou des CGU, après mise en demeure
        restée sans effet pendant 15 jours.
      </p>

      {/* Section 6 */}
      <h2
        id="section-6"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        6. Garantie satisfait ou remboursé 14 jours
      </h2>
      <p className="leading-relaxed text-slate-600">
        Conformément au droit de rétractation européen, l&apos;utilisateur
        bénéficie d&apos;une garantie satisfait ou remboursé de 14 jours à
        compter de la date de souscription à un plan payant.
      </p>

      {/* Important callout: Remboursement */}
      <div className="my-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-5">
        <p className="font-semibold text-green-800">
          Remboursement garanti
        </p>
        <p className="mt-1 text-sm text-green-700">
          Le remboursement intégral est effectué sur simple demande à{" "}
          <a
            href="mailto:contact@devizly.fr"
            className="font-medium underline"
          >
            contact@devizly.fr
          </a>
          , sans justification nécessaire.
        </p>
      </div>

      <p className="leading-relaxed text-slate-600">
        Passé ce délai de 14 jours, conformément à l&apos;article L.221-28 du
        Code de la consommation, le droit de rétractation ne s&apos;applique
        plus aux contrats de fourniture de contenu numérique dont
        l&apos;exécution a commencé avec l&apos;accord du consommateur.
      </p>

      {/* Section 7 */}
      <h2
        id="section-7"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        7. Protection des données (RGPD)
      </h2>
      <p className="leading-relaxed text-slate-600">
        Devizly s&apos;engage à protéger les données personnelles de ses
        utilisateurs conformément au Règlement Général sur la Protection des
        Données (RGPD) et à la loi Informatique et Libertés.
      </p>
      <p className="mt-4 leading-relaxed text-slate-600">
        Le traitement des données personnelles est décrit en détail dans notre{" "}
        <Link
          href="/confidentialite"
          className="text-violet-600 hover:text-violet-500"
        >
          Politique de confidentialité
        </Link>
        . Devizly agit en qualité de sous-traitant au sens du RGPD pour les
        données clients traitées pour le compte de l&apos;utilisateur.
      </p>
      <p className="mt-4 leading-relaxed text-slate-600">
        L&apos;intelligence artificielle utilisée (Mistral AI) est hébergée en
        France. Aucune donnée personnelle n&apos;est transmise à des services
        hors Union Européenne. Les données sont anonymisées avant tout
        traitement par l&apos;IA.
      </p>

      {/* Section 8 */}
      <h2
        id="section-8"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        8. Propriété intellectuelle
      </h2>
      <p className="leading-relaxed text-slate-600">
        Le client conserve la propriété intégrale de ses données (devis,
        factures, informations clients). L&apos;éditeur ne revendique aucun
        droit sur le contenu créé par le Client via la plateforme.
      </p>
      <p className="mt-4 leading-relaxed text-slate-600">
        L&apos;éditeur conserve la propriété exclusive du logiciel, du code
        source, des algorithmes, de la marque Devizly et de l&apos;ensemble des
        éléments graphiques et textuels de la plateforme. Toute reproduction,
        même partielle, est interdite sans autorisation écrite préalable.
      </p>

      {/* Section 9 */}
      <h2
        id="section-9"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        9. Responsabilité
      </h2>
      <p className="leading-relaxed text-slate-600">
        Devizly s&apos;engage à fournir un service conforme à sa description et
        à assurer une disponibilité optimale de la plateforme. Toutefois,
        l&apos;éditeur ne saurait être tenu responsable :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Des erreurs dans les devis générés par l&apos;IA — le client reste
            seul responsable de la vérification et de la validation de ses devis
            avant envoi
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Des dommages indirects (perte de chiffre d&apos;affaires, perte de
            données, etc.)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Des interruptions de service dues à des maintenances programmées ou
            à des cas de force majeure
          </span>
        </li>
      </ul>

      {/* Important callout: IA */}
      <div className="my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
        <p className="font-semibold text-amber-800">
          Important : Contenu généré par l&apos;IA
        </p>
        <p className="mt-1 text-sm text-amber-700">
          Les devis générés par l&apos;intelligence artificielle sont des
          propositions. Le Client est seul responsable de leur vérification
          avant envoi à ses propres clients.
        </p>
      </div>

      {/* Section 10 */}
      <h2
        id="section-10"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        10. Droit applicable
      </h2>
      <p className="leading-relaxed text-slate-600">
        Les présentes CGV sont soumises au droit français. En cas de litige, les
        parties s&apos;engagent à rechercher une solution amiable avant toute
        action judiciaire. À défaut de résolution amiable dans un délai de 30
        jours, tout litige sera soumis au Tribunal de Commerce de
        Chalon-sur-Saône.
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
