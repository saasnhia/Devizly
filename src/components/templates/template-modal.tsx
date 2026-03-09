"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { calculateItemTotal, formatCurrency } from "@/lib/utils/quote";
import type { QuoteTemplate, QuoteTemplateItem } from "@/types";
import { toast } from "sonner";

const CATEGORIES = [
  { label: "Général", value: "general" },
  { label: "Web", value: "web" },
  { label: "Design", value: "design" },
  { label: "Conseil", value: "conseil" },
  { label: "Artisan", value: "artisan" },
  { label: "Autre", value: "autre" },
];

const emptyItem: QuoteTemplateItem = {
  description: "",
  quantity: 1,
  unit_price: 0,
};

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: QuoteTemplate | null;
  onSave: (data: {
    name: string;
    description: string;
    category: string;
    items: QuoteTemplateItem[];
    default_validity_days: number;
    default_payment_terms: string;
    default_notes: string;
  }) => Promise<void>;
}

export function TemplateModal({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateModalProps) {
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [category, setCategory] = useState(template?.category || "general");
  const [items, setItems] = useState<QuoteTemplateItem[]>(
    template?.items && Array.isArray(template.items) && template.items.length > 0
      ? template.items
      : [{ ...emptyItem }]
  );
  const [validityDays, setValidityDays] = useState(
    String(template?.default_validity_days || 30)
  );
  const [paymentTerms, setPaymentTerms] = useState(
    template?.default_payment_terms || ""
  );
  const [notes, setNotes] = useState(template?.default_notes || "");
  const [saving, setSaving] = useState(false);

  function updateItem(
    index: number,
    field: keyof QuoteTemplateItem,
    value: string | number
  ) {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === "description") {
        item.description = value as string;
      } else if (field === "unit") {
        item.unit = value as string;
      } else {
        (item as Record<string, unknown>)[field] = Number(value) || 0;
      }
      updated[index] = item;
      return updated;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalEstimate = items.reduce(
    (sum, item) => sum + calculateItemTotal(item.quantity, item.unit_price),
    0
  );

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Le nom du template est requis");
      return;
    }
    if (!items.some((i) => i.description.trim())) {
      toast.error("Ajoutez au moins une ligne");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        category,
        items: items.filter((i) => i.description.trim()),
        default_validity_days: Number(validityDays) || 30,
        default_payment_terms: paymentTerms.trim(),
        default_notes: notes.trim(),
      });
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Modifier le template" : "Nouveau template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tpl-name">Nom du template *</Label>
              <Input
                id="tpl-name"
                placeholder="Ex: Développement web standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tpl-desc">Description courte</Label>
            <Input
              id="tpl-desc"
              placeholder="Description du template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Line items editor */}
          <div className="space-y-3">
            <Label>Lignes du devis</Label>
            {items.map((item, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Ligne {index + 1}</Badge>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Quantité</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Prix unitaire</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(index, "unit_price", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Total</Label>
                    <Input
                      value={formatCurrency(
                        calculateItemTotal(item.quantity, item.unit_price),
                        "EUR"
                      )}
                      disabled
                      className="bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une ligne
            </Button>

            <div className="text-right text-sm font-medium text-muted-foreground">
              Total estimé : {formatCurrency(totalEstimate, "EUR")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Validité par défaut (jours)</Label>
              <Input
                type="number"
                min="1"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conditions de paiement</Label>
            <Textarea
              placeholder="Ex: 30% d'acompte, solde à livraison"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes par défaut</Label>
            <Textarea
              placeholder="Notes et conditions pré-remplies..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder le template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
