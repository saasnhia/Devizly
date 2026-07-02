"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils/quote";

export interface ScheduleStepDraft {
  label: string;
  percentage: number;
}

type PresetKey = "2fois" | "3fois_btp" | "custom";

const PRESETS: Record<Exclude<PresetKey, "custom">, ScheduleStepDraft[]> = {
  "2fois": [
    { label: "Acompte", percentage: 50 },
    { label: "Solde", percentage: 50 },
  ],
  "3fois_btp": [
    { label: "Acompte", percentage: 30 },
    { label: "Situation intermédiaire", percentage: 40 },
    { label: "Solde", percentage: 30 },
  ],
};

interface PaymentScheduleEditorProps {
  totalTtc: number;
  currency: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  preset: PresetKey;
  onPresetChange: (p: PresetKey) => void;
  steps: ScheduleStepDraft[];
  onStepsChange: (steps: ScheduleStepDraft[]) => void;
  retentionEnabled: boolean;
  onRetentionChange: (v: boolean) => void;
}

export function PaymentScheduleEditor({
  totalTtc,
  currency,
  enabled,
  onEnabledChange,
  preset,
  onPresetChange,
  steps,
  onStepsChange,
  retentionEnabled,
  onRetentionChange,
}: PaymentScheduleEditorProps) {
  const sumPct = Math.round(steps.reduce((s, st) => s + Number(st.percentage || 0), 0) * 100) / 100;
  const sumOk = sumPct === 100;
  const retentionAmount = retentionEnabled ? Math.round(totalTtc * 0.05 * 100) / 100 : 0;

  function applyPreset(key: Exclude<PresetKey, "custom">) {
    onPresetChange(key);
    onStepsChange(PRESETS[key].map((s) => ({ ...s })));
  }

  function amountForStep(index: number): number {
    let amount = Math.round((totalTtc * (Number(steps[index]?.percentage) || 0)) / 100 * 100) / 100;
    if (retentionEnabled && index === steps.length - 1) {
      amount = Math.round((amount - retentionAmount) * 100) / 100;
    }
    return amount;
  }

  function updateStep(index: number, field: keyof ScheduleStepDraft, value: string) {
    const updated = [...steps];
    const step = { ...updated[index] };
    if (field === "label") {
      step.label = value;
    } else {
      step.percentage = Number(value) || 0;
    }
    updated[index] = step;
    onStepsChange(updated);
  }

  function addStep() {
    onStepsChange([...steps, { label: `Étape ${steps.length + 1}`, percentage: 0 }]);
  }

  function removeStep(index: number) {
    onStepsChange(steps.filter((_, i) => i !== index));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-sm font-medium">Paiement en plusieurs fois</span>
            <p className="text-xs text-muted-foreground">
              Acompte, situations intermédiaires, solde — chaque étape génère sa propre facture.
            </p>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-gray-300 accent-primary"
          />
        </label>

        {enabled && (
          <>
            <Separator />

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={preset === "2fois" ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset("2fois")}
              >
                2 fois : 50% / 50%
              </Button>
              <Button
                type="button"
                variant={preset === "3fois_btp" ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset("3fois_btp")}
              >
                3 fois BTP : 30/40/30
              </Button>
              <Button
                type="button"
                variant={preset === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => onPresetChange("custom")}
              >
                Personnalisé
              </Button>
            </div>

            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    {idx === 0 && <Label className="text-xs">Label</Label>}
                    <Input
                      value={step.label}
                      onChange={(e) => updateStep(idx, "label", e.target.value)}
                      disabled={preset !== "custom"}
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    {idx === 0 && <Label className="text-xs">%</Label>}
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={step.percentage}
                      onChange={(e) => updateStep(idx, "percentage", e.target.value)}
                      disabled={preset !== "custom"}
                    />
                  </div>
                  <div className="w-28 space-y-1">
                    {idx === 0 && <Label className="text-xs">Montant</Label>}
                    <Input value={formatCurrency(amountForStep(idx), currency)} disabled className="bg-slate-50" />
                  </div>
                  {preset === "custom" && steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(idx)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {preset === "custom" && (
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={addStep}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une étape
              </Button>
            )}

            <p className={`text-xs ${sumOk ? "text-muted-foreground" : "font-medium text-red-600"}`}>
              Total : {sumPct}%{!sumOk && " — la somme doit être égale à 100%"}
            </p>

            <Separator />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={retentionEnabled}
                onChange={(e) => onRetentionChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-primary"
              />
              <span>
                <span className="text-sm font-medium">Retenue de garantie 5%</span>
                <p className="text-xs text-muted-foreground">
                  Conformément au décret n°72-388 du 22 mai 1972. Le montant de la
                  dernière étape est réduit de 5% — ce montant sera facturé
                  séparément après 1 an.
                </p>
              </span>
            </label>
          </>
        )}
      </CardContent>
    </Card>
  );
}
