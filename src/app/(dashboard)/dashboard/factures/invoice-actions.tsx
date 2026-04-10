"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Copy, ExternalLink, Download, FileText, FileCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  checkoutUrl: string | null;
  facturxPdfPath: string | null;
}

export function InvoiceActions({
  invoiceId,
  status,
  checkoutUrl,
  facturxPdfPath,
}: InvoiceActionsProps) {
  const [sending, setSending] = useState(false);
  const [facturxLoading, setFacturxLoading] = useState(false);
  const [hasFacturx, setHasFacturx] = useState(!!facturxPdfPath);

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
