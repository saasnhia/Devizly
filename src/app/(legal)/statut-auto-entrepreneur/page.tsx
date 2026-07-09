import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Le statut auto-entrepreneur — cotisations et obligations | Devizly",
  description:
    "Comment créer son statut d'auto-entrepreneur, le caractère obligatoire des cotisations sociales, leur rôle et les spécificités du droit du travail applicables. Ressources officielles URSSAF.",
  alternates: { canonical: "https://devizly.fr/statut-auto-entrepreneur" },
};

const SECTIONS = [
  { id: "section-1", label: "Créer son statut d'auto-entrepreneur" },
  { id: "section-2", label: "Le caractère obligatoire des cotisations" },
  { id: "section-3", label: "Le rôle des cotisations sociales" },
  { id: "section-4", label: "Auto-entrepreneur et droit du travail" },
] as const;

const URSSAF_ESSENTIEL_URL =
  "https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html";

export default function StatutAutoEntrepreneurPage() {
  return (
    <div className="max-w-3xl">
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Le statut d&apos;auto-entrepreneur
      </h1>
      <p className="mt-3 text-base text-slate-500">
        Dernière mise à jour : juillet 2026
      </p>

      {/* Official resource callout — prominent, at the top */}
      <div className="mt-8 rounded-xl border-l-4 border-violet-500 bg-violet-50 p-6">
        <p className="font-semibold text-violet-900">
          Ressource officielle URSSAF
        </p>
        <p className="mt-2 text-sm leading-relaxed text-violet-800">
          Pour tout savoir sur le statut d&apos;auto-entrepreneur, les
          cotisations et vos obligations, consultez la ressource officielle
          de l&apos;URSSAF, qui fait référence sur le sujet :
        </p>
        <a
          href={URSSAF_ESSENTIEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 underline underline-offset-2 hover:text-violet-600"
        >
          L&apos;essentiel du statut — Autoentrepreneur.urssaf.fr
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
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

      {/* Section 1 — Création du statut */}
      <h2 id="section-1" className="mt-12 mb-4 text-xl font-bold text-slate-900">
        1. Créer son statut d&apos;auto-entrepreneur
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;auto-entrepreneur (ou micro-entrepreneur) est un régime
        simplifié de l&apos;entreprise individuelle. La création du statut
        s&apos;effectue en ligne, gratuitement, sur le guichet unique des
        formalités d&apos;entreprises, avec transmission automatique à
        l&apos;URSSAF pour l&apos;affiliation au régime micro-social.
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Déclaration d&apos;activité gratuite, aucun capital social minimum
            requis
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Comptabilité simplifiée : tenue d&apos;un livre des recettes (et
            d&apos;un registre des achats pour les activités de vente)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Franchise en base de TVA tant que le chiffre d&apos;affaires
            annuel reste sous le seuil applicable à l&apos;activité (voir
            ci-dessous)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Régime micro-fiscal optionnel avec versement libératoire de
            l&apos;impôt sur le revenu, sous conditions de revenu fiscal de
            référence
          </span>
        </li>
      </ul>
      <p className="mt-4 leading-relaxed text-slate-600">
        Le statut est soumis à des plafonds annuels de chiffre
        d&apos;affaires, au-delà desquels le régime micro-entrepreneur cesse
        de s&apos;appliquer :
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Activité
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Seuil franchise TVA
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Plafond micro-entrepreneur
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Vente de marchandises
              </td>
              <td className="px-4 py-3 text-slate-600">85 000 &euro;</td>
              <td className="px-4 py-3 text-slate-600">203 100 &euro;</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Prestations de services (BIC/BNC) &amp; professions libérales
              </td>
              <td className="px-4 py-3 text-slate-600">37 500 &euro;</td>
              <td className="px-4 py-3 text-slate-600">83 600 &euro;</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Seuils applicables en 2026. Devizly affiche votre position par
        rapport à ces seuils en temps réel dans l&apos;onglet{" "}
        <Link href="/dashboard/urssaf" className="text-violet-600 hover:text-violet-500">
          URSSAF du tableau de bord
        </Link>
        .
      </p>

      {/* Section 2 — Caractère obligatoire */}
      <h2 id="section-2" className="mt-12 mb-4 text-xl font-bold text-slate-900">
        2. Le caractère obligatoire des cotisations
      </h2>
      <p className="leading-relaxed text-slate-600">
        Les cotisations sociales de l&apos;auto-entrepreneur ne sont pas
        facultatives. Elles constituent une obligation légale attachée au
        statut, quelle que soit l&apos;activité exercée.
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Les cotisations sont calculées en pourcentage du chiffre
            d&apos;affaires effectivement encaissé, et non sur un forfait
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            La déclaration de chiffre d&apos;affaires est obligatoire à
            chaque échéance (mensuelle ou trimestrielle, au choix de
            l&apos;auto-entrepreneur), y compris lorsque le chiffre
            d&apos;affaires est nul
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            L&apos;absence de déclaration dans les délais expose à une
            pénalité forfaitaire, et l&apos;absence de paiement à des
            majorations de retard
          </span>
        </li>
      </ul>
      <p className="mt-4 leading-relaxed text-slate-600">
        Les taux de cotisation applicables en 2026 selon la nature de
        l&apos;activité :
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Activité
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Taux de cotisations sociales
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Vente de marchandises
              </td>
              <td className="px-4 py-3 text-slate-600">12,3 %</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Prestations de services (BIC)
              </td>
              <td className="px-4 py-3 text-slate-600">21,2 %</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                Prestations de services (BNC) &amp; activité libérale (CIPAV)
              </td>
              <td className="px-4 py-3 text-slate-600">21,1 %</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Un taux réduit de moitié s&apos;applique pendant 12 mois aux
        bénéficiaires de l&apos;ACRE. Une contribution à la formation
        professionnelle (CFP, 0,1 % à 0,3 % selon l&apos;activité) s&apos;y
        ajoute.
      </p>

      {/* Amber callout */}
      <div className="my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
        <p className="font-semibold text-amber-800">
          Important : déclaration obligatoire
        </p>
        <p className="mt-1 text-sm text-amber-700">
          Même sans chiffre d&apos;affaires sur la période, la déclaration
          doit être effectuée sur autoentrepreneur.urssaf.fr — l&apos;absence
          de déclaration est sanctionnée, indépendamment du montant dû.
        </p>
      </div>

      {/* Section 3 — Rôle des cotisations */}
      <h2 id="section-3" className="mt-12 mb-4 text-xl font-bold text-slate-900">
        3. Le rôle des cotisations sociales
      </h2>
      <p className="leading-relaxed text-slate-600">
        Les cotisations versées par l&apos;auto-entrepreneur ne sont pas une
        simple taxe : elles financent la protection sociale du travailleur
        indépendant et ouvrent des droits.
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong className="text-slate-700">Assurance maladie-maternité</strong> —
            remboursement des soins, indemnités journalières, congé maternité/paternité
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong className="text-slate-700">Retraite de base et complémentaire</strong> —
            acquisition de trimestres et de points retraite
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong className="text-slate-700">Invalidité-décès</strong> —
            couverture en cas d&apos;incapacité de travail ou de décès
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong className="text-slate-700">Allocations familiales</strong> —
            financement de la branche famille de la Sécurité sociale
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong className="text-slate-700">CSG-CRDS</strong> — contribution
            au remboursement de la dette sociale et au financement de la
            protection sociale
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong className="text-slate-700">Contribution à la formation professionnelle (CFP)</strong> —
            finance l&apos;accès à la formation continue de l&apos;indépendant
          </span>
        </li>
      </ul>

      {/* Green callout */}
      <div className="my-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-5">
        <p className="font-semibold text-green-800">
          Cotiser ouvre des droits
        </p>
        <p className="mt-1 text-sm text-green-700">
          Contrairement à une taxe, chaque euro de cotisation contribue
          directement à la couverture sociale et aux droits à la retraite de
          l&apos;auto-entrepreneur.
        </p>
      </div>

      {/* Section 4 — Droit du travail */}
      <h2 id="section-4" className="mt-12 mb-4 text-xl font-bold text-slate-900">
        4. Auto-entrepreneur et droit du travail
      </h2>
      <p className="leading-relaxed text-slate-600">
        L&apos;auto-entrepreneur exerce une activité indépendante et
        n&apos;est pas salarié de ses clients. Cette distinction a des
        conséquences juridiques importantes :
      </p>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Aucun lien de subordination juridique avec ses clients, aucun
            contrat de travail ni bulletin de salaire
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Un client qui impose des horaires fixes, des consignes
            permanentes et exclusives, ou intègre l&apos;auto-entrepreneur
            dans son organisation comme un salarié s&apos;expose à un risque
            de <strong className="text-slate-700">requalification en salariat déguisé</strong>{" "}
            devant le juge prud&apos;homal
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            L&apos;auto-entrepreneur est seul responsable de ses propres
            déclarations et cotisations — aucune retenue à la source par ses
            clients
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Il ne bénéficie pas de l&apos;assurance chômage salariée en cas
            d&apos;arrêt d&apos;activité, sauf éligibilité à l&apos;Allocation
            des Travailleurs Indépendants (ATI), soumise à des conditions
            strictes
          </span>
        </li>
      </ul>

      <div className="my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
        <p className="font-semibold text-amber-800">
          Important : pas de lien de subordination
        </p>
        <p className="mt-1 text-sm text-amber-700">
          Devizly est un outil de gestion (devis, facturation, suivi) destiné
          à des travailleurs indépendants. Il ne modifie ni ne garantit la
          nature juridique de la relation entre l&apos;auto-entrepreneur et
          ses clients.
        </p>
      </div>

      {/* Bottom official resource callout */}
      <div className="mt-10 rounded-xl border-l-4 border-violet-500 bg-violet-50 p-6">
        <p className="font-semibold text-violet-900">
          Pour aller plus loin
        </p>
        <p className="mt-2 text-sm leading-relaxed text-violet-800">
          Cette page présente un résumé à visée informative. Pour
          l&apos;information officielle, complète et à jour sur le statut,
          les démarches, les cotisations et vos obligations, référez-vous à
          l&apos;URSSAF :
        </p>
        <a
          href={URSSAF_ESSENTIEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 underline underline-offset-2 hover:text-violet-600"
        >
          L&apos;essentiel du statut — Autoentrepreneur.urssaf.fr
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      {/* Footer note */}
      <div className="mt-16 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">
          Pour toute question :{" "}
          <a
            href="mailto:contact@devizly.fr"
            className="font-medium text-violet-600 hover:text-violet-500"
          >
            contact@devizly.fr
          </a>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          NBHC SAS — RCS Chalon-sur-Saône — SIREN 102 637
          899
        </p>
      </div>
    </div>
  );
}
