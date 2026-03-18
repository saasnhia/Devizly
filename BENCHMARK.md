# Benchmark Devizly vs Concurrents

*Analyse comparative — Mars 2026*

---

## Tableau comparatif des features

| Feature | Devizly | Bonsai (US) | HoneyBook (US) | Axonaut (FR) | Pennylane (FR) | Freebe (FR) |
|---------|---------|-------------|----------------|-------------|----------------|-------------|
| **Devis / Quotes** | | | | | | |
| Création de devis | OK | OK | OK | OK | OK | OK |
| Génération IA des devis | OK | Partiel | Non | Non | Non | Non |
| Templates de devis | OK | OK | OK | OK | OK | Partiel |
| Multi-devises | OK | OK | OK | Non | Non | Non |
| Conditions de paiement custom | OK | OK | OK | OK | OK | Partiel |
| Validité devis configurable | OK | OK | OK | OK | OK | Partiel |
| **Signature électronique** | | | | | | |
| Signature intégrée | OK | OK | OK | OK | Non | Non |
| eIDAS compliant | OK | Non | Non | Non | N/A | N/A |
| Certificat SHA-256 | OK | Non | Non | Non | N/A | N/A |
| **Facturation** | | | | | | |
| Factures | OK | OK | OK | OK | OK | OK |
| Facturation récurrente | OK | OK | OK | OK | OK | Partiel |
| Auto-facture à la signature | OK | Non | Non | Non | Non | Non |
| Export FEC comptable | OK | Non | Non | OK | OK | Partiel |
| Export CSV | OK | OK | OK | OK | OK | OK |
| **Paiements** | | | | | | |
| Paiement en ligne (Stripe) | OK | OK | OK | OK | OK (GoCardless) | Non |
| Acomptes 30%/50% | OK | OK | OK | Non | Non | Non |
| Stripe Connect (encaissement direct) | OK | Non | OK | Non | Non | Non |
| Remboursements | OK | OK | OK | Non | OK | Non |
| **CRM / Pipeline** | | | | | | |
| Pipeline Kanban | OK | OK | OK | OK | Non | Non |
| Gestion prospects | OK | OK | OK | OK | Partiel | Non |
| Portail client | OK | Partiel | OK | Non | Non | Non |
| Lead forms embeddables | OK | Non | OK | Non | Non | Non |
| **Communication** | | | | | | |
| Envoi email devis | OK | OK | OK | OK | OK | OK |
| Relances automatiques | OK | OK | OK | OK | Partiel | Non |
| SMS relances | OK | Non | Non | Non | Non | Non |
| Notifications in-app | OK | OK | OK | OK | OK | Non |
| Daily briefing IA | OK | Non | Non | Non | Non | Non |
| **Contrats** | | | | | | |
| Gestion contrats | OK | OK | OK | Non | Non | Non |
| Signature contrats | OK | OK | OK | Non | Non | Non |
| Templates contrats | OK | OK | OK | Non | Non | Non |
| **Équipe** | | | | | | |
| Multi-utilisateurs | OK | OK | OK | OK | OK | Non |
| Rôles (admin/editor/viewer) | OK | OK | OK | OK | OK | Non |
| **Time tracking** | | | | | | |
| Timer intégré | OK | OK | OK | Non | Non | Non |
| Facturation du temps | OK | OK | OK | Non | Non | Non |
| **Comptabilité** | | | | | | |
| Rapprochement bancaire | Non | Non | Non | Partiel | OK | Non |
| TVA automatique | Partiel | Non | Non | OK | OK | OK |
| Déclaration URSSAF | Non | Non | Non | Non | Non | OK |
| Tableaux comptables | Non | Non | Non | OK | OK | Partiel |
| **Marketing / SEO** | | | | | | |
| Blog intégré | OK | OK | OK | OK | OK | OK |
| Landing pages SEO | OK | OK | OK | Partiel | OK | Partiel |
| Vidéos ads (Remotion) | OK | Non | Non | Non | Non | Non |
| **Technique** | | | | | | |
| App mobile native | Non | OK | OK | OK | OK | OK |
| Mode hors-ligne | Non | Non | Non | Non | Non | Non |
| API publique | Non | OK | OK | OK | OK | Non |
| Intégrations (Zapier, etc.) | Non | OK | OK | OK | OK | Non |
| SSO / SAML | Non | OK | OK | Non | Non | Non |

---

## Top 5 features prioritaires à ajouter

### 1. Application mobile (PWA ou native)
- **Impact :** Élevé — les artisans et freelances créent des devis sur le terrain
- **Concurrent ref :** Tous les concurrents FR ont une app mobile
- **Effort :** L (2-4 semaines pour PWA, 2-3 mois pour native)
- **Quick win :** Transformer le site en PWA avec manifest.json + service worker

### 2. Intégrations tierces (Zapier/Make + API publique)
- **Impact :** Élevé — essentiel pour l'adoption par les comptables et prescripteurs
- **Concurrent ref :** Bonsai, Axonaut, Pennylane ont tous des API et intégrations
- **Effort :** L (API REST publique + documentation + webhooks)

### 3. Rapprochement bancaire / import relevés
- **Impact :** Moyen-Élevé — forte attente des freelances qui veulent un outil tout-en-un
- **Concurrent ref :** Pennylane (leader FR), Axonaut
- **Effort :** L (intégration Bridge/Plaid + UI matching)

### 4. Déclaration URSSAF pour auto-entrepreneurs
- **Impact :** Élevé — différenciateur majeur pour le marché FR micro-entrepreneur
- **Concurrent ref :** Freebe (unique selling point)
- **Effort :** M (calcul cotisations + formulaire pré-rempli)

### 5. Mode multi-devis / packages (devis avec options)
- **Impact :** Moyen — demandé par les prestataires de services (3 formules)
- **Concurrent ref :** HoneyBook, PandaDoc
- **Effort :** M (UI options/packages + PDF adapté)

---

## Opportunités de différenciation non exploitées

### 1. IA conversationnelle pour le client
Quand un client reçoit un devis, permettre un chat IA pour poser des questions sur le devis sans déranger le freelance. Aucun concurrent ne fait ça.

### 2. Benchmark automatique des prix
L'IA pourrait comparer les prix du devis avec les moyennes du marché (par secteur/région) et suggérer des ajustements. Unique sur le marché.

### 3. Score de probabilité de signature
Prédire via ML la probabilité qu'un devis soit signé (basé sur montant, délai, historique client, nombre de vues). Devizly a déjà le tracking de vues — la data est là.

### 4. Assistant comptable IA
Le daily briefing existe déjà. L'étendre en vrai assistant : rappels de TVA, estimations de charges, alertes trésorerie. Position entre Pennylane (trop complexe) et Freebe (trop basique).

### 5. Marketplace de templates par secteur
Des templates de devis créés par des professionnels de chaque métier (plombier, graphiste, dev, architecte) avec des prix de marché. Monétisable en plus.
