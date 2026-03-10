-- Add business profile columns that code references but were never created.
-- Data was stored in auth.users.raw_user_meta_data, but API routes (send-devis,
-- cron/reminders, cron/invoices, cron/daily-briefing, portal, etc.) query these
-- from profiles table directly. This migration adds the columns and syncs
-- existing data from user_metadata.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_siret text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_tva_rate numeric(5,2) DEFAULT 20;

-- Sync existing data from auth.users metadata into profiles
UPDATE profiles p
SET
  full_name = COALESCE(u.raw_user_meta_data->>'full_name', p.full_name),
  company_name = COALESCE(u.raw_user_meta_data->>'company_name', p.company_name),
  company_address = COALESCE(u.raw_user_meta_data->>'company_address', p.company_address),
  company_siret = COALESCE(u.raw_user_meta_data->>'company_siret', p.company_siret),
  company_phone = COALESCE(u.raw_user_meta_data->>'company_phone', p.company_phone)
FROM auth.users u
WHERE p.id = u.id;

-- Update handle_new_user trigger to also populate full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
