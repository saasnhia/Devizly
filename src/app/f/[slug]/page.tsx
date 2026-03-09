import { notFound } from "next/navigation";
import { getPublicForm } from "./actions";
import { PublicLeadForm } from "./public-lead-form";

export default async function LeadFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form = await getPublicForm(slug);

  if (!form || !form.is_active) {
    return notFound();
  }

  return <PublicLeadForm form={form} />;
}
