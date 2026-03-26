---
name: devizly-debug
description: Checklist debug Devizly — Stripe webhook, Supabase RLS, build, Mistral, cron, rate limit
metadata:
  tags: devizly, debug, stripe, supabase, mistral, cron, troubleshooting
---

## When to use

Use this skill when debugging issues in the Devizly project. Consult the relevant section based on the error type before investigating further.

## Stripe webhook ne se déclenche pas

1. Vérifier `STRIPE_WEBHOOK_SECRET` dans Vercel env vars
2. `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Vérifier signature : `stripe.webhooks.constructEvent()`
4. Vérifier metadata `app="devizly"` dans les events

## Supabase RLS bloque une requête

1. Vérifier que `getUser()` est appelé côté serveur
2. Tester la policy en SQL dans Supabase dashboard
3. Ne JAMAIS utiliser `service_role` côté client

## Build qui échoue au push

1. `npm run build` en local d'abord
2. Vérifier les types TypeScript : `npx tsc --noEmit`
3. Vérifier les imports manquants

## Mistral API timeout

1. Timeout max : 15s pour la démo, 30s pour la génération
2. Vérifier `MISTRAL_API_KEY`
3. Fallback : `response_format json_object` obligatoire

## Relances cron ne partent pas

1. Vérifier `CRON_SECRET` dans Vercel
2. Vérifier le cron schedule dans `vercel.json`
3. Logs : Vercel Dashboard → Functions → Logs

## Démo interactive rate limit atteint

1. Upstash Redis : clé `demo-generate:{ip}`
2. Limite : 3/heure/IP
3. Vérifier `UPSTASH_REDIS_REST_TOKEN`
