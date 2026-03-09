"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LayoutTemplate, Loader2 } from "lucide-react";
import { formatCurrency, calculateItemTotal } from "@/lib/utils/quote";
import { getUserTemplates, useTemplate } from "@/app/(dashboard)/templates/actions";
import type { QuoteTemplate, QuoteTemplateItem, QuoteItemDraft } from "@/types";
import { toast } from "sonner";

interface TemplatePickerProps {
  onApply: (data: {
    items: QuoteItemDraft[];
    notes: string;
    validUntil: string;
  }) => void;
}

export function TemplatePicker({ onApply }: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getUserTemplates()
      .then(setTemplates)
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleSelect(template: QuoteTemplate) {
    setApplying(template.id);
    try {
      const tpl = await useTemplate(template.id);
      const tplItems: QuoteTemplateItem[] = Array.isArray(tpl.items) ? tpl.items : [];

      const items: QuoteItemDraft[] = tplItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: calculateItemTotal(item.quantity, item.unit_price),
      }));

      // Calculate valid_until from default_validity_days
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + (tpl.default_validity_days || 30));
      const validUntil = validDate.toISOString().split("T")[0];

      onApply({
        items: items.length > 0 ? items : [{ description: "", quantity: 1, unit_price: 0, total: 0 }],
        notes: tpl.default_notes || "",
        validUntil,
      });

      toast.success(`Template "${tpl.name}" appliqué`);
      setOpen(false);
    } catch {
      toast.error("Erreur lors de l'application");
    } finally {
      setApplying(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutTemplate className="mr-2 h-4 w-4" />
          Depuis un template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choisir un template</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Chargement...
          </div>
        ) : templates.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Aucun template disponible</p>
            <p className="mt-1 text-sm">
              Créez-en un depuis Templates dans le menu
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((tpl) => {
              const items = Array.isArray(tpl.items) ? tpl.items : [];
              const total = items.reduce(
                (sum, item) =>
                  sum + calculateItemTotal(item.quantity, item.unit_price),
                0
              );

              return (
                <button
                  key={tpl.id}
                  className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => handleSelect(tpl)}
                  disabled={applying !== null}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{tpl.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {items.length} ligne{items.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{tpl.description || "—"}</span>
                    <span className="font-medium">
                      {formatCurrency(total, "EUR")}
                    </span>
                  </div>
                  {applying === tpl.id && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Application...
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
