-- 040: ACRE + periodicite for URSSAF tab
-- Adds ACRE (reduced-rate) tracking and declaration periodicity to profiles
-- Safe pattern: checks table + column existence before ALTER

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'acre_active') THEN
      ALTER TABLE public.profiles ADD COLUMN acre_active BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'acre_start_date') THEN
      ALTER TABLE public.profiles ADD COLUMN acre_start_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'urssaf_periodicite') THEN
      ALTER TABLE public.profiles ADD COLUMN urssaf_periodicite TEXT DEFAULT 'mensuel' CHECK (urssaf_periodicite IN ('mensuel', 'trimestriel'));
    END IF;
  END IF;
END $$;
