-- Migration 052: e-invoicing directory status cache on clients
-- Caches whether a client is registered (and active) in the national
-- e-invoicing directory (annuaire), so the invoices list can gate the
-- "Envoyer via SUPER PDP" button without hitting the SUPER PDP API on
-- every render (N+1). Freshness enforced by a 14-day TTL in application
-- code (src/lib/superpdp/directory.ts), not by the schema.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'directory_registered'
    ) THEN
      ALTER TABLE public.clients ADD COLUMN directory_registered boolean;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'directory_checked_at'
    ) THEN
      ALTER TABLE public.clients ADD COLUMN directory_checked_at timestamptz;
    END IF;

  END IF;
END $$;
