# Devizly — Contexte projet pour Claude Code

## Project Overview

Devizly est un SaaS de génération de devis professionnels avec IA,
signature électronique et paiement Stripe intégré.

**ICP principal :** indépendants et freelancers français
(artisans, consultants, créatifs, prestataires de services).
**Canal secondaire :** comptables/experts-comptables (prescripteurs).

**Benchmark US de référence :**
Chaque décision produit/UX/feature doit s'inspirer des SaaS US
leaders du segment : HoneyBook, Bonsai, PandaDoc, FreshBooks.
Se poser systématiquement la question : "Comment HoneyBook
ou Bonsai auraient résolu ce problème ?"


- **URL prod** : https://devizly.fr
- **Deploiement** : Vercel
- **Stack** : Next.js 16.1.6 (App Router), React 19, TypeScript strict, Tailwind CSS v4
- **Base de donnees** : Supabase (PostgreSQL + Auth + RLS)
- **Paiements** : Stripe (abonnements + Connect pour encaissement client)
- **Emails** : Resend (noreply@devizly.fr)
- **IA** : OpenAI SDK (modele configurable, objectif Mistral AI heberge France)
- **Rate limiting** : Upstash Redis
- **PDF** : @react-pdf/renderer
- **Video marketing** : Remotion (devDependency)

## Architecture

```
src/
  app/
    (auth)/              # Pages login, signup (layout public)
    (dashboard)/         # Pages protegees (layout avec sidebar)
      dashboard/         # Tableau de bord principal
      devis/             # Liste et creation de devis
      clients/           # Gestion clients
      parametres/        # Profil, abonnement, Stripe Connect
      pricing/           # Page tarifs
    api/                 # Routes API (voir section dediee)
    auth/callback/       # Callback OAuth Supabase
    devis/[token]/       # Page publique consultation devis (partage)
    portal/[token]/      # Portail client self-serve
    layout.tsx           # Layout racine (metadata, fonts, Toaster)
    sitemap.ts           # Sitemap dynamique
    robots.ts            # Robots.txt dynamique
  components/
    ui/                  # Composants shadcn/ui (Button, Card, Input, etc.)
    layout/              # Sidebar, Header
    quotes/              # Composants specifiques devis
    dashboard-charts.tsx # Graphiques Recharts
    devizly-logo.tsx     # Logo SVG
    signature-canvas.tsx # Canvas signature electronique
  lib/
    supabase/
      server.ts          # createClient() — SSR avec cookies
      client.ts          # createClient() — browser (CSR)
    emails/
      devis.ts           # Template HTML email devis
    pdf/                 # Generation PDF devis
    stripe.ts            # getStripe() singleton + PLANS config
    resend.ts            # getResend() singleton + lazy proxy
    ratelimit.ts         # checkRateLimit() — Upstash 5 req/min/IP
    openai.ts            # Client OpenAI
    antiabuse.ts         # Anti-abus signup (2 comptes/IP/semaine)
    url.ts               # getSiteUrl() — URL canonique centralisee
    utils.ts             # cn() classnames helper
  hooks/                 # Custom React hooks
  types/                 # Types TypeScript partages
  middleware.ts          # Refresh token Supabase sur chaque requete
supabase/
  migrations/            # 001 a 008 — schema complet
remotion/                # Composants video marketing
scripts/                 # Scripts generation marketing
```

### Routes API

| Route | Methode | Auth | Rate-limit | Description |
|-------|---------|------|------------|-------------|
| `/api/ai/generate-quote` | POST | Session | Oui | Generation IA de devis |
| `/api/send-devis` | POST | Session | Oui | Envoi email devis via Resend |
| `/api/quotes/[id]/checkout` | POST | Token | Oui | Creation session Stripe Checkout |
| `/api/quotes/[id]/pdf` | GET | Session | Non | Generation PDF devis |
| `/api/quotes/share/[token]` | GET/POST | Public | Non | Consultation + signature devis |
| `/api/quotes/share/[token]/pdf` | GET | Public | Non | PDF devis partage |
| `/api/clients` | GET/POST | Session | Non | CRUD clients |
| `/api/clients/[id]` | PATCH/DELETE | Session | Non | Modification/suppression client |
| `/api/stripe/checkout` | POST | Session | Non | Checkout abonnement |
| `/api/stripe/portal` | POST | Session | Non | Portail Stripe billing |
| `/api/stripe/webhook` | POST | Webhook | Non | Webhooks Stripe |
| `/api/stripe/connect/authorize` | GET | Session | Non | OAuth Stripe Connect |
| `/api/stripe/connect/callback` | GET | Public | Non | Callback OAuth Connect |
| `/api/auth/signup` | POST | Public | Non | Inscription (anti-abus IP) |
| `/api/cron/reminders` | POST | CRON_SECRET | Non | Relances automatiques |
| `/api/export/csv` | GET | Session | Non | Export comptable CSV |
| `/api/admin/seed` | POST | Session | Non | Seed donnees demo |
| `/api/admin/logo` | POST | Session | Non | Upload logo |
| `/api/portal/[token]` | GET | Token | Non | Donnees portail client |

### Schema base de donnees (7 tables + RLS)

- **profiles** — id (= auth.users.id), stripe_customer_id, subscription_status (free/pro/business), stripe_account_id, stripe_connect_status, devis_used, devis_reset_at
- **clients** — id, user_id, name, email, phone, address, city, postal_code, siret, portal_token
- **quotes** — id, user_id, client_id, number, title, total_ht, tva_rate, discount, total_ttc, status (brouillon/envoye/signe/accepte/refuse/paye), share_token, signature_data, stripe_checkout_session, paid_at
- **quote_items** — id, quote_id, description, quantity, unit_price, total, position
- **quote_reminders** — id, quote_id, sent_at, type
- **signup_ips** — id, ip_address, user_id, created_at (pas de RLS = service role only)

## Regles de securite (NON NEGOCIABLES)

### 1. Auth Supabase obligatoire sur chaque route API protegee
```typescript
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
}
```
Ne JAMAIS utiliser `getSession()` seul — toujours `getUser()` qui valide le JWT cote serveur.

### 2. Verification signature webhook Stripe
```typescript
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
```
Toujours verifier la signature avec `constructEvent()`. Ne jamais parser le body JSON directement.

### 3. Secrets en variables d'environnement uniquement
Ne jamais hardcoder de cles API, tokens ou secrets. Toujours utiliser `process.env.NOM_VARIABLE`.
Variables requises (noms uniquement, jamais les valeurs) :
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (JAMAIS expose cote client)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY_CLIENT`, `STRIPE_WEBHOOK_SECRET_CLIENT`, `STRIPE_CONNECT_CLIENT_ID`
- `RESEND_API_KEY` ou `RESEND_API_KEY_DEVIZLY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `CRON_SECRET`
- `NEXT_PUBLIC_SITE_URL`

### 4. Rate limiting sur les routes sensibles
Utiliser `checkRateLimit(request)` de `@/lib/ratelimit` avant toute logique metier sur les routes exposees (send-devis, generate-quote, checkout). Sliding window 5 req/min/IP via Upstash Redis.

### 5. Service client vs client authentifie
- **Routes protegees (dashboard)** : `createClient()` de `@/lib/supabase/server` — utilise anon key + cookies session, respecte RLS
- **Routes publiques (share, checkout)** : `createServiceClient()` inline avec `SUPABASE_SERVICE_ROLE_KEY` — contourne RLS, necessaire pour acceder aux donnees sans session
- Ne JAMAIS exposer `SUPABASE_SERVICE_ROLE_KEY` cote client

### 6. Validation des entrees
- Email : regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Signature : max 500 KB (`signature_data.length > 500_000`)
- Nom signataire : max 200 caracteres
- Toujours valider et sanitiser les donnees utilisateur avant insertion

## Dev Workflow

### Commandes principales
```bash
npm run dev          # Serveur de dev (localhost:3000)
npm run build        # Build production — DOIT passer sans erreur
npm run start        # Serveur production local
npm run lint         # ESLint
```

### Supabase
```bash
# Migrations locales (Docker requis)
npx supabase start
npx supabase db reset    # Reset + replay toutes les migrations

# Appliquer une migration en prod
npx supabase db push --linked
```
Les migrations sont dans `supabase/migrations/` numerotees de 001 a 008.

### Deploiement
- Push sur `main` → deploiement automatique Vercel
- Variables d'environnement a configurer dans le dashboard Vercel
- Domaine : devizly.fr

### Remotion (video marketing)
```bash
npx remotion render DevizlyAd     # Generer video 15s
npx remotion still LinkedInBanner  # Generer banniere LinkedIn
```

## Conventions de code

### TypeScript
- Mode strict active — **zero `any`**
- Utiliser `zod` pour la validation des schemas
- Interfaces et types dans `src/types/` ou co-localises

### Nommage
- Fichiers : kebab-case (`send-devis`, `generate-quote`)
- Composants React : PascalCase (`SignatureCanvas`, `DevizlyLogo`)
- Variables/fonctions : camelCase
- Constantes : SCREAMING_SNAKE_CASE (`MAX_SIGNATURE_SIZE`)

### Composants
- Server Components par defaut (pas de `"use client"` sauf necessaire)
- `"use client"` uniquement pour : hooks (useState, useEffect), event handlers, browser APIs
- UI : composants shadcn/ui dans `src/components/ui/`
- Layouts dans `src/components/layout/`

### API Routes
- Toujours retourner `NextResponse.json()`
- Pattern standard : rate-limit → auth → validation → logique → reponse
- Erreurs en francais dans les reponses JSON (`"Non authentifie"`, `"Devis introuvable"`)

### Supabase
- Server : `import { createClient } from "@/lib/supabase/server"` (async, avec cookies)
- Client : `import { createClient } from "@/lib/supabase/client"` (browser)
- Service role : `createServiceClient()` defini inline dans la route (pas de helper partage pour eviter l'import accidentel)

### Singletons paresseux
Stripe, Resend et Redis utilisent un pattern singleton paresseux pour eviter les erreurs au cold start :
```typescript
let _instance: Type | null = null;
export function getInstance(): Type {
  if (!_instance) { _instance = new Type(process.env.KEY!); }
  return _instance;
}
```

### URL centralisee
Toujours utiliser `getSiteUrl()` de `@/lib/url` pour construire des URLs absolues. Ne jamais hardcoder `localhost` ou le domaine.

## Integrations cles

### Supabase
- Auth : email/password + Google OAuth
- RLS sur toutes les tables — policies `users_own_*`
- Trigger `on_auth_user_created` → creation automatique du profil
- Fonction `reset_monthly_devis()` pour le reset mensuel des quotas

### Stripe
- **Abonnements** : Free (3 devis/mois), Pro (50, 19EUR), Business (illimite, 49EUR)
- **Stripe Connect Express** : permet aux utilisateurs d'encaisser leurs clients directement
- **Webhooks** : checkout.session.completed, subscription.updated, subscription.deleted
- Prix configures via `NEXT_PUBLIC_STRIPE_PRICE_PRO` et `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS`

### Resend
- Envoi d'emails transactionnels (devis, relances)
- Template HTML dans `src/lib/emails/devis.ts`
- Expediteur : `Devizly <noreply@devizly.fr>`

### Upstash Redis
- Rate limiting via `@upstash/ratelimit` (sliding window 5 req/min/IP)
- Routes protegees : send-devis, generate-quote, checkout
- Analytics activees (`analytics: true`)

### Vercel
- Deploiement auto depuis branche `main`
- Cron jobs via `vercel.json` ou API routes + CRON_SECRET

## Palette de couleurs
- Primary : `#22D3A5` (emerald green)
- Background : `#0F172A` (dark navy)
- Muted : `#94A3B8`, `#64748B`
- CTA Stripe Connect : `#1e40af` (blue)
- Accent email : `#6366F1` (violet/indigo)
- Suivre exactement les composants UI existants — ne pas inventer de nouvelles couleurs

## Pieges courants (ce que Claude ne doit JAMAIS faire)

1. **Ne jamais utiliser `any`** — TypeScript strict, pas d'exception
2. **Ne jamais hardcoder d'URLs** — utiliser `getSiteUrl()`
3. **Ne jamais oublier le check auth** dans une route API protegee
4. **Ne jamais utiliser `getSession()`** sans `getUser()` — `getSession()` ne valide pas le JWT
5. **Ne jamais importer `SUPABASE_SERVICE_ROLE_KEY`** dans du code client
6. **Ne jamais casser les routes existantes** — tester avec `npm run build`
7. **Ne jamais committer de secrets** — `.env.local` est dans `.gitignore`
8. **Ne jamais envoyer de donnees personnelles brutes au LLM** — anonymiser (RGPD)
9. **Ne jamais creer de fichiers inutiles** — preferer editer l'existant
10. **`npm run build` doit toujours passer** — verifier apres chaque modification significative
