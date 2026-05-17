-- Migration 038 — Campagne promo "2 Semaines Offertes"
-- Self-contained : peut etre execute seul dans le SQL Editor Supabase.

-- ── 1. Table promo_codes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  campaign    TEXT NOT NULL DEFAULT '2-weeks-free-pro',
  expires_at  TIMESTAMPTZ NOT NULL,
  redeemed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK promo_codes.user_id -> profiles(id), ajoutee conditionnellement
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'profiles')
  AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                  WHERE constraint_name = 'promo_codes_user_id_fkey'
                  AND table_schema = 'public' AND table_name = 'promo_codes')
  THEN
    ALTER TABLE public.promo_codes
      ADD CONSTRAINT promo_codes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS promo_codes_user_id_idx ON public.promo_codes(user_id);
CREATE INDEX IF NOT EXISTS promo_codes_code_idx    ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS promo_codes_campaign_idx ON public.promo_codes(campaign);

-- RLS : l'utilisateur lit uniquement ses propres codes.
-- Les ecritures passent par le service role (cron + webhook) qui contourne RLS.
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'promo_codes' AND policyname = 'users_select_own_promo_codes'
  ) THEN
    CREATE POLICY "users_select_own_promo_codes" ON public.promo_codes
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

-- ── 2. Colonnes profiles ─────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'profiles') THEN

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles'
                   AND column_name = 'last_promo_sent_at') THEN
      ALTER TABLE public.profiles ADD COLUMN last_promo_sent_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles'
                   AND column_name = 'promo_redeemed') THEN
      ALTER TABLE public.profiles ADD COLUMN promo_redeemed BOOLEAN NOT NULL DEFAULT false;
    END IF;

  END IF;
END $$;
