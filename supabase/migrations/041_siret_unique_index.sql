-- 041: Track the SIRET anti-abuse unique index in version control.
-- This index already exists in prod (applied manually via SQL Editor) but
-- was never committed as a migration — a fresh environment would silently
-- lack the protection the app code relies on (see idx_profiles_company_siret_unique
-- references in the onboarding wizard and parametres pages).
-- Normalizes whitespace and ignores empty/null values, matching the app's
-- dedup candidates (raw + whitespace-stripped).

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_company_siret_unique
  ON public.profiles (regexp_replace(company_siret, '\s', '', 'g'))
  WHERE company_siret IS NOT NULL AND btrim(company_siret) <> '';
