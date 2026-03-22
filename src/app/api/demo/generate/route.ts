import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getMistral, parseAIResponse } from "@/lib/mistral";

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

  // 3. Generate with Mistral
  try {
    const mistral = getMistral();
    const completion = await mistral.chat.complete({
      model: "mistral-small-latest",
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `[STRICT MODE] Tu génères des devis professionnels français.
Réponds UNIQUEMENT en JSON brut valide. Pas de markdown, pas de backticks.
Structure : { "title": string, "lines": [{ "description": string, "quantity": number, "unit": string, "unitPrice": number, "total": number }], "subtotal": number, "vatRate": 20, "vatAmount": number, "total": number, "validityDays": 30, "paymentConditions": string, "notes": string }
Règles : 3-6 lignes réalistes, prix marché français 2026, montants en euros HT, descriptions courtes (10 mots max).`,
        },
        {
          role: "user",
          content: `Métier : ${metier}\nPrestation : ${description}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 800,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Réponse IA vide — veuillez réessayer" },
        { status: 500 }
      );
    }

    const quote = parseAIResponse<DemoQuote>(content);

    return NextResponse.json({
      quote,
      remainingGenerations: remaining,
    });
  } catch (err) {
    console.error("[Demo] Generation failed:", err);
    return NextResponse.json(
      { error: "Génération impossible. Réessayez dans quelques secondes." },
      { status: 500 }
    );
  }
}
