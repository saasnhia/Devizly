"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Globe,
  Download,
  Loader2,
  CheckCircle2,
  Zap,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface EReportingRow {
  id: string;
  invoice_id: string;
  client_type: "b2b" | "b2c" | "international";
  transaction_date: string;
  total_ht: number;
  total_vat: number;
  total_ttc: number;
  vat_rate: number | null;
  payment_date: string | null;
  payment_amount: number | null;
  reporting_status: "pending" | "sent" | "error";
  sent_at: string | null;
  invoices: { invoice_number: string; clients: { name: string } | null } | null;
}

function fmtEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function EReportingPage() {
  const [rows, setRows] = useState<EReportingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/e-reporting");
      const json = await res.json();
      if (res.ok) setRows(json.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // B2B rows are already covered by Factur-X/PDP — e-reporting only
  // concerns B2C and international sales.
  const reportable = rows.filter((r) => r.client_type !== "b2b");
  const pending = reportable.filter((r) => r.reporting_status === "pending");
  const sent = reportable.filter((r) => r.reporting_status === "sent");
  const pendingTotal = pending.reduce((s, r) => s + Number(r.total_ttc), 0);

  async function handleExport(status: "pending" | "sent" | "all") {
    setExporting(true);
    try {
      const res = await fetch(`/api/e-reporting/export?status=${status}`);
      if (!res.ok) {
        toast.error("Erreur lors de l'export");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `e-reporting-${status}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé");
    } finally {
      setExporting(false);
    }
  }

  function renderRow(row: EReportingRow) {
    const clientLabel =
      row.client_type === "international" ? "International" : "B2C";
    return (
      <TableRow key={row.id}>
        <TableCell className="text-sm">{fmtDate(row.transaction_date)}</TableCell>
        <TableCell>
          <Badge variant={row.client_type === "international" ? "outline" : "secondary"}>
            {clientLabel}
          </Badge>
        </TableCell>
        <TableCell className="text-sm">
          {row.invoices?.invoice_number || "—"}
        </TableCell>
        <TableCell className="text-sm">
          {row.invoices?.clients?.name || "—"}
        </TableCell>
        <TableCell className="text-right text-sm">{fmtEur(Number(row.total_ht))}</TableCell>
        <TableCell className="text-right text-sm">{fmtEur(Number(row.total_ttc))}</TableCell>
        <TableCell>
          {row.reporting_status === "sent" ? (
            <Badge className="bg-green-100 text-green-700">Reporté</Badge>
          ) : (
            <Badge variant="secondary">En attente</Badge>
          )}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          E-reporting
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Transactions B2C et internationales à transmettre à l&apos;administration
          — distinct de la facturation électronique Factur-X (B2B).
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
        <Info className="h-5 w-5 shrink-0 text-sky-500 mt-0.5" />
        <p>
          L&apos;e-reporting concerne vos ventes à des particuliers (B2C) et à
          l&apos;international. Vos ventes B2B sont déjà couvertes par la
          facturation électronique Factur-X envoyée à votre plateforme agréée.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    En attente de reporting
                  </p>
                  <p className="text-2xl font-bold mt-1">{pending.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fmtEur(pendingTotal)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Déjà reportées
                  </p>
                  <p className="text-2xl font-bold mt-1">{sent.length}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={() => handleExport("pending")}
                  disabled={exporting || pending.length === 0}
                >
                  {exporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Exporter pour e-reporting
                </Button>
                <Button
                  variant="outline"
                  disabled
                  title="Envoi automatique via votre Plateforme Agréée — disponible dans une prochaine version"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Envoyer via Plateforme Agréée (bientôt)
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>En attente de reporting</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune transaction B2C/internationale en attente.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total HT</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{pending.map(renderRow)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Historique des transactions reportées
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sent.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune transaction reportée pour le moment.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total HT</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{sent.map(renderRow)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
