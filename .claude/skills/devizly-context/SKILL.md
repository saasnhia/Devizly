---
name: devizly-context
description: Contexte projet Devizly — positionnement, pricing, features live, design system, Stripe config
metadata:
  tags: devizly, context, pricing, features, design, stripe, saas
---

## When to use

Use this skill when working on the Devizly project to understand the product context, current features, pricing, and design system. Particularly useful before adding new features or modifying existing ones.

## Positionnement

SaaS devis IA pour freelances, artisans, TPE françaises.
Entre Freebe (trop basique) et Pennylane (trop complexe).

## Pricing actuel (source de vérité)

- **Free** : 3 devis/mois, signature manuelle
- **Pro** : 19€/mois, 50 devis, signature eIDAS, Stripe Connect, relances auto
- **Business** : 39€/mois, illimité, multi-users

## Features live (ne pas reconstruire)

- Devis IA Mistral (~30s génération)
- Signature eIDAS + SHA-256
- Acomptes Stripe 30%/50%
- Portail client `/devis/[token]`
- Relances cron J+2/J+5/J+7 (Resend)
- Dashboard KPIs + Pipeline Kanban
- 10 templates métiers FR
- Blog MDX 8 articles
- Pages SEO + légales

## Phase 2 (ne pas développer sans demande explicite)

- Factures (code `lib/` prêt, UI manquante)
- CRM avancé

## Design system

- Couleur principale : `#5B5BD6` (violet)
- Sidebar active : `border-left 3px #5B5BD6` + `bg-[#F3F0FF]`
- Dashboard : mobile nav bottom / desktop sidebar 220px

## Stripe Devizly

- `NEXT_PUBLIC_BETA_MODE=false` en production
- Metadata : `app="devizly"`, `plan="free"|"pro"|"business"`
- Webhook events : `checkout.completed`, `subscription.updated/deleted`, `invoice.payment_failed`

## Variables d'env critiques

- `NEXT_PUBLIC_BETA_MODE` → false en prod
- `STRIPE_WEBHOOK_SECRET` → vérifier signature
- `MISTRAL_API_KEY` → génération devis
- `SUPABASE_SERVICE_ROLE_KEY` → jamais exposé client
