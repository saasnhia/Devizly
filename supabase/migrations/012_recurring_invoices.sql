-- ============================================
-- 012: Invoices table + recurring fields on quotes
-- ============================================

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date date,
  paid_at timestamptz,
  stripe_checkout_url text,
  stripe_payment_intent_id text,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_invoices" ON invoices
  FOR ALL USING (user_id = auth.uid());

-- Sequential invoice number index (for generating next number)
CREATE INDEX IF NOT EXISTS idx_invoices_user_number
  ON invoices(user_id, created_at DESC);

-- Recurring fields on quotes
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_frequency text,
  ADD COLUMN IF NOT EXISTS recurring_start_date date,
  ADD COLUMN IF NOT EXISTS recurring_end_date date,
  ADD COLUMN IF NOT EXISTS recurring_next_date date,
  ADD COLUMN IF NOT EXISTS recurring_invoice_count integer DEFAULT 0;

-- Constraint on frequency values
ALTER TABLE quotes
  ADD CONSTRAINT quotes_recurring_frequency_check
  CHECK (recurring_frequency IS NULL OR recurring_frequency IN ('monthly', 'quarterly', 'yearly'));

-- Index for cron job to find due recurring quotes
CREATE INDEX IF NOT EXISTS idx_quotes_recurring_next
  ON quotes(recurring_next_date)
  WHERE is_recurring = true;
