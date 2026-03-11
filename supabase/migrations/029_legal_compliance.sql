-- 029: Add legal_form and rcs_number to profiles for French legal compliance
-- Forme juridique (EI, SARL, SAS, etc.) and RCS number are mandatory on devis

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'legal_form') THEN
      ALTER TABLE public.profiles ADD COLUMN legal_form VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'rcs_number') THEN
      ALTER TABLE public.profiles ADD COLUMN rcs_number VARCHAR(50);
    END IF;
  END IF;
END $$;
