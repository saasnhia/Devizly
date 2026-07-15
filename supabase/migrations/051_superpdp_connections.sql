-- Migration 051: SUPER PDP multi-tenant (authorization_code) — per-user
-- connections. Replaces the single shared client_credentials OAuth app
-- (migration 050) with one connection per Devizly user, since SUPER PDP's
-- multi-tenant model requires: "il n'y a qu'une seule application OAuth,
-- la vôtre, et les clients finaux y sont rattachés à l'issue du flow
-- authorization_code" (Martin Ottenwaelter, SUPER PDP).

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'superpdp_connections') THEN
      CREATE TABLE public.superpdp_connections (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
        -- Encrypted at rest (AES-256-GCM, src/lib/crypto.ts) — never stored
        -- in plaintext, unlike the Pennylane pa_credentials_encrypted TODO.
        access_token_encrypted text NOT NULL,
        refresh_token_encrypted text NOT NULL,
        expires_at timestamptz NOT NULL,
        company_siren text,
        company_number_scheme text,   -- 'sandbox' | 'fr_siren' | 'be_numero_entreprise'
        company_name text,
        company_env text,             -- 'production' | 'sandbox'
        -- Polling cursor for invoice_events, now per-connection (SUPER PDP
        -- has no webhook mechanism — see migration 050's sync design).
        last_event_id bigint NOT NULL DEFAULT 0,
        last_synced_at timestamptz,
        connected_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    END IF;

    ALTER TABLE public.superpdp_connections ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'superpdp_connections' AND policyname = 'users_own_superpdp_connection') THEN
      CREATE POLICY "users_own_superpdp_connection" ON public.superpdp_connections FOR ALL USING (user_id = auth.uid());
    END IF;

    -- The global polling cursor from migration 050 (one shared OAuth app)
    -- is obsolete under the multi-tenant model — each connection now
    -- tracks its own cursor above.
    DROP TABLE IF EXISTS public.superpdp_sync_state;

  END IF;
END $$;
