import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Devizly",
  description:
    "Mentions légales de Devizly, logiciel de devis IA édité par la SAS NBHC. SIREN 102 637 899 — 55 Rue Henri Clément, 71100 Saint-Rémy. Hébergement Vercel et Supabase (UE).",
  alternates: { canonical: "https://devizly.fr/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Mentions légales</h1>
      <p className="lead">
        Conformément aux dispositions des articles 6-III et 19 de la Loi n°
        2004-575 du 21 juin 2004 pour la Confiance dans l&apos;économie
        numérique (LCEN).
      </p>

      <h2>1. Éditeur du site</h2>
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
          <strong>Directeur général :</strong> Noam BAHRI
        </li>
        <li>
          <strong>Directeur de la publication :</strong> Haroun CHIKH
        </li>
        <li>
          <strong>Email :</strong> contact@devizly.fr
        </li>
      </ul>

      <h2>2. Hébergement</h2>
      <ul>
        <li>
          <strong>Hébergeur :</strong> Vercel Inc.
        </li>
        <li>
          <strong>Adresse :</strong> 340 Pine Street Suite 701, San Francisco, CA 94104, États-Unis
        </li>
        <li>
          <strong>Site web :</strong> vercel.com
        </li>
      </ul>
      <p>
        La base de données est hébergée par <strong>Supabase</strong> sur des
        serveurs situés dans l&apos;Union européenne (AWS eu-west).
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu du site Devizly (textes, images, logos,
        icônes, logiciels) est la propriété exclusive de l&apos;éditeur ou de
        ses partenaires et est protégé par les lois françaises et
        internationales relatives à la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, représentation, modification ou adaptation, totale
        ou partielle, est interdite sans l&apos;autorisation écrite préalable de
        l&apos;éditeur.
      </p>

      <h2>4. Données personnelles</h2>
      <p>
        Le responsable de traitement au sens du RGPD est NBHC, SAS au capital
        de 500 €, dont le siège social est situé 55 Rue Henri Clément, 71100
        Saint-Rémy. Le détail du traitement des données personnelles est décrit
        dans notre <a href="/confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>5. Cookies</h2>
      <p>
        L&apos;utilisation des cookies est décrite dans notre{" "}
        <a href="/cookies">Politique de cookies</a>.
      </p>

      <h2>6. Médiation</h2>
      <p>
        Conformément aux articles L.616-1 et R.616-1 du Code de la
        consommation, en cas de litige non résolu, le consommateur peut recourir
        gratuitement au service de médiation :
      </p>
      <ul>
        <li>
          <strong>Médiateur :</strong> SAS Médiation Solution
        </li>
        <li>
          <strong>Site web :</strong> sasmediationsolution-conso.fr
        </li>
      </ul>

      <h2>7. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. En cas
        de litige, les tribunaux français seront seuls compétents.
      </p>

      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : mars 2026
      </p>
    </article>
  );
}
