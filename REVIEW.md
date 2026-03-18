# Review honnête de Devizly

*Mars 2026*

---

## Persona A — Analyste SaaS

### Positionnement et marché

Devizly se positionne sur le segment des outils de devis/facturation pour freelances et artisans français. C'est un marché mature (Axonaut, Freebe, Pennylane) mais avec encore beaucoup de friction. Le positionnement "IA + signature + paiement intégré à 19 EUR/mois" est pertinent et différenciant.

**Marché cible :** ~4 millions de travailleurs indépendants en France, dont 2.5M de micro-entrepreneurs. Le TAM est significatif.

### Forces

1. **Stack technique moderne et solide.** Next.js 16, React 19, TypeScript strict, Supabase, Stripe Connect. L'architecture est propre, bien organisée, maintenable. Rare pour un early-stage SaaS.

2. **Feature completeness impressionnante.** Pour un produit early-stage, Devizly a déjà : devis IA, signature eIDAS, paiement Stripe, facturation récurrente, pipeline Kanban, lead forms, contrats, time tracking, portail client, multi-devises, relances auto, daily briefing IA, SMS. C'est le feature set d'un produit à maturité série A.

3. **Pricing agressif et intelligent.** Gratuit (3 devis/mois) → Pro 19 EUR → Business 39 EUR. Nettement sous les concurrents FR (Axonaut 50 EUR+, Sellsy 120 EUR+). Le plan gratuit est un bon funnel d'acquisition.

4. **IA comme différenciateur réel.** La génération de devis par Mistral AI n'est pas un gadget — elle résout un vrai pain point (rédaction des descriptions, estimation des prix). Le daily briefing IA ajoute une touche "assistant personnel".

5. **Conformité FR dès le départ.** eIDAS, FEC, TVA 293B, mentions légales obligatoires. Beaucoup de SaaS US portés en France ignorent ces contraintes réglementaires.

### Faiblesses

1. **Pas d'app mobile.** C'est le blocker #1 pour les artisans qui travaillent sur le terrain. Sans mobile, le marché artisan est quasi inaccessible.

2. **Pas d'intégrations.** Aucune API publique, aucun connecteur Zapier/Make. Les comptables (canal prescripteur) ne peuvent pas intégrer Devizly dans leur workflow.

3. **Pas de rapprochement bancaire.** Les freelances qui veulent un outil tout-en-un iront chez Pennylane ou Axonaut.

4. **Traction non démontrée.** Pas de métriques publiques (utilisateurs, MRR, devis générés). Le social proof manque.

5. **Marketing content thin.** 8 articles de blog et 6 pages SEO, c'est un début mais insuffisant pour le SEO long-tail. Les concurrents FR ont des centaines d'articles.

### Note : 7/10

**Justification :** Produit techniquement excellent, feature-rich pour son stade, pricing smart, mais il manque les fondamentaux de distribution (mobile, intégrations, SEO profond) et la preuve de traction. Le produit est prêt pour les early adopters mais pas encore pour le mass market.

---

## Persona B — Freelance développeur (Julien, 3 ans d'expérience, dev web, Paris)

### Parcours testé : inscription → devis → envoi → paiement

### Inscription

L'inscription est rapide. Google OAuth + email/password. Le wizard d'onboarding me guide bien : profil entreprise, SIRET, premier devis. **Impression positive.** Le fait que le SIRET soit optionnel avec mention "en cours d'immatriculation" est un bon point — beaucoup de freelances démarrent sans.

La progress bar d'onboarding est claire et motivante. J'ai juste envie de remplir les 5 étapes.

### Création de devis

**C'est là que l'IA brille.** J'écris "Site vitrine WordPress 5 pages pour un restaurant à Paris" et Devizly me génère un devis complet avec titre, 4 lignes détaillées et prix réalistes. En 2 minutes j'ai un devis pro.

Le formulaire est bien pensé : TVA configurable, remise, conditions de paiement, validité, notes. Le template picker est un plus.

**Ce qui me frustre :**
- Pas de preview PDF en temps réel pendant la rédaction. Je dois sauvegarder puis télécharger pour voir le rendu.
- Pas de drag & drop pour réordonner les lignes du devis.
- Le champ "Conditions de paiement" a un bon défaut mais j'aimerais pouvoir sauvegarder mes propres défauts.

### Envoi au client

L'envoi par email fonctionne. Le client reçoit un lien vers une page publique propre avec le détail du devis, bouton signature et bouton paiement. **C'est impressionnant** — ça fait pro, c'est rapide, et le client peut signer depuis son téléphone.

Le QR code est un nice-to-have original.

**Ce qui me frustre :**
- Pas de personnalisation de l'email (template, couleurs, message custom).
- Pas de pièces jointes (CGV, portfolio, etc.).

### Signature client

Le client signe en 10 secondes directement sur le lien. Le certificat eIDAS est un argument de vente sérieux face aux concurrents. Je reçois un email de confirmation.

**Rien à redire.** C'est le meilleur flow de signature que j'ai vu sur un outil à ce prix.

### Paiement

Si Stripe Connect est configuré, le client peut payer directement. Les options d'acompte 30%/50% sont un vrai plus. Le fait que le bouton soit caché si Stripe n'est pas configuré est intelligent — pas de confusion.

### Dashboard et suivi

Le tableau de bord est fonctionnel : graphiques CA, top clients, statuts des devis. Le pipeline Kanban est un bonus inattendu à ce prix.

**Ce qui me frustre :**
- Les graphiques ne sont pas super lisibles avec peu de données.
- Pas de filtres avancés sur les dates (trimestre, semestre).

### Facturation

Les factures auto-générées à la signature sont un game-changer. L'export FEC est un plus pour mon comptable. Mais la facturation est basique — pas de conditions de retard personnalisables, pas de multi-acomptes.

### Ce qui m'impressionne

1. L'IA qui génère des devis réalistes et bien structurés.
2. La signature eIDAS complète avec certificat.
3. Le Stripe Connect qui me permet d'encaisser sans intermédiaire.
4. Le prix : 19 EUR/mois pour tout ça, c'est 5x moins cher qu'Axonaut.
5. Le portail client est un différenciateur que mes clients apprécieraient.

### Ce qui me manque

1. **App mobile.** Je fais mes devis en réunion client sur mon téléphone.
2. **Preview PDF live.** Je veux voir le rendu pendant que je rédige.
3. **Rappels de paiement smart.** Les relances J+2/J+5/J+7 c'est bien, mais je veux pouvoir configurer mes propres séquences.
4. **Duplication de devis.** Pour un client récurrent, je veux dupliquer et modifier.
5. **Import de données.** Si je migre depuis Freebe, je veux importer mes clients et devis existants.

### Est-ce que je paierais ?

**Oui, je prendrais le plan Pro à 19 EUR/mois.** Le ratio features/prix est imbattable. La génération IA seule vaut le prix. La signature eIDAS et le paiement intégré sont des cerises sur le gâteau.

**Mais** je continuerais à utiliser mon outil actuel en parallèle tant qu'il n'y a pas d'app mobile et d'import de données. Le switch complet viendrait avec ces deux features.

**Score UX global : 7.5/10** — Excellente base, quelques frictions surmontables, manque le mobile pour être parfait.
