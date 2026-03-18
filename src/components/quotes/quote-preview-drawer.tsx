"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { calculateQuoteScore, type QuoteScore } from "@/lib/quote-scoring";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Copy,
  Share2,
  CheckCircle,
  Loader2,
  FileText,
  Send,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils/quote";
import type { QuoteWithItems } from "@/types";
import { toast } from "sonner";

interface QuotePreviewDrawerProps {
  quoteId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate?: (quoteId: string) => void;
}

export function QuotePreviewDrawer({
  quoteId,
  open,
  onOpenChange,
  onDuplicate,
}: QuotePreviewDrawerProps) {
  const [quote, setQuote] = useState<QuoteWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [clientQuotes, setClientQuotes] = useState<{ status: string; total_ttc: number }[]>([]);

  const fetchQuote = useCallback(async () => {
    if (!quoteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`);
      if (res.ok) {
        const json = await res.json();
        setQuote(json.data);
        if (json.data?.clients?.email) {
          setEmailTo(json.data.clients.email);
        }
        // Fetch client quote history for scoring
        if (json.data?.client_id) {
          const supabase = createClient();
          const { data: cq } = await supabase
            .from("quotes")
            .select("status, total_ttc")
            .eq("client_id", json.data.client_id);
          setClientQuotes((cq || []) as { status: string; total_ttc: number }[]);
        }
      } else {
        setQuote(null);
      }
    } catch {
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    if (open && quoteId) {
      fetchQuote();
    }
    if (!open) {
      setQuote(null);
      setShowEmailForm(false);
      setEmailMessage("");
    }
  }, [open, quoteId, fetchQuote]);

  async function handleDownloadPdf() {
    if (!quoteId) return;
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/pdf`);
      if (!res.ok) {
        toast.error("Erreur lors de la génération du PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devis-${quoteId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF téléchargé");
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleSendEmail() {
    if (!quote || !emailTo.trim()) {
      toast.error("Adresse email requise");
      return;
    }
    setEmailSending(true);
    try {
      const res = await fetch("/api/send-devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo,
          customMessage: emailMessage || undefined,
          devis: {
            id: quote.number,
            uuid: quote.id,
            client: quote.clients?.name || "Client",
            montant: Number(quote.total_ttc),
            titre: quote.title,
            share_token: quote.share_token,
            currency: quote.currency || "EUR",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l\u2019envoi");
        return;
      }
      toast.success("Email envoy\u00e9 avec succ\u00e8s");
      setShowEmailForm(false);
      setEmailMessage("");
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setEmailSending(false);
    }
  }

  function handleCopyLink() {
    if (!quote?.share_token) {
      toast.error("Ce devis n'a pas de lien de partage");
      return;
    }
    const url = `${window.location.origin}/devis/${quote.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papiers");
  }

  // Score computation
  const scoreData: QuoteScore | null = useMemo(() => {
    if (!quote || !["envoyé", "signé"].includes(quote.status)) return null;
    const signed = clientQuotes.filter((q) => ["signé", "accepté", "payé"].includes(q.status)).length;
    const amounts = clientQuotes.map((q) => Number(q.total_ttc));
    const avg = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : null;
    return calculateQuoteScore({
      status: quote.status,
      viewCount: quote.view_count || 0,
      viewedAt: quote.viewed_at,
      createdAt: quote.created_at,
      validUntil: quote.valid_until,
      depositPercent: quote.deposit_percent,
      totalTtc: Number(quote.total_ttc),
      clientSignedCount: signed,
      clientTotalCount: clientQuotes.length,
      clientAvgAmount: avg,
    });
  }, [quote, clientQuotes]);

  if (!quoteId) return null;

  const items = (quote?.quote_items || []).sort(
    (a, b) => a.position - b.position
  );
  const tvaAmount = quote
    ? Number(quote.total_ttc) - Number(quote.total_ht)
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Aperçu du devis
          </SheetTitle>
          <SheetDescription>
            Prévisualisation du devis tel que vu par le client
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !quote ? (
          <div className="py-20 text-center text-muted-foreground">
            Devis introuvable
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Télécharger PDF
              </Button>
              {quote.share_token && (
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Copier le lien
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onDuplicate(quote.id);
                    onOpenChange(false);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Dupliquer
                </Button>
              )}
              <Button
                variant={showEmailForm ? "default" : "outline"}
                size="sm"
                onClick={() => setShowEmailForm((v) => !v)}
              >
                <Send className="mr-2 h-4 w-4" />
                Envoyer par email
              </Button>
            </div>

            {/* Q6: Email send form */}
            {showEmailForm && (
              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Destinataire</label>
                  <Input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="client@exemple.fr"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Message personnalis&eacute; <span className="text-xs font-normal text-muted-foreground">(optionnel)</span>
                  </label>
                  <Textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Bonjour, veuillez trouver ci-joint notre devis..."
                    rows={3}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleSendEmail}
                  disabled={emailSending || !emailTo.trim()}
                  className="w-full"
                >
                  {emailSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Envoyer
                </Button>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{quote.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Devis n° DEV-{String(quote.number).padStart(4, "0")} —{" "}
                  {formatDate(quote.created_at)}
                </p>
                {quote.valid_until && (
                  <p className="text-sm text-muted-foreground">
                    Valide jusqu&apos;au {formatDate(quote.valid_until)}
                  </p>
                )}
              </div>
              <Badge
                variant="secondary"
                className={getStatusColor(quote.status)}
              >
                {getStatusLabel(quote.status)}
              </Badge>
            </div>

            {/* Score */}
            {scoreData && (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-4">
                  {/* Circular gauge */}
                  <div className="relative h-16 w-16 shrink-0">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={scoreData.level === "hot" ? "#22c55e" : scoreData.level === "warm" ? "#f97316" : "#ef4444"}
                        strokeWidth="3"
                        strokeDasharray={`${scoreData.score}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      {scoreData.score}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Score de signature{" "}
                      <Badge variant="secondary" className={
                        scoreData.level === "hot" ? "bg-green-100 text-green-700"
                          : scoreData.level === "warm" ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }>
                        {scoreData.level === "hot" ? "Chaud" : scoreData.level === "warm" ? "Ti\u00e8de" : "Froid"}
                      </Badge>
                    </p>
                    {scoreData.advice && (
                      <p className="text-xs text-primary mt-1">{scoreData.advice}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {scoreData.signals.map((s, i) => (
                    <p key={i} className={`text-xs ${s.positive ? "text-green-600" : "text-red-500"}`}>
                      {s.positive ? "+" : ""}{s.points} {s.label}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Client */}
            {quote.clients && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">
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

            {/* Items */}
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
                    <TableCell className="text-sm">{item.description}</TableCell>
                    <TableCell className="text-right text-sm">
                      {Number(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(
                        Number(item.unit_price),
                        quote.currency || "EUR"
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(
                        Number(item.total),
                        quote.currency || "EUR"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span>
                  {formatCurrency(
                    Number(quote.total_ht),
                    quote.currency || "EUR"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  TVA ({Number(quote.tva_rate)}%)
                </span>
                <span>
                  {formatCurrency(tvaAmount, quote.currency || "EUR")}
                </span>
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
                <span>
                  {formatCurrency(
                    Number(quote.total_ttc),
                    quote.currency || "EUR"
                  )}
                </span>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-line text-sm">
                  {quote.notes}
                </p>
              </div>
            )}

            {/* Payment terms */}
            {quote.payment_terms && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Conditions de paiement
                </p>
                <p className="mt-1 whitespace-pre-line text-sm">
                  {quote.payment_terms}
                </p>
              </div>
            )}

            {/* Signature */}
            {(quote.status === "signé" || quote.status === "payé") &&
              quote.signature_data && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-800">
                      Signé électroniquement
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-3">
                    <Image
                      src={quote.signature_data}
                      alt="Signature"
                      width={250}
                      height={100}
                      className="max-h-[100px] w-auto"
                      unoptimized
                    />
                  </div>
                  <div className="mt-3 flex flex-col gap-0.5 text-sm text-green-700">
                    <p>
                      Signé par : <strong>{quote.signer_name}</strong>
                    </p>
                    {quote.signed_at && (
                      <p>Le {formatDate(quote.signed_at)}</p>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
