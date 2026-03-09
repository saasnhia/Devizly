-- ============================================================
-- 016 — System template seeds (visible to all users)
-- ============================================================

-- 1. Add is_system column
ALTER TABLE quote_templates ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- 2. Allow NULL user_id for system templates
ALTER TABLE quote_templates ALTER COLUMN user_id DROP NOT NULL;

-- 3. RLS policy: everyone can read system templates
CREATE POLICY "public_read_system_templates" ON quote_templates
  FOR SELECT USING (is_system = true);

-- 4. Seed 10 system templates (user_id NULL, is_system true)

-- Template 1: Site vitrine
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Site vitrine WordPress',
  'Création complète d''un site vitrine responsive sous WordPress',
  'web',
  true,
  '[
    {"description": "Maquette graphique (design UI/UX)", "quantity": 1, "unit_price": 800},
    {"description": "Intégration WordPress + thème sur-mesure", "quantity": 1, "unit_price": 1200},
    {"description": "Pages (Accueil, À propos, Services, Contact)", "quantity": 4, "unit_price": 200},
    {"description": "Formulaire de contact avec notifications", "quantity": 1, "unit_price": 150},
    {"description": "Optimisation SEO de base", "quantity": 1, "unit_price": 300},
    {"description": "Formation utilisation back-office (1h)", "quantity": 1, "unit_price": 100}
  ]'::jsonb,
  30,
  'Hébergement et nom de domaine non inclus. Livraison sous 3-4 semaines.'
);

-- Template 2: E-commerce
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Boutique e-commerce',
  'Création d''une boutique en ligne complète avec paiement',
  'web',
  true,
  '[
    {"description": "Maquette graphique boutique (UX/UI)", "quantity": 1, "unit_price": 1200},
    {"description": "Développement WooCommerce / Shopify", "quantity": 1, "unit_price": 2500},
    {"description": "Configuration passerelle de paiement (Stripe)", "quantity": 1, "unit_price": 300},
    {"description": "Importation catalogue produits (jusqu''à 50)", "quantity": 50, "unit_price": 10},
    {"description": "Configuration livraison et fiscalité", "quantity": 1, "unit_price": 400},
    {"description": "Tests et recette", "quantity": 1, "unit_price": 500},
    {"description": "Formation gestion boutique (2h)", "quantity": 2, "unit_price": 100}
  ]'::jsonb,
  30,
  'Abonnement plateforme et frais de transaction non inclus. Livraison sous 5-6 semaines.'
);

-- Template 3: Application web SaaS
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Application web sur-mesure',
  'Développement d''une application web métier (MVP)',
  'web',
  true,
  '[
    {"description": "Cadrage fonctionnel et spécifications", "quantity": 2, "unit_price": 600},
    {"description": "Maquettes UX/UI (Figma)", "quantity": 1, "unit_price": 1500},
    {"description": "Développement front-end (React/Next.js)", "quantity": 10, "unit_price": 500},
    {"description": "Développement back-end et API", "quantity": 8, "unit_price": 550},
    {"description": "Base de données et authentification", "quantity": 1, "unit_price": 800},
    {"description": "Déploiement et mise en production", "quantity": 1, "unit_price": 500},
    {"description": "Documentation technique", "quantity": 1, "unit_price": 400}
  ]'::jsonb,
  30,
  'Tarif MVP. Maintenance et évolutions facturées séparément. Méthodologie agile avec points hebdomadaires.'
);

-- Template 4: Identité visuelle
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Identité visuelle complète',
  'Création de l''identité de marque : logo, charte, supports',
  'design',
  true,
  '[
    {"description": "Recherche et moodboard", "quantity": 1, "unit_price": 400},
    {"description": "Création logo (3 propositions + itérations)", "quantity": 1, "unit_price": 1200},
    {"description": "Déclinaisons logo (monochrome, favicon, réseaux)", "quantity": 1, "unit_price": 300},
    {"description": "Charte graphique (typographies, couleurs, règles)", "quantity": 1, "unit_price": 600},
    {"description": "Carte de visite recto-verso", "quantity": 1, "unit_price": 250},
    {"description": "Gabarit papier à en-tête + signature email", "quantity": 1, "unit_price": 200}
  ]'::jsonb,
  30,
  'Fichiers livrés en AI, PDF, PNG et SVG. 2 allers-retours inclus par étape.'
);

-- Template 5: Supports print
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Pack supports marketing print',
  'Création de supports imprimés pour communication',
  'design',
  true,
  '[
    {"description": "Flyer A5 recto-verso", "quantity": 1, "unit_price": 350},
    {"description": "Brochure 3 volets (6 pages)", "quantity": 1, "unit_price": 600},
    {"description": "Affiche A3", "quantity": 1, "unit_price": 300},
    {"description": "Kakémono / Roll-up", "quantity": 1, "unit_price": 250},
    {"description": "Adaptation et déclinaison formats", "quantity": 1, "unit_price": 200}
  ]'::jsonb,
  30,
  'Impression non incluse. Fichiers livrés prêts pour l''imprimeur (PDF HD, CMJN, traits de coupe).'
);

-- Template 6: Conseil stratégie digitale
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Audit et stratégie digitale',
  'Audit de présence en ligne et recommandations stratégiques',
  'conseil',
  true,
  '[
    {"description": "Audit site web existant (UX, performance, SEO)", "quantity": 1, "unit_price": 800},
    {"description": "Analyse concurrentielle (benchmark 5 concurrents)", "quantity": 1, "unit_price": 600},
    {"description": "Audit réseaux sociaux", "quantity": 1, "unit_price": 400},
    {"description": "Recommandations stratégiques et plan d''action", "quantity": 1, "unit_price": 1000},
    {"description": "Présentation et restitution (2h)", "quantity": 2, "unit_price": 150}
  ]'::jsonb,
  30,
  'Livrable : document PDF de synthèse + présentation PowerPoint. Durée mission : 2-3 semaines.'
);

-- Template 7: Accompagnement / coaching
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Accompagnement mensuel',
  'Forfait mensuel de conseil et suivi projet',
  'conseil',
  true,
  '[
    {"description": "Réunion de suivi hebdomadaire (1h)", "quantity": 4, "unit_price": 150},
    {"description": "Support email et téléphone illimité", "quantity": 1, "unit_price": 300},
    {"description": "Reporting mensuel et KPIs", "quantity": 1, "unit_price": 250},
    {"description": "Veille sectorielle et recommandations", "quantity": 1, "unit_price": 200}
  ]'::jsonb,
  30,
  'Engagement minimum 3 mois. Tarif mensuel reconductible tacitement.'
);

-- Template 8: Rénovation intérieure
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Rénovation salle de bain',
  'Rénovation complète d''une salle de bain standard',
  'artisan',
  true,
  '[
    {"description": "Dépose sanitaires et revêtements existants", "quantity": 1, "unit_price": 600},
    {"description": "Plomberie (alimentation + évacuation)", "quantity": 1, "unit_price": 1200},
    {"description": "Électricité (mise aux normes NF C 15-100)", "quantity": 1, "unit_price": 500},
    {"description": "Carrelage sol et murs (fourniture + pose)", "quantity": 12, "unit_price": 80},
    {"description": "Pose sanitaires (douche, WC, vasque)", "quantity": 1, "unit_price": 800},
    {"description": "Peinture plafond et finitions", "quantity": 1, "unit_price": 350},
    {"description": "Nettoyage de chantier", "quantity": 1, "unit_price": 150}
  ]'::jsonb,
  30,
  'Fournitures sanitaires non incluses sauf mention contraire. Durée estimée : 2-3 semaines. Garantie décennale.'
);

-- Template 9: Peinture appartement
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Peinture appartement T3',
  'Remise en peinture complète d''un appartement 3 pièces',
  'artisan',
  true,
  '[
    {"description": "Protection sols et mobilier", "quantity": 1, "unit_price": 200},
    {"description": "Préparation murs (rebouchage, ponçage, sous-couche)", "quantity": 65, "unit_price": 8},
    {"description": "Peinture murs 2 couches (pièces de vie)", "quantity": 65, "unit_price": 12},
    {"description": "Peinture plafonds", "quantity": 45, "unit_price": 10},
    {"description": "Peinture boiseries (portes, plinthes)", "quantity": 1, "unit_price": 400},
    {"description": "Nettoyage fin de chantier", "quantity": 1, "unit_price": 150}
  ]'::jsonb,
  30,
  'Peinture qualité professionnelle incluse. Coloris au choix (jusqu''à 3 teintes). Durée estimée : 1 semaine.'
);

-- Template 10: Maintenance web
INSERT INTO quote_templates (user_id, name, description, category, is_system, items, default_validity_days, default_notes)
VALUES (
  NULL,
  'Maintenance site web annuelle',
  'Contrat de maintenance et support technique annuel',
  'web',
  true,
  '[
    {"description": "Mises à jour CMS, thème et plugins (mensuel)", "quantity": 12, "unit_price": 80},
    {"description": "Sauvegarde automatique quotidienne", "quantity": 1, "unit_price": 200},
    {"description": "Monitoring uptime et performance", "quantity": 1, "unit_price": 150},
    {"description": "Support technique (jusqu''à 2h/mois)", "quantity": 12, "unit_price": 60},
    {"description": "Rapport mensuel de suivi", "quantity": 12, "unit_price": 30},
    {"description": "Intervention urgente (temps de réponse 4h)", "quantity": 1, "unit_price": 300}
  ]'::jsonb,
  30,
  'Contrat annuel. Heures supplémentaires facturées au tarif horaire en vigueur. Renouvellement tacite.'
);
