-- ============================================================
-- 017 — Quote enhancements: deposit, versioning, tracking, calendly
-- ============================================================

-- 1. Deposit / acompte support
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deposit_percent INTEGER;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;

-- 2. Versioning
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS parent_quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL;

-- 3. Calendly link on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendly_url TEXT;

-- 4. Detailed quote views log
CREATE TABLE IF NOT EXISTS quote_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_quote_views_quote_id ON quote_views(quote_id);

ALTER TABLE quote_views ENABLE ROW LEVEL SECURITY;

-- Service role inserts (from public API routes), owners can read
CREATE POLICY "users_read_own_quote_views" ON quote_views
  FOR SELECT USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  );

-- Allow inserts from service role (public tracking)
CREATE POLICY "service_insert_views" ON quote_views
  FOR INSERT WITH CHECK (true);
