-- Migration 050: SUPER PDP (Plateforme Agréée) integration
-- Replaces Pennylane as the default e-invoicing transport. Two tables
-- instead of flat columns on invoices, mirroring the reference
-- implementation (hello-lemon/module-dolibarr-lemonsuperpdp):
--   - superpdp_transmissions: one row per invoice (current send state)
--   - superpdp_events: full lifecycle history (AFNOR fr:200..fr:213/fr:501),
--     populated by the polling cron since SUPER PDP has no webhook mechanism
--   - superpdp_sync_state: single-row cursor for the polling cron

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'superpdp_transmissions') THEN
      CREATE TABLE public.superpdp_transmissions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        superpdp_invoice_id text,
        -- 'sent' means SUPER PDP accepted the POST /v1.beta/invoices call
        -- (HTTP 2xx) — NOT the regulatory lifecycle, which lives in
        -- superpdp_events (fr:200..fr:213/fr:501).
        status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error')),
        format_sent text NOT NULL DEFAULT 'facturx' CHECK (format_sent IN ('facturx', 'ubl', 'cii')),
        error_message text,
        response_raw jsonb,
        sent_at timestamptz,
        last_synced_at timestamptz,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE (invoice_id)
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'superpdp_events') THEN
      CREATE TABLE public.superpdp_events (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        transmission_id uuid NOT NULL REFERENCES public.superpdp_transmissions(id) ON DELETE CASCADE,
        invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
        superpdp_event_id bigint,
        status_code text NOT NULL,
        reason_code text,
        message text,
        direction text NOT NULL DEFAULT 'in' CHECK (direction IN ('in', 'out')),
        event_date timestamptz,
        payload_raw jsonb,
        created_at timestamptz DEFAULT now(),
        UNIQUE (superpdp_event_id)
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'superpdp_sync_state') THEN
      CREATE TABLE public.superpdp_sync_state (
        id integer PRIMARY KEY DEFAULT 1,
        last_event_id bigint NOT NULL DEFAULT 0,
        last_synced_at timestamptz,
        CHECK (id = 1)
      );
      INSERT INTO public.superpdp_sync_state (id, last_event_id) VALUES (1, 0);
    END IF;

    CREATE INDEX IF NOT EXISTS idx_superpdp_transmissions_user ON public.superpdp_transmissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_superpdp_events_transmission ON public.superpdp_events(transmission_id);
    CREATE INDEX IF NOT EXISTS idx_superpdp_events_invoice ON public.superpdp_events(invoice_id);

    ALTER TABLE public.superpdp_transmissions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.superpdp_events ENABLE ROW LEVEL SECURITY;
    -- superpdp_sync_state has no RLS: single global cursor row, written only
    -- by the cron (service role), never read/written from client contexts.

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'superpdp_transmissions' AND policyname = 'users_own_superpdp_transmissions') THEN
      CREATE POLICY "users_own_superpdp_transmissions" ON public.superpdp_transmissions FOR ALL USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'superpdp_events' AND policyname = 'users_own_superpdp_events') THEN
      CREATE POLICY "users_own_superpdp_events" ON public.superpdp_events FOR ALL
        USING (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()));
    END IF;

  END IF;
END $$;
