-- 033: Add payment_terms column to quotes
-- Stores per-quote payment conditions (displayed on PDF)

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'quotes'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'payment_terms'
    ) THEN
      ALTER TABLE public.quotes
        ADD COLUMN payment_terms TEXT DEFAULT 'Acompte de 50% à la signature, solde à la livraison';
    END IF;
  END IF;
END $$;
