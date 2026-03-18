import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/export/fec?year=2026&month=3
 *
 * Export FEC (Fichier des Ecritures Comptables) conforme
 * Article A47 A-1 du Livre des Procedures Fiscales.
 *
 * 18 colonnes obligatoires, separateur TAB, encodage UTF-8 BOM.
 * Double-entry: chaque facture payee genere 2 lignes (debit + credit).
 *
 * Restricted to Business plan.
 */

// PCG (Plan Comptable General) mapping for freelance/TPE
const COMPTE_CLIENT = "411000";
const COMPTE_CLIENT_LIB = "Clients";
const COMPTE_VENTE_HT = "706000";
const COMPTE_VENTE_HT_LIB = "Prestations de services";
const COMPTE_TVA_COLLECTEE = "445710";
const COMPTE_TVA_COLLECTEE_LIB = "TVA collectee";
const COMPTE_BANQUE = "512000";
const COMPTE_BANQUE_LIB = "Banque";

const JOURNAL_VENTES = "VE";
const JOURNAL_VENTES_LIB = "Journal des ventes";
const JOURNAL_BANQUE = "BQ";
const JOURNAL_BANQUE_LIB = "Journal de banque";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Business-only feature gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, company_name, siret, is_micro_entrepreneur")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_status !== "business") {
    return NextResponse.json(
      { error: "PLAN_REQUIRED", plan: "business", message: "Export FEC reserve au plan Business" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json(
      { error: "Le parametre year est requis" },
      { status: 400 }
    );
  }

  const y = parseInt(year, 10);
  const month = searchParams.get("month");

  let startDate: string;
  let endDate: string;
  if (month) {
    const m = parseInt(month, 10) - 1;
    startDate = new Date(y, m, 1).toISOString();
    endDate = new Date(y, m + 1, 0, 23, 59, 59).toISOString();
  } else {
    startDate = new Date(y, 0, 1).toISOString();
    endDate = new Date(y, 11, 31, 23, 59, 59).toISOString();
  }

  // Fetch invoices (paid) — the primary source for FEC
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, quotes(number, title, total_ht, tva_rate, total_ttc, client_id, clients(name, siret))")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .gte("paid_at", startDate)
    .lte("paid_at", endDate)
    .order("paid_at", { ascending: true });

  // Also fetch paid quotes without invoices (direct payments)
  const { data: paidQuotes } = await supabase
    .from("quotes")
    .select("*, clients(name, siret)")
    .eq("user_id", user.id)
    .eq("status", "payé")
    .gte("paid_at", startDate)
    .lte("paid_at", endDate)
    .order("paid_at", { ascending: true });

  // Deduplicate: exclude quotes that already have an invoice
  const invoicedQuoteIds = new Set(
    (invoices || [])
      .map((inv: Record<string, unknown>) => {
        const q = inv.quotes as Record<string, unknown> | null;
        return q ? String(inv.quote_id || "") : "";
      })
      .filter(Boolean)
  );

  const isMicro = profile.is_micro_entrepreneur;

  const lines: string[][] = [];
  let ecritureNum = 1;

  // Process invoices first
  for (const inv of invoices || []) {
    const quote = inv.quotes as Record<string, unknown> | null;
    const client = quote?.clients as { name: string; siret: string | null } | null;
    const totalHT = Number(quote?.total_ht || inv.total_ht || 0);
    const totalTTC = Number(quote?.total_ttc || inv.total_ttc || 0);
    const tvaRate = Number(quote?.tva_rate || 0);
    const tvaAmount = isMicro ? 0 : (totalTTC - totalHT);
    const amount = isMicro ? totalHT : totalTTC;

    const invNum = String(inv.invoice_number || "");
    const quoteRef = quote?.number ? `DEV-${String(quote.number).padStart(4, "0")}` : invNum;
    const paidDate = inv.paid_at ? fmtFecDate(inv.paid_at) : fmtFecDate(inv.created_at);
    const invoiceDate = fmtFecDate(inv.created_at);
    const label = String(quote?.title || inv.title || `Facture ${invNum}`);
    const clientName = client?.name || "";
    const clientSiret = client?.siret || "";
    const num = String(ecritureNum).padStart(6, "0");

    // --- Journal des ventes: ecriture de facturation ---
    // Line 1: Debit client (411)
    lines.push(fecLine({
      journalCode: JOURNAL_VENTES,
      journalLib: JOURNAL_VENTES_LIB,
      ecritureNum: num,
      ecritureDate: invoiceDate,
      compteNum: COMPTE_CLIENT,
      compteLib: COMPTE_CLIENT_LIB,
      compAuxNum: clientSiret,
      compAuxLib: clientName,
      pieceRef: invNum || quoteRef,
      pieceDate: invoiceDate,
      ecritureLib: label,
      debit: amount,
      credit: 0,
      validDate: invoiceDate,
    }));

    // Line 2: Credit vente HT (706)
    lines.push(fecLine({
      journalCode: JOURNAL_VENTES,
      journalLib: JOURNAL_VENTES_LIB,
      ecritureNum: num,
      ecritureDate: invoiceDate,
      compteNum: COMPTE_VENTE_HT,
      compteLib: COMPTE_VENTE_HT_LIB,
      compAuxNum: "",
      compAuxLib: "",
      pieceRef: invNum || quoteRef,
      pieceDate: invoiceDate,
      ecritureLib: label,
      debit: 0,
      credit: totalHT,
      validDate: invoiceDate,
    }));

    // Line 3: Credit TVA collectee (4457) — skip for micro-entrepreneur
    if (!isMicro && tvaAmount > 0) {
      lines.push(fecLine({
        journalCode: JOURNAL_VENTES,
        journalLib: JOURNAL_VENTES_LIB,
        ecritureNum: num,
        ecritureDate: invoiceDate,
        compteNum: COMPTE_TVA_COLLECTEE,
        compteLib: `${COMPTE_TVA_COLLECTEE_LIB} ${tvaRate}%`,
        compAuxNum: "",
        compAuxLib: "",
        pieceRef: invNum || quoteRef,
        pieceDate: invoiceDate,
        ecritureLib: `TVA ${tvaRate}% - ${label}`,
        debit: 0,
        credit: tvaAmount,
        validDate: invoiceDate,
      }));
    }

    ecritureNum++;

    // --- Journal de banque: ecriture de reglement ---
    const numBQ = String(ecritureNum).padStart(6, "0");

    // Line 1: Debit banque (512)
    lines.push(fecLine({
      journalCode: JOURNAL_BANQUE,
      journalLib: JOURNAL_BANQUE_LIB,
      ecritureNum: numBQ,
      ecritureDate: paidDate,
      compteNum: COMPTE_BANQUE,
      compteLib: COMPTE_BANQUE_LIB,
      compAuxNum: "",
      compAuxLib: "",
      pieceRef: invNum || quoteRef,
      pieceDate: paidDate,
      ecritureLib: `Reglement ${clientName} - ${label}`,
      debit: amount,
      credit: 0,
      validDate: paidDate,
    }));

    // Line 2: Credit client (411)
    lines.push(fecLine({
      journalCode: JOURNAL_BANQUE,
      journalLib: JOURNAL_BANQUE_LIB,
      ecritureNum: numBQ,
      ecritureDate: paidDate,
      compteNum: COMPTE_CLIENT,
      compteLib: COMPTE_CLIENT_LIB,
      compAuxNum: clientSiret,
      compAuxLib: clientName,
      pieceRef: invNum || quoteRef,
      pieceDate: paidDate,
      ecritureLib: `Reglement ${clientName} - ${label}`,
      debit: 0,
      credit: amount,
      validDate: paidDate,
    }));

    ecritureNum++;
  }

  // Process paid quotes without invoices
  for (const q of paidQuotes || []) {
    if (invoicedQuoteIds.has(q.id)) continue;

    const client = q.clients as { name: string; siret: string | null } | null;
    const totalHT = Number(q.total_ht);
    const totalTTC = Number(q.total_ttc);
    const tvaRate = Number(q.tva_rate || 0);
    const tvaAmount = isMicro ? 0 : (totalTTC - totalHT);
    const amount = isMicro ? totalHT : totalTTC;

    const quoteRef = `DEV-${String(q.number).padStart(4, "0")}`;
    const paidDate = fmtFecDate(q.paid_at || q.updated_at);
    const createdDate = fmtFecDate(q.created_at);
    const label = q.title || quoteRef;
    const clientName = client?.name || "";
    const clientSiret = client?.siret || "";
    const num = String(ecritureNum).padStart(6, "0");

    // Journal des ventes
    lines.push(fecLine({
      journalCode: JOURNAL_VENTES,
      journalLib: JOURNAL_VENTES_LIB,
      ecritureNum: num,
      ecritureDate: createdDate,
      compteNum: COMPTE_CLIENT,
      compteLib: COMPTE_CLIENT_LIB,
      compAuxNum: clientSiret,
      compAuxLib: clientName,
      pieceRef: quoteRef,
      pieceDate: createdDate,
      ecritureLib: label,
      debit: amount,
      credit: 0,
      validDate: createdDate,
    }));

    lines.push(fecLine({
      journalCode: JOURNAL_VENTES,
      journalLib: JOURNAL_VENTES_LIB,
      ecritureNum: num,
      ecritureDate: createdDate,
      compteNum: COMPTE_VENTE_HT,
      compteLib: COMPTE_VENTE_HT_LIB,
      compAuxNum: "",
      compAuxLib: "",
      pieceRef: quoteRef,
      pieceDate: createdDate,
      ecritureLib: label,
      debit: 0,
      credit: totalHT,
      validDate: createdDate,
    }));

    if (!isMicro && tvaAmount > 0) {
      lines.push(fecLine({
        journalCode: JOURNAL_VENTES,
        journalLib: JOURNAL_VENTES_LIB,
        ecritureNum: num,
        ecritureDate: createdDate,
        compteNum: COMPTE_TVA_COLLECTEE,
        compteLib: `${COMPTE_TVA_COLLECTEE_LIB} ${tvaRate}%`,
        compAuxNum: "",
        compAuxLib: "",
        pieceRef: quoteRef,
        pieceDate: createdDate,
        ecritureLib: `TVA ${tvaRate}% - ${label}`,
        debit: 0,
        credit: tvaAmount,
        validDate: createdDate,
      }));
    }

    ecritureNum++;
    const numBQ = String(ecritureNum).padStart(6, "0");

    lines.push(fecLine({
      journalCode: JOURNAL_BANQUE,
      journalLib: JOURNAL_BANQUE_LIB,
      ecritureNum: numBQ,
      ecritureDate: paidDate,
      compteNum: COMPTE_BANQUE,
      compteLib: COMPTE_BANQUE_LIB,
      compAuxNum: "",
      compAuxLib: "",
      pieceRef: quoteRef,
      pieceDate: paidDate,
      ecritureLib: `Reglement ${clientName} - ${label}`,
      debit: amount,
      credit: 0,
      validDate: paidDate,
    }));

    lines.push(fecLine({
      journalCode: JOURNAL_BANQUE,
      journalLib: JOURNAL_BANQUE_LIB,
      ecritureNum: numBQ,
      ecritureDate: paidDate,
      compteNum: COMPTE_CLIENT,
      compteLib: COMPTE_CLIENT_LIB,
      compAuxNum: clientSiret,
      compAuxLib: clientName,
      pieceRef: quoteRef,
      pieceDate: paidDate,
      ecritureLib: `Reglement ${clientName} - ${label}`,
      debit: 0,
      credit: amount,
      validDate: paidDate,
    }));

    ecritureNum++;
  }

  if (lines.length === 0) {
    return NextResponse.json(
      { error: "Aucune ecriture pour cette periode" },
      { status: 404 }
    );
  }

  // FEC header (18 columns, TAB-separated)
  const FEC_HEADER = [
    "JournalCode",
    "JournalLib",
    "EcritureNum",
    "EcritureDate",
    "CompteNum",
    "CompteLib",
    "CompAuxNum",
    "CompAuxLib",
    "PieceRef",
    "PieceDate",
    "EcritureLib",
    "Debit",
    "Credit",
    "EcrtureLet",
    "DateLet",
    "ValidDate",
    "Montantdevise",
    "Idevise",
  ].join("\t");

  const BOM = "\uFEFF";
  const content = BOM + FEC_HEADER + "\n" + lines.map(l => l.join("\t")).join("\n");

  // Filename per DGFi specs: SirenFECYYYYMMDD.txt
  const siren = (profile.siret || "000000000").slice(0, 9);
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const filename = `${siren}FEC${dateStr}.txt`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/* ── Helpers ── */

interface FecLineParams {
  journalCode: string;
  journalLib: string;
  ecritureNum: string;
  ecritureDate: string;
  compteNum: string;
  compteLib: string;
  compAuxNum: string;
  compAuxLib: string;
  pieceRef: string;
  pieceDate: string;
  ecritureLib: string;
  debit: number;
  credit: number;
  validDate: string;
}

function fecLine(p: FecLineParams): string[] {
  return [
    p.journalCode,
    p.journalLib,
    p.ecritureNum,
    p.ecritureDate,
    p.compteNum,
    p.compteLib,
    p.compAuxNum,
    p.compAuxLib,
    p.pieceRef,
    p.pieceDate,
    p.ecritureLib,
    fmtAmount(p.debit),
    fmtAmount(p.credit),
    "", // EcrtureLet (lettrage) — empty
    "", // DateLet — empty
    p.validDate,
    "", // Montantdevise — empty (EUR)
    "EUR", // Idevise
  ];
}

/** FEC date format: YYYYMMDD */
function fmtFecDate(d: string): string {
  const date = new Date(d);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/** FEC amount: French decimal (comma), no thousands separator */
function fmtAmount(n: number): string {
  if (n === 0) return "0,00";
  return n.toFixed(2).replace(".", ",");
}
