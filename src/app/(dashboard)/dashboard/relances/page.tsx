import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/quote";
import type { QuoteWithClient } from "@/types";

const REMINDER_LABELS = [
  { day: 2, label: "J+2 — Rappel consultation", icon: Eye },
  { day: 5, label: "J+5 — Relance signature", icon: Send },
  { day: 7, label: "J+7 — Proposition acompte", icon: Mail },
];

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function timeAgo(date: string): string {
  const days = daysSince(date);
  if (days === 0) return "Aujourd\u2019hui";
  if (days === 1) return "Hier";
  return `Il y a ${days}j`;
}

export default async function RelancesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: quotes }, { data: reminders }, { data: profile }] = await Promise.all([
    supabase
      .from("quotes")
      .select("*, clients(*)")
      .eq("user_id", user.id)
      .eq("status", "envoyé")
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("quote_reminders")
      .select("quote_id, reminder_number, sent_at, type")
      .eq("user_id", user.id)
      .eq("type", "email"),
    supabase
      .from("profiles")
      .select("subscription_status, relance_enabled")
      .eq("id", user.id)
      .single(),
  ]);

  const allQuotes = (quotes || []) as QuoteWithClient[];
  const allReminders = reminders || [];
  const plan = profile?.subscription_status || "free";
  const relanceEnabled = profile?.relance_enabled !== false;

  // Build reminder map: quote_id → Set of reminder_numbers sent
  const reminderMap = new Map<string, { numbers: Set<number>; lastSentAt: string | null }>();
  for (const r of allReminders) {
    if (!reminderMap.has(r.quote_id)) {
      reminderMap.set(r.quote_id, { numbers: new Set(), lastSentAt: null });
    }
    const entry = reminderMap.get(r.quote_id)!;
    entry.numbers.add(r.reminder_number);
    if (!entry.lastSentAt || r.sent_at > entry.lastSentAt) {
      entry.lastSentAt = r.sent_at;
    }
  }

  // Stats
  const totalPending = allQuotes.length;
  const totalPendingAmount = allQuotes.reduce((s, q) => s + Number(q.total_ttc), 0);
  const totalRemindersSent = allReminders.length;
  const quotesOverdue = allQuotes.filter((q) => daysSince(q.created_at) > 7).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relances automatiques</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vos devis en attente sont relancés automatiquement — J+2, J+5, J+7
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/parametres">
            Paramètres relances
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">En attente</p>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-1 text-2xl font-bold">{totalPending}</p>
            <p className="text-xs text-muted-foreground">devis non signés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Montant en jeu</p>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(totalPendingAmount)}</p>
            <p className="text-xs text-muted-foreground">TTC à signer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Relances envoyées</p>
              <Send className="h-4 w-4 text-violet-500" />
            </div>
            <p className="mt-1 text-2xl font-bold">{totalRemindersSent}</p>
            <p className="text-xs text-muted-foreground">emails auto</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Urgents (+7j)</p>
              <Bell className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-1 text-2xl font-bold">{quotesOverdue}</p>
            <p className="text-xs text-muted-foreground">sans réponse</p>
          </CardContent>
        </Card>
      </div>

      {/* Status banner */}
      {plan === "free" ? (
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <div>
                <p className="text-sm font-semibold">Relances automatiques — Pro requis</p>
                <p className="text-xs text-muted-foreground">
                  Passez au plan Pro pour activer les relances J+2, J+5, J+7
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/pricing">Passer au Pro</Link>
            </Button>
          </CardContent>
        </Card>
      ) : !relanceEnabled ? (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold">Relances désactivées</p>
                <p className="text-xs text-muted-foreground">
                  Activez les relances automatiques dans vos paramètres
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/parametres">Activer</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Main content: quotes + timeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Quotes table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Devis en attente de réponse
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allQuotes.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
                  <p className="font-medium">Tous vos devis ont reçu une réponse</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Aucun devis en attente de signature
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allQuotes.map((quote) => {
                    const days = daysSince(quote.created_at);
                    const rm = reminderMap.get(quote.id);
                    const sentCount = rm?.numbers.size || 0;
                    const isViewed = !!quote.viewed_at;

                    return (
                      <div
                        key={quote.id}
                        className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-slate-50"
                      >
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/devis/nouveau?edit=${quote.id}`}
                              className="truncate text-sm font-semibold hover:underline"
                            >
                              {quote.title}
                            </Link>
                            {isViewed && (
                              <Badge variant="outline" className="shrink-0 border-amber-200 text-[10px] text-amber-600">
                                <Eye className="mr-1 h-3 w-3" />
                                Vu
                              </Badge>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {quote.clients?.name || "Sans client"} · DEV-{String(quote.number).padStart(4, "0")} · {timeAgo(quote.created_at)}
                          </p>
                        </div>

                        {/* Amount */}
                        <p className="shrink-0 text-sm font-bold">
                          {formatCurrency(Number(quote.total_ttc), quote.currency || "EUR")}
                        </p>

                        {/* Relance dots */}
                        <div className="flex shrink-0 flex-col items-center gap-1">
                          <div className="flex gap-1">
                            {[1, 2, 3].map((n) => {
                              const sent = rm?.numbers.has(n);
                              const isNext = !sent && sentCount === n - 1 && days >= [2, 5, 7][n - 1];
                              return (
                                <div
                                  key={n}
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    sent
                                      ? "bg-emerald-500"
                                      : isNext
                                        ? "animate-pulse bg-amber-400"
                                        : "bg-slate-200"
                                  }`}
                                  title={`J+${[2, 5, 7][n - 1]} ${sent ? "envoyé" : isNext ? "en cours" : "programmé"}`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {sentCount}/3
                          </span>
                        </div>

                        {/* Action */}
                        <Button asChild variant="outline" size="sm" className="shrink-0 text-xs">
                          <Link href={`/devis/nouveau?edit=${quote.id}`}>
                            <Mail className="mr-1 h-3 w-3" />
                            Relancer
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Timeline explanation */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Séquence de relance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {REMINDER_LABELS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.day} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          i === 0
                            ? "bg-emerald-100 text-emerald-600"
                            : i === 1
                              ? "bg-blue-100 text-blue-600"
                              : "bg-violet-100 text-violet-600"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {i < 2 && (
                          <div className="mt-1 h-6 w-0.5 bg-slate-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-sm font-semibold">{step.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {i === 0 && "Email envoyé 2 jours après la première consultation"}
                          {i === 1 && "Relance pour inviter le client à signer le devis"}
                          {i === 2 && "Proposition de payer un acompte 30% pour démarrer"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
                <div>
                  <p className="text-sm font-semibold">Aperçu email</p>
                  <div className="mt-2 rounded-lg border bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold text-slate-700">
                      Objet : Votre devis DEV-XXXX attend votre signature
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      De : votre entreprise via Devizly
                    </p>
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
                      Bonjour, nous n&apos;avons pas encore reçu votre retour pour le devis...
                      Vous pouvez le signer en 10 secondes depuis votre mobile.
                    </p>
                    <div className="mt-2 rounded bg-emerald-500 px-3 py-1.5 text-center text-[10px] font-semibold text-white">
                      Consulter et signer le devis
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Les emails incluent un lien de désinscription RGPD
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
