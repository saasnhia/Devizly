-- Migration 034: Quote archive (soft delete) + performance indexes
-- Safe: checks existence before altering

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'quotes'
      AND column_name = 'archived_at'
  ) THEN
    ALTER TABLE public.quotes ADD COLUMN archived_at timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Composite index for listing queries (user + status + date)
CREATE INDEX IF NOT EXISTS idx_quotes_user_status_created
  ON public.quotes (user_id, status, created_at DESC);

-- Index for archived queries
CREATE INDEX IF NOT EXISTS idx_quotes_user_archived
  ON public.quotes (user_id, archived_at)
  WHERE archived_at IS NOT NULL;
