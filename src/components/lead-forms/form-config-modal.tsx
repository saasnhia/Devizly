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
import type { LeadForm, LeadFormFields } from "@/types";
import { toast } from "sonner";

const DEFAULT_FIELDS: LeadFormFields = {
  name: true,
  email: true,
  phone: false,
  company: false,
  project_type: false,
  budget_range: false,
  message: true,
  deadline: false,
};

const FIELD_LABELS: Record<keyof LeadFormFields, string> = {
  name: "Nom",
  email: "Email",
  phone: "Téléphone",
  company: "Entreprise",
  project_type: "Type de projet",
  budget_range: "Budget",
  message: "Message",
  deadline: "Date limite",
};

const PIPELINE_STAGES = [
  { label: "Nouveau", value: "nouveau" },
  { label: "Contacté", value: "contacté" },
  { label: "Qualifié", value: "qualifié" },
];

interface FormConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form?: LeadForm | null;
  onSave: (data: {
    name: string;
    title: string;
    subtitle: string;
    button_text: string;
    accent_color: string;
    fields: LeadFormFields;
    auto_pipeline_stage: string;
    notification_email: string | null;
    redirect_url: string | null;
  }) => Promise<void>;
}

export function FormConfigModal({
  open,
  onOpenChange,
  form,
  onSave,
}: FormConfigModalProps) {
  const [tab, setTab] = useState<"fields" | "appearance" | "settings">(
    "fields"
  );
  const [name, setName] = useState(form?.name || "Mon formulaire");
  const [title, setTitle] = useState(form?.title || "Demande de devis");
  const [subtitle, setSubtitle] = useState(
    form?.subtitle || "Répondez sous 24h"
  );
  const [buttonText, setButtonText] = useState(
    form?.button_text || "Envoyer ma demande"
  );
  const [accentColor, setAccentColor] = useState(
    form?.accent_color || "#7c3aed"
  );
  const [fields, setFields] = useState<LeadFormFields>(
    (form?.fields as LeadFormFields) || { ...DEFAULT_FIELDS }
  );
  const [pipelineStage, setPipelineStage] = useState(
    form?.auto_pipeline_stage || "nouveau"
  );
  const [notifEmail, setNotifEmail] = useState(
    form?.notification_email || ""
  );
  const [redirectUrl, setRedirectUrl] = useState(form?.redirect_url || "");
  const [saving, setSaving] = useState(false);

  function toggleField(key: keyof LeadFormFields) {
    if (key === "name" || key === "email") return; // required
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        button_text: buttonText.trim(),
        accent_color: accentColor,
        fields,
        auto_pipeline_stage: pipelineStage,
        notification_email: notifEmail.trim() || null,
        redirect_url: redirectUrl.trim() || null,
      });
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "fields" as const, label: "Champs" },
    { id: "appearance" as const, label: "Apparence" },
    { id: "settings" as const, label: "Paramètres" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {form ? "Modifier le formulaire" : "Nouveau formulaire"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nom du formulaire</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon formulaire"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b pb-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Fields */}
          {tab === "fields" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Activez ou désactivez les champs du formulaire
              </p>
              {(Object.keys(FIELD_LABELS) as (keyof LeadFormFields)[]).map(
                (key) => {
                  const isRequired = key === "name" || key === "email";
                  return (
                    <label
                      key={key}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <span className="font-medium">
                          {FIELD_LABELS[key]}
                        </span>
                        {isRequired && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (obligatoire)
                          </span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={fields[key]}
                        disabled={isRequired}
                        onChange={() => toggleField(key)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                    </label>
                  );
                }
              )}
            </div>
          )}

          {/* Tab: Appearance */}
          {tab === "appearance" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titre du formulaire</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sous-titre</Label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Texte du bouton</Label>
                <Input
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Couleur d&apos;accent</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-32"
                    placeholder="#7c3aed"
                  />
                </div>
              </div>

              {/* Live preview */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="mb-1 text-xs text-muted-foreground uppercase">
                  Aperçu
                </p>
                <h3 className="text-lg font-bold">{title || "Titre"}</h3>
                <p className="text-sm text-muted-foreground">
                  {subtitle || "Sous-titre"}
                </p>
                <div className="mt-4 space-y-2">
                  {(
                    Object.entries(fields) as [keyof LeadFormFields, boolean][]
                  )
                    .filter(([, enabled]) => enabled)
                    .map(([key]) => (
                      <div
                        key={key}
                        className="h-9 rounded-md border bg-slate-50 px-3 flex items-center text-sm text-muted-foreground"
                      >
                        {FIELD_LABELS[key]}
                      </div>
                    ))}
                </div>
                <button
                  className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {buttonText || "Envoyer"}
                </button>
              </div>
            </div>
          )}

          {/* Tab: Settings */}
          {tab === "settings" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Stage pipeline de destination</Label>
                <Select
                  value={pipelineStage}
                  onValueChange={setPipelineStage}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email de notification</Label>
                <Input
                  type="email"
                  value={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.value)}
                  placeholder="vous@entreprise.com"
                />
                <p className="text-xs text-muted-foreground">
                  Recevez un email à chaque nouveau lead
                </p>
              </div>
              <div className="space-y-2">
                <Label>URL de redirection</Label>
                <Input
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://monsite.com/merci"
                />
                <p className="text-xs text-muted-foreground">
                  Redirige le visiteur après soumission (optionnel)
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {form ? "Enregistrer" : "Créer le formulaire"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
