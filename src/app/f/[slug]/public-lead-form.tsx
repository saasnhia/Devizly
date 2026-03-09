"use client";

import { useState } from "react";
import Link from "next/link";
import type { LeadForm, LeadFormFields, CustomField } from "@/types";
import { submitLead } from "./actions";

const FIELD_CONFIG: Record<
  keyof LeadFormFields,
  { label: string; type: string; placeholder: string; required?: boolean }
> = {
  name: {
    label: "Nom complet",
    type: "text",
    placeholder: "Jean Dupont",
    required: true,
  },
  email: {
    label: "Adresse email",
    type: "email",
    placeholder: "jean@exemple.com",
    required: true,
  },
  phone: {
    label: "Téléphone",
    type: "tel",
    placeholder: "06 12 34 56 78",
  },
  company: {
    label: "Entreprise",
    type: "text",
    placeholder: "Nom de votre entreprise",
  },
  project_type: {
    label: "Type de projet",
    type: "text",
    placeholder: "Ex: Site web, application, design...",
  },
  budget_range: {
    label: "Budget estimé",
    type: "text",
    placeholder: "Ex: 2 000 - 5 000 €",
  },
  message: {
    label: "Message",
    type: "textarea",
    placeholder: "Décrivez votre projet en quelques lignes...",
  },
  deadline: {
    label: "Date limite souhaitée",
    type: "date",
    placeholder: "",
  },
};

interface PublicLeadFormProps {
  form: LeadForm;
}

function renderCustomField(
  field: CustomField,
  value: string,
  onChange: (val: string) => void
) {
  const baseClass =
    "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-0 placeholder:text-gray-400";

  switch (field.type) {
    case "select":
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={`${baseClass} bg-white`}
        >
          <option value="">Sélectionnez...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "textarea":
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          rows={4}
          placeholder={`Votre réponse...`}
          className={baseClass}
        />
      );
    case "number":
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          min={0}
          placeholder="0"
          className={baseClass}
        />
      );
    case "url":
      return (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder="https://..."
          className={baseClass}
        />
      );
    case "date":
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={baseClass}
        />
      );
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder="Votre réponse..."
          className={baseClass}
        />
      );
  }
}

export function PublicLeadForm({ form }: PublicLeadFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = (form.fields || {}) as LeadFormFields;
  const customFields = (form.custom_fields || []) as CustomField[];
  const hasCustomFields = customFields.length > 0;

  // Legacy boolean fields (excluding name/email/phone/company/message which are always rendered for legacy forms)
  const enabledFields = (
    Object.entries(fields) as [keyof LeadFormFields, boolean][]
  ).filter(([, enabled]) => enabled);

  function handleChange(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim() || !formData.email?.trim()) {
      setError("Le nom et l'email sont obligatoires");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Adresse email invalide");
      return;
    }

    setSubmitting(true);
    try {
      // Build responses from custom fields
      const responses: Record<string, string> = {};
      if (hasCustomFields) {
        for (const cf of customFields) {
          if (formData[cf.name]) {
            responses[cf.name] = formData[cf.name];
          }
        }
      }

      const result = await submitLead(form.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        project_type: formData.project_type,
        budget_range: formData.budget_range,
        message: formData.message,
        deadline: formData.deadline,
        responses: hasCustomFields ? responses : undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Demande envoyée !
          </h2>
          <p className="mt-2 text-gray-600">
            Merci pour votre demande. Vous recevrez une réponse rapidement.
          </p>
          <p className="mt-6 text-xs text-gray-400">
            Propulsé par{" "}
            <Link
              href="https://devizly.fr"
              target="_blank"
              className="underline hover:text-gray-600"
            >
              Devizly
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[560px]">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-4 text-sm font-medium text-gray-400 uppercase tracking-wider">
            Devizly
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {form.title}
          </h1>
          {form.subtitle && (
            <p className="mt-2 text-gray-500">{form.subtitle}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Always render name + email first */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Jean Dupont"
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Adresse email <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="jean@exemple.com"
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
          </div>

          {/* Phone + Company (from legacy fields, shown if enabled) */}
          {fields.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
            </div>
          )}
          {fields.company && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Entreprise
              </label>
              <input
                type="text"
                value={formData.company || ""}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="Nom de votre entreprise"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Custom fields (new structured system) */}
          {hasCustomFields ? (
            <>
              {customFields.map((cf) => (
                <div key={cf.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {cf.label}
                    {cf.required && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                  </label>
                  {renderCustomField(
                    cf,
                    formData[cf.name] || "",
                    (val) => handleChange(cf.name, val)
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Legacy toggle fields (excluding name/email/phone/company already rendered) */}
              {enabledFields
                .filter(
                  ([key]) =>
                    key !== "name" &&
                    key !== "email" &&
                    key !== "phone" &&
                    key !== "company"
                )
                .map(([key]) => {
                  const config = FIELD_CONFIG[key];

                  if (config.type === "textarea") {
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {config.label}
                          {config.required && (
                            <span className="text-red-500 ml-0.5">*</span>
                          )}
                        </label>
                        <textarea
                          value={formData[key] || ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={config.placeholder}
                          required={config.required}
                          rows={4}
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {config.label}
                        {config.required && (
                          <span className="text-red-500 ml-0.5">*</span>
                        )}
                      </label>
                      <input
                        type={config.type}
                        value={formData[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={config.placeholder}
                        required={config.required}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
                      />
                    </div>
                  );
                })}
            </>
          )}

          {/* Message field (always last for forms with custom fields too) */}
          {hasCustomFields && fields.message && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message complémentaire
              </label>
              <textarea
                value={formData.message || ""}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Informations supplémentaires..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: form.accent_color || "#7c3aed" }}
          >
            {submitting ? "Envoi en cours..." : form.button_text}
          </button>
        </form>

        {/* Powered by */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Propulsé par{" "}
          <Link
            href="https://devizly.fr"
            target="_blank"
            className="underline hover:text-gray-600"
          >
            Devizly
          </Link>
        </p>
      </div>
    </div>
  );
}
