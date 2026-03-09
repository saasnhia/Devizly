"use server";

import { createServerClient } from "@supabase/ssr";
import { resend } from "@/lib/resend";
import { leadFormEmail } from "@/lib/emails/lead-form";
import { getSiteUrl } from "@/lib/url";
import type { LeadForm } from "@/types";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

const FROM_EMAIL = "Devizly <noreply@devizly.fr>";

export async function getPublicForm(slug: string): Promise<LeadForm | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("lead_forms")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as LeadForm;
}

export async function submitLead(
  formId: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    project_type?: string;
    budget_range?: string;
    message?: string;
    deadline?: string;
  }
) {
  const supabase = createServiceClient();

  // Get form to find user_id and settings
  const { data: form, error: formError } = await supabase
    .from("lead_forms")
    .select("*")
    .eq("id", formId)
    .single();

  if (formError || !form) {
    return { error: "Formulaire introuvable" };
  }

  // Insert lead
  const { error: insertError } = await supabase.from("leads").insert({
    user_id: form.user_id,
    form_id: formId,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    company: data.company?.trim() || null,
    project_type: data.project_type?.trim() || null,
    budget_range: data.budget_range?.trim() || null,
    message: data.message?.trim() || null,
    deadline: data.deadline || null,
    pipeline_stage: form.auto_pipeline_stage || "nouveau",
    source: "form",
  });

  if (insertError) {
    console.error("[Lead form] Insert error:", insertError);
    return { error: "Erreur lors de l'enregistrement" };
  }

  // Send notification email (fire-and-forget)
  const notifEmail = form.notification_email;
  if (notifEmail) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("id", form.user_id)
        .single();

      const freelancerName =
        profile?.company_name || profile?.full_name || "Freelance";
      const appUrl = getSiteUrl();

      const { subject, html } = leadFormEmail({
        freelancerName,
        prospectName: data.name.trim(),
        prospectEmail: data.email.trim(),
        prospectPhone: data.phone?.trim(),
        message: data.message?.trim(),
        dashboardUrl: `${appUrl}/dashboard/leads`,
      });

      resend.emails
        .send({ from: FROM_EMAIL, to: notifEmail, subject, html })
        .catch((err: unknown) => {
          console.error("[Lead form] Email notification failed:", err);
        });
    } catch (err) {
      console.error("[Lead form] Email prep failed:", err);
    }
  }

  return { success: true, redirect_url: form.redirect_url };
}
