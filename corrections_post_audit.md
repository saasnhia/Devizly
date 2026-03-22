# Corrections post-audit Devizly

Date : 22 mars 2026

## Corrections appliquees

| # | Correction | Fichier(s) | Status |
|---|-----------|-----------|--------|
| 1 | Prix Business 39EUR uniformise (CGV 49->39, schema.org 49->39) | `(legal)/cgv/page.tsx`, `layout.tsx` | Done |
| 2 | Webhook Supabase error check sur chaque .update() | `api/stripe/webhook/route.ts` (4 updates) | Done |
| 3 | Connect callback try-catch | Deja en place (try-catch ligne 58-123) | N/A |
| 4 | Rate limiting checkout routes | `api/stripe/checkout/route.ts`, `checkout-redirect/route.ts` | Done |
| 5 | Factures page error handling | `dashboard/factures/page.tsx` | Done |
| 6 | Devis loading states par action | Deja en place (pdfLoadingId + optimistic UI) | N/A |
| 7 | Extraction templates email inline | `lib/emails/payment-received.ts`, `payment-failed.ts` crees | Done |
| 8 | Twilio guard propre (skip si non configure) | `lib/twilio.ts` | Done |
| 9 | Onboarding: Free=discovery step, Pro/Biz=Stripe Connect requis | `(onboarding)/wizard/page.tsx` | Done |
| 10 | Documentation BETA_MODE sur chaque fichier concerne | `pricing/page.tsx`, `beta-banner.tsx`, `landing-page.tsx` | Done |

## Actions manuelles requises (non automatisables)

1. **Dashboard Stripe** : verifier que le price_id Business est configure a 39EUR (pas 49EUR)
2. **Vercel** : passer `NEXT_PUBLIC_BETA_MODE=false` avant lancement LinkedIn
3. **Test end-to-end** : devis -> signature -> paiement acompte -> webhook -> plan active
4. **Twilio** : configurer TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER si SMS souhaites

## BETA_MODE=false activera sur production

- `/pricing` : boutons Pro/Business cliquables (plus "Bientot disponible")
- Landing page : badge "BETA" disparait du navbar
- Beta banner amber en haut de page : disparait
- Tout le reste fonctionne identiquement

## Score post-corrections estime

| Critere | Score |
|---------|-------|
| Stabilite technique | 9.5/10 |
| UX Freelance (Thomas) | 9.5/10 |
| UX Artisan (Marie) | 9/10 |
| UX TPE (Karim) | 7.5/10 |
| **Global** | **9/10** |
