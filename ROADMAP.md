# Roadmap Devizly — Priorisée par impact

*Basée sur l'audit technique, le benchmark concurrentiel et les reviews utilisateur — Mars 2026*

---

## Quick Wins (1-3 jours)

| # | Feature | Impact | Effort | Description |
|---|---------|--------|--------|-------------|
| Q1 | Duplication de devis | Elevé | S | Bouton "Dupliquer" sur chaque devis qui crée une copie modifiable. Le bouton existe dans le drawer mais pas en action principale. |
| Q2 | Preview PDF inline | Elevé | S | Afficher un aperçu PDF dans un modal/drawer avant envoi au client (utiliser `@react-pdf/renderer` côté client via `<PDFViewer>`). |
| Q3 | Drag & drop lignes de devis | Moyen | S | Utiliser `@dnd-kit` (déjà installé) pour réordonner les lignes sur le formulaire de création. |
| Q4 | Conditions de paiement par défaut | Moyen | S | Permettre de sauvegarder ses conditions de paiement par défaut dans les paramètres profil, auto-chargées à chaque nouveau devis. |
| Q5 | Import CSV clients | Moyen | S | Upload CSV pour importer une liste de clients existants (migration depuis un autre outil). Parser basique nom/email/phone/adresse. |
| Q6 | Personnalisation message email | Moyen | S | Champ textarea pour personnaliser le message de l'email de devis (au lieu du template fixe). |
| Q7 | parseInt radix fix | Faible | S | Ajouter le radix `, 10` aux parseInt dans export/csv et export/fec. |
| Q8 | Erreurs API génériques en prod | Faible | S | Remplacer `error.message` par des messages génériques dans les réponses API 500. |

---

## Court terme (1-2 semaines)

| # | Feature | Impact | Effort | Description |
|---|---------|--------|--------|-------------|
| C1 | PWA (Progressive Web App) | Elevé | M | Ajouter service worker, manifest.json complet, icônes app, splash screen. Permet l'installation sur mobile sans passer par les stores. Le manifest existe déjà mais le service worker manque. |
| C2 | API publique v1 | Elevé | M | REST API documentée pour les opérations CRUD (clients, devis, factures). Authentification via API key. Pré-requis pour toute intégration tierce. |
| C3 | Webhooks sortants | Elevé | M | Déclencher des webhooks configurables sur les événements clés (devis signé, paiement reçu, lead créé). Essentiel pour les intégrations Zapier/Make. |
| C4 | Séquences de relance configurables | Moyen | M | Permettre à l'utilisateur de définir ses propres séquences de relance (J+X, nombre max, message custom) au lieu du fixe J+2/J+5/J+7. |
| C5 | Multi-devis / options | Moyen | M | Permettre de créer un devis avec plusieurs options (formule Basic/Pro/Premium). Le client choisit son option avant de signer. |
| C6 | Pièces jointes sur devis | Moyen | M | Uploader des fichiers (CGV, portfolio, plans) qui seront joints au PDF ou accessibles depuis la page publique du devis. |
| C7 | Import devis/factures (CSV/JSON) | Moyen | M | Importer ses données depuis un export concurrent (Freebe, Axonaut, Excel). Facilite la migration. |
| C8 | Dashboard filtres avancés | Moyen | S | Filtres par trimestre, semestre, année glissante. Comparaison période N vs N-1. |
| C9 | Transactions atomiques quote_items | Moyen | S | Créer une RPC Postgres pour le update des items (delete + insert dans une transaction). |

---

## Moyen terme (1-2 mois)

| # | Feature | Impact | Effort | Description |
|---|---------|--------|--------|-------------|
| M1 | App mobile React Native | Elevé | L | Application mobile native (ou Expo) pour créer/envoyer des devis sur le terrain. Feature #1 demandée par les artisans. |
| M2 | Rapprochement bancaire | Elevé | L | Intégration Bridge API (agrégateur FR) pour connecter les comptes bancaires, matcher automatiquement les paiements reçus avec les factures émises. |
| M3 | Déclaration URSSAF auto-entrepreneur | Elevé | M | Calcul automatique des cotisations sociales basé sur le CA facturé. Pré-remplissage du formulaire URSSAF. Killer feature pour les 2.5M de micro-entrepreneurs. |
| M4 | Score de probabilité de signature | Moyen | M | ML model simple basé sur : montant, délai de réponse, nombre de vues, historique client, secteur. Afficher un score % sur chaque devis envoyé. La data de tracking existe déjà. |
| M5 | Intégration Zapier/Make | Moyen | M | Connecteur officiel Zapier avec triggers (devis signé, paiement reçu) et actions (créer client, créer devis). Dépend de C2 (API publique). |
| M6 | Chat IA sur page publique devis | Moyen | M | Le client qui reçoit un devis peut poser des questions à un chatbot IA qui répond en se basant sur le contenu du devis. Réduit les allers-retours freelance-client. |
| M7 | Marketplace templates | Moyen | L | Templates de devis par métier (plombier, graphiste, dev, archi) avec prix de marché FR. Contribution communautaire. Monétisable. |
| M8 | Multi-société | Faible | M | Permettre de gérer plusieurs entités juridiques depuis un seul compte (fréquent chez les indépendants avec EI + SAS). |

---

## Matrice impact / effort

```
         EFFORT
         S         M         L
    ┌─────────┬─────────┬─────────┐
 E  │ Q1 Q2   │ C1 C4   │ M1 M2   │  ← Faire en premier
 l  │ Q3 Q5   │ C2 C3   │         │
 e  │ Q6      │ C5 C6   │         │
 v  ├─────────┼─────────┼─────────┤
 é  │ Q4      │ C7 C8   │ M3 M5   │  ← Faire ensuite
    │         │ C9      │ M4 M6   │
 I  ├─────────┼─────────┼─────────┤
 m  │ Q7 Q8   │         │ M7 M8   │  ← Quand on a le temps
 p  │         │         │         │
 a  └─────────┴─────────┴─────────┘
 c
 t
```

---

## Recommandation stratégique

**Semaine 1-2 :** Quick wins Q1-Q6 + PWA (C1). Impact maximal, effort minimal. La PWA débloque le marché mobile sans le coût d'une app native.

**Semaine 3-4 :** API publique (C2) + webhooks (C3) + relances configurables (C4). Débloque le canal prescripteur (comptables) et les intégrations.

**Mois 2 :** Déclaration URSSAF (M3) + score de signature (M4). Différenciation forte vs concurrents FR. Le score de signature est unique sur le marché.

**Mois 3+ :** App mobile native (M1) + rapprochement bancaire (M2). Le gros investissement pour passer au mass market.
