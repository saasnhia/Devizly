-- Logo URL on profiles for PDF branding
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url text;
