-- Fix #8: Stripe refund tracking
-- Fix #6: eIDAS document hash + signer metadata

-- Refund tracking
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deposit_refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deposit_refunded_at TIMESTAMPTZ;

-- eIDAS signature audit trail
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS document_hash VARCHAR(64);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS document_hash_algorithm VARCHAR(10) DEFAULT 'SHA-256';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signer_ip VARCHAR(45);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signed_user_agent TEXT;
