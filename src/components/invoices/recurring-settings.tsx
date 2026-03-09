"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface RecurringSettingsProps {
  quoteId: string;
  isRecurring: boolean;
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
  nextDate: string | null;
  invoiceCount: number;
}

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Mensuelle",
  quarterly: "Trimestrielle",
  yearly: "Annuelle",
};

function computeNextPreview(startDate: string, frequency: string): string {
  const d = new Date(startDate);
  switch (frequency) {
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function RecurringSettings({
  quoteId,
  isRecurring: initialRecurring,
  frequency: initialFrequency,
  startDate: initialStartDate,
  endDate: initialEndDate,
  nextDate,
  invoiceCount,
}: RecurringSettingsProps) {
  const [enabled, setEnabled] = useState(initialRecurring);
  const [frequency, setFrequency] = useState(initialFrequency || "monthly");
  const [startDate, setStartDate] = useState(
    initialStartDate || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(initialEndDate || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/recurring`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isRecurring: enabled,
          frequency: enabled ? frequency : undefined,
          startDate: enabled ? startDate : undefined,
          endDate: enabled && endDate ? endDate : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }

      toast.success(
        enabled
          ? "Facturation récurrente activée"
          : "Facturation récurrente désactivée"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Facturation récurrente</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="recurring-toggle">Activer la récurrence</Label>
          <button
            id="recurring-toggle"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? "bg-primary" : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {enabled && (
          <>
            {/* Frequency */}
            <div>
              <Label>Fréquence</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuelle</SelectItem>
                  <SelectItem value="quarterly">Trimestrielle</SelectItem>
                  <SelectItem value="yearly">Annuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start date */}
            <div>
              <Label htmlFor="start-date">Date de début</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* End date (optional) */}
            <div>
              <Label htmlFor="end-date">Date de fin (optionnel)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Preview */}
            {startDate && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="text-muted-foreground">
                  Prochaine facture le{" "}
                  <span className="font-medium text-foreground">
                    {nextDate
                      ? new Date(nextDate).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : computeNextPreview(startDate, frequency)}
                  </span>
                </p>
                {invoiceCount > 0 && (
                  <p className="mt-1 text-muted-foreground">
                    {invoiceCount} facture{invoiceCount > 1 ? "s" : ""} générée
                    {invoiceCount > 1 ? "s" : ""}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Fréquence : {FREQUENCY_LABELS[frequency] || frequency}
                </p>
              </div>
            )}
          </>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
  );
}
