# Devizly

SaaS de génération de devis professionnels avec l'IA. Créez, envoyez et suivez vos devis en quelques secondes.

## Stack technique

- **Next.js 16** (App Router, TypeScript strict)
- **Supabase** (auth + base de données PostgreSQL + RLS)
- **shadcn/ui** + Tailwind CSS
- **OpenAI** gpt-4o-mini (génération IA)
- **Stripe** (paiements, à venir)
- **Resend** (emails, à venir)

## Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm run start

# Lint
npm run lint
```

## Variables d'environnement

Copier `.env.local.example` en `.env.local` et renseigner :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Base de données

Appliquer la migration initiale dans Supabase :

```bash
# Via Supabase CLI
supabase db push

# Ou manuellement : copier-coller supabase/migrations/001_initial.sql
# dans l'éditeur SQL de Supabase Dashboard
```
