"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Calculator,
  Copy,
  Check,
  ExternalLink,
  Download,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import type { UrssafDeclaration, UrssafActiviteType } from "@/types";

// ── Constants ──────────────────────────────────────────────

const TAUX_COTISATIONS: Record<UrssafActiviteType, { label: string; taux: number; cfp: number }> = {
  vente_marchandises: { label: "Vente de marchandises", taux: 12.3, cfp: 0.1 },
  prestations_bic: { label: "Prestations de services (BIC)", taux: 21.2, cfp: 0.3 },
  prestations_bnc: { label: "Prestations de services (BNC)", taux: 21.1, cfp: 0.2 },
  liberale_cipav: { label: "Activité libérale (CIPAV)", taux: 21.1, cfp: 0.2 },
};

// Seuils de franchise TVA 2026 (loi n°2025-1044 du 3 novembre 2025 — seuils historiques maintenus)
const SEUILS_TVA: Record<UrssafActiviteType, number> = {
  vente_marchandises: 85000,
  prestations_bic: 37500,
  prestations_bnc: 37500,
  liberale_cipav: 37500,
};

// Plafonds de chiffre d'affaires micro-entrepreneur 2026 (LégiFiscal)
const PLAFONDS_MICRO: Record<UrssafActiviteType, number> = {
  vente_marchandises: 203100,
  prestations_bic: 83600,
  prestations_bnc: 83600,
  liberale_cipav: 83600,
};

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function fmtEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

/** ACRE: taux de cotisation réduit de 50% pendant les 12 mois suivant le début d'activité. */
function isAcreActiveForPeriod(acreActive: boolean, acreStartDate: string, periodeStartISO: string): boolean {
  if (!acreActive || !acreStartDate) return false;
  const start = new Date(acreStartDate);
  if (Number.isNaN(start.getTime())) return false;
  const oneYearLater = new Date(start);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  return new Date(periodeStartISO) < oneYearLater;
}

// ── Component ──────────────────────────────────────────────

export default function UrssafPage() {
  const now = new Date();
  const [activite, setActivite] = useState<UrssafActiviteType>("prestations_bnc");
  const [periodeType, setPeriodeType] = useState<"mensuelle" | "trimestrielle">("trimestrielle");
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth())); // 0-indexed
  const [trimestre, setTrimestre] = useState(String(Math.floor(now.getMonth() / 3)));

  const [caHt, setCaHt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);

  // ACRE
  const [acreActive, setAcreActive] = useState(false);
  const [acreStartDate, setAcreStartDate] = useState("");

  // Annual summary
  const [annualData, setAnnualData] = useState<{ label: string; ca: number; cotisations: number; cfp: number }[]>([]);
  const [annualTotal, setAnnualTotal] = useState(0);

  // Declarations history
  const [declarations, setDeclarations] = useState<UrssafDeclaration[]>([]);

  // ── Computed values ──
  const config = TAUX_COTISATIONS[activite];
  const { start: periodeStart, label: periodeLabel } = getPeriodBounds();
  const acreApplies = isAcreActiveForPeriod(acreActive, acreStartDate, periodeStart);
  const effectiveTaux = acreApplies ? config.taux / 2 : config.taux;
  const cotisations = Math.round(caHt * effectiveTaux) / 100;
  const cfp = Math.round(caHt * config.cfp) / 100;
  const totalDu = cotisations + cfp;
  const seuilTva = SEUILS_TVA[activite];
  const plafondMicro = PLAFONDS_MICRO[activite];
  const seuilTvaPct = annualTotal > 0 ? Math.min(100, Math.round((annualTotal / seuilTva) * 100)) : 0;
  const plafondMicroPct = annualTotal > 0 ? Math.min(100, Math.round((annualTotal / plafondMicro) * 100)) : 0;
  const formattedResume = `Période : ${periodeLabel} | CA à déclarer : ${fmtEur(caHt)} | Cotisations estimées : ${fmtEur(totalDu)}`;

  // ── Period bounds ──
  function getPeriodBounds(): { start: string; end: string; label: string } {
    const y = parseInt(year, 10);
    if (periodeType === "mensuelle") {
      const m = parseInt(month, 10);
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
        label: `${MONTHS_FR[m]} ${y}`,
      };
    }
    const t = parseInt(trimestre, 10);
    const startMonth = t * 3;
    const start = new Date(y, startMonth, 1);
    const end = new Date(y, startMonth + 3, 0);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
      label: `T${t + 1} ${y}`,
    };
  }

  // ── Fetch CA for selected period ──
  const fetchCA = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) { setLoading(false); return; }
    const uid = currentUser.id;
    const { start, end } = getPeriodBounds();

    // Paid invoices in period
    const { data: invoices } = await supabase
      .from("invoices")
      .select("amount")
      .eq("user_id", uid)
      .eq("status", "paid")
      .gte("paid_at", start)
      .lte("paid_at", end + "T23:59:59");

    // Also paid quotes without invoices
    const { data: paidQuotes } = await supabase
      .from("quotes")
      .select("total_ht")
      .eq("user_id", uid)
      .eq("status", "payé")
      .gte("paid_at", start)
      .lte("paid_at", end + "T23:59:59");

    const invoiceTotal = (invoices || []).reduce((s, i) => s + Number(i.amount), 0);
    const quoteTotal = (paidQuotes || []).reduce((s, q) => s + Number(q.total_ht), 0);
    setCaHt(invoiceTotal + quoteTotal);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, trimestre, periodeType]);

  // ── Fetch annual summary ──
  const fetchAnnualSummary = useCallback(async () => {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;
    const uid = currentUser.id;
    const y = parseInt(year, 10);
    const periods = periodeType === "mensuelle"
      ? Array.from({ length: 12 }, (_, i) => ({
          label: `${MONTHS_FR[i]} ${y}`,
          start: new Date(y, i, 1).toISOString().split("T")[0],
          end: new Date(y, i + 1, 0).toISOString().split("T")[0],
        }))
      : Array.from({ length: 4 }, (_, t) => ({
          label: `T${t + 1} ${y}`,
          start: new Date(y, t * 3, 1).toISOString().split("T")[0],
          end: new Date(y, t * 3 + 3, 0).toISOString().split("T")[0],
        }));

    const startYear = `${y}-01-01`;
    const endYear = `${y}-12-31T23:59:59`;

    const [{ data: invoices }, { data: quotes }] = await Promise.all([
      supabase.from("invoices").select("amount, paid_at").eq("user_id", uid).eq("status", "paid")
        .gte("paid_at", startYear).lte("paid_at", endYear),
      supabase.from("quotes").select("total_ht, paid_at").eq("user_id", uid).eq("status", "payé")
        .gte("paid_at", startYear).lte("paid_at", endYear),
    ]);

    const result = periods.map((p) => {
      const invCA = (invoices || [])
        .filter((i) => i.paid_at && i.paid_at >= p.start && i.paid_at <= p.end + "T23:59:59")
        .reduce((s, i) => s + Number(i.amount), 0);
      const qCA = (quotes || [])
        .filter((q) => q.paid_at && q.paid_at >= p.start && q.paid_at <= p.end + "T23:59:59")
        .reduce((s, q) => s + Number(q.total_ht), 0);
      const ca = invCA + qCA;
      const rowAcreApplies = isAcreActiveForPeriod(acreActive, acreStartDate, p.start);
      const rowTaux = rowAcreApplies ? config.taux / 2 : config.taux;
      return {
        label: p.label,
        ca,
        cotisations: Math.round(ca * rowTaux) / 100,
        cfp: Math.round(ca * config.cfp) / 100,
      };
    });
    setAnnualData(result);
    setAnnualTotal(result.reduce((s, r) => s + r.ca, 0));
  }, [year, periodeType, config.taux, config.cfp, acreActive, acreStartDate]);

  // ── Fetch declarations history ──
  const fetchDeclarations = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("urssaf_declarations")
      .select("*")
      .order("periode_start", { ascending: false })
      .limit(20);
    setDeclarations((data || []) as UrssafDeclaration[]);
  }, []);

  // ── Fetch ACRE + periodicité preference from profile ──
  const fetchProfileSettings = useCallback(async () => {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;
    const { data } = await supabase
      .from("profiles")
      .select("acre_active, acre_start_date, urssaf_periodicite")
      .eq("id", currentUser.id)
      .single();
    if (data) {
      setAcreActive(Boolean(data.acre_active));
      setAcreStartDate(data.acre_start_date || "");
      if (data.urssaf_periodicite === "trimestriel") setPeriodeType("trimestrielle");
      else if (data.urssaf_periodicite === "mensuel") setPeriodeType("mensuelle");
    }
    // Marks the URSSAF page as visited (used by tip_urssaf's condition)
    supabase.from("profiles").update({ urssaf_visited_at: new Date().toISOString() }).eq("id", currentUser.id).then(() => {});
  }, []);

  useEffect(() => { fetchCA(); }, [fetchCA]);
  useEffect(() => { fetchAnnualSummary(); }, [fetchAnnualSummary]);
  useEffect(() => { fetchDeclarations(); }, [fetchDeclarations]);
  useEffect(() => { fetchProfileSettings(); }, [fetchProfileSettings]);

  // ── Actions ──
  async function handleSaveDeclaration() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { start, end, label } = getPeriodBounds();
    const { error } = await supabase.from("urssaf_declarations").upsert({
      user_id: user.id,
      periode_type: periodeType,
      periode_label: label,
      periode_start: start,
      periode_end: end,
      ca_ht: caHt,
      taux_activite: activite,
      cotisations,
      cfp,
      statut: "a_declarer",
    }, { onConflict: "user_id,periode_start" });

    if (error) {
      toast.error("Erreur de sauvegarde");
    } else {
      toast.success("Déclaration enregistrée");
      fetchDeclarations();
    }
  }

  async function handleMarkDeclared(id: string) {
    const supabase = createClient();
    await supabase.from("urssaf_declarations").update({
      statut: "declare",
      declared_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    toast.success("Marqué comme déclaré");
    fetchDeclarations();
  }

  function handleCopyCA() {
    navigator.clipboard.writeText(caHt.toFixed(2).replace(".", ","));
    setCopied(true);
    toast.success("Montant CA copié dans le presse-papiers");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyResume() {
    navigator.clipboard.writeText(formattedResume);
    setCopiedResume(true);
    toast.success("Résumé copié dans le presse-papiers");
    setTimeout(() => setCopiedResume(false), 2000);
  }

  async function handlePeriodeTypeChange(v: "mensuelle" | "trimestrielle") {
    setPeriodeType(v);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({
      urssaf_periodicite: v === "mensuelle" ? "mensuel" : "trimestriel",
    }).eq("id", user.id);
  }

  async function saveAcre(active: boolean, startDate: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      acre_active: active,
      acre_start_date: startDate || null,
    }).eq("id", user.id);
    if (error) toast.error("Erreur de sauvegarde ACRE");
  }

  function handleAcreToggle(checked: boolean) {
    setAcreActive(checked);
    saveAcre(checked, acreStartDate);
  }

  function handleAcreDateChange(date: string) {
    setAcreStartDate(date);
    saveAcre(acreActive, date);
  }

  // ── Years list ──
  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - 2 + i));

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            D&eacute;claration URSSAF
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Calcul automatique des cotisations auto-entrepreneur
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="https://www.autoentrepreneur.urssaf.fr" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            D&eacute;clarer sur urssaf.fr
          </a>
        </Button>
      </div>

      {/* ACRE toggle */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4">
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={acreActive}
            onChange={(e) => handleAcreToggle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-primary"
          />
          J&apos;ai l&apos;ACRE (taux de cotisation r&eacute;duit de 50% la 1&egrave;re ann&eacute;e)
        </label>
        {acreActive && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">D&eacute;but d&apos;activit&eacute;</label>
            <Input
              type="date"
              value={acreStartDate}
              onChange={(e) => handleAcreDateChange(e.target.value)}
              className="w-40"
            />
          </div>
        )}
        {acreApplies && (
          <Badge className="bg-primary/10 text-primary border border-primary/20">
            Taux ACRE -50% appliqu&eacute;
          </Badge>
        )}
      </div>

      {/* Selectors */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Activit&eacute;</label>
          <Select value={activite} onValueChange={(v) => setActivite(v as UrssafActiviteType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TAUX_COTISATIONS).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">P&eacute;riode</label>
          <Select value={periodeType} onValueChange={(v) => handlePeriodeTypeChange(v as "mensuelle" | "trimestrielle")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mensuelle">Mensuelle</SelectItem>
              <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Ann&eacute;e</label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {periodeType === "mensuelle" ? "Mois" : "Trimestre"}
          </label>
          {periodeType === "mensuelle" ? (
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS_FR.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Select value={trimestre} onValueChange={setTrimestre}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">T1 (Jan-Mar)</SelectItem>
                <SelectItem value="1">T2 (Avr-Jun)</SelectItem>
                <SelectItem value="2">T3 (Jul-Sep)</SelectItem>
                <SelectItem value="3">T4 (Oct-D&eacute;c)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Calculation */}
        <Card>
          <CardHeader>
            <CardTitle>Calcul des cotisations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    CA HT de la p&eacute;riode ({periodeLabel})
                  </p>
                  <p className="text-3xl font-bold mt-1">{fmtEur(caHt)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Factures et devis pay&eacute;s
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Cotisations sociales ({effectiveTaux}%{acreApplies ? " — ACRE" : ""})
                    </span>
                    <span className="font-medium">{fmtEur(cotisations)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CFP ({config.cfp}%)</span>
                    <span className="font-medium">{fmtEur(cfp)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total &agrave; payer</span>
                    <span className="text-primary">{fmtEur(totalDu)}</span>
                  </div>
                </div>

                <Separator />

                {/* Résumé pour la déclaration */}
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                    R&eacute;sum&eacute; pour votre d&eacute;claration
                  </p>
                  <p className="text-sm font-mono text-slate-700 break-words">{formattedResume}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={handleCopyResume} variant="outline" className="flex-1">
                    {copiedResume ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copiedResume ? "Copié !" : "Copier le montant"}
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <a href="https://www.autoentrepreneur.urssaf.fr" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      D&eacute;clarer sur urssaf.fr
                    </a>
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCopyCA} variant="outline" className="flex-1">
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copié !" : "Copier le CA"}
                  </Button>
                  <Button onClick={handleSaveDeclaration} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right: TVA threshold + Plafond micro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Seuils {year}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CA annuel cumul&eacute;</span>
                <span className="font-medium">{fmtEur(annualTotal)}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    Seuil franchise TVA
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        Vous ne facturez pas la TVA tant que votre CA annuel reste sous ce seuil.
                        Au-del&agrave; de {fmtEur(seuilTva)}, vous devrez facturer la TVA &agrave; vos clients.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="font-medium">{fmtEur(seuilTva)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      seuilTvaPct >= 90 ? "bg-red-500" : seuilTvaPct >= 70 ? "bg-orange-400" : "bg-primary"
                    }`}
                    style={{ width: `${seuilTvaPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{seuilTvaPct}% du seuil</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    Plafond micro-entrepreneur
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        Au-del&agrave; de {fmtEur(plafondMicro)} de CA annuel, vous perdez le statut de
                        micro-entrepreneur et basculez vers un r&eacute;gime r&eacute;el d&apos;imposition.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="font-medium">{fmtEur(plafondMicro)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      plafondMicroPct >= 90 ? "bg-red-500" : plafondMicroPct >= 70 ? "bg-orange-400" : "bg-primary"
                    }`}
                    style={{ width: `${plafondMicroPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{plafondMicroPct}% du plafond</p>
              </div>
            </div>

            {seuilTvaPct >= 90 && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Attention</p>
                  <p className="text-xs text-red-700">
                    Votre CA approche le seuil de franchise TVA. Au-del&agrave; de {fmtEur(seuilTva)}, vous devrez facturer la TVA.
                  </p>
                </div>
              </div>
            )}

            {plafondMicroPct >= 90 && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Attention</p>
                  <p className="text-xs text-red-700">
                    Votre CA approche le plafond micro-entrepreneur. Au-del&agrave; de {fmtEur(plafondMicro)}, vous sortirez du r&eacute;gime micro.
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Annual summary table */}
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>P&eacute;riode</TableHead>
                    <TableHead className="text-right">CA HT</TableHead>
                    <TableHead className="text-right">Cotisations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {annualData.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="text-sm">{row.label}</TableCell>
                      <TableCell className="text-right text-sm">{fmtEur(row.ca)}</TableCell>
                      <TableCell className="text-right text-sm">{fmtEur(row.cotisations + row.cfp)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{fmtEur(annualTotal)}</TableCell>
                    <TableCell className="text-right">
                      {fmtEur(annualData.reduce((s, r) => s + r.cotisations + r.cfp, 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Declarations history */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des d&eacute;clarations</CardTitle>
        </CardHeader>
        <CardContent>
          {declarations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune d&eacute;claration enregistr&eacute;e. Utilisez le calculateur ci-dessus puis cliquez &laquo; Enregistrer &raquo;.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>P&eacute;riode</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">CA HT</TableHead>
                  <TableHead className="text-right">Cotisations</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {declarations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.periode_label}</TableCell>
                    <TableCell className="text-sm capitalize">{d.periode_type}</TableCell>
                    <TableCell className="text-right">{fmtEur(Number(d.ca_ht))}</TableCell>
                    <TableCell className="text-right">{fmtEur(Number(d.cotisations) + Number(d.cfp))}</TableCell>
                    <TableCell>
                      {d.statut === "declare" ? (
                        <Badge className="bg-green-100 text-green-700">D&eacute;clar&eacute;</Badge>
                      ) : (
                        <Badge variant="secondary">A d&eacute;clarer</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {d.statut === "a_declarer" && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkDeclared(d.id)}>
                          <Check className="mr-1 h-3 w-3" />
                          D&eacute;clar&eacute;
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
