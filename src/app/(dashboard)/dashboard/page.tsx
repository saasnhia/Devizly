import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Euro,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  CreditCard,
  Bell,
  Download,
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
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: quotes }, { data: profile }, { count: remindersSent }] =
    await Promise.all([
      supabase
        .from("quotes")
        .select("*, clients(*)")
        .eq("user_id", user.id)
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
  const recentQuotes = allQuotes.slice(0, 5);

  const plan = (profile?.subscription_status || "free") as PlanId;
  const devisUsed = profile?.devis_used || 0;
  const planInfo = PLANS[plan];
  const devisLimit = planInfo.devisLimit;
  const isUnlimited = devisLimit === -1;
  const quotaPercent = isUnlimited
    ? 0
    : Math.min((devisUsed / devisLimit) * 100, 100);
  const isNearLimit = !isUnlimited && devisUsed >= devisLimit - 1;

  // ── Metrics ──
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const sentQuotes = allQuotes.filter((q) => q.status === "envoyé").length;
  const signedQuotes = allQuotes.filter(
    (q) => q.status === "signé" || q.status === "accepté"
  ).length;
  const paidQuotes = allQuotes.filter((q) => q.status === "payé");
  const refusedQuotes = allQuotes.filter((q) => q.status === "refusé").length;

  // CA = paid + signed/accepted quotes
  const revenueQuotes = allQuotes.filter(
    (q) => q.status === "payé" || q.status === "signé" || q.status === "accepté"
  );
  const totalCA = revenueQuotes.reduce(
    (sum, q) => sum + Number(q.total_ttc),
    0
  );

  // CA this month
  const caThisMonth = revenueQuotes
    .filter((q) => {
      const d = new Date(q.created_at);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);

  // Conversion rate
  const respondedQuotes = signedQuotes + paidQuotes.length + refusedQuotes;
  const conversionRate =
    respondedQuotes > 0
      ? Math.round(
          ((signedQuotes + paidQuotes.length) / respondedQuotes) * 100
        )
      : 0;

  // Average time to sign
  const signedList = allQuotes.filter(
    (q) =>
      q.status === "signé" || q.status === "accepté" || q.status === "payé"
  );
  const avgDaysToSign =
    signedList.length > 0
      ? Math.round(
          signedList.reduce((sum, q) => {
            const created = new Date(q.created_at).getTime();
            const updated = new Date(q.updated_at).getTime();
            return sum + (updated - created) / (1000 * 60 * 60 * 24);
          }, 0) / signedList.length
        )
      : 0;

  // Pending revenue (envoyé quotes)
  const pendingRevenue = allQuotes
    .filter((q) => q.status === "envoyé")
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);

  // ── Chart data: Monthly CA (last 12 months) ──
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const monthIdx = (currentMonth - 11 + i + 12) % 12;
    const year =
      currentMonth - 11 + i < 0 ? currentYear - 1 : currentYear;
    const amount = revenueQuotes
      .filter((q) => {
        const d = new Date(q.created_at);
        return d.getFullYear() === year && d.getMonth() === monthIdx;
      })
      .reduce((sum, q) => sum + Number(q.total_ttc), 0);
    return {
      month: `${MONTH_NAMES[monthIdx]} ${String(year).slice(2)}`,
      amount,
    };
  });

  // ── Chart data: Funnel ──
  const funnel = [
    { name: "Envoyés", count: sentQuotes, color: "#3B82F6" },
    {
      name: "Signés",
      count: signedQuotes,
      color: "#22C55E",
    },
    { name: "Payés", count: paidQuotes.length, color: "#8B5CF6" },
    { name: "Refusés", count: refusedQuotes, color: "#EF4444" },
  ];

  // ── Chart data: Top 5 clients ──
  const clientRevMap = new Map<string, number>();
  for (const q of revenueQuotes) {
    const name = q.clients?.name || "Sans client";
    clientRevMap.set(name, (clientRevMap.get(name) || 0) + Number(q.total_ttc));
  }
  const topClients = [...clientRevMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, total]) => ({ name, total }));

  // ── KPI cards ──
  const kpis = [
    {
      label: `CA ${currentYear}`,
      value: formatCurrency(totalCA),
      subtitle: `${formatCurrency(caThisMonth)} ce mois`,
      icon: Euro,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Taux de conversion",
      value: `${conversionRate}%`,
      subtitle: `${signedQuotes + paidQuotes.length} / ${respondedQuotes} repondus`,
      icon: Target,
      color:
        conversionRate >= 50
          ? "text-green-600"
          : conversionRate >= 25
            ? "text-amber-600"
            : "text-red-600",
      bgColor:
        conversionRate >= 50
          ? "bg-green-50"
          : conversionRate >= 25
            ? "bg-amber-50"
            : "bg-red-50",
    },
    {
      label: "En attente",
      value: String(sentQuotes),
      subtitle: formatCurrency(pendingRevenue),
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Paiements recus",
      value: String(paidQuotes.length),
      subtitle: avgDaysToSign > 0 ? `~${avgDaysToSign}j pour signer` : "—",
      icon: CreditCard,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      label: "Relances envoyees",
      value: String(remindersSent || 0),
      subtitle:
        plan === "free"
          ? "Disponible en Pro"
          : `${sentQuotes} devis en attente`,
      icon: Bell,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  // Onboarding progress data
  const hasProfile = !!(profile?.company_name && profile?.company_siret);
  const hasQuote = allQuotes.length > 0;
  const hasStripe = profile?.stripe_connect_status === "active" || !!profile?.stripe_account_id;
  const hasSentQuote = allQuotes.some((q) => q.status !== "brouillon");
  const showOnboarding = !profile?.onboarding_completed || (!hasProfile || !hasQuote || !hasStripe || !hasSentQuote);

  return (
    <div className="space-y-6">
      {/* Onboarding Progress (A3) */}
      {showOnboarding && (
        <OnboardingProgress
          hasProfile={hasProfile}
          hasQuote={hasQuote}
          hasStripe={hasStripe}
          hasSentQuote={hasSentQuote}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {user.id === ADMIN_USER_ID && <SeedButton />}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/export/csv?year=${new Date().getFullYear()}`}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </a>
          </Button>
          <Button asChild>
            <Link href="/devis/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau devis
            </Link>
          </Button>
        </div>
      </div>

      {/* Quota bar */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Plan {planInfo.name}</p>
              <Badge variant="secondary" className="text-xs">
                {isUnlimited
                  ? `${devisUsed} devis ce mois`
                  : `${devisUsed} / ${devisLimit} devis ce mois`}
              </Badge>
            </div>
            {!isUnlimited && (
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isNearLimit ? "bg-red-500" : "bg-primary"
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            )}
          </div>
          {plan === "free" && (
            <Button asChild size="sm">
              <Link href="/pricing">
                <Sparkles className="mr-2 h-4 w-4" />
                Passer au Pro — 19€/mois
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg p-3 ${kpi.bgColor} ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {kpi.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        monthlyRevenue={monthlyRevenue}
        funnel={funnel}
        topClients={topClients}
      />

      {/* Recent Quotes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Devis recents
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/devis">Voir tout</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentQuotes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="mx-auto mb-2 h-10 w-10 opacity-50" />
              <p>Aucun devis pour le moment</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/devis/nouveau">Créer votre premier devis</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Client
                  </TableHead>
                  <TableHead className="text-right">Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-sm">
                      DEV-{String(quote.number).padStart(4, "0")}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/devis/nouveau?edit=${quote.id}`}
                        className="hover:underline"
                      >
                        {quote.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {quote.clients?.name || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(quote.total_ttc), quote.currency || "EUR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(quote.status)}
                      >
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDate(quote.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
