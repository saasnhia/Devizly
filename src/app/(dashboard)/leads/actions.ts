"use server";

import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadWithForm, LeadStatus } from "@/types";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  return { supabase, userId: user.id };
}

export async function getUserLeads(filters?: {
  status?: LeadStatus | "all";
  formId?: string;
}) {
  const { supabase } = await getUserId();

  let query = supabase
    .from("leads")
    .select("*, lead_forms(*)")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.formId) {
    query = query.eq("form_id", filters.formId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as LeadWithForm[];
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const { supabase } = await getUserId();
  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function convertLeadToClient(leadId: string) {
  const { supabase, userId } = await getUserId();

  // Fetch lead
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) throw new Error("Lead introuvable");

  // Create client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      user_id: userId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
    })
    .select()
    .single();

  if (clientError || !client) throw new Error("Erreur création client");

  // Update lead
  await supabase
    .from("leads")
    .update({
      status: "converted" as LeadStatus,
      converted_to_client_id: client.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  return client;
}

export async function deleteLead(id: string) {
  const { supabase } = await getUserId();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getNewLeadsCount() {
  const { supabase } = await getUserId();
  const { count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  if (error) return 0;
  return count || 0;
}
