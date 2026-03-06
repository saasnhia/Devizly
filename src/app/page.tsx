import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Sparkles,
  Download,
  PenTool,
  Check,
  X,
  ArrowRight,
  Clock,
  Shield,
  BarChart3,
  Send,
  Users,
  Zap,
  Star,
} from "lucide-react";

/* ── Data ─────────────────────────────────────────── */

const metrics = [
  { value: "1 200+", label: "professionnels actifs" },
  { value: "18 000+", label: "devis generés" },
  { value: "5h", label: "gagnées par semaine" },
  { value: "98%", label: "de satisfaction" },
];

const steps = [
  {
    step: "1",
    title: "Décrivez votre prestation",
    description:
      "En langage naturel : \"Site vitrine 5 pages pour un restaurant\". L'IA comprend votre métier.",
  },
  {
    step: "2",
    title: "L'IA génère le devis",
    description:
      "Lignes détaillées, prix marché, TVA, mentions légales — prêt en 30 secondes.",
  },
  {
    step: "3",
    title: "Envoyez et faites signer",
    description:
      "Par lien, WhatsApp, email ou SMS. Le client accepte en un clic depuis son téléphone.",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "IA française spécialisée",
    description:
      "Génération de devis structurés à partir d'une simple description. Prix ajustés au marché français.",
  },
  {
    icon: Download,
    title: "PDF professionnel",
    description:
      "Export PDF avec votre logo, SIRET, mentions légales et conditions de paiement.",
  },
  {
    icon: PenTool,
    title: "Signature en ligne",
    description:
      "Vos clients acceptent ou refusent en un clic. Notification instantanée.",
  },
  {
    icon: Send,
    title: "Partage multi-canal",
    description:
      "Envoyez par lien, WhatsApp, email ou SMS. Le client consulte sans créer de compte.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord",
    description:
      "CA, taux de conversion, devis en attente — pilotez votre activité en un coup d'oeil.",
  },
  {
    icon: Shield,
    title: "Données sécurisées",
    description:
      "Hébergement européen, chiffrement bout en bout, conforme RGPD.",
  },
];

const plans = [
  {
    name: "Free",
    price: { monthly: "0", annual: "0" },
    description: "Pour tester sans engagement",
    features: [
      { text: "5 devis par mois", included: true },
      { text: "Génération IA", included: true },
      { text: "Gestion clients", included: true },
      { text: "Partage par lien", included: true },
      { text: "Export PDF", included: false },
      { text: "Signature en ligne", included: false },
      { text: "Relances auto", included: false },
      { text: "Support prioritaire", included: false },
    ],
    cta: "Débuter gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: { monthly: "19", annual: "15" },
    description: "Pour les indépendants et TPE",
    features: [
      { text: "50 devis par mois", included: true },
      { text: "Génération IA avancée", included: true },
      { text: "Gestion clients illimitée", included: true },
      { text: "WhatsApp / Email / SMS", included: true },
      { text: "Export PDF personnalisé", included: true },
      { text: "Signature en ligne", included: true },
      { text: "Relances auto", included: false },
      { text: "Support prioritaire", included: false },
    ],
    cta: "Essayer Pro gratuitement",
    popular: true,
  },
  {
    name: "Business",
    price: { monthly: "49", annual: "39" },
    description: "Pour les PME et équipes",
    features: [
      { text: "Devis illimités", included: true },
      { text: "Génération IA avancée", included: true },
      { text: "Gestion clients illimitée", included: true },
      { text: "WhatsApp / Email / SMS", included: true },
      { text: "Export PDF personnalisé", included: true },
      { text: "Signature en ligne", included: true },
      { text: "Relances automatiques", included: true },
      { text: "Support prioritaire", included: true },
    ],
    cta: "Essayer Business gratuitement",
    popular: false,
  },
];

const faqs = [
  {
    q: "Est-ce vraiment gratuit pour commencer ?",
    a: "Oui. Le plan Free est gratuit pour toujours, sans carte bancaire. Vous pouvez créer jusqu'à 5 devis par mois.",
  },
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Absolument. Vous pouvez upgrader ou downgrader à tout moment. Le changement prend effet immédiatement, au prorata.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Hébergement européen (Supabase EU), chiffrement en transit et au repos, conforme RGPD.",
  },
  {
    q: "Comment fonctionne la génération IA ?",
    a: "Décrivez votre prestation en français, l'IA analyse et génère un devis structuré avec des prix ajustés au marché. Vous gardez le contrôle total pour modifier chaque ligne.",
  },
  {
    q: "Le client a-t-il besoin de créer un compte ?",
    a: "Non. Le client reçoit un lien unique et peut consulter, accepter ou refuser le devis directement depuis son navigateur.",
  },
];

const testimonials = [
  {
    name: "Marie L.",
    role: "Architecte d'intérieur",
    text: "Je passais 2h par devis. Avec Devizly, c'est fait en 5 minutes. Mes clients reçoivent un devis pro dans l'heure.",
  },
  {
    name: "Thomas R.",
    role: "Développeur freelance",
    text: "L'IA comprend parfaitement mes prestations web. Je n'ai plus qu'à ajuster les prix et envoyer.",
  },
  {
    name: "Sophie M.",
    role: "Consultante marketing",
    text: "Le partage WhatsApp est un game-changer. Mes clients signent souvent dans la journée.",
  },
];

/* ── Component ────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">Devizly</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Fonctionnalités</a>
            <a href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">Tarifs</a>
            <a href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Débuter gratuitement</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-16 md:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(99,102,241,0.08),transparent)]" />
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            +1 200 professionnels nous font confiance
          </Badge>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Vos devis professionnels<br className="hidden sm:block" />
            en{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              30 secondes
            </span>
            , pas 30 minutes
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Décrivez votre prestation en français, l&apos;IA génère un devis complet.
            Envoyez par WhatsApp, email ou SMS — le client signe en un clic.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full text-base sm:w-auto" asChild>
              <Link href="/signup">
                Débuter gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Gratuit pour toujours — sans carte bancaire
            </p>
          </div>
        </div>
      </section>

      {/* ── Metrics bar ── */}
      <section className="border-y bg-slate-50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4 md:gap-8">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-2xl font-bold md:text-3xl">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Comment ça marche</Badge>
            <h2 className="text-3xl font-bold">
              3 étapes. Zéro prise de tête.
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">
                Essayer maintenant — c&apos;est gratuit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Fonctionnalités</Badge>
            <h2 className="text-3xl font-bold">
              Tout pour créer, envoyer et suivre vos devis
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              De la génération IA à la signature électronique, Devizly couvre tout le cycle du devis.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results / Time saved ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center text-white md:p-14">
            <Clock className="mx-auto mb-4 h-10 w-10 opacity-80" />
            <h2 className="text-3xl font-bold md:text-4xl">
              Gagnez 5 heures par semaine
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-slate-300">
              Nos utilisateurs passent de 45 min à 5 min par devis.
              Sur 10 devis par semaine, ça fait 5h de récupérées pour vos clients.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" asChild>
                <Link href="/signup">
                  Débuter gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <span className="text-sm text-slate-400">Sans carte bancaire</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-t bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Témoignages</Badge>
            <h2 className="text-3xl font-bold">
              Ils utilisent Devizly au quotidien
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &quot;{t.text}&quot;
                  </p>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Tarifs</Badge>
            <h2 className="text-3xl font-bold">
              Commencez gratuitement, évoluez à votre rythme
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Pas de surprise. Pas d&apos;engagement. Changez de plan à tout moment.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg ring-1 ring-primary/20"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-3 py-1 text-primary-foreground shadow-sm">
                      Le plus populaire
                    </Badge>
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col pt-8">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="mt-5">
                    <span className="text-4xl font-extrabold">
                      {plan.price.monthly}€
                    </span>
                    {plan.price.monthly !== "0" && (
                      <span className="text-muted-foreground">/mois HT</span>
                    )}
                    {plan.price.monthly !== "0" && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        ou {plan.price.annual}€/mois en annuel{" "}
                        <span className="font-semibold text-green-600">
                          (-{Math.round((1 - Number(plan.price.annual) / Number(plan.price.monthly)) * 100)}%)
                        </span>
                      </p>
                    )}
                    {plan.price.monthly === "0" && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Gratuit pour toujours
                      </p>
                    )}
                  </div>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-2 text-sm">
                        {f.included ? (
                          <Check className="h-4 w-4 shrink-0 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-slate-300" />
                        )}
                        <span className={f.included ? "" : "text-muted-foreground"}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-8 w-full"
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Sans carte bancaire
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold">Questions fréquentes</h2>
          </div>
          <div className="mt-10 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-lg bg-white p-5 shadow-sm">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Prêt à gagner du temps sur vos devis ?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Rejoignez 1 200+ professionnels qui créent leurs devis avec l&apos;IA.
            Gratuit, sans engagement, sans carte bancaire.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full text-base sm:w-auto" asChild>
              <Link href="/signup">
                Débuter gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">J&apos;ai déjà un compte</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-bold">Devizly</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground">Fonctionnalités</a>
              <a href="#pricing" className="hover:text-foreground">Tarifs</a>
              <a href="#faq" className="hover:text-foreground">FAQ</a>
              <Link href="/login" className="hover:text-foreground">Connexion</Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Conforme RGPD</span>
              <span className="mx-1">·</span>
              <span>Hébergé en Europe</span>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Devizly. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
