-- Migration 039 — Persistance de la progression du wizard d'onboarding
-- Self-contained : peut etre execute seul dans le SQL Editor Supabase.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles'
                   AND column_name = 'onboarding_step') THEN
      ALTER TABLE public.profiles
        ADD COLUMN onboarding_step INT NOT NULL DEFAULT 1;
    END IF;
  END IF;
END $$;
