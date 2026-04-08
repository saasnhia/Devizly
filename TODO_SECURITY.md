# Security TODO

## Auth user_metadata — sensitive business data exposure

**Status:** Pre-existing debt (since migration 020), out of scope for Factur-X project.

**Issue:** The settings page (`src/app/(dashboard)/parametres/page.tsx`) stores
business-sensitive fields in `auth.users.raw_user_meta_data` via `supabase.auth.updateUser()`.
This data is included in the JWT and readable client-side.

**Fields affected:**
- `company_siret` (SIRET number)
- `tva_number` (VAT intracommunity number)
- `rcs_number` (RCS registration)
- `legal_form` (legal entity type)
- `company_name`, `company_address`, `company_phone`

**Fields NOT affected (profiles-only by design):**
- `iban` — added in migration 037, saved to profiles table only
- `bic` — added in migration 037, saved to profiles table only
- `pa_credentials_encrypted` — PA OAuth tokens, profiles table only

**Recommended fix:**
1. Stop writing business fields to `auth.updateUser({ data: {...} })`
2. Load all business fields from `profiles` table instead of `user_metadata`
3. Keep only `full_name` in user_metadata (used by Supabase auth UI)
4. Audit all API routes that read from `user_metadata` and switch to profiles

**Impact:** Low risk (data is the user's own business info, not secrets),
but violates principle of least exposure. Fix when refactoring the settings page.
