-- Migration 047: Contract templates — content body + variables engine support
-- Adds the columns needed to store a reusable {{variable}} contract body
-- on contract_templates, and mirrors `content` on contracts (already added
-- in migration 031, kept here as a defensive no-op check).

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contract_templates') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'contract_templates' AND column_name = 'content'
    ) THEN
      ALTER TABLE public.contract_templates ADD COLUMN content text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'contract_templates' AND column_name = 'variables'
    ) THEN
      ALTER TABLE public.contract_templates ADD COLUMN variables jsonb DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'contract_templates' AND column_name = 'category'
    ) THEN
      ALTER TABLE public.contract_templates ADD COLUMN category text;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contracts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'contracts' AND column_name = 'content'
    ) THEN
      ALTER TABLE public.contracts ADD COLUMN content text;
    END IF;
  END IF;
END $$;
