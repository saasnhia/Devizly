import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sécurité des données — Devizly",
  description:
    "Découvrez comment Devizly protège vos données : hébergement européen, chiffrement TLS et AES, paiements sécurisés Stripe, IA Mistral hébergée en France. Conforme RGPD.",
  alternates: { canonical: "https://devizly.fr/securite" },
};

const SECTIONS = [
  { id: "section-1", label: "Hébergement des données" },
  { id: "section-2", label: "Chiffrement" },
  { id: "section-3", label: "Isolation des données" },
  { id: "section-4", label: "Paiements sécurisés" },
  { id: "section-5", label: "Protection contre les abus" },
  { id: "section-6", label: "Sauvegardes" },
  { id: "section-7", label: "Signaler une vulnérabilité" },
] as const;

export default function SecuritePage() {
  return (
    <div className="max-w-3xl">
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Sécurité
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
            Chiffrement TLS + AES-256
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            RLS — isolation totale des données
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
              ✓
            </span>
            PCI-DSS niveau 1 via Stripe
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
        1. Hébergement des données
      </h2>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Base de données :</strong> hébergée par Supabase sur des
            serveurs AWS situés dans l&apos;Union européenne (région eu-west).
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Application :</strong> hébergée par Vercel avec un CDN
            global pour des temps de réponse optimaux.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>IA Mistral :</strong> serveurs 100% en France. Les données
            envoyées à l&apos;IA sont anonymisées et ne sont jamais utilisées
            pour l&apos;entraînement des modèles.
          </span>
        </li>
      </ul>

      {/* Section 2 */}
      <h2
        id="section-2"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        2. Chiffrement
      </h2>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>En transit :</strong> toutes les communications utilisent le
            protocole HTTPS/TLS 1.3.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Au repos :</strong> les données sont chiffrées au repos dans
            la base de données (AES-256 via AWS).
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Mots de passe :</strong> hachés avec bcrypt via Supabase
            Auth. Devizly ne stocke jamais de mot de passe en clair.
          </span>
        </li>
      </ul>

      {/* Section 3 */}
      <h2
        id="section-3"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        3. Isolation des données
      </h2>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Row Level Security (RLS) :</strong> chaque utilisateur
            n&apos;accède qu&apos;à ses propres données. Impossible de voir les
            devis, clients ou factures d&apos;un autre compte.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Vérification serveur :</strong> chaque requête API vérifie
            l&apos;identité de l&apos;utilisateur via{" "}
            <code>getUser()</code> (validation JWT côté serveur).
          </span>
        </li>
      </ul>

      {/* Callout: Isolation totale */}
      <div className="my-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-5">
        <p className="font-semibold text-green-800">Isolation totale</p>
        <p className="mt-1 text-sm text-green-700">
          Row Level Security (RLS) garantit que chaque utilisateur n&apos;accède
          qu&apos;à ses propres données. Aucun accès croisé n&apos;est possible.
        </p>
      </div>

      {/* Section 4 */}
      <h2
        id="section-4"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        4. Paiements sécurisés
      </h2>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Stripe :</strong> certifié PCI-DSS niveau 1 (le plus haut
            niveau de conformité). Devizly ne stocke jamais de numéro de carte
            bancaire.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Webhooks :</strong> chaque événement Stripe est vérifié via
            signature HMAC avant traitement.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Stripe Connect :</strong> les fonds de vos clients
            transitent directement vers votre compte Stripe, sans passer par
            Devizly.
          </span>
        </li>
      </ul>

      {/* Callout: PCI-DSS */}
      <div className="my-6 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-5">
        <p className="font-semibold text-blue-800">PCI-DSS</p>
        <p className="mt-1 text-sm text-blue-700">
          Stripe est certifié PCI-DSS niveau 1, le plus haut niveau de
          conformité. Devizly ne stocke jamais de numéro de carte bancaire.
        </p>
      </div>

      {/* Section 5 */}
      <h2
        id="section-5"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        5. Protection contre les abus
      </h2>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Rate limiting :</strong> les endpoints sensibles (envoi de
            devis, génération IA, paiement) sont limités à 5 requêtes par minute
            par IP via Upstash Redis.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Anti-abus :</strong> limitation à 2 créations de compte par
            adresse IP par semaine.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            <strong>Signature électronique :</strong> conforme eIDAS avec
            empreinte SHA-256, horodatage, IP et user-agent enregistrés.
          </span>
        </li>
      </ul>

      {/* Section 6 */}
      <h2
        id="section-6"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        6. Sauvegardes
      </h2>
      <ul className="mt-4 space-y-2 text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Sauvegardes automatiques quotidiennes de la base de données par
            Supabase (retention 7 jours).
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span className="leading-relaxed">
            Export CSV disponible à tout moment depuis votre tableau de bord.
          </span>
        </li>
      </ul>

      {/* Section 7 */}
      <h2
        id="section-7"
        className="mt-12 mb-4 text-xl font-bold text-slate-900"
      >
        7. Signaler une vulnérabilité
      </h2>
      <p className="leading-relaxed text-slate-600">
        Si vous découvrez une faille de sécurité, contactez-nous à{" "}
        <a
          href="mailto:security@devizly.fr"
          className="font-medium text-violet-600 hover:text-violet-500"
        >
          security@devizly.fr
        </a>
        . Nous nous engageons à traiter chaque signalement sous 48 heures.
      </p>

      {/* Callout: Signaler */}
      <div className="my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
        <p className="font-semibold text-amber-800">
          Important : Signalement
        </p>
        <p className="mt-1 text-sm text-amber-700">
          Toute vulnérabilité signalée à{" "}
          <a
            href="mailto:security@devizly.fr"
            className="font-medium underline"
          >
            security@devizly.fr
          </a>{" "}
          sera traitée sous 48 heures.
        </p>
      </div>

      {/* Footer note */}
      <div className="mt-16 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">
          Signaler une vulnérabilité :{" "}
          <a
            href="mailto:security@devizly.fr"
            className="font-medium text-violet-600 hover:text-violet-500"
          >
            security@devizly.fr
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
