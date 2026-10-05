import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeWithFallback, parseAIResponse } from "@/lib/mistral";
import { NO_COMPLIANCE_CLAIMS_RULE } from "@/lib/ai/prompts";
import { formatCurrency } from "@/lib/utils/quote";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Fetch quote with client info
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*, clients(name, email)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  const client = Array.isArray(quote.clients) ? quote.clients[0] : quote.clients;

  if (!client?.email) {
    return NextResponse.json(
      { error: "Ce client n'a pas d'email" },
      { status: 400 }
    );
  }

  // Get user profile for company name
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, full_name")
    .eq("id", user.id)
    .single();

  const companyName =
    profile?.company_name || profile?.full_name || "Votre prestataire";
  const clientName = client.name;
  const quoteRef = `DEV-${String(quote.number).padStart(4, "0")}`;
  const daysSinceSent = Math.floor(
    (Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalTTC = formatCurrency(Number(quote.total_ttc));

  try {
    const { content } = await completeWithFallback("relance", {
      messages: [
        {
          role: "system",
          content: `Tu rediges des emails de relance professionnels pour des independants et freelancers francais.
Ton : chaleureux, professionnel, pas insistant — style HoneyBook.
Retourne un JSON avec "subject" (string) et "body" (string, texte brut avec sauts de ligne).
Le body ne doit PAS contenir de HTML. Utilise des sauts de ligne simples.
Reponds UNIQUEMENT en JSON valide, sans markdown ni backticks.
${NO_COMPLIANCE_CLAIMS_RULE}`,
        },
        {
          role: "user",
          content: `Redige un email de relance pour :
- Client : ${clientName}
- Entreprise qui envoie : ${companyName}
- Reference devis : ${quoteRef}
- Objet du devis : ${quote.title}
- Montant TTC : ${totalTTC}
- Envoye il y a : ${daysSinceSent} jours
- Le devis ${quote.viewed_at ? "a ete consulte" : "n'a pas encore ete consulte"}

L'email doit rappeler le devis, etre bienveillant, et proposer de repondre aux questions.`,
        },
      ],
      temperature: 0.6,
      maxTokens: 500,
    });

    let parsed: { subject: string; body: string };
    try {
      parsed = parseAIResponse<{ subject: string; body: string }>(content);
    } catch (parseError) {
      console.error(
        JSON.stringify({
          event: "ai_parse_failed",
          tag: "relance",
          error: parseError instanceof Error ? parseError.message : "UnknownError",
          contentLength: content.length,
        })
      );
      return NextResponse.json({ error: "Réponse IA invalide — veuillez réessayer" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      draft: {
        subject: parsed.subject,
        body: parsed.body,
        to: client.email,
        clientName,
        quoteRef,
      },
    });
  } catch {
    // completeWithFallback already logged every failed attempt
    return NextResponse.json(
      { error: "La génération IA a rencontré un problème, réessayez ou rédigez la relance manuellement." },
      { status: 503 }
    );
  }
}
