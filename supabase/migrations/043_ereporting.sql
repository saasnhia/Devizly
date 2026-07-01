-- 043: E-reporting B2C — client_type flag + e_reporting_data table
-- Reforme facturation electronique sept. 2026 (e-reporting distinct du
-- e-invoicing Factur-X : concerne les ventes B2C et internationales).

-- ── Block A: clients.client_type ────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'client_type') THEN
      ALTER TABLE public.clients
        ADD COLUMN client_type TEXT DEFAULT 'b2b'
        CHECK (client_type IN ('b2b', 'b2c'));
    END IF;
  END IF;
END $$;

-- Backfill existing clients: SIRET present -> b2b, absent -> b2c.
-- Only runs against rows still at the column default so it's safe to
-- re-run and won't clobber a manual choice made after this migration.
UPDATE public.clients
  SET client_type = 'b2b'
  WHERE siret IS NOT NULL AND btrim(siret) <> '' AND client_type = 'b2b';

UPDATE public.clients
  SET client_type = 'b2c'
  WHERE (siret IS NULL OR btrim(siret) = '') AND client_type = 'b2b';


-- ── Block B: e_reporting_data ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.e_reporting_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_id UUID NOT NULL,
  client_type TEXT NOT NULL CHECK (client_type IN ('b2b', 'b2c', 'international')),
  transaction_date DATE NOT NULL,
  total_ht DECIMAL(12,2) NOT NULL,
  total_vat DECIMAL(12,2) NOT NULL,
  total_ttc DECIMAL(12,2) NOT NULL,
  vat_rate DECIMAL(5,2),
  payment_date DATE,
  payment_amount DECIMAL(12,2),
  reporting_status TEXT DEFAULT 'pending' CHECK (reporting_status IN ('pending', 'sent', 'error')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FK added conditionally, per project convention (order of migration
-- application via SQL Editor is not guaranteed).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'e_reporting_data_user_id_fkey'
  ) THEN
    ALTER TABLE public.e_reporting_data
      ADD CONSTRAINT e_reporting_data_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'e_reporting_data_invoice_id_fkey'
    ) THEN
      ALTER TABLE public.e_reporting_data
        ADD CONSTRAINT e_reporting_data_invoice_id_fkey
        FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- One e-reporting row per invoice (idempotent insert on payment webhook)
CREATE UNIQUE INDEX IF NOT EXISTS idx_e_reporting_data_invoice_unique
  ON public.e_reporting_data(invoice_id);

CREATE INDEX IF NOT EXISTS idx_e_reporting_data_user_status
  ON public.e_reporting_data(user_id, reporting_status);

ALTER TABLE public.e_reporting_data ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users_own_e_reporting_data'
  ) THEN
    CREATE POLICY "users_own_e_reporting_data"
      ON public.e_reporting_data
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
