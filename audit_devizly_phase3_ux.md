# PHASE 3 — Simulation parcours utilisateur (UX Audit)

*Audit Devizly — mars 2026*

---

## PERSONA A — Thomas, 28 ans, freelance developpeur

### Etape 1 — Landing page
- **Code** : `components/landing/landing-page.tsx`
- **Status** : Fluide
- Proposition de valeur claire en < 3s : "Devis IA en 30 secondes"
- CTA "Essayer gratuitement" visible et convaincant (gradient violet, glow)
- Trust badges presents : Mistral France, Stripe securise, RGPD conforme
- Pricing visible section dediee (Gratuit/Pro 19E/Business 39E)
- Hero carousel montre 3 vrais screens (IA builder, partage, pipeline)
- **Friction** : Aucune

### Etape 2 — Inscription
- **Code** : `(auth)/signup/page.tsx`
- **Status** : Fluide
- 3 champs (nom, email, password) + Google OAuth 1 clic
- Redirect post-signup vers wizard ou dashboard
- Plan query param gere (?plan=pro -> Stripe checkout apres signup)
- **Friction** : Aucune

### Etape 3 — Onboarding wizard
- **Code** : `(onboarding)/wizard/page.tsx`
- **Status** : Fluide
- 4 etapes : Profil -> Stripe -> Client demo -> 1er devis
- Stripe Connect optionnel (peut skip)
- Client demo pre-cree pour tester immediatement
- Bouton IA mis en avant a l'etape devis
- Peut skipper chaque etape
- **Friction** : Stripe Connect dans l'onboarding free tier peut sembler premature

### Etape 4 — Premier devis
- **Code** : `devis/nouveau/page.tsx`
- **Status** : Fluide
- IA genere en ~5s (response_format json_object)
- Resultat editable ligne par ligne avec drag & drop
- Mise en page professionnelle (PDF preview inline)
- Peut envoyer sans Stripe (free tier)
- ClientPicker hybride : recherche existants + INSEE + creation inline
- **Friction** : Aucune

### Etape 5 — Envoi au client
- **Code** : `devis/[token]/page.tsx`
- **Status** : Fluide
- Lien /devis/[token] fonctionne sans compte
- Page professionnelle : logo, details, tableau, totaux, QR code
- Signature manuelle + bouton paiement (si Stripe configure)
- Email de confirmation apres signature (client + freelance)
- **Friction** : Aucune

### Etape 6 — Dashboard apres 1er devis
- **Code** : `dashboard/page.tsx`
- **Status** : Fluide
- Si 0 devis : OnboardingDashboard avec hero + checklist 4 etapes + feature cards
- Si 1+ devis : KPIs (CA, devis envoyes, taux conversion, en attente)
- Upsell Pro visible dans sidebar (badge plan) + pricing page
- Empty states engageants avec CTA
- **Friction** : Aucune

### Score Thomas : 9/10
Point fort : Flow IA -> devis -> envoi tres fluide, zero friction technique.
Point faible mineur : Stripe Connect propose trop tot dans l'onboarding.

---

## PERSONA B — Marie, 42 ans, plombiere independante

### Etape 1 — Landing page
- **Status** : Fluide
- Metiers artisans representes dans le pricing ("artisans, freelances")
- Vocabulaire accessible (pas trop tech)
- Prix 19E/mois clairement visible
- Pages SEO dediees : /logiciel-devis-artisan, /devis-batiment-gratuit
- **Friction** : Aucune

### Etape 2 — Inscription + passage Pro
- **Status** : Fluide
- Flow direct landing -> signup?plan=pro -> Stripe Checkout
- Stripe Checkout en francais, logos CB securises
- Apres paiement : redirect /dashboard?checkout=success
- Plan active via webhook checkout.session.completed
- **Friction** : Aucune

### Etape 3 — Template Plomberie
- **Status** : Fluide
- 10 templates metiers pre-installes (migration 016_template_seeds)
- Template picker accessible depuis le formulaire devis
- IA comprend le contexte artisan (prompt en francais)
- Termes professionnels adaptes
- **Friction** : Aucune

### Etape 4 — Envoi + signature
- **Status** : Fluide
- Email pro via Resend (noreply@devizly.fr)
- Interface signature simple sur mobile (canvas responsive)
- Confirmation claire apres signature (badge vert + toast)
- Emails de confirmation aux deux parties
- **Friction** : Aucune

### Etape 5 — Encaissement acompte 30%
- **Status** : Fluide
- Boutons acompte 30%/50% visibles (Pro/Business)
- Montant clairement affiche avant redirect Stripe
- Stripe Checkout en francais
- Notification paiement in-app + email
- **Friction** : Aucune

### Etape 6 — Relances automatiques
- **Status** : Fluide
- Page dediee /dashboard/relances avec KPIs
- Timeline J+2, J+5, J+7 avec statuts
- Peut desactiver par devis (toggle automation)
- Wording professionnel, personnalisable (Pro)
- Email editor avec preview temps reel
- **Friction** : Aucune

### Score Marie : 9/10
Point fort : Templates metiers + relances auto = gain de temps enorme.
Point faible mineur : Pas d'app mobile native (PWA disponible mais moins intuitive).

---

## PERSONA C — Karim, 35 ans, dirigeant TPE (5 personnes)

### Etape 1 — Landing page
- **Status** : Fluide
- Screenshots reels dans le hero carousel
- Plan Business et avantages differencies (equipe, leads, exports)
- Essai gratuit sans CB disponible
- **Friction** : Pas de demo interactive (screenshots statiques)

### Etape 2 — Dashboard
- **Status** : Fluide
- KPIs pertinents : CA mensuel, taux conversion, devis en attente
- Graphiques Recharts (courbe CA + funnel + top clients)
- Export CSV + FEC disponible
- **Friction mineure** : Multi-users existe (equipe page) mais basic (roles admin/editor/viewer)

### Etape 3 — Volume de devis
- **Status** : Fluide
- Free = 3/mois, Pro = illimite, Business = illimite + equipe
- Compteur devis_used visible
- Upgrade suggere quand quota atteint
- **Friction** : Aucune

### Etape 4 — Integrations
- **Status** : Friction
- Pas d'API publique documentee
- Pas de webhooks sortants
- Pas d'integration Zapier/Make
- Lead forms embeddables (iframe) = seule integration
- **Friction** : Deal-breaker potentiel pour une TPE voulant connecter ses outils

### Score Karim : 7/10
Point fort : Dashboard pro, pipeline kanban, exports comptables.
Point faible : Absence d'API publique et d'integrations tierces.

---

## Resume UX

| Parcours | Score | Verdict |
|----------|-------|---------|
| Thomas (freelance dev) | 9/10 | Excellent — pret a convertir |
| Marie (artisane) | 9/10 | Excellent — templates + relances = killer features |
| Karim (TPE 5 pers.) | 7/10 | Bon — manque API publique et integrations |
