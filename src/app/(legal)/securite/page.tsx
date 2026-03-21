import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sécurité",
  description:
    "Comment Devizly protège vos données — hébergement, chiffrement, paiements sécurisés.",
  alternates: { canonical: "https://devizly.fr/securite" },
};

export default function SecuritePage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Sécurité</h1>
      <p className="lead">
        Vos données et celles de vos clients sont au cœur de notre
        préoccupation. Voici comment Devizly les protège.
      </p>

      <h2>Hébergement des données</h2>
      <ul>
        <li>
          <strong>Base de données :</strong> hébergée par Supabase sur des
          serveurs AWS situés dans l&apos;Union européenne (région eu-west).
        </li>
        <li>
          <strong>Application :</strong> hébergée par Vercel avec un CDN global
          pour des temps de réponse optimaux.
        </li>
        <li>
          <strong>IA Mistral :</strong> serveurs 100% en France. Les données
          envoyées à l&apos;IA sont anonymisées et ne sont jamais utilisées pour
          l&apos;entraînement des modèles.
        </li>
      </ul>

      <h2>Chiffrement</h2>
      <ul>
        <li>
          <strong>En transit :</strong> toutes les communications utilisent le
          protocole HTTPS/TLS 1.3.
        </li>
        <li>
          <strong>Au repos :</strong> les données sont chiffrées au repos dans
          la base de données (AES-256 via AWS).
        </li>
        <li>
          <strong>Mots de passe :</strong> hachés avec bcrypt via Supabase Auth.
          Devizly ne stocke jamais de mot de passe en clair.
        </li>
      </ul>

      <h2>Isolation des données</h2>
      <ul>
        <li>
          <strong>Row Level Security (RLS) :</strong> chaque utilisateur
          n&apos;accède qu&apos;à ses propres données. Impossible de voir les
          devis, clients ou factures d&apos;un autre compte.
        </li>
        <li>
          <strong>Vérification serveur :</strong> chaque requête API vérifie
          l&apos;identité de l&apos;utilisateur via{" "}
          <code>getUser()</code> (validation JWT côté serveur).
        </li>
      </ul>

      <h2>Paiements sécurisés</h2>
      <ul>
        <li>
          <strong>Stripe :</strong> certifié PCI-DSS niveau 1 (le plus haut
          niveau de conformité). Devizly ne stocke jamais de numéro de carte
          bancaire.
        </li>
        <li>
          <strong>Webhooks :</strong> chaque événement Stripe est vérifié via
          signature HMAC avant traitement.
        </li>
        <li>
          <strong>Stripe Connect :</strong> les fonds de vos clients transitent
          directement vers votre compte Stripe, sans passer par Devizly.
        </li>
      </ul>

      <h2>Protection contre les abus</h2>
      <ul>
        <li>
          <strong>Rate limiting :</strong> les endpoints sensibles (envoi de
          devis, génération IA, paiement) sont limités à 5 requêtes par minute
          par IP via Upstash Redis.
        </li>
        <li>
          <strong>Anti-abus :</strong> limitation à 2 créations de compte par
          adresse IP par semaine.
        </li>
        <li>
          <strong>Signature électronique :</strong> conforme eIDAS avec
          empreinte SHA-256, horodatage, IP et user-agent enregistrés.
        </li>
      </ul>

      <h2>Sauvegardes</h2>
      <ul>
        <li>
          Sauvegardes automatiques quotidiennes de la base de données par
          Supabase (retention 7 jours).
        </li>
        <li>
          Export CSV disponible à tout moment depuis votre tableau de bord.
        </li>
      </ul>

      <h2>Signaler une vulnérabilité</h2>
      <p>
        Si vous découvrez une faille de sécurité, contactez-nous à{" "}
        <strong>security@devizly.fr</strong>. Nous nous engageons à traiter
        chaque signalement sous 48 heures.
      </p>

      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : mars 2026
      </p>
    </article>
  );
}
