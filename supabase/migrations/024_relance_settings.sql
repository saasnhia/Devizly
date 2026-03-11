-- Fix #2: Unsubscribe RGPD + Fix #15: Relance settings
-- Adds opt-out per quote + relance preferences on profiles
-- Safe pattern: checks table + column existence before ALTER

DO $$ BEGIN
  -- Per-quote opt-out (client can unsubscribe from reminders for a specific quote)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'relance_opt_out') THEN
      ALTER TABLE public.quotes ADD COLUMN relance_opt_out BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'relance_opt_out_at') THEN
      ALTER TABLE public.quotes ADD COLUMN relance_opt_out_at TIMESTAMPTZ;
    END IF;
  END IF;

  -- Per-user relance settings (freelance controls their reminder preferences)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'relance_enabled') THEN
      ALTER TABLE public.profiles ADD COLUMN relance_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'relance_delays') THEN
      ALTER TABLE public.profiles ADD COLUMN relance_delays JSONB DEFAULT '[2, 5, 7]'::jsonb;
    END IF;
  END IF;
END $$;
