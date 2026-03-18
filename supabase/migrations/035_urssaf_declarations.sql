-- 035: URSSAF declarations for auto-entrepreneurs
-- Tracks monthly/quarterly CA declarations and cotisations

CREATE TABLE IF NOT EXISTS public.urssaf_declarations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  periode_type TEXT NOT NULL CHECK (periode_type IN ('mensuelle', 'trimestrielle')),
  periode_label TEXT NOT NULL,
  periode_start DATE NOT NULL,
  periode_end DATE NOT NULL,
  ca_ht DECIMAL(10,2) NOT NULL DEFAULT 0,
  taux_activite TEXT NOT NULL,
  cotisations DECIMAL(10,2) NOT NULL DEFAULT 0,
  cfp DECIMAL(10,2) NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'a_declarer' CHECK (statut IN ('a_declarer', 'declare')),
  declared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK only if auth.users exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'urssaf_declarations_user_id_fkey'
  ) THEN
    ALTER TABLE public.urssaf_declarations
      ADD CONSTRAINT urssaf_declarations_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.urssaf_declarations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'users_own_urssaf_declarations'
  ) THEN
    CREATE POLICY "users_own_urssaf_declarations"
      ON public.urssaf_declarations
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_urssaf_user_periode
  ON public.urssaf_declarations(user_id, periode_start);
