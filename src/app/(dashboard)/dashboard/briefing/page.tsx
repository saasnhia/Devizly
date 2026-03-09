import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { BriefingActions } from "./briefing-actions";

interface BriefingRow {
  id: string;
  summary: string;
  actions: string[];
  stats: {
    pendingQuotes: number;
    pendingRevenue: string;
    caThisWeek: string;
    caLastWeek: string;
    caVariation: string;
    remindersToday: number;
    overdueQuotes: number;
  };
  created_at: string;
}

export default async function BriefingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: briefings } = await supabase
    .from("daily_briefings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(7);

  const latest = (briefings?.[0] as BriefingRow) || null;
  const history = (briefings?.slice(1) as BriefingRow[]) || [];

  const variationPositive = latest?.stats?.caVariation?.startsWith("+");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-violet-500" />
          <h1 className="text-2xl font-bold">Briefing IA</h1>
          <Badge variant="secondary" className="bg-violet-100 text-violet-700">
            Mistral AI
          </Badge>
        </div>
        <BriefingActions />
      </div>

      {!latest ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Brain className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p className="text-lg font-medium">Aucun briefing disponible</p>
            <p className="mt-1 text-sm">
              Votre premier briefing sera genere demain matin a 8h00, ou cliquez
              sur &quot;Generer maintenant&quot;.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card className="border-violet-200 bg-violet-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Resume du jour</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {new Date(latest.created_at).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[15px] leading-relaxed text-slate-700">
                {latest.summary}
              </p>
            </CardContent>
          </Card>

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                  {variationPositive ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    CA cette semaine
                  </p>
                  <p className="text-xl font-bold">
                    {latest.stats.caThisWeek}
                  </p>
                  <p
                    className={`text-xs ${variationPositive ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {latest.stats.caVariation} vs sem. derniere
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-xl font-bold">
                    {latest.stats.pendingQuotes}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {latest.stats.pendingRevenue}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    En retard (&gt;2j)
                  </p>
                  <p className="text-xl font-bold">
                    {latest.stats.overdueQuotes}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    sans reponse client
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Relances du jour
                  </p>
                  <p className="text-xl font-bold">
                    {latest.stats.remindersToday}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    envoyees automatiquement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowRight className="h-5 w-5 text-emerald-500" />
                Actions prioritaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {latest.actions.map((action, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Briefings precedents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {history.map((b) => (
                    <li
                      key={b.id}
                      className="rounded-lg border p-4 text-sm text-slate-600"
                    >
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        {new Date(b.created_at).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                      <p>{b.summary}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
