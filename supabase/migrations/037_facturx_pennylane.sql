-- =============================================================
-- Migration 037: Factur-X + Pennylane integration columns
-- Adds billing address fields, IBAN/BIC, PA provider fields
-- to profiles, Factur-X columns to invoices, country to clients
-- =============================================================

-- ── Block A: profiles — billing address + bank + PA ──────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN

    -- Billing address (separate from company_address for Factur-X EN 16931 compliance)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_city') THEN
      ALTER TABLE public.profiles ADD COLUMN company_city TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_postal_code') THEN
      ALTER TABLE public.profiles ADD COLUMN company_postal_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_country') THEN
      ALTER TABLE public.profiles ADD COLUMN company_country TEXT DEFAULT 'FR';
    END IF;

    -- Bank account (for SEPA payment info on Factur-X, BT-84/BT-86)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'iban') THEN
      ALTER TABLE public.profiles ADD COLUMN iban TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bic') THEN
      ALTER TABLE public.profiles ADD COLUMN bic TEXT;
    END IF;

    -- Plateforme Agréée (PA) provider connection
    -- No CHECK constraint on pa_provider — validation at API level via Zod
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'pa_provider') THEN
      ALTER TABLE public.profiles ADD COLUMN pa_provider TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'pa_credentials_encrypted') THEN
      ALTER TABLE public.profiles ADD COLUMN pa_credentials_encrypted TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'pa_company_id') THEN
      ALTER TABLE public.profiles ADD COLUMN pa_company_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'pa_connected_at') THEN
      ALTER TABLE public.profiles ADD COLUMN pa_connected_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'pa_last_sync_at') THEN
      ALTER TABLE public.profiles ADD COLUMN pa_last_sync_at TIMESTAMPTZ;
    END IF;

  END IF;
END $$;

-- IBAN length constraint (max 34 chars per ISO 13616)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'profiles' AND constraint_name = 'profiles_iban_length_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_iban_length_check CHECK (iban IS NULL OR length(iban) <= 34);
  END IF;
END $$;

-- BIC length constraint (max 11 chars per ISO 9362)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'profiles' AND constraint_name = 'profiles_bic_length_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_bic_length_check CHECK (bic IS NULL OR length(bic) <= 11);
  END IF;
END $$;


-- ── Block B: invoices — Factur-X + PA tracking ──────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN

    -- Factur-X PDF/A-3 storage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'facturx_pdf_path') THEN
      ALTER TABLE public.invoices ADD COLUMN facturx_pdf_path TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'facturx_generated_at') THEN
      ALTER TABLE public.invoices ADD COLUMN facturx_generated_at TIMESTAMPTZ;
    END IF;

    -- Plateforme Agréée tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'pa_invoice_id') THEN
      ALTER TABLE public.invoices ADD COLUMN pa_invoice_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'pa_status') THEN
      ALTER TABLE public.invoices ADD COLUMN pa_status TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'pa_sent_at') THEN
      ALTER TABLE public.invoices ADD COLUMN pa_sent_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'pa_error') THEN
      ALTER TABLE public.invoices ADD COLUMN pa_error TEXT;
    END IF;

  END IF;
END $$;

-- pa_status CHECK constraint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'invoices' AND constraint_name = 'invoices_pa_status_check') THEN
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_pa_status_check
      CHECK (pa_status IS NULL OR pa_status IN ('pending', 'sent', 'delivered', 'accepted', 'rejected', 'error'));
  END IF;
END $$;

-- Index for polling cron (Phase 3): find invoices with active PA status
CREATE INDEX IF NOT EXISTS idx_invoices_pa_status
  ON invoices(pa_status) WHERE pa_status IS NOT NULL;


-- ── Block C: clients — country code for Factur-X BT-55 ─────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'country') THEN
      ALTER TABLE public.clients ADD COLUMN country TEXT DEFAULT 'FR';
    END IF;
  END IF;
END $$;
