-- 046: Séquestre de paiement (escrow) — Stripe Connect "separate charges and transfers"
--
-- Le toggle vit sur quotes (le devis payé par le client). L'état du séquestre
-- vit sur invoices : quand un devis en séquestre est payé, une ligne invoices
-- est créée de façon FORCÉE (indépendamment du réglage auto_invoice_on_payment)
-- pour porter escrow_status/escrow_charge_id/escrow_transfer_id.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'escrow_enabled') THEN
      ALTER TABLE public.quotes ADD COLUMN escrow_enabled BOOLEAN DEFAULT false;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'escrow_status') THEN
      ALTER TABLE public.invoices ADD COLUMN escrow_status TEXT DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'escrow_released_at') THEN
      ALTER TABLE public.invoices ADD COLUMN escrow_released_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'escrow_transfer_id') THEN
      ALTER TABLE public.invoices ADD COLUMN escrow_transfer_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'escrow_charge_id') THEN
      -- ID de charge Stripe (pas le PaymentIntent) — requis par transfers.create({ source_transaction }).
      ALTER TABLE public.invoices ADD COLUMN escrow_charge_id TEXT;
    END IF;
  END IF;
END $$;

-- Extend CHECK constraint. DROP+ADD is idempotent and safe to re-run.
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_escrow_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_escrow_status_check
  CHECK (escrow_status IS NULL OR escrow_status IN ('held', 'released', 'disputed', 'refunded'));

-- Anti-doublon lookups (webhook checks "existing invoice for this quote_id" on every escrow payment).
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON public.invoices(quote_id);

-- Cron auto-release after 90 days scans held escrows.
CREATE INDEX IF NOT EXISTS idx_invoices_escrow_held ON public.invoices(escrow_status, paid_at) WHERE escrow_status = 'held';
