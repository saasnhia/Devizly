-- Fix #8: Stripe refund tracking
-- Fix #6: eIDAS document hash + signer metadata
-- Safe pattern: checks table + column existence before ALTER

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    -- Refund tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'deposit_refunded') THEN
      ALTER TABLE public.quotes ADD COLUMN deposit_refunded BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'deposit_refunded_at') THEN
      ALTER TABLE public.quotes ADD COLUMN deposit_refunded_at TIMESTAMPTZ;
    END IF;

    -- eIDAS signature audit trail
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'document_hash') THEN
      ALTER TABLE public.quotes ADD COLUMN document_hash VARCHAR(64);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'document_hash_algorithm') THEN
      ALTER TABLE public.quotes ADD COLUMN document_hash_algorithm VARCHAR(10) DEFAULT 'SHA-256';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'signer_ip') THEN
      ALTER TABLE public.quotes ADD COLUMN signer_ip VARCHAR(45);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'signed_user_agent') THEN
      ALTER TABLE public.quotes ADD COLUMN signed_user_agent TEXT;
    END IF;
  END IF;
END $$;
