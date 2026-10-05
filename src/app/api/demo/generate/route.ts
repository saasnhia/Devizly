import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { AIGenerationError, completeWithFallback, parseAIResponse } from "@/lib/mistral";
import { NO_COMPLIANCE_CLAIMS_RULE, QUOTE_LINE_RULES } from "@/lib/ai/prompts";
import { filterQuoteClaims, stripClaimSentences } from "@/lib/ai/compliance-filter";

// Allow up to 30s on Vercel Pro (ignored on Hobby)
export const maxDuration = 30;

// Separate rate limiter: 3 demo generations per IP per hour
const demoRatelimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }),
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "devizly-demo",
});

interface DemoQuoteLine {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface DemoQuote {
  title: string;
  lines: DemoQuoteLine[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  validityDays: number;
  paymentConditions: string;
  notes: string;
}

export async function POST(request: Request) {
  // 1. Rate limiting — 3 per IP per hour
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "127.0.0.1";
  const { success, remaining } = await demoRatelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: "Limite atteinte",
        message:
          "Vous avez généré 3 devis de démonstration. Créez un compte gratuit pour continuer.",
        upgrade: true,
      },
      { status: 429 }
    );
  }

  // 2. Validate input
  const body = await request.json();
  const { metier, description } = body;

  if (!metier || typeof metier !== "string") {
    return NextResponse.json({ error: "Métier requis" }, { status: 400 });
  }
  if (!description || typeof description !== "string" || description.length < 10) {
    return NextResponse.json(
      { error: "Description requise (10 caractères min)" },
      { status: 400 }
    );
  }
  if (description.length > 200) {
    return NextResponse.json(
      { error: "Description trop longue (200 caractères max)" },
      { status: 400 }
    );
  }

  // 3. Generate with Mistral (primary model, then fallback model — 12s each to stay under maxDuration)
  try {
    const { content } = await completeWithFallback(
      "demo",
      {
        responseFormat: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `[STRICT MODE] Tu génères des devis professionnels français.
Réponds UNIQUEMENT en JSON brut valide. Pas de markdown, pas de backticks.
Structure : { "title": string, "lines": [{ "description": string, "quantity": number, "unit": string, "unitPrice": number, "total": number }], "subtotal": number, "vatRate": 20, "vatAmount": number, "total": number, "validityDays": 30, "paymentConditions": string, "notes": string }
Règles : 3-6 lignes réalistes, prix marché français 2026. "total" de chaque ligne = quantity × unitPrice.
${QUOTE_LINE_RULES}
${NO_COMPLIANCE_CLAIMS_RULE}`,
          },
          {
            role: "user",
            content: `Métier : ${metier}
Prestation : ${description}`,
          },
        ],
        temperature: 0.7,
        maxTokens: 800,
      },
      { timeoutMs: 12_000 }
    );

    const raw = parseAIResponse<DemoQuote>(content);

    // The prompt discourages compliance claims; this filter guarantees none reaches the visitor
    const filtered = filterQuoteClaims("demo", { title: raw.title, notes: raw.notes, lines: raw.lines ?? [] });
    if (filtered.lines.length === 0) {
      throw new Error("No quote line left after filtering");
    }
    const quote: DemoQuote = { ...raw, title: filtered.title, notes: filtered.notes ?? "", lines: filtered.lines };
    if (typeof quote.paymentConditions === "string") {
      quote.paymentConditions = stripClaimSentences(quote.paymentConditions);
    }
    if (filtered.lines.length !== (raw.lines ?? []).length) {
      // A line was dropped — totals from the model no longer match
      quote.subtotal = Math.round(filtered.lines.reduce((s, l) => s + Number(l.total || 0), 0) * 100) / 100;
      quote.vatAmount = Math.round(quote.subtotal * (Number(quote.vatRate) || 20)) / 100;
      quote.total = Math.round((quote.subtotal + quote.vatAmount) * 100) / 100;
    }

    return NextResponse.json({
      quote,
      remainingGenerations: remaining,
    });
  } catch (err: unknown) {
    if (!(err instanceof AIGenerationError)) {
      console.error(
        JSON.stringify({
          event: "ai_parse_failed",
          tag: "demo",
          error: err instanceof Error ? err.message : "UnknownError",
        })
      );
    }
    return NextResponse.json(
      { error: "Génération impossible. Réessayez dans quelques secondes." },
      { status: 500 }
    );
  }
}
