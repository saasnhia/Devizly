// Variable substitution engine for contract templates.
// Templates store free text with {{variable}} placeholders; this resolves
// them against the prestataire's profile, the selected client, and the
// commercial's custom inputs (objet/montant/duree).

export interface TemplateProfile {
  company_name?: string | null;
  company_siret?: string | null;
  company_address?: string | null;
  company_postal_code?: string | null;
  company_city?: string | null;
  full_name?: string | null;
}

export interface TemplateClient {
  name?: string | null;
  siret?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  contact_name?: string | null;
}

export interface TemplateCustomFields {
  montant?: string | null;
  duree?: string | null;
  objet?: string | null;
}

export interface ResolveVariablesInput {
  profile?: TemplateProfile | null;
  client?: TemplateClient | null;
  custom?: TemplateCustomFields | null;
}

const PLACEHOLDER = "[à compléter]";

function formatAddress(
  address?: string | null,
  postalCode?: string | null,
  city?: string | null
): string {
  const line2 = [postalCode, city].filter(Boolean).join(" ");
  return [address, line2].filter(Boolean).join(", ") || PLACEHOLDER;
}

function today(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/**
 * Resolves every {{variable}} placeholder in `content`. Unresolved or
 * missing values fall back to a visible "[à compléter]" marker rather than
 * silently disappearing, so the commercial spots what still needs input.
 */
export function resolveVariables(
  content: string,
  { profile, client, custom }: ResolveVariablesInput
): string {
  const values: Record<string, string> = {
    prestataire_nom: profile?.company_name || PLACEHOLDER,
    prestataire_siret: profile?.company_siret || PLACEHOLDER,
    prestataire_adresse: formatAddress(
      profile?.company_address,
      profile?.company_postal_code,
      profile?.company_city
    ),
    prestataire_representant: profile?.full_name || PLACEHOLDER,
    client_nom: client?.name || PLACEHOLDER,
    client_siret: client?.siret || "[SIRET à compléter]",
    client_adresse: formatAddress(
      client?.address,
      client?.postal_code,
      client?.city
    ),
    client_representant: client?.contact_name || client?.name || PLACEHOLDER,
    date: today(),
    montant: custom?.montant || PLACEHOLDER,
    duree: custom?.duree || PLACEHOLDER,
    objet: custom?.objet || PLACEHOLDER,
  };

  return content.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in values ? values[key] : match
  );
}

/** Extracts the distinct {{variable}} names used in a template body. */
export function extractVariables(content: string): string[] {
  const found = new Set<string>();
  for (const match of content.matchAll(/\{\{(\w+)\}\}/g)) {
    found.add(match[1]);
  }
  return Array.from(found);
}
