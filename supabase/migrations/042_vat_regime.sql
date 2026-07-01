-- 042: TVA sur les débits vs encaissement (mention obligatoire sept. 2026)
-- Default 'encaissement' — regime le plus courant chez les artisans/
-- prestataires de services (auto-entrepreneurs inclus).

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'vat_regime') THEN
      ALTER TABLE public.profiles ADD COLUMN vat_regime TEXT DEFAULT 'encaissement'
        CHECK (vat_regime IN ('encaissement', 'debits'));
    END IF;
  END IF;
END $$;
