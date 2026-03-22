import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGV",
  description: "Conditions Générales de Vente de Devizly — conditions applicables aux abonnements et services.",
  alternates: { canonical: "https://devizly.fr/cgv" },
};

export default function CGVPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Conditions Générales de Vente (CGV)</h1>
      <p className="lead">
        Les présentes CGV sont conclues entre NBHC, SAS au capital de 500 €,
        immatriculée au RCS de Chalon-sur-Saône sous le numéro 102 637 899,
        dont le siège social est situé 55 Rue Henri Clément, 71100 Saint-Rémy
        (ci-après « l&apos;Éditeur »), et tout client professionnel souscrivant
        aux services Devizly (ci-après « le Client »).
      </p>

      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales de Vente définissent les droits et
        obligations des parties dans le cadre de la souscription aux services
        proposés par Devizly, plateforme SaaS de génération de devis,
        facturation et suivi de pipeline commercial.
      </p>

      <h2>2. Identification du prestataire</h2>
      <ul>
        <li>
          <strong>Raison sociale :</strong> NBHC
        </li>
        <li>
          <strong>Forme juridique :</strong> Société par actions simplifiée (SAS)
        </li>
        <li>
          <strong>Capital social :</strong> 500,00 €
        </li>
        <li>
          <strong>Siège social :</strong> 55 Rue Henri Clément, 71100 Saint-Rémy
        </li>
        <li>
          <strong>SIREN :</strong> 102 637 899
        </li>
        <li>
          <strong>RCS :</strong> 102 637 899 R.C.S. Chalon-sur-Saône
        </li>
        <li>
          <strong>Président :</strong> Haroun CHIKH
        </li>
        <li>
          <strong>Email :</strong> contact@devizly.fr
        </li>
      </ul>

      <h2>3. Services proposés</h2>
      <p>Devizly propose les services suivants :</p>
      <ul>
        <li>Génération de devis assistée par intelligence artificielle (Mistral AI)</li>
        <li>Envoi de devis par email avec suivi de consultation</li>
        <li>Signature électronique en ligne</li>
        <li>Facturation automatique à la signature</li>
        <li>Pipeline commercial (Kanban)</li>
        <li>Relances automatiques</li>
        <li>Encaissement par carte bancaire via Stripe</li>
        <li>Export comptable CSV</li>
        <li>Formulaire de capture de leads</li>
      </ul>

      <h2>4. Plans et tarifs</h2>
      <table>
        <thead>
          <tr>
            <th>Plan</th>
            <th>Prix HT/mois</th>
            <th>Caractéristiques principales</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Free</td>
            <td>0 €</td>
            <td>3 devis/mois, génération IA, gestion clients</td>
          </tr>
          <tr>
            <td>Pro</td>
            <td>19 €</td>
            <td>Devis illimités, relances auto, signature, multi-devises</td>
          </tr>
          <tr>
            <td>Business</td>
            <td>39 €</td>
            <td>Illimité, facturation récurrente, leads, support prioritaire</td>
          </tr>
        </tbody>
      </table>
      <p>
        Les prix s&apos;entendent hors taxes (HT). La TVA applicable sera
        ajoutée au taux en vigueur.
      </p>

      <h2>5. Souscription et paiement</h2>
      <p>
        L&apos;abonnement est souscrit en ligne sur le site devizly.fr. Le
        paiement est effectué par carte bancaire via Stripe. L&apos;abonnement
        est renouvelé automatiquement à chaque échéance mensuelle.
      </p>

      <h2>6. Garantie satisfait ou remboursé</h2>
      <p>
        Conformément au droit de rétractation européen, l&apos;utilisateur
        bénéficie d&apos;une garantie satisfait ou remboursé de 14 jours à
        compter de la date de souscription. Le remboursement intégral est
        effectué sur simple demande à contact@devizly.fr, sans justification
        nécessaire.
      </p>
      <p>
        Passé ce délai de 14 jours, conformément à l&apos;article L.221-28
        du Code de la consommation, le droit de rétractation ne s&apos;applique
        plus aux contrats de fourniture de contenu numérique dont
        l&apos;exécution a commencé avec l&apos;accord du consommateur.
      </p>

      <h2>7. Résiliation</h2>
      <p>
        Le client peut résilier son abonnement à tout moment depuis les
        paramètres de son compte. La résiliation prend effet à la fin de la
        période de facturation en cours. Aucun remboursement au prorata ne sera
        effectué.
      </p>
      <p>
        L&apos;éditeur se réserve le droit de suspendre ou résilier un compte en
        cas de non-respect des présentes CGV ou des CGU.
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        Devizly s&apos;engage à fournir un service conforme à sa description.
        L&apos;éditeur ne saurait être tenu responsable :
      </p>
      <ul>
        <li>Des erreurs dans les devis générés par l&apos;IA — le client reste seul responsable de la vérification et de la validation de ses devis avant envoi</li>
        <li>Des dommages indirects (perte de chiffre d&apos;affaires, perte de données, etc.)</li>
        <li>Des interruptions de service dues à des maintenances programmées ou à des cas de force majeure</li>
      </ul>

      <h2>9. Propriété intellectuelle</h2>
      <p>
        Le client conserve la propriété intégrale de ses données (devis,
        factures, informations clients). L&apos;éditeur conserve la propriété du
        logiciel, du code source et des algorithmes.
      </p>

      <h2>10. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans notre{" "}
        <a href="/confidentialite">Politique de confidentialité</a>. Devizly agit
        en qualité de sous-traitant au sens du RGPD pour les données clients
        traitées pour le compte de l&apos;utilisateur.
      </p>

      <h2>11. Droit applicable et juridiction</h2>
      <p>
        Les présentes CGV sont soumises au droit français. Tout litige sera
        soumis au Tribunal de Commerce de Chalon-sur-Saône.
      </p>

      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : mars 2026
      </p>
    </article>
  );
}
