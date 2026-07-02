-- 044: Invoice refunds (Feature 2 — remboursement en 1 clic)

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'refunded_amount') THEN
      ALTER TABLE public.invoices ADD COLUMN refunded_amount DECIMAL(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'refund_reason') THEN
      ALTER TABLE public.invoices ADD COLUMN refund_reason TEXT;
    END IF;
  END IF;
END $$;

-- Extend status CHECK to allow refunded / partially_refunded.
-- DROP+ADD is idempotent and safe to re-run regardless of current state.
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'refunded', 'partially_refunded'));
