---
name: devizly-seo
description: Stratégie SEO complète pour Devizly. Utilise ce skill pour toute optimisation SEO.
metadata:
  tags: devizly, seo, google, sitemap, canonical, schema, keywords
---

## Contexte SEO Devizly

- Site lancé mars 2026
- 16 pages indexées / 35 dans le sitemap
- 11 clics GSC sur 2 semaines
- Concurrent principal : Tolteck, Obat (pas de devis IA)
- Différenciateur : IA Mistral française, signature eIDAS, paiement Stripe

## Mots-clés cibles prioritaires

### Longue traîne (faible concurrence)
- "logiciel devis IA gratuit"
- "devis automatique freelance"
- "générer devis en ligne gratuit"
- "logiciel devis artisan simple"
- "devis plombier en ligne gratuit"
- "créer devis électricien"
- "signer devis en ligne"

### Pages existantes
- / (homepage)
- /pricing
- /blog + 8 articles MDX
- /logiciel-devis-artisan
- /devis-auto-entrepreneur
- /logiciel-facturation-freelance
- /devis-batiment-gratuit
- /creer-devis-en-ligne
- /generateur-devis-ia
- /mentions-legales, /cgu, /cgv, /confidentialite, /cookies, /securite

## Stack technique
- Next.js 16 App Router
- Supabase, Vercel (devizly.fr)
- Sitemap: src/app/sitemap.ts
- Robots: src/app/robots.ts
- SEO pages: src/app/(seo)/

## Rules
- Canonical self-referencing absolu sur CHAQUE page
- Business = 39€, Pro = 19€, Free = 0€
- H1 unique par page, contient le mot-clé principal
- Min 800 mots par page SEO hub
- Schema.org: FAQPage + SoftwareApplication sur chaque page SEO
