-- 046: Système de guidage in-app contextuel (tips)

-- ── Block A: dismissed_tips ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dismissed_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tip_id TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tip_id)
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'dismissed_tips_user_id_fkey'
  ) THEN
    ALTER TABLE public.dismissed_tips
      ADD CONSTRAINT dismissed_tips_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.dismissed_tips ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users_own_dismissed_tips'
  ) THEN
    CREATE POLICY "users_own_dismissed_tips"
      ON public.dismissed_tips
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_dismissed_tips_user
  ON public.dismissed_tips(user_id);


-- ── Block B: profiles — global opt-out + URSSAF visit tracking ──

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'tips_disabled') THEN
      ALTER TABLE public.profiles ADD COLUMN tips_disabled BOOLEAN DEFAULT false;
    END IF;
    -- Tracks whether the user has visited /dashboard/urssaf at least once,
    -- used by tip_urssaf's condition (!visited_urssaf).
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'urssaf_visited_at') THEN
      ALTER TABLE public.profiles ADD COLUMN urssaf_visited_at TIMESTAMPTZ;
    END IF;
  END IF;
END $$;
