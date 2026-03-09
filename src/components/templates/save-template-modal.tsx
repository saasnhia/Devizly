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
import { Loader2 } from "lucide-react";
import { createTemplateFromQuote } from "@/app/(dashboard)/templates/actions";
import { toast } from "sonner";

const CATEGORIES = [
  { label: "Général", value: "general" },
  { label: "Web", value: "web" },
  { label: "Design", value: "design" },
  { label: "Conseil", value: "conseil" },
  { label: "Artisan", value: "artisan" },
  { label: "Autre", value: "autre" },
];

interface SaveTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  quoteTitle: string;
}

export function SaveTemplateModal({
  open,
  onOpenChange,
  quoteId,
  quoteTitle,
}: SaveTemplateModalProps) {
  const [name, setName] = useState(quoteTitle);
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSaving(true);
    try {
      await createTemplateFromQuote(quoteId, name.trim(), category);
      toast.success("Template créé depuis le devis");
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sauvegarder comme template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nom du template</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du template..."
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
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
