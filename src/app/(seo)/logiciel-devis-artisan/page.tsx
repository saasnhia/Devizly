import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CTABanner } from "@/components/seo/cta-banner";
import { HowItWorks } from "@/components/seo/how-it-works";
import { DevisExample } from "@/components/seo/devis-example";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { SocialProof } from "@/components/seo/social-proof";
import { FileText, Shield, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Logiciel de Devis Gratuit pour Artisans",
  description:
    "Créez vos devis artisan en 2 minutes avec l'IA. Mentions obligatoires, TVA, signature électronique. Logiciel gratuit pour électriciens, plombiers, maçons et tous les métiers du bâtiment.",
  alternates: { canonical: "https://devizly.fr/logiciel-devis-artisan" },
  openGraph: {
    title: "Logiciel de Devis Gratuit pour Artisans — Devizly",
    description:
      "Devis artisan en 2 minutes avec l'IA. TVA, mentions obligatoires, signature électronique. Pour électriciens, plombiers, maçons.",
    url: "https://devizly.fr/logiciel-devis-artisan",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devizly — Logiciel devis gratuit pour artisans" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Logiciel de Devis Gratuit pour Artisans",
    description: "Devis artisan en 2 min. IA + TVA auto + signature électronique. Gratuit pour tous les métiers du bâtiment.",
    images: ["/og-image.png"],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Devizly — Logiciel devis artisan",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  description: "Logiciel de devis gratuit pour artisans du bâtiment.",
  url: "https://devizly.fr/logiciel-devis-artisan",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Un devis artisan est-il obligatoire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, pour tout travail dont le montant dépasse 150 € TTC, un devis écrit est obligatoire avant le début des travaux. Pour les dépannages et réparations, le devis est obligatoire au-delà de 150 €. En dessous, le professionnel doit informer le client du caractère payant de la prestation et de son prix avant exécution.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle est la durée de validité d'un devis ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La loi ne fixe pas de durée minimale, mais il est recommandé d'indiquer une durée de validité de 30 à 90 jours. Devizly ajoute automatiquement une durée de validité de 30 jours sur chaque devis. Passé ce délai, le professionnel n'est plus engagé par les prix indiqués.",
      },
    },
    {
      "@type": "Question",
      name: "Comment faire signer un devis à distance ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Avec Devizly, envoyez votre devis par email ou partagez un lien. Votre client le consulte sur son navigateur et le signe électroniquement d'un simple geste sur l'écran. La signature a valeur juridique et est horodatée.",
      },
    },
  ],
};

export default function LogicielDevisArtisanPage() {
  return (
    <>
      <JsonLd data={schema} />
      <JsonLd data={faqSchema} />

      <article>
        {/* Hero badges */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">Gratuit</span>
          <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-400">IA Mistral</span>
          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-400">Sans CB</span>
        </div>

        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Logiciel de devis gratuit pour artisans
        </h1>

        {/* Hero stats */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <span className="text-slate-400"><strong className="text-white">30 secondes</strong> — génération IA</span>
          <span className="text-slate-400"><strong className="text-white">0 €</strong> — plan gratuit</span>
          <span className="text-slate-400"><strong className="text-white">100% légal</strong> — mentions conformes</span>
        </div>

        <Link
          href="/signup"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
        >
          Créer mon devis gratuit
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="mt-8 text-lg leading-relaxed text-slate-300">
          En tant qu&apos;artisan — électricien, plombier, maçon, peintre, menuisier ou carreleur — vous
          savez que chaque minute passée sur la paperasse est une minute de perdue sur le chantier.
          Devizly est un logiciel de devis en ligne conçu pour les professionnels du bâtiment qui
          veulent créer des devis conformes à la réglementation française en quelques clics.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          La loi française impose des mentions obligatoires strictes sur chaque devis : le numéro
          SIRET de l&apos;entreprise, la date de validité de l&apos;offre, le détail des prestations avec
          prix unitaires et quantités, le taux de TVA applicable (20&nbsp;% standard, 10&nbsp;% pour
          les travaux de rénovation sur des logements de plus de 2 ans, ou 5,5&nbsp;% pour les
          travaux d&apos;amélioration énergétique), ainsi que les conditions de paiement et les éventuels
          acomptes. Oublier une seule de ces mentions peut rendre votre devis contestable.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Avec Devizly, vous décrivez simplement votre prestation — par exemple &laquo;&nbsp;rénovation
          salle de bain complète, pose carrelage sol et murs, remplacement baignoire par douche
          italienne&nbsp;&raquo; — et l&apos;intelligence artificielle structure automatiquement votre devis
          avec toutes les lignes de postes, les prix marché comme point de départ, et les mentions
          légales obligatoires. Vous gardez bien sûr le contrôle total : chaque ligne, chaque tarif,
          chaque description est modifiable avant l&apos;envoi.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Le devis est ensuite envoyé par email ou partagé par lien direct. Votre client peut le
          consulter sur son téléphone, le signer électroniquement sans créer de compte, et même verser
          un acompte par carte bancaire. Vous suivez tout depuis votre tableau de bord : devis en
          attente, signés, payés. Plus besoin de relancer manuellement — Devizly envoie des relances
          automatiques à J+2, J+5 et J+7 si le client n&apos;a pas répondu.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Que vous soyez artisan en micro-entreprise avec franchise de TVA ou entreprise au réel,
          Devizly s&apos;adapte à votre régime fiscal. Le logiciel gère la mention &laquo;&nbsp;TVA non
          applicable, article 293 B du CGI&nbsp;&raquo; pour les auto-entrepreneurs, et calcule
          automatiquement la TVA pour les autres régimes. Vos factures sont générées automatiquement
          après signature, avec une numérotation séquentielle conforme.
        </p>

        {/* Pourquoi un logiciel de devis */}
        <h2 className="mt-14 text-2xl font-bold">Pourquoi utiliser un logiciel de devis quand on est artisan&nbsp;?</h2>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Le constat est simple&nbsp;: <strong className="text-white">68&nbsp;% des artisans perdent des clients</strong> faute
          de réactivité sur leurs devis. Un particulier qui demande un devis pour une rénovation de
          salle de bain s&apos;attend à recevoir une réponse sous 24&nbsp;heures. Si vous répondez en
          3&nbsp;jours avec un fichier Word mal formaté, le client est déjà parti chez un concurrent.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Un logiciel de devis adapté aux artisans résout ce problème en vous permettant de créer un
          devis professionnel depuis votre téléphone, entre deux chantiers. Plus besoin de rentrer au
          bureau le soir pour ouvrir Excel. Avec Devizly, vous décrivez la prestation en langage
          naturel et l&apos;IA génère un devis complet avec les bonnes lignes, les bons taux de TVA
          et toutes les mentions légales obligatoires.
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Les artisans qui utilisent un logiciel de devis constatent en
          moyenne une <strong className="text-white">réduction de 80&nbsp;% du temps</strong> passé
          sur la paperasse, un <strong className="text-white">taux de signature
          supérieur de 35&nbsp;%</strong> grâce à la signature électronique, et un <strong className="text-white">encaissement plus rapide</strong> grâce aux acomptes par carte bancaire intégrés.
        </p>

        {/* Mentions obligatoires */}
        <h2 className="mt-14 text-2xl font-bold">Les mentions obligatoires sur un devis artisan en 2026</h2>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          La réglementation française impose des mentions strictes sur tout devis professionnel.
          Un devis non conforme peut entraîner une amende de
          3&nbsp;000&nbsp;€ (personne physique) ou 15&nbsp;000&nbsp;€ (personne morale).
          Devizly remplit automatiquement chaque mention&nbsp;:
        </p>

        <ul className="mt-4 space-y-2 pl-6 text-base text-slate-400">
          <li className="list-disc marker:text-violet-500">Identité de l&apos;entreprise&nbsp;: nom, SIRET, adresse, RCS</li>
          <li className="list-disc marker:text-violet-500">N° TVA intracommunautaire (ou mention exonération art.&nbsp;293&nbsp;B)</li>
          <li className="list-disc marker:text-violet-500">Date d&apos;émission et durée de validité (30&nbsp;jours par défaut)</li>
          <li className="list-disc marker:text-violet-500">Description détaillée de chaque prestation avec prix unitaire HT</li>
          <li className="list-disc marker:text-violet-500">Quantités et unités (forfait, m², heure, pièce)</li>
          <li className="list-disc marker:text-violet-500">Taux de TVA (5,5&nbsp;%, 10&nbsp;% ou 20&nbsp;% selon les travaux)</li>
          <li className="list-disc marker:text-violet-500">Total HT, montant TVA, total TTC</li>
          <li className="list-disc marker:text-violet-500">Conditions de paiement et pénalités de retard</li>
          <li className="list-disc marker:text-violet-500">Assurance décennale (numéro et assureur, si applicable)</li>
        </ul>

        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Devizly pré-remplit toutes ces informations à partir de votre profil. Changez de régime
          fiscal, mettez à jour votre SIRET — le logiciel s&apos;adapte automatiquement.
        </p>

        {/* 3 avantages */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Zap className="mb-3 h-8 w-8 text-violet-400" />
            <h3 className="text-lg font-semibold">Devis en 30 secondes</h3>
            <p className="mt-2 text-sm text-slate-400">
              Décrivez votre prestation, l&apos;IA structure tout. Mentions légales incluses automatiquement.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <FileText className="mb-3 h-8 w-8 text-emerald-400" />
            <h3 className="text-lg font-semibold">Conforme loi française</h3>
            <p className="mt-2 text-sm text-slate-400">
              TVA 10&nbsp;%/20&nbsp;%, SIRET, conditions de paiement, garantie décennale — tout est inclus.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <Shield className="mb-3 h-8 w-8 text-amber-400" />
            <h3 className="text-lg font-semibold">Signature + paiement</h3>
            <p className="mt-2 text-sm text-slate-400">
              Votre client signe et paie depuis son téléphone. Acompte Stripe intégré.
            </p>
          </div>
        </div>

        {/* Comparaison */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Devizly vs Excel vs Tolteck</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <ComparisonTable competitorName="Tolteck" />
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Comment créer un devis artisan avec Devizly</h2>
          <HowItWorks />
        </div>

        {/* Exemple de devis */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Exemple de devis artisan généré par l&apos;IA</h2>
          <DevisExample
            metier="Rénovation salle de bain"
            lines={[
              { description: "Dépose baignoire + évacuation", qty: 1, unit: "forfait", price: 450 },
              { description: "Pose douche italienne (receveur + paroi)", qty: 1, unit: "forfait", price: 1800 },
              { description: "Carrelage sol et murs (fourniture + pose)", qty: 12, unit: "m²", price: 85 },
              { description: "Plomberie (raccords + robinetterie)", qty: 1, unit: "forfait", price: 650 },
              { description: "Peinture plafond (2 couches)", qty: 1, unit: "forfait", price: 280 },
            ]}
          />
          <p className="mt-3 text-center text-xs text-slate-500">
            Devis exemple — les montants sont ajustables à vos tarifs réels.
          </p>
        </div>

        {/* CTA mid-page */}
        <div className="mt-12">
          <CTABanner
            title="Créez votre premier devis artisan"
            subtitle="30 secondes avec l'IA. Gratuit, sans carte bancaire."
            cta="Essayer maintenant"
          />
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Un devis artisan est-il obligatoire ?
              </h3>
              <p className="mt-2 text-slate-400">
                Oui, pour tout travail dont le montant dépasse 150&nbsp;€ TTC, un devis écrit est
                obligatoire avant le début des travaux. Pour les dépannages et réparations, le devis
                est obligatoire au-delà de 150&nbsp;€. En dessous, le professionnel doit informer le
                client du caractère payant de la prestation et de son prix avant exécution.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Quelle est la durée de validité d&apos;un devis ?
              </h3>
              <p className="mt-2 text-slate-400">
                La loi ne fixe pas de durée minimale, mais il est recommandé d&apos;indiquer une durée
                de validité de 30 à 90 jours. Devizly ajoute automatiquement une durée de validité de
                30 jours sur chaque devis. Passé ce délai, le professionnel n&apos;est plus engagé par
                les prix indiqués.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400">
                Comment faire signer un devis à distance ?
              </h3>
              <p className="mt-2 text-slate-400">
                Avec Devizly, envoyez votre devis par email ou partagez un lien. Votre client le
                consulte sur son navigateur et le signe électroniquement d&apos;un simple geste sur
                l&apos;écran. La signature a valeur juridique et est horodatée.
              </p>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-16">
          <SocialProof />
        </div>

        {/* CTA bottom */}
        <div className="mt-16">
          <CTABanner
            title="Prêt à gagner du temps sur vos devis ?"
            subtitle="Créez votre premier devis artisan en 30 secondes. Gratuit, sans CB."
          />
        </div>

        {/* Internal links — metiers */}
        <div className="mt-12 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Devis par métier :</span>
          <Link href="/logiciel-devis/plombier" className="text-violet-400 hover:text-violet-300">Plombier</Link>
          <span className="text-slate-600">·</span>
          <Link href="/logiciel-devis/electricien" className="text-violet-400 hover:text-violet-300">Électricien</Link>
          <span className="text-slate-600">·</span>
          <Link href="/logiciel-devis/peintre" className="text-violet-400 hover:text-violet-300">Peintre</Link>
          <span className="text-slate-600">·</span>
          <Link href="/logiciel-devis/couvreur" className="text-violet-400 hover:text-violet-300">Couvreur</Link>
          <span className="text-slate-600">·</span>
          <Link href="/logiciel-devis/macon" className="text-violet-400 hover:text-violet-300">Maçon</Link>
          <span className="text-slate-600">·</span>
          <Link href="/logiciel-devis/menuisier" className="text-violet-400 hover:text-violet-300">Menuisier</Link>
        </div>

        {/* Internal links */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Voir aussi :</span>
          <Link href="/devis-batiment-gratuit" className="text-violet-400 hover:text-violet-300">Devis bâtiment gratuit</Link>
          <span className="text-slate-600">·</span>
          <Link href="/devis-auto-entrepreneur" className="text-violet-400 hover:text-violet-300">Devis auto-entrepreneur</Link>
          <span className="text-slate-600">·</span>
          <Link href="/creer-devis-en-ligne" className="text-violet-400 hover:text-violet-300">Créer devis en ligne</Link>
          <span className="text-slate-600">·</span>
          <Link href="/pricing" className="text-violet-400 hover:text-violet-300">Tarifs</Link>
        </div>

        {/* Blog links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">Articles :</span>
          <Link href="/blog/mentions-obligatoires-devis-artisan" className="text-emerald-400 hover:text-emerald-300">Mentions obligatoires sur un devis artisan</Link>
          <span className="text-slate-600">·</span>
          <Link href="/blog/tva-devis-facture-artisan" className="text-emerald-400 hover:text-emerald-300">TVA sur devis et factures artisan</Link>
        </div>
      </article>
    </>
  );
}
