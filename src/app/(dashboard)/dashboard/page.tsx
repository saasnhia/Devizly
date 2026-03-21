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
import { OnboardingProgress } from "@/components/onboarding-progress";
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
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return formatDate(date);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
  const recentQuotes = allQuotes.slice(0, 8);

  const plan = (profile?.subscription_status || "free") as PlanId;
  const devisUsed = profile?.devis_used || 0;
  const planInfo = PLANS[plan];
  const devisLimit = planInfo.devisLimit;
  const isUnlimited = devisLimit === -1;

  // ── Metrics ──
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const firstName = (user.user_metadata?.full_name || "").split(" ")[0] || "là";

  const sentQuotes = allQuotes.filter((q) => q.status === "envoyé");
  const signedCount = allQuotes.filter(
    (q) => q.status === "signé" || q.status === "accepté"
  ).length;
  const paidQuotes = allQuotes.filter((q) => q.status === "payé");
  const refusedCount = allQuotes.filter((q) => q.status === "refusé").length;

  // CA = paid + signed/accepted
  const revenueQuotes = allQuotes.filter(
    (q) => q.status === "payé" || q.status === "signé" || q.status === "accepté"
  );
  const caThisMonth = revenueQuotes
    .filter((q) => {
      const d = new Date(q.created_at);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);

  // CA last month for comparison
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

  // Conversion rate
  const respondedQuotes = signedCount + paidQuotes.length + refusedCount;
  const conversionRate = respondedQuotes > 0
    ? Math.round(((signedCount + paidQuotes.length) / respondedQuotes) * 100)
    : 0;

  // Pending revenue
  const pendingRevenue = sentQuotes.reduce(
    (sum, q) => sum + Number(q.total_ttc), 0
  );

  // Expired quotes (envoyé > 7 days)
  const expiredCount = sentQuotes.filter((q) => {
    const days = (Date.now() - new Date(q.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return days > 7;
  }).length;

  // ── Chart data ──
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

  // Onboarding
  const hasProfile = !!(profile?.company_name && profile?.company_siret);
  const hasQuote = allQuotes.length > 0;
  const hasStripe = profile?.stripe_connect_status === "active" || !!profile?.stripe_account_id;
  const hasSentQuote = allQuotes.some((q) => q.status !== "brouillon");
  const showOnboarding = !profile?.onboarding_completed || (!hasProfile || !hasQuote || !hasStripe || !hasSentQuote);

  const dateStr = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  }).format(now);

  return (
    <div className="space-y-6">
      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingProgress
          hasProfile={hasProfile}
          hasQuote={hasQuote}
          hasStripe={hasStripe}
          hasSentQuote={hasSentQuote}
        />
      )}

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
            <p className="mt-1 text-xs text-muted-foreground">
              Moy. secteur : 65%
            </p>
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
            <p className="mt-1 text-xs text-muted-foreground">
              {sentQuotes.length} devis
            </p>
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
              Décrivez en langage naturel, l&apos;IA structure tout
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>

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
              {expiredCount > 0
                ? `${expiredCount} devis sans réponse depuis +7j`
                : "Tous vos devis sont à jour"}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/devis?filter=signed"
          className="group flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-blue-50 to-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600 transition-transform group-hover:scale-110">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Paiements en attente</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pendingRevenue)} à encaisser
            </p>
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
          {recentQuotes.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-40" />
              <p className="text-lg font-medium">Aucun devis pour le moment</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Créez votre premier devis en 2 minutes avec l&apos;IA
              </p>
              <Button asChild className="mt-4 bg-violet-600 hover:bg-violet-700">
                <Link href="/devis/nouveau">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Créer votre premier devis
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {recentQuotes.map((quote) => {
                const clientName = quote.clients?.name || "Sans client";
                return (
                  <div
                    key={quote.id}
                    className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50"
                  >
                    {/* Avatar */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(clientName)}`}>
                      {getInitials(clientName)}
                    </div>

                    {/* Info */}
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

                    {/* Amount */}
                    <p className="shrink-0 text-sm font-bold">
                      {formatCurrency(Number(quote.total_ttc), quote.currency || "EUR")}
                    </p>

                    {/* Quick actions (visible on hover) */}
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
          )}
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
