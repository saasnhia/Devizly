-- 045: Échéancier de paiement BTP (Feature 1) + retenue de garantie (Feature 3)

-- ── Block A: payment_schedule ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payment_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  invoice_id UUID,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  position INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FKs added conditionally, per project convention (order of migration
-- application via SQL Editor is not guaranteed).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'payment_schedule_quote_id_fkey'
    ) THEN
      ALTER TABLE public.payment_schedule
        ADD CONSTRAINT payment_schedule_quote_id_fkey
        FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payment_schedule_user_id_fkey'
  ) THEN
    ALTER TABLE public.payment_schedule
      ADD CONSTRAINT payment_schedule_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'payment_schedule_invoice_id_fkey'
    ) THEN
      ALTER TABLE public.payment_schedule
        ADD CONSTRAINT payment_schedule_invoice_id_fkey
        FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

ALTER TABLE public.payment_schedule ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users_own_payment_schedule'
  ) THEN
    CREATE POLICY "users_own_payment_schedule"
      ON public.payment_schedule
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payment_schedule_quote
  ON public.payment_schedule(quote_id);


-- ── Block B: retention de garantie sur quotes ────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'retention_guarantee') THEN
      ALTER TABLE public.quotes ADD COLUMN retention_guarantee BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'retention_percentage') THEN
      ALTER TABLE public.quotes ADD COLUMN retention_percentage DECIMAL(5,2) DEFAULT 5.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'retention_release_date') THEN
      ALTER TABLE public.quotes ADD COLUMN retention_release_date DATE;
    END IF;
  END IF;
END $$;
