import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_TEMPLATES = {
  j2: {
    subject: "{client_name}, votre devis {devis_id} attend votre retour",
    body: "Bonjour {client_name},\n\nJuste un petit rappel pour le devis {devis_id} envoyé le {date_envoi} d'un montant de {montant_ttc}.\n\nAvez-vous eu le temps de le consulter ?\n\nCordialement,\n{votre_nom}",
  },
  j5: {
    subject: "{devis_id} : Toujours intéressé ? Signez en 1 clic",
    body: "Bonjour {client_name},\n\nLe devis {devis_id} ({montant_ttc}) est toujours en attente de votre signature.\n\nPour ne pas retarder votre projet, signez directement en ligne — c'est rapide et sécurisé.\n\nCordialement,\n{votre_nom}",
  },
  j7: {
    subject: "Dernier rappel : Acompte 30% sécurisé — {devis_id}",
    body: "Bonjour {client_name},\n\nC'est notre dernier rappel pour le devis {devis_id} d'un montant de {montant_ttc}.\n\nSécurisez votre place avec un acompte de 30% — paiement en ligne simple et rapide.\n\nCordialement,\n{votre_nom}",
  },
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("relance_email_templates, subscription_status")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    templates: profile?.relance_email_templates || DEFAULT_TEMPLATES,
    defaults: DEFAULT_TEMPLATES,
    plan: profile?.subscription_status || "free",
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Check plan — Pro+ only
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_status === "free") {
    return NextResponse.json({ error: "Plan Pro requis" }, { status: 403 });
  }

  const body = await request.json();
  const { templates } = body;

  if (!templates || typeof templates !== "object") {
    return NextResponse.json({ error: "Templates invalides" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ relance_email_templates: templates })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
