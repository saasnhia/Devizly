# Devizly — Launch Readiness Report

*Audit complet — 20 mars 2026*

---

## ❌ Bugs corrigés dans ce commit

### 🔴 CRITIQUE — Webhook Stripe : `planFromPriceId()` utilisait les mauvaises variables d'env
- **Fichier** : `src/app/api/stripe/webhook/route.ts`
- **Bug** : La fonction `planFromPriceId()` cherchait `STRIPE_PRICE_PRO` et `STRIPE_PRICE_BUSINESS` — mais seules `NEXT_PUBLIC_STRIPE_PRICE_PRO` et `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS` existaient dans .env.local.
- **Impact** : **Toutes les souscriptions Stripe étaient silencieusement ignorées**. Chaque `checkout.session.completed` résolvait le plan comme "free" → les users Pro/Business n'étaient jamais activés en base.
- **Fix** : `planFromPriceId()` cherche maintenant `NEXT_PUBLIC_*` en priorité, fallback sur `STRIPE_PRICE_*`.

### 🔴 CRITIQUE — PDF factures : barres/rayures sur les montants
- **Fichiers** : `src/lib/pdf/invoice-template.tsx` + `src/lib/pdf/devis-template.tsx`
- **Bug** : `Intl.NumberFormat("fr-FR")` produit des espaces fines insécables (U+202F) comme séparateur de milliers. Le font Helvetica embarqué dans @react-pdf ne supporte pas ce caractère → rendu avec des artefacts visuels (barres).
- **Fix** : `fmt()` remplace désormais `\u202f` et `\u00a0` par des espaces normaux.

### 🟠 IMPORTANT — Webhook : aucune gestion de `invoice.payment_failed`
- **Fichier** : `src/app/api/stripe/webhook/route.ts`
- **Bug** : Quand un paiement d'abonnement échouait, aucune action n'était prise — l'utilisateur n'était pas notifié.
- **Fix** : Ajout d'un handler `invoice.payment_failed` qui :
  - Crée une notification in-app "Échec de paiement"
  - Envoie un email avec CTA "Mettre à jour mon paiement"

### 🟠 IMPORTANT — Factures PDF : mentions légales NBHC manquantes
- **Fichier** : `src/lib/pdf/invoice-template.tsx`
- **Bug** : Le footer des factures PDF n'avait pas la ligne NBHC (déjà présente sur les devis).
- **Fix** : Ajout de "Édité par NBHC SAS — SIREN 102 637 899 — RCS Chalon-sur-Saône" + fallback SIRET "en cours d'immatriculation".

---

## ✅ Ce qui fonctionne

### Authentification
- [x] Inscription email/password + Google OAuth
- [x] `getUser()` utilisé partout (pas de `getSession()` seul)
- [x] Middleware refresh token
- [x] Anti-abus signup (2 comptes/IP/semaine)
- [x] Zero `any` dans le codebase (TypeScript strict)

### Stripe Abonnements
- [x] Checkout Session avec `NEXT_PUBLIC_STRIPE_PRICE_PRO` / `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS`
- [x] Whitelist des price IDs (pas de souscription arbitraire)
- [x] Webhook : `checkout.session.completed` → active le plan
- [x] Webhook : `customer.subscription.updated` → met à jour le plan
- [x] Webhook : `customer.subscription.deleted` → repasse en Gratuit
- [x] Webhook : `invoice.payment_failed` → notifie l'utilisateur ✨ NEW
- [x] Portail Stripe billing pour gestion abonnement
- [x] Plan Gratuit limité à 3 devis/mois (`canCreateDevis()`)

### Stripe Connect
- [x] OAuth flow : `/api/stripe/connect/authorize` → callback
- [x] URL de callback utilise `getSiteUrl()` (pas de hardcode)
- [x] Statut Connect sauvé en base (`connected`/`pending`)
- [x] Paiements redirigés vers le compte Connect si activé
- [x] Acomptes 30%/50% gérés (Pro/Business uniquement)
- [x] Bouton paiement masqué si Stripe non configuré

### Devis & Factures
- [x] Génération IA (Mistral) avec `response_format: json_object`
- [x] PDF devis avec mentions légales NBHC
- [x] PDF factures avec mentions légales NBHC
- [x] Signature électronique eIDAS + certificat SHA-256
- [x] Conditions de paiement par devis
- [x] Validité configurable (défaut 30 jours)
- [x] SIRET optionnel ("en cours d'immatriculation" sur PDF)
- [x] Relances automatiques (J+2, J+5, J+7)
- [x] Soft delete / archivage devis

### Emails transactionnels
- [x] Devis envoyé (avec tracking pixel)
- [x] Confirmation signature (client + freelance)
- [x] Facture
- [x] Relances
- [x] Paiement reçu
- [x] Remboursement
- [x] Échec paiement ✨ NEW
- [x] Footer NBHC SAS sur tous les emails

### SEO & Marketing
- [x] Meta tags Open Graph + Twitter Cards
- [x] Schema.org (SoftwareApplication + WebSite + FAQPage)
- [x] sitemap.xml dynamique (pages + blog)
- [x] robots.txt (dashboard/API/portal exclus)
- [x] 6 pages SEO longue traîne
- [x] Blog MDX (8 articles)
- [x] PWA installable (manifest + service worker + icônes)

### Légal & Conformité
- [x] Mentions légales NBHC complètes
- [x] CGV avec identification NBHC
- [x] Footer landing : © NBHC SAS — SIREN
- [x] RGPD : données anonymisées avant envoi LLM
- [x] Rate limiting (5 req/min/IP) sur routes sensibles

---

## ⚠️ Actions manuelles requises

### Variables d'environnement Vercel (à vérifier)
1. **`NEXT_PUBLIC_STRIPE_PRICE_PRO`** — doit contenir le price_id live du plan Pro (19€/mois)
2. **`NEXT_PUBLIC_STRIPE_PRICE_BUSINESS`** — doit contenir le price_id live du plan Business (39€/mois)
3. **`STRIPE_WEBHOOK_SECRET`** — doit être le secret du webhook **live** (pas test)
4. **`STRIPE_CONNECT_CLIENT_ID`** — doit être le `ca_live_*` (pas `ca_test_*`)
5. **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** — doit être `pk_live_*`
6. **`STRIPE_SECRET_KEY`** — doit être `sk_live_*`
7. **`NEXT_PUBLIC_BETA_MODE`** — mettre à `false` pour activer les plans payants sur /pricing

### Stripe Dashboard
1. Créer le webhook live endpoint → `https://devizly.fr/api/stripe/webhook`
2. Sélectionner les événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
3. Copier le signing secret dans `STRIPE_WEBHOOK_SECRET` sur Vercel
4. Vérifier que les deux price IDs (Pro/Business) sont bien créés en mode live

### Supabase
1. Appliquer les migrations manquantes via SQL Editor si nécessaire (033_payment_terms, 034_quote_archive)
2. Vérifier que les vues `ai_usage_monthly` et `notifications_factures` sont en `SECURITY INVOKER` (voir issue précédente)

### DNS / Domaine
1. Vérifier que devizly.fr pointe bien vers Vercel
2. Vérifier le certificat SSL
3. Configurer Google Search Console (meta tag de vérification à ajouter)
