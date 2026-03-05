CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE clients (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  siret text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE quotes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  number serial NOT NULL,
  title text NOT NULL,
  total_ht numeric(10,2) DEFAULT 0,
  tva_rate numeric(5,2) DEFAULT 20,
  discount numeric(5,2) DEFAULT 0,
  total_ttc numeric(10,2) DEFAULT 0,
  status text DEFAULT 'brouillon'
    CHECK (status IN ('brouillon','envoyé','signé','accepté','refusé')),
  notes text,
  valid_until date,
  pdf_url text,
  ai_prompt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE quote_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  quantity numeric(10,2) DEFAULT 1,
  unit_price numeric(10,2) DEFAULT 0,
  total numeric(10,2) DEFAULT 0,
  position integer DEFAULT 0
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_clients" ON clients FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_quotes" ON quotes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_quote_items" ON quote_items FOR ALL
  USING (quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid()));
