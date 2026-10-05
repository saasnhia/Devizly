import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { completeWithFallback, parseAIResponse } from "@/lib/mistral";
import { QUOTE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { filterQuoteClaims } from "@/lib/ai/compliance-filter";
import { checkRateLimit } from "@/lib/ratelimit";
import { canCreateDevis, type PlanId } from "@/lib/stripe";

// Small fallback models sometimes return numbers as strings ("2", "1 200,50") — coerce them
const aiNumber = z.preprocess(
  (v) => (typeof v === "string" ? Number(v.replace(/[^\d,.-]/g, "").replace(",", ".")) : v),
  z.number().finite().nonnegative()
);

const aiQuoteSchema = z.object({
  title: z.string().trim().min(1),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1),
        quantity: aiNumber,
        unit_price: aiNumber,
      })
    )
    .min(1),
  notes: z.string().optional().catch(undefined),
});

const AI_FAILURE_MESSAGE =
  "La génération IA a rencontré un problème, réessayez ou créez votre devis manuellement.";

export async function POST(request: Request) {
  // Rate limit check
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Quota check — prevent free users from generating beyond their limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, devis_used")
    .eq("id", user.id)
    .single();

  const plan = (profile?.subscription_status || "free") as PlanId;
  const devisUsed = profile?.devis_used || 0;

  if (!canCreateDevis(plan, devisUsed)) {
    return NextResponse.json(
      {
        error: "Quota de devis atteint. Passez au plan supérieur.",
        code: "QUOTA_EXCEEDED",
      },
      { status: 403 }
    );
  }

  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Le prompt est requis" }, { status: 400 });
  }

  try {
    const { content, model } = await completeWithFallback("generate-quote", {
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: QUOTE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    let parsed: z.infer<typeof aiQuoteSchema>;
    try {
      parsed = aiQuoteSchema.parse(parseAIResponse(content));
    } catch (parseError) {
      console.error(
        JSON.stringify({
          event: "ai_parse_failed",
          tag: "generate-quote",
          model,
          error: parseError instanceof z.ZodError ? "SchemaMismatch" : parseError instanceof Error ? parseError.message : "UnknownError",
          contentLength: content.length,
        })
      );
      return NextResponse.json({ error: AI_FAILURE_MESSAGE, code: "AI_INVALID_RESPONSE" }, { status: 502 });
    }

    // The prompt discourages compliance claims; this filter guarantees none reaches the client
    const filtered = filterQuoteClaims("generate-quote", {
      title: parsed.title,
      notes: parsed.notes,
      lines: parsed.items,
    });
    if (filtered.lines.length === 0) {
      return NextResponse.json({ error: AI_FAILURE_MESSAGE, code: "AI_INVALID_RESPONSE" }, { status: 502 });
    }
    return NextResponse.json({
      success: true,
      data: { title: filtered.title, notes: filtered.notes, items: filtered.lines },
    });
  } catch {
    // completeWithFallback already logged every failed attempt
    return NextResponse.json({ error: AI_FAILURE_MESSAGE, code: "AI_UNAVAILABLE" }, { status: 503 });
  }
}
