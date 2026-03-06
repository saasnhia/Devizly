"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils/quote";
import type { QuoteWithItems } from "@/types";
import { toast } from "sonner";

export default function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [quote, setQuote] = useState<QuoteWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuote() {
      const response = await fetch(`/api/quotes/share/${token}`);
      if (!response.ok) {
        setError("Ce devis est introuvable ou le lien est invalide.");
        setLoading(false);
        return;
      }
      const result = await response.json();
      setQuote(result.data);
      setLoading(false);
    }
    fetchQuote();
  }, [token]);

  async function handleRespond(action: "accepté" | "refusé") {
    setResponding(true);
    const response = await fetch(`/api/quotes/share/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Erreur");
      setResponding(false);
      return;
    }
    toast.success(
      action === "accepté" ? "Devis accepté !" : "Devis refusé."
    );
    setQuote((prev) => (prev ? { ...prev, status: action } : prev));
    setResponding(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">Devis introuvable</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || "Ce lien n'est plus valide."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = (quote.quote_items || []).sort(
    (a, b) => a.position - b.position
  );
  const tvaAmount =
    Number(quote.total_ttc) - Number(quote.total_ht);
  const alreadyResponded =
    quote.status === "accepté" || quote.status === "refusé";

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Devizly</span>
          </div>
          <Badge variant="secondary" className={getStatusColor(quote.status)}>
            {getStatusLabel(quote.status)}
          </Badge>
        </div>

        {/* Quote Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">{quote.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Devis n° DEV-{String(quote.number).padStart(4, "0")} —{" "}
                  {formatDate(quote.created_at)}
                </p>
              </div>
              {quote.valid_until && (
                <p className="text-sm text-muted-foreground">
                  Valide jusqu&apos;au {formatDate(quote.valid_until)}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Client info */}
            {quote.clients && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Client
                </p>
                <p className="font-medium">{quote.clients.name}</p>
                {quote.clients.email && (
                  <p className="text-sm text-muted-foreground">
                    {quote.clients.email}
                  </p>
                )}
                {quote.clients.address && (
                  <p className="text-sm text-muted-foreground">
                    {quote.clients.address}
                    {quote.clients.postal_code &&
                      `, ${quote.clients.postal_code}`}
                    {quote.clients.city && ` ${quote.clients.city}`}
                  </p>
                )}
              </div>
            )}

            {/* Items table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Description</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Prix unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.unit_price))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(item.total))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span>{formatCurrency(Number(quote.total_ht))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  TVA ({Number(quote.tva_rate)}%)
                </span>
                <span>{formatCurrency(tvaAmount)}</span>
              </div>
              {Number(quote.discount) > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Remise ({Number(quote.discount)}%)</span>
                  <span>incluse</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC</span>
                <span>{formatCurrency(Number(quote.total_ttc))}</span>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-line text-sm">
                  {quote.notes}
                </p>
              </div>
            )}

            <Separator />

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" disabled>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>

              {alreadyResponded ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border bg-slate-50 py-2 text-sm text-muted-foreground">
                  {quote.status === "accepté" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Devis accepté
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      Devis refusé
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleRespond("accepté")}
                    disabled={responding}
                  >
                    {responding ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Accepter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleRespond("refusé")}
                    disabled={responding}
                  >
                    {responding ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Refuser
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Propulsé par Devizly
        </p>
      </div>
    </div>
  );
}
