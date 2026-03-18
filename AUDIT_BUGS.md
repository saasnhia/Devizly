# Audit technique Devizly — Bugs et vulnérabilités

*Audit réalisé le 18 mars 2026 sur la branche main*

---

## Bugs corrigés

### B1 — Injection HTML dans /api/contact (CORRIGÉ)
- **Sévérité :** Critique
- **Fichier :** `src/app/api/contact/route.ts`
- **Problème :** Les champs `email` et `message` étaient interpolés directement dans le HTML envoyé par Resend sans échappement. Un attaquant pouvait injecter du HTML/JS dans l'email reçu par l'admin.
- **Correction :** Ajout d'une fonction `escapeHtml()` appliquée sur les deux champs + limite de 5000 caractères.

### B2 — Absence de rate limiting sur /api/contact (CORRIGÉ)
- **Sévérité :** Critique
- **Fichier :** `src/app/api/contact/route.ts`
- **Problème :** Le formulaire de contact public n'avait aucun rate limiting. Un bot pouvait spammer l'endpoint et envoyer des milliers d'emails via Resend.
- **Correction :** Ajout de `checkRateLimit(request)` (sliding window 5 req/min/IP via Upstash).

### B3 — Bouton login reste en loading après succès (CORRIGÉ)
- **Sévérité :** Important
- **Fichier :** `src/app/(auth)/login/page.tsx` ligne 35
- **Problème :** `setLoading(false)` n'était jamais appelé sur le chemin de succès (seulement sur erreur). Le bouton restait en état spinner jusqu'au changement de page.
- **Correction :** Ajout de `setLoading(false)` avant `router.push()`.

### B4 — Bouton signup reste en loading après succès (CORRIGÉ)
- **Sévérité :** Important
- **Fichier :** `src/app/(auth)/signup/page.tsx` ligne 63
- **Problème :** Même problème que B3 sur la page inscription.
- **Correction :** Ajout de `setLoading(false)` avant `router.push()`.

### B5 — Page clients bloquée en loading si fetch échoue (CORRIGÉ)
- **Sévérité :** Important
- **Fichier :** `src/app/(dashboard)/clients/page.tsx` ligne 45
- **Problème :** `fetchClients()` n'avait pas de try-catch. Si la requête Supabase échouait, `setLoading(false)` n'était jamais atteint et la page restait en spinner infini.
- **Correction :** Ajout d'un try-catch-finally avec toast d'erreur.

### B6 — Quote preview drawer : pas de feedback si fetch échoue (CORRIGÉ)
- **Sévérité :** Important
- **Fichier :** `src/components/quotes/quote-preview-drawer.tsx` ligne 58
- **Problème :** Si le fetch du devis échouait, le drawer s'affichait vide sans aucune indication d'erreur.
- **Correction :** Ajout de try-catch-finally, reset du quote à null en cas d'erreur.

### B7 — Validation email manquante dans /api/auth/signup (CORRIGÉ)
- **Sévérité :** Important
- **Fichier :** `src/app/api/auth/signup/route.ts` ligne 25
- **Problème :** Le champ email n'était pas validé côté serveur (format regex). Des emails invalides étaient envoyés directement à Supabase Auth.
- **Correction :** Ajout de validation regex identique aux autres routes.

---

## Bugs mineurs non corrigés

### M1 — Transaction non atomique pour les quote_items
- **Sévérité :** Mineur
- **Fichier :** `src/app/api/quotes/[id]/route.ts` lignes 69-83
- **Problème :** Les items sont supprimés puis réinsérés séquentiellement. Si l'insert échoue après le delete, les items sont perdus. Supabase ne supporte pas les transactions côté client facilement.
- **Recommandation :** Utiliser une fonction RPC Postgres pour rendre l'opération atomique.

### M2 — parseInt sans radix dans les exports
- **Sévérité :** Mineur
- **Fichier :** `src/app/api/export/csv/route.ts` lignes 49-50, `src/app/api/export/fec/route.ts` lignes 65-71
- **Problème :** `parseInt(year)` sans paramètre radix.
- **Recommandation :** Ajouter `, 10` en second argument.

### M3 — Admin user ID hardcodé
- **Sévérité :** Mineur
- **Fichier :** `src/app/api/admin/seed/route.ts` ligne 5
- **Problème :** `ADMIN_USER_ID` est hardcodé dans le code. Devrait être en variable d'env.

### M4 — Erreurs Supabase exposées au client
- **Sévérité :** Mineur
- **Fichier :** Plusieurs routes API (clients, quotes, invoices)
- **Problème :** `error.message` de Supabase est retourné directement au client, exposant des détails sur le schéma DB.
- **Recommandation :** Logger l'erreur serveur-side et retourner un message générique.

### M5 — Emails d'erreur silencieusement avalés
- **Sévérité :** Mineur
- **Fichier :** `src/app/api/quotes/share/[token]/route.ts` lignes 259, 295
- **Problème :** Les envois d'emails asynchrones (confirmation de signature) utilisent `catch { }` vide. Si un email échoue, personne ne le sait.
- **Recommandation :** Logger vers un service de monitoring.

### M6 — Devise mixte dans les graphiques dashboard
- **Sévérité :** Mineur
- **Fichier :** `src/components/dashboard-charts.tsx`
- **Problème :** Le top clients peut afficher des montants de devises différentes sans indication claire.

### M7 — Onboarding dismiss échoue silencieusement
- **Sévérité :** Mineur
- **Fichier :** `src/components/onboarding-progress.tsx` lignes 45-58
- **Problème :** Le fetch pour persister le dismiss utilise `.catch(() => {})`. Si l'API échoue, l'onboarding réapparaît au refresh.

### M8 — leads table : INSERT public trop permissif
- **Sévérité :** Mineur (sécurité DB)
- **Fichier :** Migration 015 + 018
- **Problème :** La policy `public_insert_leads` permet un INSERT avec `WITH CHECK (true)` et `user_id` est nullable. Risque de spam de leads.
- **Recommandation :** Ajouter validation au niveau application ou policy plus stricte.

### M9 — Indexes manquants pour les sous-requêtes RLS
- **Sévérité :** Mineur (performance)
- **Problème :** `quote_items` et `quote_views` utilisent des sous-requêtes RLS (`quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())`) sans index optimisé sur `quotes(user_id, id)`.
- **Recommandation :** `CREATE INDEX idx_quotes_user ON quotes(user_id, id);`

---

## Résumé

| Catégorie | Trouvés | Corrigés |
|-----------|---------|----------|
| Critique | 2 | 2 |
| Important | 5 | 5 |
| Mineur | 9 | 0 (documentés) |
| **Total** | **16** | **7** |
