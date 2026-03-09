-- ============================================================
-- 018 — System lead forms with custom fields + template link
-- ============================================================

-- 1. Allow NULL user_id for system lead forms
ALTER TABLE lead_forms ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add system flag + suggested template link + custom fields
ALTER TABLE lead_forms ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;
ALTER TABLE lead_forms ADD COLUMN IF NOT EXISTS suggested_template_id UUID REFERENCES quote_templates(id) ON DELETE SET NULL;
ALTER TABLE lead_forms ADD COLUMN IF NOT EXISTS custom_fields JSONB;

-- 3. Add responses JSONB to leads (for custom field data)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS responses JSONB;
ALTER TABLE leads ALTER COLUMN user_id DROP NOT NULL;

-- 4. RLS: allow reading system forms publicly
CREATE POLICY "public_read_system_forms" ON lead_forms
  FOR SELECT USING (is_system = true);

-- 5. Seed 5 system lead forms with custom fields + template link
-- Each form references its matching system template by name

-- Form 1: Site web
INSERT INTO lead_forms (user_id, name, slug, is_system, is_active, title, subtitle, button_text, accent_color, fields, custom_fields, suggested_template_id)
VALUES (
  NULL,
  'Demande site web',
  'site-web',
  true,
  true,
  'Votre projet de site web',
  'Décrivez votre besoin et recevez un devis personnalisé sous 24h',
  'Recevoir mon devis gratuit',
  '#22D3A5',
  '{"name": true, "email": true, "phone": true, "company": true, "project_type": false, "budget_range": false, "message": true, "deadline": false}'::jsonb,
  '[
    {"name": "type_site", "label": "Type de site", "type": "select", "options": ["Site vitrine", "Landing page", "Blog / Magazine", "Portfolio", "Autre"], "required": true},
    {"name": "nombre_pages", "label": "Nombre de pages estimé", "type": "number", "required": false},
    {"name": "url_existant", "label": "URL du site actuel (si existant)", "type": "url", "required": false},
    {"name": "fonctionnalites", "label": "Fonctionnalités souhaitées", "type": "textarea", "required": false},
    {"name": "budget", "label": "Budget envisagé", "type": "select", "options": ["< 1 000 €", "1 000 – 3 000 €", "3 000 – 5 000 €", "5 000 – 10 000 €", "> 10 000 €"], "required": true},
    {"name": "delai", "label": "Délai souhaité", "type": "select", "options": ["< 1 mois", "1 – 2 mois", "2 – 3 mois", "Pas de contrainte"], "required": false}
  ]'::jsonb,
  (SELECT id FROM quote_templates WHERE name = 'Site vitrine WordPress' AND is_system = true LIMIT 1)
);

-- Form 2: Design / Identité visuelle
INSERT INTO lead_forms (user_id, name, slug, is_system, is_active, title, subtitle, button_text, accent_color, fields, custom_fields, suggested_template_id)
VALUES (
  NULL,
  'Demande design',
  'design',
  true,
  true,
  'Votre projet de design',
  'Logo, identité visuelle, supports marketing — décrivez votre besoin',
  'Demander un devis design',
  '#7c3aed',
  '{"name": true, "email": true, "phone": true, "company": true, "project_type": false, "budget_range": false, "message": true, "deadline": false}'::jsonb,
  '[
    {"name": "type_design", "label": "Type de prestation", "type": "select", "options": ["Logo", "Identité visuelle complète", "Supports print (flyer, brochure)", "Design UI/UX", "Illustration", "Autre"], "required": true},
    {"name": "description_projet", "label": "Décrivez votre projet et vos attentes", "type": "textarea", "required": true},
    {"name": "url_inspiration", "label": "URL d''inspiration ou références", "type": "url", "required": false},
    {"name": "budget", "label": "Budget envisagé", "type": "select", "options": ["< 500 €", "500 – 1 500 €", "1 500 – 3 000 €", "3 000 – 5 000 €", "> 5 000 €"], "required": true},
    {"name": "delai", "label": "Délai souhaité", "type": "select", "options": ["< 2 semaines", "2 – 4 semaines", "1 – 2 mois", "Pas de contrainte"], "required": false}
  ]'::jsonb,
  (SELECT id FROM quote_templates WHERE name = 'Identité visuelle complète' AND is_system = true LIMIT 1)
);

-- Form 3: Conseil / Stratégie
INSERT INTO lead_forms (user_id, name, slug, is_system, is_active, title, subtitle, button_text, accent_color, fields, custom_fields, suggested_template_id)
VALUES (
  NULL,
  'Demande conseil',
  'conseil',
  true,
  true,
  'Besoin d''un accompagnement ?',
  'Audit, stratégie digitale, coaching — parlons de vos objectifs',
  'Demander un accompagnement',
  '#1e40af',
  '{"name": true, "email": true, "phone": true, "company": true, "project_type": false, "budget_range": false, "message": true, "deadline": false}'::jsonb,
  '[
    {"name": "type_conseil", "label": "Type d''accompagnement", "type": "select", "options": ["Audit site web / SEO", "Stratégie digitale", "Coaching / Formation", "Accompagnement projet", "Autre"], "required": true},
    {"name": "objectifs", "label": "Vos objectifs principaux", "type": "textarea", "required": true},
    {"name": "url_site", "label": "URL de votre site actuel", "type": "url", "required": false},
    {"name": "taille_equipe", "label": "Taille de l''équipe", "type": "select", "options": ["Solo / Freelance", "2 – 5 personnes", "6 – 20 personnes", "20+"], "required": false},
    {"name": "budget", "label": "Budget mensuel envisagé", "type": "select", "options": ["< 500 €/mois", "500 – 1 000 €/mois", "1 000 – 2 000 €/mois", "> 2 000 €/mois"], "required": true}
  ]'::jsonb,
  (SELECT id FROM quote_templates WHERE name = 'Audit et stratégie digitale' AND is_system = true LIMIT 1)
);

-- Form 4: E-commerce
INSERT INTO lead_forms (user_id, name, slug, is_system, is_active, title, subtitle, button_text, accent_color, fields, custom_fields, suggested_template_id)
VALUES (
  NULL,
  'Demande e-commerce',
  'ecommerce',
  true,
  true,
  'Votre projet e-commerce',
  'Créez votre boutique en ligne — recevez un devis adapté',
  'Recevoir mon devis e-commerce',
  '#dc2626',
  '{"name": true, "email": true, "phone": true, "company": true, "project_type": false, "budget_range": false, "message": true, "deadline": false}'::jsonb,
  '[
    {"name": "plateforme", "label": "Plateforme souhaitée", "type": "select", "options": ["Shopify", "WooCommerce", "PrestaShop", "Sur-mesure", "Je ne sais pas"], "required": true},
    {"name": "nombre_produits", "label": "Nombre de produits estimé", "type": "number", "required": true},
    {"name": "url_existant", "label": "URL de la boutique actuelle (si existante)", "type": "url", "required": false},
    {"name": "fonctionnalites", "label": "Fonctionnalités spécifiques (paiement, livraison, etc.)", "type": "textarea", "required": false},
    {"name": "budget", "label": "Budget envisagé", "type": "select", "options": ["< 3 000 €", "3 000 – 5 000 €", "5 000 – 10 000 €", "10 000 – 20 000 €", "> 20 000 €"], "required": true},
    {"name": "delai", "label": "Délai souhaité", "type": "select", "options": ["< 1 mois", "1 – 3 mois", "3 – 6 mois", "Pas de contrainte"], "required": false}
  ]'::jsonb,
  (SELECT id FROM quote_templates WHERE name = 'Boutique e-commerce' AND is_system = true LIMIT 1)
);

-- Form 5: Maintenance
INSERT INTO lead_forms (user_id, name, slug, is_system, is_active, title, subtitle, button_text, accent_color, fields, custom_fields, suggested_template_id)
VALUES (
  NULL,
  'Demande maintenance',
  'maintenance',
  true,
  true,
  'Maintenance de votre site',
  'Mises à jour, sécurité, support technique — on s''occupe de tout',
  'Demander un contrat maintenance',
  '#059669',
  '{"name": true, "email": true, "phone": true, "company": true, "project_type": false, "budget_range": false, "message": true, "deadline": false}'::jsonb,
  '[
    {"name": "type_site", "label": "Type de site à maintenir", "type": "select", "options": ["WordPress", "Shopify / WooCommerce", "Site sur-mesure", "Application web", "Autre"], "required": true},
    {"name": "url_site", "label": "URL du site", "type": "url", "required": true},
    {"name": "problemes", "label": "Problèmes rencontrés actuellement", "type": "textarea", "required": false},
    {"name": "frequence", "label": "Fréquence de mise à jour souhaitée", "type": "select", "options": ["Hebdomadaire", "Mensuel", "Trimestriel", "À la demande"], "required": true},
    {"name": "budget", "label": "Budget mensuel envisagé", "type": "select", "options": ["< 100 €/mois", "100 – 200 €/mois", "200 – 500 €/mois", "> 500 €/mois"], "required": true}
  ]'::jsonb,
  (SELECT id FROM quote_templates WHERE name = 'Maintenance site web annuelle' AND is_system = true LIMIT 1)
);
