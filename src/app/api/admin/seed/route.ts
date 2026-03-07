import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_USER_ID = "ea81a899-f85b-4b61-b931-6f45cb532094";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

const SEED_CLIENTS = [
  {
    name: "Martin Dupont",
    email: "martin.dupont@gmail.com",
    phone: "06 12 34 56 78",
    address: "45 Rue de la Paix",
    city: "Paris",
    postal_code: "75002",
    siret: "84726351900014",
  },
  {
    name: "Sophie Laurent - Architecte",
    email: "s.laurent@cabinet-laurent.fr",
    phone: "06 98 76 54 32",
    address: "12 Avenue des Champs-Elysees",
    city: "Lyon",
    postal_code: "69001",
    siret: "91234567800021",
  },
  {
    name: "Restaurant Le Gourmet",
    email: "contact@legourmet-paris.fr",
    phone: "01 42 36 78 90",
    address: "8 Rue du Commerce",
    city: "Bordeaux",
    postal_code: "33000",
    siret: "78945612300035",
  },
  {
    name: "Tech Solutions SAS",
    email: "projets@techsolutions.fr",
    phone: "01 55 66 77 88",
    address: "120 Boulevard Haussmann",
    city: "Paris",
    postal_code: "75008",
    siret: "45678912300042",
  },
  {
    name: "Marie Petit - Coiffeuse",
    email: "marie.petit@outlook.fr",
    phone: "07 11 22 33 44",
    address: "3 Place de la Mairie",
    city: "Nantes",
    postal_code: "44000",
  },
];

interface SeedQuote {
  client_index: number;
  title: string;
  total_ht: number;
  tva_rate: number;
  discount: number;
  total_ttc: number;
  status: string;
  notes: string;
  valid_until: string;
  ai_prompt?: string;
  items: { description: string; quantity: number; unit_price: number; total: number }[];
}

const SEED_QUOTES: SeedQuote[] = [
  {
    client_index: 0,
    title: "Renovation salle de bain complete",
    total_ht: 8500,
    tva_rate: 10,
    discount: 0,
    total_ttc: 9350,
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
    client_index: 1,
    title: "Amenagement bureau cabinet architecte",
    total_ht: 12800,
    tva_rate: 20,
    discount: 5,
    total_ttc: 14592,
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
    client_index: 2,
    title: "Renovation cuisine professionnelle",
    total_ht: 25600,
    tva_rate: 20,
    discount: 0,
    total_ttc: 30720,
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
    client_index: 3,
    title: "Creation site web vitrine + SEO",
    total_ht: 3200,
    tva_rate: 20,
    discount: 10,
    total_ttc: 3456,
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
    client_index: 4,
    title: "Amenagement salon de coiffure",
    total_ht: 6800,
    tva_rate: 20,
    discount: 0,
    total_ttc: 8160,
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
    client_index: 0,
    title: "Terrasse bois composite 20m2",
    total_ht: 4200,
    tva_rate: 10,
    discount: 0,
    total_ttc: 4620,
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

export async function POST() {
  // Check auth — must be logged in as admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const service = createServiceClient();

  // Clean existing data for this user first
  const { data: existingQuotes } = await service
    .from("quotes")
    .select("id")
    .eq("user_id", ADMIN_USER_ID);

  if (existingQuotes && existingQuotes.length > 0) {
    const quoteIds = existingQuotes.map((q: { id: string }) => q.id);
    await service.from("quote_items").delete().in("quote_id", quoteIds);
    await service.from("quotes").delete().eq("user_id", ADMIN_USER_ID);
  }
  await service.from("clients").delete().eq("user_id", ADMIN_USER_ID);

  // Insert clients
  const clientsWithUserId = SEED_CLIENTS.map((c) => ({
    ...c,
    user_id: ADMIN_USER_ID,
  }));

  const { data: clients, error: clientErr } = await service
    .from("clients")
    .insert(clientsWithUserId)
    .select();

  if (clientErr || !clients) {
    return NextResponse.json(
      { error: "Erreur création clients: " + clientErr?.message },
      { status: 500 }
    );
  }

  // Insert quotes + items
  let quotesCreated = 0;
  for (const seed of SEED_QUOTES) {
    const { items, client_index, ...fields } = seed;
    const { data: quote, error: qErr } = await service
      .from("quotes")
      .insert({
        ...fields,
        user_id: ADMIN_USER_ID,
        client_id: clients[client_index].id,
      })
      .select()
      .single();

    if (qErr || !quote) continue;

    const itemsWithQuoteId = items.map((item, i) => ({
      quote_id: quote.id,
      ...item,
      position: i,
    }));
    await service.from("quote_items").insert(itemsWithQuoteId);
    quotesCreated++;
  }

  return NextResponse.json({
    success: true,
    clients: clients.length,
    quotes: quotesCreated,
  });
}
