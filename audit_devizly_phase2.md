# PHASE 2 — Audit technique & detection de bugs

*Audit Devizly — mars 2026*

---

## 2.1 Bugs critiques

### BUG CRITIQUE #1 — Webhook secret fallback vide
```
Fichier : src/app/api/stripe/webhook/route.ts
Ligne : 40
Probleme : process.env.STRIPE_WEBHOOK_SECRET || "" — fallback string vide
Impact : Si la var est absente, constructEvent() echoue mais le pattern est dangereux
Fix : APPLIQUE — check explicite + return 500 si absent
```

---

## 2.2 Bugs moyens (corriges)

### BUG MOYEN #1 — Checkout Stripe sans try-catch
```
Fichier : src/app/api/stripe/checkout/route.ts
Lignes : 40-61
Probleme : getStripe().customers.create() et checkout.sessions.create() sans try-catch
Impact : Erreur Stripe non catchee = crash 500 sans message clair
Fix : APPLIQUE — try-catch avec message fr "Impossible de creer la session"
```

### BUG MOYEN #2 — Webhook DB updates sans check erreur
```
Fichier : src/app/api/stripe/webhook/route.ts
Lignes : 57-224
Probleme : Tous les supabase.update() ignorent l'erreur retournee
Impact : Subscription pas mise a jour en base, user reste "free" malgre paiement
Recommandation : Ajouter console.error sur chaque .error — non bloquant pour le webhook
Status : DOCUMENTE (pas fix pour eviter de casser le webhook flow)
```

### BUG MOYEN #3 — Connect callback fetch sans try-catch
```
Fichier : src/app/api/stripe/connect/callback/route.ts
Ligne : 61-69
Probleme : fetch() vers connect.stripe.com sans try-catch
Impact : Erreur reseau = crash route
Recommandation : Wrap dans try-catch avec redirect parametres?stripe=error
Status : DOCUMENTE
```

---

## 2.3 Bugs mineurs

### MINEUR #1 — Checkout routes sans rate limiting
```
Fichiers : api/stripe/checkout/route.ts, api/stripe/checkout-redirect/route.ts
Probleme : Pas de checkRateLimit() sur ces routes
Impact : Faible (auth requise, Stripe a ses propres limites)
```

### MINEUR #2 — Factures page sans error handling fetch
```
Fichier : src/app/(dashboard)/dashboard/factures/page.tsx
Lignes : 35-39
Probleme : Pas de check .error sur le fetch Supabase
Impact : Page vide sans message si erreur DB
```

### MINEUR #3 — Devis page actions sans loading individuel
```
Fichier : src/app/(dashboard)/devis/page.tsx
Probleme : Pas de loading state par action (PDF, send, delete)
Impact : User clique et rien ne se passe visuellement
```

---

## 2.4 Dette technique

### DETTE #1 — landing-page.tsx (70K)
```
Fichier : src/components/landing/landing-page.tsx
Probleme : 70KB = ~2000 lignes, composant monolithique
Recommandation : Decouper en HeroSection, FeaturesSection, PricingSection, etc.
```

### DETTE #2 — Inline emails HTML dans les API routes
```
Fichiers : api/quotes/share/[token]/route.ts, api/stripe/webhook/route.ts
Probleme : Templates HTML email inline (~50 lignes chacun)
Recommandation : Extraire dans lib/emails/ comme les autres templates
```

---

## Securite — Resume

| Aspect | Status |
|--------|--------|
| RLS sur toutes les tables | 20/20 tables |
| getUser() sur toutes les routes protegees | OK |
| Webhook signature verification | OK (fix applique) |
| Rate limiting routes sensibles | OK (send-devis, generate-quote, signup, contact) |
| Anti-abus inscription | OK (2/IP/semaine) |
| Secrets en env vars uniquement | OK |
| Service role jamais expose client-side | OK |
| Validation entrees (email, signature, nom) | OK |

**Aucune vulnerabilite critique de securite detectee.**
