import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Euro,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Bell,
  Download,
  Wallet,
  ArrowRight,
  Eye,
  Mail,
  Zap,
  CreditCard,
  Shield,
  CheckCircle2,
  Lock,
  Kanban,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils/quote";
import { PLANS } from "@/lib/stripe";
import { SeedButton } from "@/components/seed-button";
import { DashboardCharts } from "@/components/dashboard-charts";
import type { QuoteWithClient } from "@/types";
import type { PlanId } from "@/lib/stripe";

const ADMIN_USER_ID = "ea81a899-f85b-4b61-b931-6f45cb532094";

const MONTH_NAMES = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd\u2019hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return formatDate(date);
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ═══════════════════════════════════════════════════════
   ONBOARDING DASHBOARD (0 devis)
   ═══════════════════════════════════════════════════════ */

function OnboardingDashboard({
  firstName,
  hasProfile,
  hasQuote,
  hasSentQuote,
}: {
  firstName: string;
  hasProfile: boolean;
  hasQuote: boolean;
  hasSentQuote: boolean;
}) {
  const steps = [
    { label: "Créer votre compte", done: true, href: "", description: "" },
    {
      label: "Configurer votre profil",
      done: hasProfile,
      href: "/parametres",
      description: "Ajoutez votre logo, SIRET et coordonnées",
    },
    {
      label: "Créer votre premier devis",
      done: hasQuote,
      href: "/devis/nouveau",
      description: "L\u2019IA vous guide en 2 minutes",
    },
    {
      label: "Envoyer à un client",
      done: hasSentQuote,
      href: "",
      description: "Disponible après étape 3",
      locked: !hasQuote,
    },
  ] as const;

  const completed = steps.filter((s) => s.done).length;
  const percent = Math.round((completed / steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* [A] Welcome Hero */}
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Bienvenue sur Devizly, {firstName} !
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Votre premier devis professionnel est à 2 minutes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href="/devis/nouveau">
              <Zap className="mr-2 h-4 w-4" />
              Créer mon premier devis
            </Link>
          </Button>
        </div>
      </div>

      {/* [B] Activation Checklist */}
      <Card className="overflow-hidden">
        <CardContent className="p-7">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Démarrez en 4 étapes</p>
            <span className="text-xs font-medium text-slate-500">{completed}/4 complétées</span>
          </div>
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="space-y-1">
            {steps.map((step, i) => {
              const isLocked = "locked" in step && step.locked;
              const isNext = !step.done && !isLocked && steps.slice(0, i).every((s) => s.done);
              return (
                <div
                  key={step.label}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
                    isNext ? "bg-violet-50" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-slate-300" />
                    ) : (
                      <div className={`h-5 w-5 rounded-full border-2 ${
                        isNext ? "border-violet-400 bg-violet-100" : "border-slate-300"
                      }`} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      step.done ? "text-slate-400 line-through" : isLocked ? "text-slate-300" : "text-slate-900"
                    }`}>
                      {step.label}
                    </p>
                    {step.description && !step.done && (
                      <p className={`mt-0.5 text-xs ${isLocked ? "text-slate-300" : "text-slate-500"}`}>
                        {step.description}
                      </p>
                    )}
                  </div>
                  {!step.done && !isLocked && step.href && (
                    <Button asChild size="sm" variant="outline" className="shrink-0 text-xs">
                      <Link href={step.href}>
                        Compléter
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* [C] Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-violet-100 bg-gradient-to-br from-violet-50/50 to-white">
          <CardContent className="p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Devis IA en 2 min</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Décrivez votre prestation, l&apos;IA structure le devis et propose des prix marché.
            </p>
            <p className="mt-3 text-[10px] font-medium text-violet-500">
              1. Décrivez → 2. Ajustez → 3. Envoyez
            </p>
            <Button asChild variant="ghost" size="sm" className="mt-3 -ml-2 text-xs text-violet-600">
              <Link href="/devis/nouveau">
                Essayer maintenant
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
          <CardContent className="p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Kanban className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Pipeline de suivi</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Prospect → Envoyé → Signé → Payé. Relances automatiques sous 48h.
            </p>
            <div className="mt-3 flex gap-1">
              {["Prospect", "Envoyé", "Signé"].map((s) => (
                <span key={s} className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-500">
                  {s}
                </span>
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="mt-3 -ml-2 text-xs text-blue-600">
              <Link href="/dashboard/pipeline">
                Voir le pipeline
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-teal-100 bg-gradient-to-br from-teal-50/50 to-white">
          <CardContent className="p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Encaissez sans effort</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Votre client signe et paie depuis son navigateur — sans créer de compte.
            </p>
            <Badge variant="outline" className="mt-3 text-[10px]">
              <Shield className="mr-1 h-3 w-3" />
              Stripe sécurisé
            </Badge>
            <Button asChild variant="ghost" size="sm" className="mt-3 -ml-2 text-xs text-teal-600">
              <Link href="/parametres">
                Configurer Stripe
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* [D] Trust bar */}
      <div className="rounded-xl bg-slate-50 px-6 py-4 text-center text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            Devis pro en moins de 2 minutes
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Données hébergées en France · RGPD
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-blue-400" />
            Paiement sécurisé Stripe
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ═══════════════════════════════════════════════════════ */

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: quotes }, { data: profile }, { count: remindersSent }] =
    await Promise.all([
      supabase
        .from("quotes")
        .select("*, clients(*)")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("subscription_status, devis_used, onboarding_completed, company_name, company_siret, stripe_account_id, stripe_connect_status")
        .eq("id", user.id)
        .single(),
      supabase
        .from("quote_reminders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const allQuotes = (quotes || []) as QuoteWithClient[];
  const firstName = (user.user_metadata?.full_name || "").split(" ")[0] || "là";
  const hasProfile = !!(profile?.company_name && profile?.company_siret);
  const hasQuote = allQuotes.length > 0;
  const hasSentQuote = allQuotes.some((q) => q.status !== "brouillon");
  const isNewUser = allQuotes.length === 0;

  // ── New user → onboarding dashboard ──
  if (isNewUser) {
    return (
      <OnboardingDashboard
        firstName={firstName}
        hasProfile={hasProfile}
        hasQuote={false}
        hasSentQuote={false}
      />
    );
  }

  // ── Normal dashboard ──
  const recentQuotes = allQuotes.slice(0, 8);
  const plan = (profile?.subscription_status || "free") as PlanId;
  const devisUsed = profile?.devis_used || 0;
  const planInfo = PLANS[plan];
  const devisLimit = planInfo.devisLimit;
  const isUnlimited = devisLimit === -1;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const sentQuotes = allQuotes.filter((q) => q.status === "envoyé");
  const signedCount = allQuotes.filter(
    (q) => q.status === "signé" || q.status === "accepté"
  ).length;
  const paidQuotes = allQuotes.filter((q) => q.status === "payé");
  const refusedCount = allQuotes.filter((q) => q.status === "refusé").length;

  const revenueQuotes = allQuotes.filter(
    (q) => q.status === "payé" || q.status === "signé" || q.status === "accepté"
  );
  const caThisMonth = revenueQuotes
    .filter((q) => {
      const d = new Date(q.created_at);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const caLastMonth = revenueQuotes
    .filter((q) => {
      const d = new Date(q.created_at);
      return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
    })
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);
  const caGrowth = caLastMonth > 0
    ? Math.round(((caThisMonth - caLastMonth) / caLastMonth) * 100)
    : caThisMonth > 0 ? 100 : 0;

  const respondedQuotes = signedCount + paidQuotes.length + refusedCount;
  const conversionRate = respondedQuotes > 0
    ? Math.round(((signedCount + paidQuotes.length) / respondedQuotes) * 100)
    : 0;

  const pendingRevenue = sentQuotes.reduce(
    (sum, q) => sum + Number(q.total_ttc), 0
  );

  const expiredCount = sentQuotes.filter((q) => {
    const days = (Date.now() - new Date(q.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return days > 7;
  }).length;

  // Chart data
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const monthIdx = (currentMonth - 11 + i + 12) % 12;
    const year = currentMonth - 11 + i < 0 ? currentYear - 1 : currentYear;
    const amount = revenueQuotes
      .filter((q) => {
        const d = new Date(q.created_at);
        return d.getFullYear() === year && d.getMonth() === monthIdx;
      })
      .reduce((sum, q) => sum + Number(q.total_ttc), 0);
    return { month: `${MONTH_NAMES[monthIdx]} ${String(year).slice(2)}`, amount };
  });

  const funnel = [
    { name: "Envoyés", count: sentQuotes.length, color: "#3B82F6" },
    { name: "Signés", count: signedCount, color: "#22C55E" },
    { name: "Payés", count: paidQuotes.length, color: "#8B5CF6" },
    { name: "Refusés", count: refusedCount, color: "#EF4444" },
  ];

  const clientRevMap = new Map<string, number>();
  for (const q of revenueQuotes) {
    const name = q.clients?.name || "Sans client";
    clientRevMap.set(name, (clientRevMap.get(name) || 0) + Number(q.total_ttc));
  }
  const topClients = [...clientRevMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, total]) => ({ name, total }));

  const dateStr = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  }).format(now);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bonjour, {firstName}
          </h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          {user.id === ADMIN_USER_ID && <SeedButton />}
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/export/csv?year=${currentYear}`}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </a>
          </Button>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href="/devis/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau devis
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Quota (free plan only) ── */}
      {plan === "free" && (
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                Plan {planInfo.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {devisUsed} / {devisLimit} devis ce mois
              </span>
              {!isUnlimited && (
                <div className="h-2 w-24 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-violet-500 transition-all"
                    style={{ width: `${Math.min((devisUsed / devisLimit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/pricing">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Passer au Pro
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Stats Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">CA ce mois</p>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Euro className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(caThisMonth)}</p>
            <p className={`mt-1 text-xs ${caGrowth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {caGrowth >= 0 ? "+" : ""}{caGrowth}% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Devis envoyés</p>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold">{sentQuotes.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {sentQuotes.length} en attente de réponse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Taux de conversion</p>
              <div className={`rounded-lg p-2 ${conversionRate >= 50 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                <Target className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold">{conversionRate}%</p>
            <p className="mt-1 text-xs text-muted-foreground">Moy. secteur : 65%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">En attente</p>
              <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(pendingRevenue)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sentQuotes.length} devis</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/devis/nouveau"
          className="group flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-violet-50 to-white p-5 transition-all hover:border-violet-300 hover:shadow-md"
        >
          <div className="rounded-xl bg-violet-100 p-3 text-violet-600 transition-transform group-hover:scale-110">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Créer un devis IA</p>
            <p className="text-xs text-muted-foreground">
              L&apos;IA structure votre devis en 2 min
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>

        {expiredCount > 0 ? (
          <Link
            href="/devis?filter=expired"
            className="group flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-amber-50 to-white p-5 transition-all hover:border-amber-300 hover:shadow-md"
          >
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600 transition-transform group-hover:scale-110">
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Relancer un client</p>
              <p className="text-xs text-muted-foreground">
                {expiredCount} devis sans réponse depuis +7j
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="flex cursor-not-allowed items-center gap-4 rounded-2xl border bg-slate-50/50 p-5 opacity-50">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-400">
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-400">Relancer un client</p>
              <p className="text-xs text-slate-400">Tous vos devis sont à jour</p>
            </div>
          </div>
        )}

        <Link
          href="/devis?filter=signed"
          className="group flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-blue-50 to-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600 transition-transform group-hover:scale-110">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Paiements en attente</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(pendingRevenue)} à encaisser</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* ── Charts ── */}
      <DashboardCharts
        monthlyRevenue={monthlyRevenue}
        funnel={funnel}
        topClients={topClients}
      />

      {/* ── Recent Activity ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Derniers devis
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/devis">
              Voir tout
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentQuotes.map((quote) => {
              const clientName = quote.clients?.name || "Sans client";
              return (
                <div
                  key={quote.id}
                  className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(clientName)}`}>
                    {getInitials(clientName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/devis/nouveau?edit=${quote.id}`}
                        className="truncate text-sm font-semibold hover:underline"
                      >
                        {quote.title}
                      </Link>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 text-[10px] ${getStatusColor(quote.status)}`}
                      >
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {clientName} · {timeAgo(quote.created_at)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold">
                    {formatCurrency(Number(quote.total_ttc), quote.currency || "EUR")}
                  </p>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Voir">
                      <Link href={`/devis/nouveau?edit=${quote.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    {quote.status === "envoyé" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Relancer">
                        <Link href={`/devis/nouveau?edit=${quote.id}`}>
                          <Mail className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="PDF">
                      <a href={`/api/quotes/${quote.id}/pdf`} target="_blank" rel="noreferrer">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Relances stat */}
      {(remindersSent || 0) > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          {remindersSent} relance{(remindersSent || 0) > 1 ? "s" : ""} envoyée{(remindersSent || 0) > 1 ? "s" : ""} automatiquement
        </div>
      )}
    </div>
  );
}
