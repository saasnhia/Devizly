-- ============================================================
-- 015 — Quote templates + Lead forms + Leads
-- ============================================================

-- TABLE 1 : Templates de devis
CREATE TABLE IF NOT EXISTS quote_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_default BOOLEAN DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]',
  default_validity_days INTEGER DEFAULT 30,
  default_payment_terms TEXT,
  default_notes TEXT,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 2 : Lead forms (formulaires embeddables)
CREATE TABLE IF NOT EXISTS lead_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mon formulaire',
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  fields JSONB DEFAULT '{
    "name": true,
    "email": true,
    "phone": false,
    "company": false,
    "project_type": false,
    "budget_range": false,
    "message": true,
    "deadline": false
  }',
  title TEXT DEFAULT 'Demande de devis',
  subtitle TEXT DEFAULT 'Répondez sous 24h',
  button_text TEXT DEFAULT 'Envoyer ma demande',
  accent_color TEXT DEFAULT '#7c3aed',
  auto_pipeline_stage TEXT DEFAULT 'nouveau',
  notification_email TEXT,
  redirect_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE 3 : Leads reçus via les formulaires
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_id UUID REFERENCES lead_forms(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  project_type TEXT,
  budget_range TEXT,
  message TEXT,
  deadline DATE,
  source TEXT DEFAULT 'form',
  ip_address TEXT,
  user_agent TEXT,
  converted_to_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  converted_to_quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  pipeline_stage TEXT DEFAULT 'nouveau',
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_templates" ON quote_templates FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_forms" ON lead_forms FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_leads" ON leads FOR ALL USING (user_id = auth.uid());

-- Lead form public read (pour le formulaire public)
CREATE POLICY "public_read_active_forms" ON lead_forms
  FOR SELECT USING (is_active = true);

-- Public insert leads (visiteurs qui soumettent le formulaire)
CREATE POLICY "public_insert_leads" ON leads
  FOR INSERT WITH CHECK (true);
