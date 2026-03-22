# PHASE 1 — Cartographie des features existantes

*Audit Devizly — mars 2026*

---

## 1.1 Features confirmees live

### Auth & Onboarding
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Inscription email/password | `(auth)/signup/page.tsx`, `api/auth/signup/route.ts` | Complet | Supabase |
| Google OAuth | `(auth)/login/page.tsx`, `auth/callback/route.ts` | Complet | Supabase |
| Anti-abus signup (2/IP/sem) | `lib/antiabuse.ts`, `api/auth/signup/route.ts` | Complet | Supabase |
| Wizard onboarding 4 etapes | `(onboarding)/wizard/page.tsx` | Complet | Supabase, Stripe |
| Onboarding progress bar | `components/onboarding-progress.tsx` | Complet | - |

### Devis & IA
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Generation devis IA | `api/ai/generate-quote/route.ts`, `lib/mistral.ts` | Complet | Mistral AI |
| Formulaire creation devis | `devis/nouveau/page.tsx` | Complet | - |
| Drag & drop lignes | `devis/nouveau/page.tsx` (dnd-kit) | Complet | @dnd-kit |
| Auto-save brouillon | `devis/nouveau/page.tsx` (debounce 2s) | Complet | - |
| Apercu PDF inline | `devis/nouveau/page.tsx` (dialog iframe) | Complet | @react-pdf |
| Liste devis + filtres | `devis/page.tsx` | Complet | - |
| Pagination devis | `devis/page.tsx` | Complet | - |
| Archivage soft delete | `api/quotes/[id]/route.ts` (PATCH/DELETE) | Complet | - |
| Templates devis (10 metiers) | `templates/page.tsx`, seed migration 016 | Complet | - |
| Conditions de paiement | `devis/nouveau/page.tsx`, PDF template | Complet | - |
| Validite configurable | `devis/nouveau/page.tsx` (defaut +30j) | Complet | - |
| Multi-devises | `lib/currencies.ts` (EUR, USD, GBP, CHF, CAD, MAD) | Complet | - |

### Signature electronique
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Canvas signature | `components/signature-canvas.tsx` | Complet | - |
| Signature eIDAS + SHA-256 | `api/quotes/share/[token]/route.ts` | Complet | crypto.subtle |
| Certificat PDF eIDAS | `lib/pdf/devis-template.tsx` (page 2) | Complet | @react-pdf |
| IP + User-Agent audit trail | `api/quotes/share/[token]/route.ts` | Complet | - |

### Paiements Stripe
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Abonnements Pro/Business | `api/stripe/checkout/route.ts` | Complet | Stripe |
| Webhook checkout.completed | `api/stripe/webhook/route.ts` | Complet | Stripe |
| Webhook subscription.updated | `api/stripe/webhook/route.ts` | Complet | Stripe |
| Webhook subscription.deleted | `api/stripe/webhook/route.ts` | Complet | Stripe |
| Webhook invoice.payment_failed | `api/stripe/webhook/route.ts` | Complet | Stripe |
| Stripe Connect Express | `api/stripe/connect/authorize` + `callback` | Complet | Stripe |
| Acomptes 30%/50% | `api/quotes/[id]/checkout/route.ts` | Complet | Stripe |
| Portail billing | `api/stripe/portal/route.ts` | Complet | Stripe |
| Remboursements | `api/stripe/refund/route.ts` | Complet | Stripe |
| Direct checkout from landing | `api/stripe/checkout-redirect/route.ts` | Complet | Stripe |

### PDF & Export
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| PDF devis | `lib/pdf/devis-template.tsx` | Complet | @react-pdf |
| PDF factures | `lib/pdf/invoice-template.tsx` | Complet | @react-pdf |
| Export CSV | `api/export/csv/route.ts` | Complet | - |
| Export FEC comptable | `api/export/fec/route.ts` | Complet | - |

### Pipeline & CRM
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Pipeline Kanban 6 colonnes | `dashboard/pipeline/page.tsx`, `components/pipeline/` | Complet | - |
| Gestion prospects | `api/prospects/route.ts` | Complet | - |
| Gestion clients CRUD | `clients/page.tsx`, `api/clients/` | Complet | - |
| Autocomplete INSEE | `components/company-autocomplete.tsx` | Complet | API gouv.fr |
| Import CSV clients | `clients/page.tsx` (inline) | Complet | - |
| Portail client public | `portal/[token]/page.tsx` | Complet | - |
| Lead forms embeddables | `lead-forms/page.tsx`, `f/[slug]/page.tsx` | Complet | - |
| Leads management | `leads/page.tsx` | Complet | - |

### Communication
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Envoi email devis | `api/send-devis/route.ts`, `lib/emails/devis.ts` | Complet | Resend |
| Relances auto J+2/J+5/J+7 | `api/cron/reminders/route.ts`, `lib/emails/reminder.ts` | Complet | Resend |
| Relances email customisables | `components/relance-email-editor.tsx`, `api/settings/relance-templates/` | Complet | - |
| Notifications in-app | `components/layout/notification-bell.tsx`, `api/notifications/` | Complet | Supabase |
| Daily briefing IA | `dashboard/briefing/page.tsx`, `lib/ai/daily-briefing.ts` | Complet | Mistral |
| Email facture | `lib/emails/invoice.ts` | Complet | Resend |
| Email confirmation signature | `api/quotes/share/[token]/route.ts` (inline) | Complet | Resend |
| Tracking pixel vues devis | `api/track/[quoteId]/route.ts` | Complet | - |

### Contrats & Facturation
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Contrats recurents | `contrats/page.tsx`, `api/contracts/` | Complet | - |
| Signature contrats | `contracts/sign/[token]/page.tsx` | Complet | - |
| Factures auto a la signature | `lib/invoices/auto-invoice.ts` | Complet | - |
| Generation factures | `lib/invoices/generate-invoice.ts` | Complet | - |
| Cron facturation recurrente | `api/cron/invoices/route.ts` | Complet | - |

### Equipe & Time Tracking
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Multi-users (roles) | `equipe/page.tsx`, `api/team/` | Complet | - |
| Timer integre | `timer/page.tsx`, `api/time-entries/` | Complet | - |
| Facturation du temps | `api/time-entries/bill/route.ts` | Complet | - |

### URSSAF
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Declarations URSSAF | `dashboard/urssaf/page.tsx` | Complet | - |

### SEO & Marketing
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Landing page premium | `components/landing/landing-page.tsx` (70K) | Complet | framer-motion |
| Hero carousel 3 screens | `components/landing/hero-carousel.tsx` | Complet | - |
| BlurText animation | `components/landing/blur-text.tsx` | Complet | - |
| Blog MDX 8 articles | `app/blog/`, `content/blog/` | Complet | next-mdx-remote |
| 6 pages SEO longue traine | `(seo)/` | Complet | - |
| Schema.org (3 types) | `layout.tsx`, `page.tsx`, blog | Complet | - |
| Sitemap dynamique | `sitemap.ts` | Complet | - |
| robots.txt | `robots.ts` | Complet | - |
| PWA installable | `sw.js`, `manifest.json`, icons | Complet | - |
| 7 ads video Remotion | `src/remotion/ads/` | Complet | Remotion |

### Legal & Conformite
| Feature | Fichiers | Status | Deps |
|---------|----------|--------|------|
| Mentions legales NBHC | `(legal)/mentions-legales/page.tsx` | Complet | - |
| CGU | `(legal)/cgu/page.tsx` | Complet | - |
| CGV | `(legal)/cgv/page.tsx` | Complet | - |
| Confidentialite RGPD | `(legal)/confidentialite/page.tsx` | Complet | - |
| Cookies | `(legal)/cookies/page.tsx` | Complet | - |
| Securite | `(legal)/securite/page.tsx` | Complet | - |
| Cookie banner | `components/cookie-banner.tsx` | Complet | - |

---

## 1.2 Fichiers orphelins ou suspects

- **Aucun TODO/FIXME/HACK** trouve dans le codebase
- **Aucun import orphelin** detecte (tous les @/ resolvent correctement)
- `components/seed-button.tsx` : composant admin visible uniquement pour ADMIN_USER_ID — OK

---

## 1.3 Variables d'environnement

### Presentes dans .env.local (23) :
```
CRON_SECRET, ELEVENLABS_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
MISTRAL_API_KEY, NEXTAUTH_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_BETA_MODE,
NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
NEXT_PUBLIC_STRIPE_PRICE_PRO, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL,
RESEND_API_KEY, RESEND_API_KEY_DEVIZLY, STRIPE_CONNECT_CLIENT_ID,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_CLIENT,
SUPABASE_SERVICE_ROLE_KEY, UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL
```

### Referencees dans le code mais absentes de .env.local :
- `STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS` — fallbacks dans webhook (couvert par NEXT_PUBLIC_*)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` — SMS relances (non configure)

---

## Resume

| Categorie | Total features | Completes | Partielles | Cassees |
|-----------|---------------|-----------|------------|---------|
| Auth & Onboarding | 5 | 5 | 0 | 0 |
| Devis & IA | 12 | 12 | 0 | 0 |
| Signature | 4 | 4 | 0 | 0 |
| Paiements Stripe | 10 | 10 | 0 | 0 |
| PDF & Export | 4 | 4 | 0 | 0 |
| Pipeline & CRM | 8 | 8 | 0 | 0 |
| Communication | 8 | 8 | 0 | 0 |
| Contrats & Factures | 5 | 5 | 0 | 0 |
| Equipe & Time | 3 | 3 | 0 | 0 |
| SEO & Marketing | 10 | 10 | 0 | 0 |
| Legal | 7 | 7 | 0 | 0 |
| **TOTAL** | **76** | **76** | **0** | **0** |

40 pages, 57 API routes, 48 composants, 25 fichiers lib, 36 migrations.
