-- Add 'prospect' to quotes status constraint
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_status_check
  CHECK (status IN ('prospect','brouillon','envoyé','signé','accepté','refusé','payé'));

-- Prospects table for leads without a full quote yet
CREATE TABLE IF NOT EXISTS prospects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  company text,
  notes text,
  estimated_amount numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  converted_quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL
);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_prospects" ON prospects
  FOR ALL USING (user_id = auth.uid());
