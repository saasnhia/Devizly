# LinkedIn Auto-Growth — @devizlyfr

30 jours de posts LinkedIn carrousel ciblant les freelances français,
avec publication automatisée via Buffer API.

## Structure

```
scripts/linkedin/
├── posts.json                  # 30 posts (5 slides chacun)
├── buffer-api-poster.mjs       # Scheduler via Buffer API (recommandé)
├── get-buffer-profile-id.mjs   # Helper pour trouver le BUFFER_PROFILE_ID
├── auto-poster.mjs             # Post direct via LinkedIn API (avancé)
├── export-buffer-csv.mjs       # Export CSV (obsolète — Buffer ne supporte pas bien)
├── .env.linkedin.example       # Template variables d'environnement
└── README.md                   # Ce fichier
```

## Setup rapide (Buffer API)

### 1. Créer un token Buffer

1. Aller sur **https://buffer.com/developers/apps**
2. Créer une app (ou utiliser l'existante)
3. Copier l'**Access Token**

### 2. Configurer les variables

```bash
cp scripts/linkedin/.env.linkedin.example scripts/linkedin/.env.linkedin
```

Remplir :
```env
BUFFER_ACCESS_TOKEN=votre_token_ici
BUFFER_PROFILE_ID=   # rempli à l'étape 3
```

### 3. Trouver le Profile ID

```bash
node scripts/linkedin/get-buffer-profile-id.mjs
```

Copier l'ID du profil LinkedIn (@devizlyfr) dans `.env.linkedin`.

### 4. Preview (dry-run)

```bash
node scripts/linkedin/buffer-api-poster.mjs --dry-run
```

Vérifie que les 30 posts sont bien formatés avec les bonnes dates.

### 5. Scheduler tous les posts

```bash
# Tous les 30 posts d'un coup
node scripts/linkedin/buffer-api-poster.mjs --all

# Un seul post (test)
node scripts/linkedin/buffer-api-poster.mjs --day 1

# Une plage de posts
node scripts/linkedin/buffer-api-poster.mjs --day 1-5
```

### 6. Vérifier

Aller sur **https://publish.buffer.com** → Queue → Vérifier que les posts sont bien programmés.

## Planning

4 posts/semaine sur 8 semaines :

| Jour | Créneau | Cible |
|------|---------|-------|
| Mardi | 9h | Contenu éducatif |
| Mercredi | 11h | Cas d'usage métier |
| Jeudi | 14h | Storytelling |
| Dimanche | 18h | Inspiration |

## Format des posts

Chaque post dans `posts.json` :

```json
{
  "day": 1,
  "title": "Titre du post",
  "hour": "Mardi 9h",
  "virality": "9/10",
  "type": "educatif",
  "slides": ["Slide 1 (hook)", "Slide 2", "...", "Slide N (CTA)"],
  "hashtags": "#Freelance #Devizly ..."
}
```

Le script formate automatiquement les slides en texte LinkedIn optimisé
(hook → contenu → séparateur → CTA → hashtags).

## KPI objectifs

| Métrique | Objectif |
|----------|----------|
| Impressions/post | 2 000+ |
| Engagement rate | > 3% |
| Followers gagnés | +500 en 60 jours |
| Clics devizly.fr | 50+/semaine |
| Signups attribués | 20+ en 60 jours |

## Méthode alternative : LinkedIn API directe

Pour poster directement sans Buffer (avancé) :

1. Créer une app sur LinkedIn Developer Portal
2. Obtenir un access token OAuth 2.0
3. Configurer `LINKEDIN_ACCESS_TOKEN` et `LINKEDIN_PERSON_URN`
4. `node scripts/linkedin/auto-poster.mjs --dry-run`

## Notes

- `.post-state.json` : fichier d'état local (gitignored) — évite les doublons
- Rate limit Buffer API : 1 requête / 2 secondes (géré automatiquement)
- Les posts sont idempotents : relancer `--all` ne repostera pas les posts déjà schedulés
