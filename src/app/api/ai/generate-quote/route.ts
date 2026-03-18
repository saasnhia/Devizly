import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMistral, parseAIResponse } from "@/lib/mistral";
import { checkRateLimit } from "@/lib/ratelimit";
import { canCreateDevis, type PlanId } from "@/lib/stripe";

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
    const mistral = getMistral();
    const completion = await mistral.chat.complete({
      model: "mistral-medium-latest",
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `[STRICT MODE] Tu es un assistant qui génère des devis professionnels français.
Tu dois répondre UNIQUEMENT avec du JSON brut valide.
Pas de markdown, pas de backticks, pas de \`\`\`json, pas de texte avant ou après. Pas de commentaires. JSON pur uniquement.
Structure attendue : { "title": string, "items": [{ "description": string, "quantity": number, "unit_price": number }], "notes": string }.
Les descriptions doivent être courtes (10 mots max par ligne).
Les prix doivent être en euros HT, réalistes pour le marché français.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Réponse vide de l'IA" }, { status: 500 });
    }

    let parsed;
    try {
      parsed = parseAIResponse(content);
    } catch (parseError) {
      console.error("[generate-quote] JSON parse failed:", parseError, "Raw:", content.slice(0, 500));
      return NextResponse.json({ error: "Réponse IA invalide — veuillez réessayer" }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error("[generate-quote] Error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
