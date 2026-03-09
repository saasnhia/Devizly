"use server";

import { createClient } from "@/lib/supabase/server";
import type { QuoteTemplate, QuoteTemplateItem } from "@/types";

export interface CreateTemplateInput {
  name: string;
  description?: string;
  category?: string;
  items: QuoteTemplateItem[];
  default_validity_days?: number;
  default_payment_terms?: string;
  default_notes?: string;
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  is_default?: boolean;
}

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, userId: null, error: "Non authentifié" } as const;
  return { supabase, userId: user.id, error: null } as const;
}

export async function createTemplate(data: CreateTemplateInput) {
  const auth = await getUserId();
  if (auth.error) throw new Error(auth.error);
  const { supabase, userId } = auth;

  const { data: template, error } = await supabase
    .from("quote_templates")
    .insert({
      user_id: userId,
      name: data.name,
      description: data.description || null,
      category: data.category || "general",
      items: JSON.stringify(data.items),
      default_validity_days: data.default_validity_days || 30,
      default_payment_terms: data.default_payment_terms || null,
      default_notes: data.default_notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return template as QuoteTemplate;
}

export async function updateTemplate(id: string, data: UpdateTemplateInput) {
  const auth = await getUserId();
  if (auth.error) throw new Error(auth.error);
  const { supabase } = auth;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) update.name = data.name;
  if (data.description !== undefined) update.description = data.description;
  if (data.category !== undefined) update.category = data.category;
  if (data.items !== undefined) update.items = JSON.stringify(data.items);
  if (data.default_validity_days !== undefined) update.default_validity_days = data.default_validity_days;
  if (data.default_payment_terms !== undefined) update.default_payment_terms = data.default_payment_terms;
  if (data.default_notes !== undefined) update.default_notes = data.default_notes;
  if (data.is_default !== undefined) update.is_default = data.is_default;

  const { data: template, error } = await supabase
    .from("quote_templates")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return template as QuoteTemplate;
}

export async function deleteTemplate(id: string) {
  const auth = await getUserId();
  if (auth.error) throw new Error(auth.error);

  const { error } = await auth.supabase.from("quote_templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function duplicateTemplate(id: string) {
  const auth = await getUserId();
  if (auth.error) throw new Error(auth.error);
  const { supabase, userId } = auth;

  const { data: original, error: fetchError } = await supabase
    .from("quote_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) throw new Error("Template introuvable");

  const { data: duplicate, error } = await supabase
    .from("quote_templates")
    .insert({
      user_id: userId,
      name: `${original.name} (copie)`,
      description: original.description,
      category: original.category,
      items: original.items,
      default_validity_days: original.default_validity_days,
      default_payment_terms: original.default_payment_terms,
      default_notes: original.default_notes,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return duplicate as QuoteTemplate;
}

export async function useTemplate(id: string) {
  const auth = await getUserId();
  if (auth.error) throw new Error(auth.error);
  const { supabase } = auth;

  const { data: template, error } = await supabase
    .from("quote_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !template) throw new Error("Template introuvable");

  // Increment times_used (fire-and-forget, non-critical — skip for system templates)
  if (!template.is_system) {
    supabase
      .from("quote_templates")
      .update({ times_used: (template.times_used || 0) + 1 })
      .eq("id", id)
      .then(() => {});
  }

  return template as QuoteTemplate;
}

export async function getUserTemplates(category?: string) {
  const auth = await getUserId();
  if (auth.error) throw new Error(auth.error);
  const { supabase, userId } = auth;

  let query = supabase
    .from("quote_templates")
    .select("*")
    .or(`user_id.eq.${userId},is_system.eq.true`)
    .order("is_system", { ascending: true })
    .order("times_used", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []) as QuoteTemplate[];
}

export async function duplicateSystemTemplate(id: string) {
  const auth = await getUserId();
  if (auth.error) throw new Error(auth.error);
  const { supabase, userId } = auth;

  const { data: original, error: fetchError } = await supabase
    .from("quote_templates")
    .select("*")
    .eq("id", id)
    .eq("is_system", true)
    .single();

  if (fetchError || !original) throw new Error("Template système introuvable");

  const { data: copy, error } = await supabase
    .from("quote_templates")
    .insert({
      user_id: userId,
      name: original.name,
      description: original.description,
      category: original.category,
      is_system: false,
      items: original.items,
      default_validity_days: original.default_validity_days,
      default_payment_terms: original.default_payment_terms,
      default_notes: original.default_notes,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return copy as QuoteTemplate;
}

export async function createTemplateFromQuote(quoteId: string, name: string, category: string) {
  const auth = await getUserId();
  if (auth.error) throw new Error(auth.error);
  const { supabase, userId } = auth;

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*, quote_items(*)")
    .eq("id", quoteId)
    .single();

  if (quoteError || !quote) throw new Error("Devis introuvable");

  const items: QuoteTemplateItem[] = (quote.quote_items || [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    .map((item: { description: string; quantity: number; unit_price: number }) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

  const { data: template, error } = await supabase
    .from("quote_templates")
    .insert({
      user_id: userId,
      name,
      category,
      items: JSON.stringify(items),
      default_notes: quote.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return template as QuoteTemplate;
}
