# Test Results — Quick Wins Q1-Q8 + PWA

*Post-implementation code review — Mars 2026*

---

## Q1 — Duplication de devis

**Status: ❌ Bug corrige**

- ✅ Bouton inline `<Copy>` ajoute dans la colonne actions de chaque ligne du tableau (`devis/page.tsx:824-832`)
- ✅ `handleDuplicate()` cree un nouveau devis via Supabase insert direct (client-side, pas API)
- ✅ Titre prefixe avec "(copie)" (`line 265`)
- ✅ `client_id` correctement copie (`line 264`)
- ✅ Gestion d'erreur: toast.error si insert echoue (`line 278`)
- ✅ Items (quote_items) dupliques avec position preservee (`lines 282-298`)
- ✅ Bouton aussi present dans le drawer + dropdown menu (3 points d'acces)

**Bugs trouves et corriges:**
- ❌ `payment_terms` n'etait pas copie dans le duplicata → **corrige**: ajoute `payment_terms: quote.payment_terms`
- ❌ `status` n'etait pas explicitement mis a "brouillon" (dependait du default DB) → **corrige**: ajoute `status: "brouillon"`

---

## Q2 — Preview PDF live

**Status: ✅ OK**

- ✅ Bouton "Apercu PDF" visible uniquement en mode edition (`editId` requis, `line 688`)
- ✅ Appel correct vers `/api/quotes/${editId}/pdf` (`line 343`)
- ✅ PDF affiche dans un Dialog avec iframe blob URL (`lines 737-760`)
- ✅ Blob URL revoquee a la fermeture du dialog (`lines 741-744`)
- ✅ Pas de boucle infinie de re-render (state controle, pas de deps loops)
- ✅ Loading state avec spinner pendant la generation
- ✅ Toast informatif pour les nouveaux devis non sauvegardes

**Limitation connue (by design):**
- ⚠️ La preview montre la derniere version **sauvegardee**, pas les modifications en cours. Normal car le PDF est genere cote serveur.

---

## Q3 — Drag & drop lignes devis

**Status: ✅ OK**

- ✅ `@dnd-kit/core@^6.3.1`, `@dnd-kit/sortable@^10.0.0`, `@dnd-kit/utilities@^3.2.2` dans package.json
- ✅ `DndContext`, `SortableContext`, `useSortable` correctement importes et utilises
- ✅ `arrayMove` met a jour l'ordre des items dans le state (`line 211-215`)
- ✅ Pas de conflit avec les inputs: le drag se declenche uniquement sur le handle `<GripVertical>` (`line 103-108`), pas sur les champs texte/nombre
- ✅ `PointerSensor` avec `distance: 5` pour eviter les drags accidentels
- ✅ `KeyboardSensor` avec `sortableKeyboardCoordinates` pour l'accessibilite
- ✅ IDs uniques via `genItemId()` (compteur incrementel module-level) — stables pendant toute la session
- ✅ `stripIds()` retire les `_id` internes avant envoi a l'API
- ✅ Feedback visuel: opacity 0.5 pendant le drag (`isDragging`, line 96)

---

## Q4 — Conditions de paiement par defaut

**Status: ✅ OK**

- ✅ Champ `<Textarea>` ajoute dans parametres (`parametres/page.tsx:510-522`)
- ✅ Valeur stockee dans `user_metadata` via `supabase.auth.updateUser({ data: profile })` (`line 194`)
- ✅ Charge au mount dans `nouveau/page.tsx` via `loadDefaults()` (`lines 218-229`)
- ✅ Ne charge les defaults que pour les **nouveaux** devis (`if (editId) return`)
- ✅ Mode edition utilise les conditions du devis existant (`line 257`)
- ✅ Graceful fallback si le setting n'existe pas (`if (!user?.user_metadata?.default_payment_terms) return`)
- ✅ Guard `defaultsLoaded.current` empeche les rechargements multiples

---

## Q5 — Import CSV clients

**Status: ❌ Bug corrige**

- ✅ Bouton "Importer CSV" avec icone Upload (`clients/page.tsx:215-226`)
- ✅ Detection intelligente des colonnes via aliases FR/EN (`nom`, `name`, `raison sociale`, `societe`, etc.)
- ✅ Support separateurs `;` et `,` (auto-detect)
- ✅ Feedback utilisateur: toast avec nombre importes / erreurs (`lines 186-195`)
- ✅ Reset du file input apres selection (`e.target.value = ""`, line 123)
- ✅ Loading state avec spinner pendant l'import

**Bug trouve et corrige:**
- ❌ Pas de limite de lignes — un CSV de 10 000 lignes envoyait 10 000 requetes sequentielles → **corrige**: ajoute limite MAX_ROWS = 500 avec message d'erreur

**Limitations connues (non critiques):**
- ⚠️ Pas de detection de doublons (meme email) — les clients sont crees sans verification d'unicite. L'API `/api/clients` n'a pas de contrainte unique sur email.
- ⚠️ Pas de validation email dans le CSV — l'API accepte n'importe quelle valeur pour email.
- ⚠️ Import sequentiel (1 requete par ligne) — pourrait etre optimise en batch, mais acceptable pour < 500 lignes.

---

## Q6 — Message email personnalise

**Status: ❌ Bug corrige**

- ✅ Formulaire email dans le drawer (`quote-preview-drawer.tsx:248-285`)
- ✅ Champ destinataire pre-rempli avec l'email du client (`line 73-74`)
- ✅ Textarea pour message personnalise (optionnel) (`line 264-269`)
- ✅ Envoi via `POST /api/send-devis` avec champ `customMessage` (`line 130-146`)
- ✅ API passe le `customMessage` au template email (`send-devis/route.ts:89`)
- ✅ Template utilise le message custom ou le defaut (`devis.ts:46-48`)
- ✅ Champ vide → message par defaut ("X vous a transmis un devis")
- ✅ Bouton toggle "Envoyer par email" avec highlight actif/inactif
- ✅ State reset a la fermeture du drawer (`line 92-93`)

**Bug trouve et corrige:**
- ❌ **Injection HTML** — le `customMessage` etait insere dans le template HTML via interpolation sans echappement. Un utilisateur pouvait injecter du HTML arbitraire. → **corrige**: ajoute `escapeHtml()` qui echappe `&`, `<`, `>`, `"` avant insertion dans le template.

---

## Q7 — parseInt radix

**Status: ✅ OK**

Verification par grep — **0 parseInt sans radix** dans les fichiers cibles:

```
export/csv/route.ts:49   parseInt(year, 10)       ✅
export/csv/route.ts:51   parseInt(month, 10)      ✅
export/fec/route.ts:65   parseInt(year, 10)       ✅
export/fec/route.ts:71   parseInt(month, 10)      ✅
invoices/route.ts:21     parseInt(..., 10)        ✅
invoices/route.ts:22     parseInt(..., 10)        ✅
stripe/webhook/route.ts:79 parseInt(..., 10)      ✅
```

---

## Q8 — Erreurs API generiques

**Status: ✅ OK**

Verification par grep — les seuls `error.message` restants sont sur des statuts non-500:

| Fichier | Ligne | Status | Verdict |
|---------|-------|--------|---------|
| `clients/[id]/route.ts` | 24 | 404 | ✅ Correct (client introuvable) |
| `auth/signup/route.ts` | 65 | 400 | ✅ Correct (erreur inscription) |
| `quotes/[id]/route.ts` | 25 | 404 | ✅ Correct (devis introuvable) |

Tous les status 500 retournent maintenant `{ error: "Une erreur est survenue" }` (30+ occurrences dans 20 fichiers).

---

## PWA

**Status: ✅ OK**

- ✅ `public/manifest.json` — JSON valide, champs complets (name, short_name, icons, shortcuts, theme_color)
- ✅ `public/sw.js` — Service worker avec handlers install/activate/fetch
  - Cache-first pour assets statiques (icons, fonts, images)
  - Network-first pour navigation/pages avec fallback cache
  - Skip des requetes API (`/api/`)
- ✅ `src/components/sw-register.tsx` — Registration du SW au mount
- ✅ Importe dans `src/app/layout.tsx`
- ✅ 9/9 icones referees dans manifest.json presentes dans `public/icons/`:
  - icon-72x72.png, icon-96x96.png, icon-128x128.png, icon-144x144.png
  - icon-152x152.png, icon-192x192.png, icon-384x384.png, icon-512x512.png
  - maskable-icon-512x512.png

---

## Resume

| Feature | Status | Bugs corriges |
|---------|--------|---------------|
| Q1 Duplication devis | ❌→✅ | +payment_terms, +status explicite |
| Q2 Preview PDF | ✅ | — |
| Q3 Drag & drop | ✅ | — |
| Q4 Conditions paiement defaut | ✅ | — |
| Q5 Import CSV clients | ❌→✅ | +limite 500 lignes |
| Q6 Message email custom | ❌→✅ | +escapeHtml (XSS) |
| Q7 parseInt radix | ✅ | — |
| Q8 Erreurs API generiques | ✅ | — |
| PWA | ✅ | — |

**3 bugs corriges, 0 features cassees, build OK.**
