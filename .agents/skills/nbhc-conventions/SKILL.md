---
name: nbhc-conventions
description: Conventions globales NBHC — langue, stack, Stripe multi-app, sécurité Supabase
metadata:
  tags: nbhc, conventions, stripe, supabase, security, holding
---

## When to use

Use this skill whenever working on any NBHC project (Devizly, Worthifast, or future SaaS) to ensure consistent conventions across the holding.

## Structure holding

SAS NBHC → Devizly (devis IA) + Worthifast (comptabilité) + futurs SaaS

## Règles langue

- Code, variables, commentaires → anglais
- Textes UI, copy, messages utilisateur → français formel (vouvoiement)
- Réponses au développeur → français décontracté

## Stack commune

Next.js App Router / TypeScript strict / Supabase / Stripe / Vercel

## Stripe NBHC

- Un seul compte Stripe pour tous les produits NBHC
- Metadata obligatoire sur chaque objet Stripe : `app="devizly"` | `app="worthifast"`
- Jamais de clé en dur — toujours `process.env.*`
- Toujours vérifier la signature webhook avec `constructEvent()`

## Sécurité non négociable

- RLS Supabase : toujours actif, jamais contourné côté client
- `getUser()` obligatoire sur toutes les routes protégées (jamais `getSession()` seul)
- Webhook Stripe : toujours vérifier la signature
- Secrets : uniquement dans `.env.local` / Vercel env vars
- `SUPABASE_SERVICE_ROLE_KEY` : jamais exposé côté client
