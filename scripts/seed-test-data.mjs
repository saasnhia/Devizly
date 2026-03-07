/**
 * Seed test data for Devizly demo screenshots
 * Usage: node scripts/seed-test-data.mjs
 */

import { createClient } from "@supabase/supabase-js";

import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const TARGET_EMAIL = "harounchikh71@gmail.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Find user by email
  console.log(`Looking up user: ${TARGET_EMAIL}...`);
  const { data: { users }, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) throw userErr;

  const user = users.find((u) => u.email === TARGET_EMAIL);
  if (!user) {
    console.error(`User ${TARGET_EMAIL} not found. Please sign up first at the app.`);
    process.exit(1);
  }
  const userId = user.id;
  console.log(`Found user: ${userId}`);

  // 2. Create realistic clients
  console.log("Creating test clients...");
  const clientsData = [
    {
      user_id: userId,
      name: "Martin Dupont",
      email: "martin.dupont@gmail.com",
      phone: "06 12 34 56 78",
      address: "45 Rue de la Paix",
      city: "Paris",
      postal_code: "75002",
      siret: "84726351900014",
    },
    {
      user_id: userId,
      name: "Sophie Laurent - Architecte",
      email: "s.laurent@cabinet-laurent.fr",
      phone: "06 98 76 54 32",
      address: "12 Avenue des Champs-Elysees",
      city: "Lyon",
      postal_code: "69001",
      siret: "91234567800021",
    },
    {
      user_id: userId,
      name: "Restaurant Le Gourmet",
      email: "contact@legourmet-paris.fr",
      phone: "01 42 36 78 90",
      address: "8 Rue du Commerce",
      city: "Bordeaux",
      postal_code: "33000",
      siret: "78945612300035",
    },
    {
      user_id: userId,
      name: "Tech Solutions SAS",
      email: "projets@techsolutions.fr",
      phone: "01 55 66 77 88",
      address: "120 Boulevard Haussmann",
      city: "Paris",
      postal_code: "75008",
      siret: "45678912300042",
    },
    {
      user_id: userId,
      name: "Marie Petit - Coiffeuse",
      email: "marie.petit@outlook.fr",
      phone: "07 11 22 33 44",
      address: "3 Place de la Mairie",
      city: "Nantes",
      postal_code: "44000",
    },
  ];

  const { data: clients, error: clientErr } = await supabase
    .from("clients")
    .insert(clientsData)
    .select();
  if (clientErr) throw clientErr;
  console.log(`Created ${clients.length} clients`);

  // 3. Create realistic quotes with varied statuses
  console.log("Creating test devis...");

  const quotesData = [
    {
      user_id: userId,
      client_id: clients[0].id,
      title: "Renovation salle de bain complete",
      total_ht: 8500.0,
      tva_rate: 10,
      discount: 0,
      total_ttc: 9350.0,
      status: "signé",
      notes: "Travaux prevus debut avril. Materiaux haut de gamme inclus.",
      valid_until: "2026-04-15",
      items: [
        { description: "Demolition et evacuation", quantity: 1, unit_price: 1200, total: 1200 },
        { description: "Plomberie complete (douche italienne + WC suspendu)", quantity: 1, unit_price: 3200, total: 3200 },
        { description: "Carrelage sol et murs (fourniture + pose)", quantity: 18, unit_price: 85, total: 1530 },
        { description: "Meuble vasque double + miroir LED", quantity: 1, unit_price: 1450, total: 1450 },
        { description: "Electricite et eclairage", quantity: 1, unit_price: 1120, total: 1120 },
      ],
    },
    {
      user_id: userId,
      client_id: clients[1].id,
      title: "Amenagement bureau cabinet architecte",
      total_ht: 12800.0,
      tva_rate: 20,
      discount: 5,
      total_ttc: 14592.0,
      status: "envoyé",
      notes: "Devis genere par IA Mistral. Livraison sous 3 semaines.",
      valid_until: "2026-04-01",
      ai_prompt: "Amenagement complet bureau architecte 40m2, style moderne, rangements sur mesure",
      items: [
        { description: "Bureau sur mesure chene massif (2m40 x 0m80)", quantity: 2, unit_price: 1800, total: 3600 },
        { description: "Bibliotheque murale integree", quantity: 1, unit_price: 3500, total: 3500 },
        { description: "Cloison vitree atelier", quantity: 1, unit_price: 2800, total: 2800 },
        { description: "Eclairage architectural LED", quantity: 6, unit_price: 250, total: 1500 },
        { description: "Peinture et finitions", quantity: 40, unit_price: 35, total: 1400 },
      ],
    },
    {
      user_id: userId,
      client_id: clients[2].id,
      title: "Renovation cuisine professionnelle",
      total_ht: 25600.0,
      tva_rate: 20,
      discount: 0,
      total_ttc: 30720.0,
      status: "brouillon",
      notes: "En attente validation chef cuisinier pour plan definitif.",
      valid_until: "2026-05-01",
      items: [
        { description: "Plan de travail inox professionnel (6m lineaire)", quantity: 1, unit_price: 4800, total: 4800 },
        { description: "Hotte extraction industrielle", quantity: 1, unit_price: 5200, total: 5200 },
        { description: "Installation gaz + raccordements", quantity: 1, unit_price: 3600, total: 3600 },
        { description: "Revetement sol antiderapant", quantity: 35, unit_price: 120, total: 4200 },
        { description: "Plonge double bac + lave-vaisselle pro", quantity: 1, unit_price: 4800, total: 4800 },
        { description: "Mise aux normes electrique", quantity: 1, unit_price: 3000, total: 3000 },
      ],
    },
    {
      user_id: userId,
      client_id: clients[3].id,
      title: "Creation site web vitrine + SEO",
      total_ht: 3200.0,
      tva_rate: 20,
      discount: 10,
      total_ttc: 3456.0,
      status: "accepté",
      notes: "Projet valide. Debut des travaux le 10 mars.",
      valid_until: "2026-03-30",
      ai_prompt: "Site web vitrine 5 pages pour entreprise tech, responsive, SEO optimise",
      items: [
        { description: "Maquettes UX/UI (5 pages)", quantity: 1, unit_price: 800, total: 800 },
        { description: "Developpement front-end responsive", quantity: 1, unit_price: 1200, total: 1200 },
        { description: "Integration CMS + back-office", quantity: 1, unit_price: 600, total: 600 },
        { description: "Optimisation SEO (audit + implementation)", quantity: 1, unit_price: 400, total: 400 },
        { description: "Formation utilisation (2h)", quantity: 1, unit_price: 200, total: 200 },
      ],
    },
    {
      user_id: userId,
      client_id: clients[4].id,
      title: "Amenagement salon de coiffure",
      total_ht: 6800.0,
      tva_rate: 20,
      discount: 0,
      total_ttc: 8160.0,
      status: "envoyé",
      notes: "Possibilite de paiement en 3 fois sans frais.",
      valid_until: "2026-04-20",
      items: [
        { description: "Postes de coiffage (miroir + tablette + rangement)", quantity: 3, unit_price: 950, total: 2850 },
        { description: "Bac a shampoing ergonomique", quantity: 2, unit_price: 780, total: 1560 },
        { description: "Comptoir accueil + caisse", quantity: 1, unit_price: 1200, total: 1200 },
        { description: "Eclairage salon (spots + bandeaux LED)", quantity: 1, unit_price: 890, total: 890 },
        { description: "Peinture decorative", quantity: 25, unit_price: 12, total: 300 },
      ],
    },
    {
      user_id: userId,
      client_id: clients[0].id,
      title: "Terrasse bois composite 20m2",
      total_ht: 4200.0,
      tva_rate: 10,
      discount: 0,
      total_ttc: 4620.0,
      status: "refusé",
      notes: "Client a choisi un autre prestataire.",
      valid_until: "2026-03-15",
      items: [
        { description: "Lames composite premium (20m2)", quantity: 20, unit_price: 95, total: 1900 },
        { description: "Structure portante lambourdes", quantity: 1, unit_price: 800, total: 800 },
        { description: "Plots reglables", quantity: 45, unit_price: 12, total: 540 },
        { description: "Main d'oeuvre pose complete", quantity: 1, unit_price: 960, total: 960 },
      ],
    },
  ];

  for (const quoteData of quotesData) {
    const { items, ...quoteFields } = quoteData;

    // Insert quote
    const { data: quote, error: qErr } = await supabase
      .from("quotes")
      .insert(quoteFields)
      .select()
      .single();
    if (qErr) {
      console.error(`Failed to create quote "${quoteFields.title}":`, qErr.message);
      continue;
    }

    // Insert items
    const itemsWithQuoteId = items.map((item, i) => ({
      quote_id: quote.id,
      ...item,
      position: i,
    }));

    const { error: iErr } = await supabase.from("quote_items").insert(itemsWithQuoteId);
    if (iErr) {
      console.error(`Failed to create items for "${quoteFields.title}":`, iErr.message);
      continue;
    }

    console.log(`  -> ${quote.title} (${quoteFields.status}) - ${quoteFields.total_ttc} EUR TTC`);
  }

  console.log("\nDone! 5 clients + 6 devis created for", TARGET_EMAIL);
  console.log("You can now log in and see the data in the dashboard.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
