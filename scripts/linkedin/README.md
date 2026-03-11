# LinkedIn Auto-Growth — @devizlyfr

30 jours de posts LinkedIn carrousel ciblant les freelances français,
avec publication automatisée via Buffer API.

## Structure

```
scripts/linkedin/
├── posts.json                  # 30 posts (5 slides chacun)
├── buffer-api-poster.mjs       # Scheduler via Buffer API (recommandé)
├── get-buffer-profile-id.mjs   # Helper pour trouver le BUFFER_PROFILE_ID
├── linkedin-oauth-setup.mjs    # OAuth 2.0 — obtenir un token LinkedIn en 2min
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

Pour poster directement sans Buffer via l'API LinkedIn native.

### 1. Créer une app LinkedIn

1. Aller sur **https://www.linkedin.com/developers/apps**
2. Cliquer **Create App**
3. Remplir : nom, logo, page LinkedIn associée
4. Onglet **Products** → activer **Share on LinkedIn**
5. Onglet **Auth** :
   - Copier **Client ID** et **Client Secret**
   - Ajouter `http://localhost:3456/callback` dans **Authorized redirect URLs**

### 2. Configurer les variables

Ajouter dans `.env.linkedin` :
```env
LINKEDIN_CLIENT_ID=votre_client_id
LINKEDIN_CLIENT_SECRET=votre_client_secret
```

### 3. Obtenir le token (automatique)

```bash
node scripts/linkedin/linkedin-oauth-setup.mjs
```

Le script :
1. Démarre un serveur local sur `localhost:3456`
2. Ouvre LinkedIn dans le navigateur
3. Vous vous connectez et autorisez l'app
4. Le code est capturé automatiquement
5. Le token (60 jours) est sauvegardé dans `.env.linkedin`

### 4. Tester

```bash
# Preview
node scripts/linkedin/auto-poster.mjs --dry-run

# Poster le jour 1
node scripts/linkedin/auto-poster.mjs --day 1

# Mode cron continu
node scripts/linkedin/auto-poster.mjs --cron
```

### Renouveler le token

Le token expire après 60 jours. Relancez simplement :
```bash
node scripts/linkedin/linkedin-oauth-setup.mjs
```

## Notes

- `.post-state.json` : fichier d'état local (gitignored) — évite les doublons
- Rate limit Buffer API : 1 requête / 2 secondes (géré automatiquement)
- Les posts sont idempotents : relancer `--all` ne repostera pas les posts déjà schedulés
