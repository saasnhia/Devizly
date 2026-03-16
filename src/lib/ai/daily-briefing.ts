import { createServerClient } from "@supabase/ssr";
import { getMistral, cleanJSON } from "@/lib/mistral";
import { formatCurrency } from "@/lib/utils/quote";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export interface BriefingResult {
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
}

interface QuoteRow {
  id: string;
  title: string;
  number: number;
  total_ttc: string | number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  valid_until: string | null;
  clients: { name: string; email: string | null }[] | null;
}

export async function generateDailyBriefing(userId: string): Promise<BriefingResult> {
  const supabase = createServiceClient();
  const now = new Date();

  // Fetch all user quotes with clients
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, title, number, total_ttc, currency, status, created_at, updated_at, valid_until, clients(name, email)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const allQuotes = (quotes || []) as QuoteRow[];

  // Pending quotes (envoyé) older than 2 days
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const pendingQuotes = allQuotes.filter((q) => q.status === "envoyé");
  const overdueQuotes = pendingQuotes.filter(
    (q) => new Date(q.created_at) < twoDaysAgo
  );

  // Quotes expiring soon (valid_until within 3 days)
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const expiringQuotes = pendingQuotes.filter(
    (q) => q.valid_until && new Date(q.valid_until) <= threeDaysFromNow
  );

  // Revenue this week vs last week
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const revenueStatuses = ["signé", "accepté", "payé"];
  const revenueQuotes = allQuotes.filter((q) =>
    revenueStatuses.includes(q.status)
  );

  const caThisWeek = revenueQuotes
    .filter((q) => new Date(q.updated_at) >= startOfWeek)
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);

  const caLastWeek = revenueQuotes
    .filter(
      (q) =>
        new Date(q.updated_at) >= startOfLastWeek &&
        new Date(q.updated_at) < startOfWeek
    )
    .reduce((sum, q) => sum + Number(q.total_ttc), 0);

  const caVariation =
    caLastWeek > 0
      ? `${caThisWeek >= caLastWeek ? "+" : ""}${Math.round(((caThisWeek - caLastWeek) / caLastWeek) * 100)}%`
      : caThisWeek > 0
        ? "+100%"
        : "0%";

  // Pending revenue
  const pendingRevenue = pendingQuotes.reduce(
    (sum, q) => sum + Number(q.total_ttc),
    0
  );

  // Reminders due today (quotes at J+3, J+7, J+14)
  const { count: remindersToday } = await supabase
    .from("quote_reminders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("sent_at", now.toISOString().split("T")[0])
    .lt("sent_at", new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  const stats: BriefingResult["stats"] = {
    pendingQuotes: pendingQuotes.length,
    pendingRevenue: formatCurrency(pendingRevenue),
    caThisWeek: formatCurrency(caThisWeek),
    caLastWeek: formatCurrency(caLastWeek),
    caVariation,
    remindersToday: remindersToday || 0,
    overdueQuotes: overdueQuotes.length,
  };

  // Build context for Mistral
  const overdueList = overdueQuotes
    .slice(0, 10)
    .map(
      (q) =>
        `- DEV-${String(q.number).padStart(4, "0")} "${q.title}" (${formatCurrency(Number(q.total_ttc), q.currency || "EUR")}) pour ${q.clients?.[0]?.name || "client inconnu"} — envoye le ${new Date(q.created_at).toLocaleDateString("fr-FR")}`
    )
    .join("\n");

  const expiringList = expiringQuotes
    .slice(0, 5)
    .map(
      (q) =>
        `- DEV-${String(q.number).padStart(4, "0")} "${q.title}" expire le ${new Date(q.valid_until!).toLocaleDateString("fr-FR")}`
    )
    .join("\n");

  const contextPrompt = `Voici les donnees du jour pour cet utilisateur Devizly :

STATISTIQUES :
- Devis en attente : ${stats.pendingQuotes} (${stats.pendingRevenue})
- Devis sans reponse depuis +2 jours : ${stats.overdueQuotes}
- CA cette semaine : ${stats.caThisWeek} (${stats.caVariation} vs semaine derniere : ${stats.caLastWeek})
- Relances envoyees aujourd'hui : ${stats.remindersToday}

${overdueList ? `DEVIS EN ATTENTE (>2 jours sans reponse) :\n${overdueList}` : "Aucun devis en retard."}

${expiringList ? `DEVIS QUI EXPIRENT BIENTOT :\n${expiringList}` : ""}

Genere un briefing matinal en JSON avec :
- "summary" : 2-3 phrases de resume actionnable, ton professionnel mais humain, en francais. Commence par le point le plus urgent.
- "actions" : liste de 3-5 actions concretes prioritaires (strings). Chaque action doit etre specifique (mentionner le client ou le devis si pertinent).

Reponds UNIQUEMENT en JSON valide, sans markdown ni backticks.`;

  try {
    const mistral = getMistral();
    const completion = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content:
            "Vous etes l'assistant IA de Devizly. Vous generez des briefings matinaux concis et actionnables pour des independants et freelancers francais. Votre role : les aider a prioriser leur journee. Soyez direct, vouvoyez l'utilisateur, pas de formules de politesse inutiles.",
        },
        { role: "user", content: contextPrompt },
      ],
      temperature: 0.5,
      maxTokens: 600,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return fallbackBriefing(stats);
    }

    let parsed: { summary: string; actions: string[] };
    try {
      parsed = JSON.parse(cleanJSON(content)) as { summary: string; actions: string[] };
    } catch (parseError) {
      console.error("[daily-briefing] JSON parse failed:", parseError, "Raw:", content.slice(0, 500));
      return fallbackBriefing(stats);
    }
    return { ...parsed, stats };
  } catch {
    return fallbackBriefing(stats);
  }
}

function fallbackBriefing(stats: BriefingResult["stats"]): BriefingResult {
  const actions: string[] = [];
  if (stats.overdueQuotes > 0) {
    actions.push(`Relancer les ${stats.overdueQuotes} devis en attente depuis plus de 2 jours`);
  }
  if (stats.pendingQuotes > 0) {
    actions.push(`Suivre vos ${stats.pendingQuotes} devis en cours (${stats.pendingRevenue})`);
  }
  actions.push("Consulter votre dashboard pour les details");

  return {
    summary: `Vous avez ${stats.pendingQuotes} devis en attente pour ${stats.pendingRevenue}. CA cette semaine : ${stats.caThisWeek} (${stats.caVariation}).`,
    actions,
    stats,
  };
}
