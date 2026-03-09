"use server";

import { createClient } from "@/lib/supabase/server";
import type { LeadForm, LeadFormFields } from "@/types";

function generateSlug(): string {
  return Math.random().toString(36).substring(2, 10);
}

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  return { supabase, userId: user.id };
}

export async function getUserForms() {
  const { supabase } = await getUserId();
  const { data, error } = await supabase
    .from("lead_forms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as LeadForm[];
}

export async function createLeadForm(data: {
  name: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  accent_color?: string;
  fields?: LeadFormFields;
  auto_pipeline_stage?: string;
  notification_email?: string | null;
  redirect_url?: string | null;
}) {
  const { supabase, userId } = await getUserId();

  const slug = generateSlug();

  const { data: form, error } = await supabase
    .from("lead_forms")
    .insert({
      user_id: userId,
      name: data.name,
      slug,
      title: data.title || "Demande de devis",
      subtitle: data.subtitle || "Répondez sous 24h",
      button_text: data.button_text || "Envoyer ma demande",
      accent_color: data.accent_color || "#7c3aed",
      fields: data.fields ? JSON.stringify(data.fields) : undefined,
      auto_pipeline_stage: data.auto_pipeline_stage || "nouveau",
      notification_email: data.notification_email || null,
      redirect_url: data.redirect_url || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return form as LeadForm;
}

export async function updateLeadForm(
  id: string,
  data: Partial<{
    name: string;
    is_active: boolean;
    title: string;
    subtitle: string;
    button_text: string;
    accent_color: string;
    fields: LeadFormFields;
    auto_pipeline_stage: string;
    notification_email: string | null;
    redirect_url: string | null;
  }>
) {
  const { supabase } = await getUserId();

  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.is_active !== undefined) update.is_active = data.is_active;
  if (data.title !== undefined) update.title = data.title;
  if (data.subtitle !== undefined) update.subtitle = data.subtitle;
  if (data.button_text !== undefined) update.button_text = data.button_text;
  if (data.accent_color !== undefined) update.accent_color = data.accent_color;
  if (data.fields !== undefined) update.fields = JSON.stringify(data.fields);
  if (data.auto_pipeline_stage !== undefined)
    update.auto_pipeline_stage = data.auto_pipeline_stage;
  if (data.notification_email !== undefined)
    update.notification_email = data.notification_email;
  if (data.redirect_url !== undefined) update.redirect_url = data.redirect_url;

  const { data: form, error } = await supabase
    .from("lead_forms")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return form as LeadForm;
}

export async function deleteLeadForm(id: string) {
  const { supabase } = await getUserId();
  const { error } = await supabase.from("lead_forms").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getFormLeadCount(formId: string) {
  const { supabase } = await getUserId();
  const { count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("form_id", formId);

  if (error) return 0;
  return count || 0;
}
