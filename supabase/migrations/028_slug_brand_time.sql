-- Migration 028: Slug + brand color for freelancers + time tracking
-- ⚠️ Règle : toujours vérifier l'existence des tables/colonnes via information_schema
-- avant tout ALTER TABLE ou REFERENCES. Ne jamais supposer qu'une table existe.

-- ═══════════════════════════════════════════════════════════════
-- 1. Profiles: slug + brand_color + email
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'slug') THEN
      ALTER TABLE public.profiles ADD COLUMN slug VARCHAR(50) UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'brand_color') THEN
      ALTER TABLE public.profiles ADD COLUMN brand_color VARCHAR(7) DEFAULT '#8B5CF6';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
      ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 2. Time entries table (sans FK directes pour éviter l'erreur
--    "relation does not exist" si quotes/clients n'existent pas)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quote_id UUID,
  client_id UUID,
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  hourly_rate DECIMAL(10,2),
  billed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. FK constraints ajoutées conditionnellement
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN
  -- FK → auth.users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'time_entries_user_id_fkey'
      AND table_schema = 'public' AND table_name = 'time_entries'
  ) THEN
    ALTER TABLE public.time_entries
      ADD CONSTRAINT time_entries_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- FK → quotes (seulement si la table quotes existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'time_entries_quote_id_fkey'
        AND table_schema = 'public' AND table_name = 'time_entries'
    ) THEN
      ALTER TABLE public.time_entries
        ADD CONSTRAINT time_entries_quote_id_fkey
        FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- FK → clients (seulement si la table clients existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'time_entries_client_id_fkey'
        AND table_schema = 'public' AND table_name = 'time_entries'
    ) THEN
      ALTER TABLE public.time_entries
        ADD CONSTRAINT time_entries_client_id_fkey
        FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 4. RLS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'users_own_time_entries'
  ) THEN
    CREATE POLICY "users_own_time_entries" ON public.time_entries
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;
