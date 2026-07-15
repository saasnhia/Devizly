"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Copy, ExternalLink, Download, FileText, FileCheck, Loader2, AlertTriangle, Undo2, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { superpdpStatusLabel } from "@/lib/superpdp/status-codes";

const REFUND_REASONS = [
  "Chantier annulé",
  "Litige client",
  "Erreur de facturation",
  "Autre",
];

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  amount: number;
  currency: string;
  refundedAmount: number;
  checkoutUrl: string | null;
  facturxPdfPath: string | null;
  paStatus: string | null;
  pennylaneConnected: boolean;
  superpdpStatus: string | null;
  superpdpLifecycleCode: string | null;
  superpdpError: string | null;
  escrowStatus: string | null;
  escrowReleasedAt: string | null;
}

export function InvoiceActions({
  invoiceId,
  status,
  amount,
  currency,
  refundedAmount,
  checkoutUrl,
  facturxPdfPath,
  paStatus,
  pennylaneConnected,
  superpdpStatus,
  superpdpLifecycleCode,
  superpdpError,
  escrowStatus,
  escrowReleasedAt,
}: InvoiceActionsProps) {
  const [sending, setSending] = useState(false);
  const [facturxLoading, setFacturxLoading] = useState(false);
  const [hasFacturx, setHasFacturx] = useState(!!facturxPdfPath);
  const [pennylaneLoading, setPennylaneLoading] = useState(false);
  const [currentPaStatus, setCurrentPaStatus] = useState(paStatus);
  const [superpdpLoading, setSuperpdpLoading] = useState(false);
  const [superpdpRefreshing, setSuperpdpRefreshing] = useState(false);
  const [currentSuperpdpStatus, setCurrentSuperpdpStatus] = useState(superpdpStatus);
  const [currentSuperpdpCode, setCurrentSuperpdpCode] = useState(superpdpLifecycleCode);
  const [currentSuperpdpError, setCurrentSuperpdpError] = useState(superpdpError);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentRefundedAmount, setCurrentRefundedAmount] = useState(refundedAmount);

  const remainingAmount = Math.round((amount - currentRefundedAmount) * 100) / 100;

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState(String(remainingAmount));
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  const [currentEscrowStatus, setCurrentEscrowStatus] = useState(escrowStatus);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [disputeLoading, setDisputeLoading] = useState(false);

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur envoi");
      }

      toast.success("Facture envoyée par email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur envoi");
    } finally {
      setSending(false);
    }
  }

  function handleCopyLink() {
    if (checkoutUrl) {
      navigator.clipboard.writeText(checkoutUrl);
      toast.success("Lien de paiement copié");
    }
  }

  async function handleFacturx() {
    setFacturxLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/generate-facturx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.detail || "Erreur génération");
      }
      window.open(data.download_url, "_blank");
      setHasFacturx(true);
      toast.success("Factur-X généré avec succès");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la génération Factur-X"
      );
    } finally {
      setFacturxLoading(false);
    }
  }

  async function handlePennylane() {
    setPennylaneLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/push-pennylane`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.detail || "Erreur Pennylane");
      }
      setCurrentPaStatus("sent");
      if (data.pennylane_url) {
        window.open(data.pennylane_url, "_blank");
      }
      toast.success("Facture envoyée à Pennylane");
    } catch (err) {
      setCurrentPaStatus("error");
      toast.error(
        err instanceof Error ? err.message : "Erreur envoi Pennylane"
      );
    } finally {
      setPennylaneLoading(false);
    }
  }

  async function handleSuperpdp() {
    setSuperpdpLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-superpdp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.detail || "Erreur SUPER PDP");
      }
      setCurrentSuperpdpStatus("sent");
      setCurrentSuperpdpError(null);
      toast.success(
        data.already_sent ? "Facture déjà transmise à SUPER PDP" : "Facture transmise à SUPER PDP"
      );
    } catch (err) {
      setCurrentSuperpdpStatus("error");
      const msg = err instanceof Error ? err.message : "Erreur envoi SUPER PDP";
      setCurrentSuperpdpError(msg);
      toast.error(msg);
    } finally {
      setSuperpdpLoading(false);
    }
  }

  async function handleSuperpdpRefresh() {
    setSuperpdpRefreshing(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/superpdp-refresh`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la synchronisation");
      }
      if (data.transmission) {
        setCurrentSuperpdpStatus(data.transmission.status);
        setCurrentSuperpdpError(data.transmission.error_message);
      }
      if (data.latest_event) {
        setCurrentSuperpdpCode(data.latest_event.status_code);
      }
      toast.success("Statut SUPER PDP synchronisé");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de synchronisation");
    } finally {
      setSuperpdpRefreshing(false);
    }
  }

  async function handleRefund() {
    const parsedAmount = parseFloat(refundAmount);
    if (!refundReason) {
      toast.error("Sélectionnez un motif de remboursement");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Montant invalide");
      return;
    }

    setRefundLoading(true);
    try {
      const isFull = Math.round(parsedAmount * 100) === Math.round(remainingAmount * 100);
      const res = await fetch(`/api/invoices/${invoiceId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: refundReason,
          ...(isFull ? {} : { amount: parsedAmount }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du remboursement");
      }
      setCurrentStatus(data.status);
      setCurrentRefundedAmount(data.refunded_amount);
      setRefundOpen(false);
      toast.success(
        data.status === "refunded" ? "Facture remboursée" : "Remboursement partiel effectué"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du remboursement");
    } finally {
      setRefundLoading(false);
    }
  }

  async function handleReleaseEscrow() {
    setReleaseLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/release-escrow`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la libération des fonds");
      }
      setCurrentEscrowStatus("released");
      setReleaseOpen(false);
      toast.success("Fonds libérés — transfert en cours vers votre compte Stripe");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la libération des fonds");
    } finally {
      setReleaseLoading(false);
    }
  }

  async function handleDisputeEscrow() {
    setDisputeLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/dispute-escrow`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du signalement");
      }
      setCurrentEscrowStatus("disputed");
      toast.success("Litige signalé — les fonds restent bloqués");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du signalement");
    } finally {
      setDisputeLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        asChild
        title="Télécharger PDF"
      >
        <a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noopener noreferrer">
          <Download className="mr-1 h-3 w-3" />
          PDF
        </a>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={handleFacturx}
        disabled={facturxLoading}
        title={hasFacturx ? "Télécharger Factur-X" : "Générer Factur-X"}
      >
        {facturxLoading ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ...
          </>
        ) : hasFacturx ? (
          <>
            <FileCheck className="mr-1 h-3 w-3 text-green-500" />
            FX
          </>
        ) : (
          <>
            <FileText className="mr-1 h-3 w-3 text-violet-500" />
            FX
          </>
        )}
      </Button>

      {hasFacturx && pennylaneConnected && currentPaStatus !== "sent" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handlePennylane}
          disabled={pennylaneLoading}
          title={currentPaStatus === "error" ? "Réessayer Pennylane" : "Envoyer à Pennylane"}
        >
          {pennylaneLoading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ...
            </>
          ) : currentPaStatus === "error" ? (
            <>
              <AlertTriangle className="mr-1 h-3 w-3 text-red-500" />
              PA
            </>
          ) : (
            <>
              <Send className="mr-1 h-3 w-3 text-violet-500" />
              PA
            </>
          )}
        </Button>
      )}

      {hasFacturx && currentPaStatus === "sent" && (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
          PA ✓
        </span>
      )}

      {hasFacturx && currentSuperpdpStatus !== "sent" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleSuperpdp}
          disabled={superpdpLoading}
          title={
            currentSuperpdpStatus === "error"
              ? `Réessayer SUPER PDP${currentSuperpdpError ? ` — ${currentSuperpdpError}` : ""}`
              : "Transmettre la facture via SUPER PDP"
          }
        >
          {superpdpLoading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ...
            </>
          ) : currentSuperpdpStatus === "error" ? (
            <>
              <AlertTriangle className="mr-1 h-3 w-3 text-red-500" />
              SUPER PDP
            </>
          ) : (
            <>
              <Send className="mr-1 h-3 w-3 text-emerald-500" />
              SUPER PDP
            </>
          )}
        </Button>
      )}

      {hasFacturx && currentSuperpdpStatus === "sent" && (
        <div className="flex items-center gap-1">
          <span
            className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
            title={currentSuperpdpCode ? undefined : "Transmise — en attente de statut"}
          >
            {currentSuperpdpCode ? superpdpStatusLabel(currentSuperpdpCode) : "Transmise"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={handleSuperpdpRefresh}
            disabled={superpdpRefreshing}
            title="Rafraîchir le statut SUPER PDP"
          >
            <RefreshCw className={`h-3 w-3 ${superpdpRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      )}

      {(currentStatus === "draft" || currentStatus === "sent") && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleSend}
          disabled={sending}
          title="Envoyer par email"
        >
          <Send className="mr-1 h-3 w-3" />
          {sending ? "..." : "Envoyer"}
        </Button>
      )}

      {(currentStatus === "paid" || currentStatus === "partially_refunded") && (
        <Dialog
          open={refundOpen}
          onOpenChange={(open) => {
            setRefundOpen(open);
            if (open) {
              setRefundAmount(String(remainingAmount));
              setRefundReason("");
            }
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
            onClick={() => setRefundOpen(true)}
            title="Rembourser"
          >
            <Undo2 className="mr-1 h-3 w-3" />
            Rembourser
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rembourser la facture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Montant à rembourser</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0.01"
                    max={remainingAmount}
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {currency}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total facture : {amount} {currency}
                  {currentRefundedAmount > 0 && ` — déjà remboursé : ${currentRefundedAmount} ${currency} — reste : ${remainingAmount} ${currency}`}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Motif du remboursement</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un motif" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFUND_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <p className="text-xs text-red-700">
                  Cette action est irréversible. Le montant sera recrédité au
                  client sous 5 à 10 jours ouvrés.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setRefundOpen(false)}
                  disabled={refundLoading}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleRefund}
                  disabled={refundLoading}
                >
                  {refundLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Confirmer le remboursement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {currentEscrowStatus === "held" && (
        <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700"
            onClick={() => setReleaseOpen(true)}
            title="Confirmer la livraison et libérer les fonds"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            Libérer
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
            onClick={handleDisputeEscrow}
            disabled={disputeLoading}
            title="Signaler un litige"
          >
            {disputeLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ShieldAlert className="h-3 w-3" />
            )}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la livraison</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {amount} {currency} seront transférés sur votre compte Stripe.
              </p>
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Les fonds seront transférés sur votre compte Stripe sous 2 à
                  7 jours ouvrés. Cette action est irréversible.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setReleaseOpen(false)}
                  disabled={releaseLoading}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleReleaseEscrow}
                  disabled={releaseLoading}
                >
                  {releaseLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Confirmer et libérer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {currentEscrowStatus === "disputed" && (
        <span
          className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700"
          title="Litige signalé — contactez le support pour résoudre"
        >
          Litige en cours
        </span>
      )}

      {currentEscrowStatus === "released" && escrowReleasedAt && (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
          Libéré le {new Date(escrowReleasedAt).toLocaleDateString("fr-FR")}
        </span>
      )}

      {checkoutUrl && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleCopyLink}
            title="Copier le lien de paiement"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            asChild
            title="Ouvrir le lien de paiement"
          >
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </>
      )}
    </div>
  );
}
