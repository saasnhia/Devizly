# Quotify — Progress

## Built (Steps 1-12)

### Step 1 — Database Migration
- `supabase/migrations/001_initial.sql`
- Tables: `clients`, `quotes`, `quote_items`
- RLS policies on all 3 tables (user_id = auth.uid())

### Step 2 — TypeScript Types
- `src/types/index.ts`
- Types: Client, Quote, QuoteItem, QuoteStatus, QuoteWithClient, QuoteWithItems, UserProfile, StripeSubscription, QuoteItemDraft, AIGeneratedQuote

### Step 3 — Lib Setup
- `src/lib/supabase/client.ts` — browser client (pre-existing)
- `src/lib/supabase/server.ts` — server client with cookies (pre-existing)
- `src/lib/stripe.ts` — Stripe client init
- `src/lib/openai.ts` — OpenAI client init (gpt-4o-mini)
- `src/lib/resend.ts` — Resend client init
- `src/lib/utils/quote.ts` — calculateTotals, generateQuoteNumber, formatCurrency, formatDate, getStatusColor, getStatusLabel
- `src/middleware.ts` — Supabase auth session refresh (pre-existing)

### Step 4 — Auth Pages
- `src/app/(auth)/layout.tsx` — Centered layout with logo and tagline
- `src/app/(auth)/login/page.tsx` — Email/password + Google OAuth
- `src/app/(auth)/signup/page.tsx` — Name + email + password
- `src/app/auth/callback/route.ts` — OAuth callback handler

### Step 5 — Dashboard Layout
- `src/app/(dashboard)/layout.tsx` — Auth guard + shell
- `src/components/layout/dashboard-shell.tsx` — Sidebar (Dashboard, Devis, Clients, Paramètres), user avatar, logout, responsive mobile menu

### Step 6 — Dashboard Page
- `src/app/(dashboard)/dashboard/page.tsx`
- 4 stat cards: Total devis, Envoyés, Signés, CA total
- Recent quotes table (last 5) with status badges
- Quick action "Nouveau devis"

### Step 7 — Quotes List Page
- `src/app/(dashboard)/devis/page.tsx`
- Full table with filters (Tous/Brouillon/Envoyé/Signé)
- Search by title or client name
- Dropdown actions: Edit, Duplicate, Change status, Delete
- Empty state

### Step 8 — New Quote Form
- `src/app/(dashboard)/devis/nouveau/page.tsx`
- Two-column layout (details left, preview right)
- AI generation textarea + button (calls /api/ai/generate-quote)
- Client selector, title, date, notes
- Dynamic line items (add/remove)
- Real-time totals: subtotal HT, TVA selector, discount %, total TTC
- Save as draft or Send buttons
- Edit mode via ?edit=<id> query param

### Step 9 — API Routes
- `POST /api/ai/generate-quote` — OpenAI gpt-4o-mini structured generation
- `GET/POST /api/quotes` — List/create quotes with items
- `GET/PUT/DELETE /api/quotes/[id]` — Single quote CRUD
- `GET/POST /api/clients` — List/create clients
- `GET/PUT/DELETE /api/clients/[id]` — Single client CRUD
- All routes check Supabase session

### Step 10 — Clients Page
- `src/app/(dashboard)/clients/page.tsx`
- Table: Nom, Email, Téléphone, SIRET, Actions
- Add/Edit client via Dialog modal
- Delete with confirmation
- Search by name

### Step 11 — Settings Page
- `src/app/(dashboard)/parametres/page.tsx`
- Profile & company info (stored in user_metadata)
- Default TVA rate setting
- Subscription section (Starter 19€, Pro 49€ — coming soon)

### Step 12 — Landing Page
- `src/app/page.tsx`
- Hero: "Créez vos devis professionnels en 30 secondes avec l'IA"
- 3 feature cards: IA, PDF, Signature
- Pricing: Starter 19€/mois, Pro 49€/mois
- CTA buttons → /signup

### Step 13 — Build Verification
- `npm run build` passes with 0 errors
- 15 routes generated (3 static, 12 dynamic)

## Still To Do (V2)
- **PDF Generation**: Generate professional PDF from quote data (using @react-pdf/renderer already installed)
- **Stripe Webhooks**: Payment processing, subscription management
- **Email Sending**: Send quotes via email (Resend client ready)
- **Electronic Signature**: Sign quotes online with audit trail
- **Relances automatiques**: Auto-follow-up emails for unsigned quotes
- **Logo Upload**: Company logo for PDF header (Supabase Storage)
- **Multi-user**: Team management, roles & permissions
- **Quote Templates**: Save/reuse common quote structures
- **Analytics**: Conversion rates, revenue charts
- **Export**: CSV/Excel export of quotes and clients
