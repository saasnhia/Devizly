-- E-signature fields on quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signer_name text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signed_at timestamptz;
