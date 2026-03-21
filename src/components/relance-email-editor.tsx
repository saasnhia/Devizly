"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Eye,
  Send,
  Mail,
  Loader2,
  RotateCcw,
  Save,
  Check,
  Lock,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  subject: string;
  body: string;
}

interface Templates {
  j2: EmailTemplate;
  j5: EmailTemplate;
  j7: EmailTemplate;
}

const TABS = [
  { key: "j2" as const, label: "J+2", title: "Rappel consultation", icon: Eye, color: "text-emerald-600 bg-emerald-50" },
  { key: "j5" as const, label: "J+5", title: "Relance signature", icon: Send, color: "text-blue-600 bg-blue-50" },
  { key: "j7" as const, label: "J+7", title: "Proposition acompte", icon: Mail, color: "text-violet-600 bg-violet-50" },
];

const VARIABLES = [
  { var: "{client_name}", example: "Marie Petit" },
  { var: "{devis_id}", example: "DEV-0012" },
  { var: "{montant_ttc}", example: "8 160,00 €" },
  { var: "{date_envoi}", example: "15 mars 2026" },
  { var: "{votre_nom}", example: "Votre Nom" },
];

function replaceVars(text: string): string {
  return text
    .replace(/\{client_name\}/g, "Marie Petit")
    .replace(/\{devis_id\}/g, "DEV-0012")
    .replace(/\{montant_ttc\}/g, "8 160,00 €")
    .replace(/\{date_envoi\}/g, "15 mars 2026")
    .replace(/\{votre_nom\}/g, "Devizly Demo");
}

export function RelanceEmailEditor({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [templates, setTemplates] = useState<Templates | null>(null);
  const [defaults, setDefaults] = useState<Templates | null>(null);
  const [plan, setPlan] = useState("free");
  const [activeTab, setActiveTab] = useState<"j2" | "j5" | "j7">("j2");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/settings/relance-templates");
        const data = await res.json();
        setTemplates(data.templates);
        setDefaults(data.defaults);
        setPlan(data.plan);
      } catch {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [open]);

  const autoSave = useCallback(async (tpl: Templates) => {
    if (plan === "free") return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/relance-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates: tpl }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  }, [plan]);

  function updateField(tab: "j2" | "j5" | "j7", field: "subject" | "body", value: string) {
    if (!templates) return;
    const updated = {
      ...templates,
      [tab]: { ...templates[tab], [field]: value },
    };
    setTemplates(updated);
    // Debounced auto-save
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(updated), 1000);
  }

  function resetToDefaults() {
    if (!defaults) return;
    setTemplates({ ...defaults });
    autoSave({ ...defaults });
    toast.success("Templates restaurés par défaut");
  }

  const isPro = plan !== "free";
  const current = templates?.[activeTab];
  const tab = TABS.find((t) => t.key === activeTab)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-violet-500" />
            Personnaliser les emails de relance
            {!isPro && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Lock className="mr-1 h-3 w-3" />
                Pro requis
              </Badge>
            )}
            {saving && (
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Sauvegarde...
              </span>
            )}
            {saved && (
              <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600">
                <Check className="h-3 w-3" />
                Sauvegardé
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === t.key
                      ? "bg-violet-100 text-violet-700"
                      : "text-muted-foreground hover:bg-slate-100"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label} — {t.title}
                </button>
              ))}
            </div>

            {/* Editor + Preview */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Editor */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Objet de l&apos;email</Label>
                  <Input
                    value={current?.subject || ""}
                    onChange={(e) => updateField(activeTab, "subject", e.target.value)}
                    disabled={!isPro}
                    placeholder="Objet du mail..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Corps du message</Label>
                  <Textarea
                    value={current?.body || ""}
                    onChange={(e) => updateField(activeTab, "body", e.target.value)}
                    disabled={!isPro}
                    rows={10}
                    className="font-mono text-sm"
                    placeholder="Contenu du mail..."
                  />
                </div>

                {/* Variables help */}
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <Info className="h-3 w-3" />
                    Variables disponibles
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIABLES.map((v) => (
                      <button
                        key={v.var}
                        type="button"
                        disabled={!isPro}
                        className="rounded bg-white px-2 py-0.5 font-mono text-[11px] text-violet-600 ring-1 ring-slate-200 transition-colors hover:bg-violet-50 disabled:opacity-50"
                        onClick={() => {
                          if (!isPro) return;
                          updateField(activeTab, "body", (current?.body || "") + v.var);
                        }}
                        title={v.example}
                      >
                        {v.var}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefaults}
                    disabled={!isPro}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Restaurer par défaut
                  </Button>
                  {isPro && (
                    <Button
                      size="sm"
                      onClick={() => templates && autoSave(templates)}
                      disabled={saving}
                    >
                      <Save className="mr-1 h-3.5 w-3.5" />
                      Sauvegarder
                    </Button>
                  )}
                </div>
              </div>

              {/* Right: Preview */}
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  Aperçu — Destinataire : Marie Petit - Coiffure
                </p>
                <div className="overflow-hidden rounded-xl border shadow-sm">
                  {/* Email header */}
                  <div className="bg-[#6366F1] px-5 py-3">
                    <span className="text-sm font-bold text-white">Devizly</span>
                  </div>
                  <div className="bg-white p-5">
                    <p className="text-xs text-slate-400">
                      De : Devizly Demo via Devizly · noreply@devizly.fr
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {replaceVars(current?.subject || "")}
                    </p>
                    <div className="my-4 h-px bg-slate-100" />
                    <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                      {replaceVars(current?.body || "")}
                    </div>
                    <div className="mt-4">
                      <div className="rounded-lg bg-[#22C55E] px-6 py-3 text-center text-sm font-semibold text-white">
                        {activeTab === "j2" && "Consulter le devis — 8 160,00 €"}
                        {activeTab === "j5" && "Signer le devis maintenant"}
                        {activeTab === "j7" && "Signer et payer l'acompte"}
                      </div>
                    </div>
                  </div>
                  <div className="border-t bg-slate-50 px-5 py-3 text-center text-[10px] text-slate-400">
                    NBHC SAS — 55 Rue Henri Clément, 71100 Saint-Rémy — SIREN 102 637 899
                  </div>
                </div>
              </div>
            </div>

            {/* Pro gate */}
            {!isPro && (
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-center">
                <p className="text-sm font-semibold text-violet-700">
                  Personnalisez vos emails de relance avec le plan Pro
                </p>
                <p className="mt-1 text-xs text-violet-500">
                  Adaptez le ton, ajoutez votre signature, utilisez vos variables
                </p>
                <Button asChild size="sm" className="mt-3">
                  <a href="/pricing">Passer au Pro — 19€/mois</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
