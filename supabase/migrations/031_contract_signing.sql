-- Migration 031: Add document signing to contracts
-- Enables CGV/SLA contracts with electronic signature (eIDAS)

DO $$ BEGIN
  -- Document content (rich text / markdown for CGV/SLA body)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'content'
  ) THEN
    ALTER TABLE contracts ADD COLUMN content text;
  END IF;

  -- Document type classification
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'document_type'
  ) THEN
    ALTER TABLE contracts ADD COLUMN document_type text DEFAULT 'recurring';
  END IF;

  -- Share token for public signing page
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'sign_token'
  ) THEN
    ALTER TABLE contracts ADD COLUMN sign_token text UNIQUE;
  END IF;

  -- Signature data (base64 PNG from canvas)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'signature_data'
  ) THEN
    ALTER TABLE contracts ADD COLUMN signature_data text;
  END IF;

  -- Signer name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'signer_name'
  ) THEN
    ALTER TABLE contracts ADD COLUMN signer_name text;
  END IF;

  -- Signed timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'signed_at'
  ) THEN
    ALTER TABLE contracts ADD COLUMN signed_at timestamptz;
  END IF;

  -- eIDAS audit: signer IP
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'signer_ip'
  ) THEN
    ALTER TABLE contracts ADD COLUMN signer_ip text;
  END IF;

  -- eIDAS audit: document hash
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'document_hash'
  ) THEN
    ALTER TABLE contracts ADD COLUMN document_hash text;
  END IF;

  -- Sent at (when contract was sent for signature)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE contracts ADD COLUMN sent_at timestamptz;
  END IF;
END $$;

-- Update status constraint to include signature workflow states
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE contracts ADD CONSTRAINT contracts_status_check
  CHECK (status IN ('draft', 'active', 'paused', 'ended', 'pending_signature', 'signed'));

-- Add CGV/SLA/NDA system templates with default content
INSERT INTO contract_templates (id, user_id, name, description, is_system, default_amount, default_frequency, default_duration_months, items)
VALUES
  (
    gen_random_uuid(), NULL,
    'CGV — Conditions Générales de Vente',
    'Modèle standard de CGV pour prestations de services',
    true, NULL, 'monthly', NULL, '[]'
  ),
  (
    gen_random_uuid(), NULL,
    'SLA — Accord de Niveau de Service',
    'Contrat définissant les engagements de disponibilité et support',
    true, NULL, 'monthly', 12, '[]'
  ),
  (
    gen_random_uuid(), NULL,
    'NDA — Accord de Confidentialité',
    'Accord de non-divulgation bilatéral',
    true, NULL, 'monthly', 24, '[]'
  )
ON CONFLICT DO NOTHING;
