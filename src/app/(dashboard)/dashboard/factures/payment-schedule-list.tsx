"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, FileText, Loader2, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/quote";
import { toast } from "sonner";

export interface ScheduleStep {
  id: string;
  label: string;
  percentage: number;
  amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  due_date: string | null;
  invoice_id: string | null;
  position: number;
}

export interface ScheduleGroup {
  quoteId: string;
  quoteTitle: string;
  currency: string;
  steps: ScheduleStep[];
}

function stepBadge(step: ScheduleStep) {
  if (step.status === "paid") {
    return <Badge className="bg-emerald-100 text-emerald-700">Payée</Badge>;
  }
  if (step.status === "cancelled") {
    return <Badge variant="secondary">Annulée</Badge>;
  }
  const isOverdue = step.due_date && new Date(step.due_date) < new Date();
  if (isOverdue) {
    return <Badge className="bg-red-100 text-red-700">En retard</Badge>;
  }
  if (step.invoice_id) {
    return <Badge className="bg-blue-50 text-blue-600">Facture envoyée</Badge>;
  }
  return <Badge variant="secondary">À facturer</Badge>;
}

function ScheduleGroupCard({ group }: { group: ScheduleGroup }) {
  const router = useRouter();
  const [invoicingStepId, setInvoicingStepId] = useState<string | null>(null);

  const totalAmount = group.steps.reduce((s, st) => s + st.amount, 0);
  const paidAmount = group.steps
    .filter((s) => s.status === "paid")
    .reduce((s, st) => s + st.amount, 0);
  const progressPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  async function handleInvoiceStep(stepId: string) {
    setInvoicingStepId(stepId);
    try {
      const res = await fetch(`/api/quotes/${group.quoteId}/schedule/${stepId}/invoice`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la facturation");
      }
      toast.success("Facture créée");
      if (data.invoice?.stripe_checkout_url) {
        window.open(data.invoice.stripe_checkout_url, "_blank");
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la facturation");
    } finally {
      setInvoicingStepId(null);
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium">{group.quoteTitle}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(paidAmount, group.currency)} / {formatCurrency(totalAmount, group.currency)}
        </p>
      </div>

      <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mt-3 space-y-2">
        {group.steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">
                {step.label} <span className="text-muted-foreground">({step.percentage}%)</span>
              </span>
              {stepBadge(step)}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-medium">{formatCurrency(step.amount, group.currency)}</span>
              {step.due_date && step.status === "pending" && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  échéance {formatDate(step.due_date)}
                </span>
              )}
              {step.status === "pending" && !step.invoice_id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleInvoiceStep(step.id)}
                  disabled={invoicingStepId === step.id}
                >
                  {invoicingStepId === step.id ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <FileText className="mr-1 h-3 w-3" />
                  )}
                  Facturer cette étape
                </Button>
              )}
              {step.status === "pending" && step.invoice_id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  asChild
                >
                  <a href={`/api/invoices/${step.invoice_id}/pdf`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaymentScheduleList({ groups }: { groups: ScheduleGroup[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Échéanciers de paiement BTP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group) => (
          <ScheduleGroupCard key={group.quoteId} group={group} />
        ))}
      </CardContent>
    </Card>
  );
}
