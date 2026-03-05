import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Sparkles,
  Download,
  PenTool,
  Check,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Génération IA",
    description:
      "Décrivez votre prestation en langage naturel et l'IA génère un devis professionnel complet en secondes.",
  },
  {
    icon: Download,
    title: "Export PDF",
    description:
      "Générez des devis PDF professionnels avec votre logo, vos mentions légales et le détail des prestations.",
  },
  {
    icon: PenTool,
    title: "Signature électronique",
    description:
      "Envoyez vos devis par email et faites-les signer en ligne. Suivi en temps réel du statut.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "19",
    description: "Pour les indépendants",
    features: [
      "50 devis par mois",
      "Génération IA",
      "Export PDF",
      "Gestion clients",
      "Tableau de bord",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: "49",
    description: "Pour les équipes",
    features: [
      "Devis illimités",
      "Génération IA avancée",
      "Export PDF personnalisé",
      "Signature électronique",
      "Relances automatiques",
      "Support prioritaire",
    ],
    cta: "Essai gratuit 14 jours",
    popular: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Quotify</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Créez vos devis professionnels en{" "}
            <span className="text-primary">30 secondes</span> avec l&apos;IA
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Décrivez votre prestation, l&apos;intelligence artificielle génère un
            devis complet. Personnalisez, envoyez et faites signer en ligne.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">J&apos;ai déjà un compte</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">
            Tout ce qu&apos;il faut pour vos devis
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            De la génération à la signature, en passant par le suivi
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold">
            Tarifs simples et transparents
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Commencez gratuitement, évoluez quand vous êtes prêt
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.popular ? "border-primary shadow-lg" : "border"
                }
              >
                <CardContent className="pt-6">
                  {plan.popular && (
                    <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Populaire
                    </div>
                  )}
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-8 w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Quotify. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
