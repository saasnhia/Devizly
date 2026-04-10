"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Copy, ExternalLink, Download, FileText, FileCheck, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  checkoutUrl: string | null;
  facturxPdfPath: string | null;
  paStatus: string | null;
  pennylaneConnected: boolean;
}

export function InvoiceActions({
  invoiceId,
  status,
  checkoutUrl,
  facturxPdfPath,
  paStatus,
  pennylaneConnected,
}: InvoiceActionsProps) {
  const [sending, setSending] = useState(false);
  const [facturxLoading, setFacturxLoading] = useState(false);
  const [hasFacturx, setHasFacturx] = useState(!!facturxPdfPath);
  const [pennylaneLoading, setPennylaneLoading] = useState(false);
  const [currentPaStatus, setCurrentPaStatus] = useState(paStatus);

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

      {(status === "draft" || status === "sent") && (
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
