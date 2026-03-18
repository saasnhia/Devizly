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
  Calculator,
  Copy,
  Check,
  ExternalLink,
  Download,
  Loader2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import type { UrssafDeclaration, UrssafActiviteType } from "@/types";

// ── Constants ──────────────────────────────────────────────

const TAUX_COTISATIONS: Record<UrssafActiviteType, { label: string; taux: number; cfp: number }> = {
  vente_marchandises: { label: "Vente de marchandises", taux: 12.3, cfp: 0.1 },
  prestations_bic: { label: "Prestations de services (BIC)", taux: 21.2, cfp: 0.3 },
  prestations_bnc: { label: "Prestations de services (BNC)", taux: 21.1, cfp: 0.2 },
  liberale_cipav: { label: "Activit\u00e9 lib\u00e9rale (CIPAV)", taux: 21.1, cfp: 0.2 },
};

const SEUILS_TVA: Record<string, number> = {
  vente_marchandises: 85000,
  prestations_bic: 37500,
  prestations_bnc: 37500,
  liberale_cipav: 37500,
};

const MONTHS_FR = [
  "Janvier", "F\u00e9vrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Ao\u00fbt", "Septembre", "Octobre", "Novembre", "D\u00e9cembre",
];

function fmtEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
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

  // Annual summary
  const [annualData, setAnnualData] = useState<{ label: string; ca: number; cotisations: number; cfp: number }[]>([]);
  const [annualTotal, setAnnualTotal] = useState(0);

  // Declarations history
  const [declarations, setDeclarations] = useState<UrssafDeclaration[]>([]);

  // ── Computed values ──
  const config = TAUX_COTISATIONS[activite];
  const cotisations = Math.round(caHt * config.taux) / 100;
  const cfp = Math.round(caHt * config.cfp) / 100;
  const totalDu = cotisations + cfp;
  const seuilTva = SEUILS_TVA[activite];
  const seuilPct = annualTotal > 0 ? Math.min(100, Math.round((annualTotal / seuilTva) * 100)) : 0;

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
    const { start, end } = getPeriodBounds();

    // Paid invoices in period
    const { data: invoices } = await supabase
      .from("invoices")
      .select("amount")
      .eq("status", "paid")
      .gte("paid_at", start)
      .lte("paid_at", end + "T23:59:59");

    // Also paid quotes without invoices
    const { data: paidQuotes } = await supabase
      .from("quotes")
      .select("total_ht")
      .eq("status", "pay\u00e9")
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
      supabase.from("invoices").select("amount, paid_at").eq("status", "paid")
        .gte("paid_at", startYear).lte("paid_at", endYear),
      supabase.from("quotes").select("total_ht, paid_at").eq("status", "pay\u00e9")
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
      return {
        label: p.label,
        ca,
        cotisations: Math.round(ca * config.taux) / 100,
        cfp: Math.round(ca * config.cfp) / 100,
      };
    });
    setAnnualData(result);
    setAnnualTotal(result.reduce((s, r) => s + r.ca, 0));
  }, [year, periodeType, config.taux, config.cfp]);

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

  useEffect(() => { fetchCA(); }, [fetchCA]);
  useEffect(() => { fetchAnnualSummary(); }, [fetchAnnualSummary]);
  useEffect(() => { fetchDeclarations(); }, [fetchDeclarations]);

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
      toast.success("D\u00e9claration enregistr\u00e9e");
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
    toast.success("Marqu\u00e9 comme d\u00e9clar\u00e9");
    fetchDeclarations();
  }

  function handleCopyCA() {
    navigator.clipboard.writeText(caHt.toFixed(2).replace(".", ","));
    setCopied(true);
    toast.success("Montant CA copi\u00e9 dans le presse-papiers");
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Years list ──
  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - 2 + i));

  return (
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
          <Select value={periodeType} onValueChange={(v) => setPeriodeType(v as "mensuelle" | "trimestrielle")}>
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
                    CA HT de la p&eacute;riode ({getPeriodBounds().label})
                  </p>
                  <p className="text-3xl font-bold mt-1">{fmtEur(caHt)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Factures et devis pay&eacute;s
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cotisations sociales ({config.taux}%)</span>
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

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleCopyCA} variant="outline" className="flex-1">
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copi\u00e9 !" : "Copier le CA"}
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

        {/* Right: TVA threshold */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Seuil franchise TVA {year}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CA annuel cumul&eacute;</span>
                <span className="font-medium">{fmtEur(annualTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seuil TVA</span>
                <span className="font-medium">{fmtEur(seuilTva)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    seuilPct >= 90 ? "bg-red-500" : seuilPct >= 70 ? "bg-orange-400" : "bg-primary"
                  }`}
                  style={{ width: `${seuilPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">{seuilPct}% du seuil</p>
            </div>

            {seuilPct >= 90 && (
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
  );
}
