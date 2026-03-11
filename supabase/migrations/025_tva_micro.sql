-- Fix #4: TVA intracommunautaire + Fix #5: Micro-entrepreneur
-- Adds fiscal identification fields to profiles
-- Safe pattern: checks table + column existence before ALTER

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'tva_number') THEN
      ALTER TABLE public.profiles ADD COLUMN tva_number VARCHAR(25);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'tva_applicable') THEN
      ALTER TABLE public.profiles ADD COLUMN tva_applicable BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_micro_entrepreneur') THEN
      ALTER TABLE public.profiles ADD COLUMN is_micro_entrepreneur BOOLEAN DEFAULT FALSE;
    END IF;
  END IF;
END $$;
