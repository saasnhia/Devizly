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
import { FileText, Send, CheckCircle, Euro, Plus, Sparkles, TrendingUp, Clock, Target } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils/quote";
import { PLANS } from "@/lib/stripe";
import type { QuoteWithClient } from "@/types";
import type { PlanId } from "@/lib/stripe";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: quotes }, { data: profile }] = await Promise.all([
    supabase
      .from("quotes")
      .select("*, clients(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("subscription_status, devis_used")
      .eq("id", user.id)
      .single(),
  ]);

  const allQuotes = (quotes || []) as QuoteWithClient[];
  const recentQuotes = allQuotes.slice(0, 5);

  const plan = (profile?.subscription_status || "free") as PlanId;
  const devisUsed = profile?.devis_used || 0;
  const planInfo = PLANS[plan];
  const devisLimit = planInfo.devisLimit;
  const isUnlimited = devisLimit === -1;
  const quotaPercent = isUnlimited ? 0 : Math.min((devisUsed / devisLimit) * 100, 100);
  const isNearLimit = !isUnlimited && devisUsed >= devisLimit - 1;

  // ── Metrics US-style ──
  const totalQuotes = allQuotes.length;
  const sentQuotes = allQuotes.filter((q) => q.status === "envoyé").length;
  const signedQuotes = allQuotes.filter(
    (q) => q.status === "signé" || q.status === "accepté"
  ).length;
  const refusedQuotes = allQuotes.filter((q) => q.status === "refusé").length;
  const totalRevenue = allQuotes
    .filter((q) => q.status === "signé" || q.status === "accepté")
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);

  // Conversion rate: signed / (signed + refused + sent)
  const respondedQuotes = signedQuotes + refusedQuotes;
  const conversionRate = respondedQuotes > 0
    ? Math.round((signedQuotes / respondedQuotes) * 100)
    : 0;

  // Average time to sign (days between created_at and now for signed quotes)
  const signedQuotesList = allQuotes.filter(
    (q) => q.status === "signé" || q.status === "accepté"
  );
  const avgDaysToSign = signedQuotesList.length > 0
    ? Math.round(
        signedQuotesList.reduce((sum, q) => {
          const created = new Date(q.created_at).getTime();
          const updated = new Date(q.updated_at).getTime();
          return sum + (updated - created) / (1000 * 60 * 60 * 24);
        }, 0) / signedQuotesList.length
      )
    : 0;

  // Average quote value
  const avgQuoteValue = signedQuotesList.length > 0
    ? totalRevenue / signedQuotesList.length
    : 0;

  const stats = [
    { label: "Total devis", value: String(totalQuotes), icon: FileText, color: "text-blue-600" },
    { label: "Devis envoyés", value: String(sentQuotes), icon: Send, color: "text-amber-600" },
    { label: "Devis signés", value: String(signedQuotes), icon: CheckCircle, color: "text-green-600" },
    { label: "CA généré", value: formatCurrency(totalRevenue), icon: Euro, color: "text-emerald-600" },
  ];

  const advancedMetrics = [
    {
      label: "Taux de conversion",
      value: `${conversionRate}%`,
      subtitle: `${signedQuotes} signés / ${respondedQuotes} répondus`,
      icon: Target,
      color: conversionRate >= 50 ? "text-green-600" : conversionRate >= 25 ? "text-amber-600" : "text-red-600",
    },
    {
      label: "Temps moyen signature",
      value: avgDaysToSign > 0 ? `${avgDaysToSign}j` : "—",
      subtitle: signedQuotesList.length > 0 ? `sur ${signedQuotesList.length} devis` : "Aucun devis signé",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Panier moyen",
      value: avgQuoteValue > 0 ? formatCurrency(avgQuoteValue) : "—",
      subtitle: signedQuotesList.length > 0 ? "par devis signé" : "Aucun devis signé",
      icon: TrendingUp,
      color: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/devis/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Link>
        </Button>
      </div>

      {/* Quota bar */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">
                Plan {planInfo.name}
              </p>
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

      {/* Primary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg bg-slate-100 p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced metrics (US-style: conversion, avg time, avg value) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {advancedMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg bg-slate-100 p-3 ${metric.color}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Devis récents</CardTitle>
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
                  <TableHead>Numéro</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-sm">
                      DEV-{String(quote.number).padStart(4, "0")}
                    </TableCell>
                    <TableCell>
                      <Link href={`/devis/nouveau?edit=${quote.id}`} className="hover:underline">
                        {quote.title}
                      </Link>
                    </TableCell>
                    <TableCell>{quote.clients?.name || "—"}</TableCell>
                    <TableCell>{formatCurrency(Number(quote.total_ttc))}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(quote.status)}>
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(quote.created_at)}</TableCell>
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
