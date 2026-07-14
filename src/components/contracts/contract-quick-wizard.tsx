"use client";

import { useEffect, useState } from "react";
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
import { Send, Download, Pencil, Plus, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import type { ContractTemplate, Client } from "@/types";
import {
  resolveVariables,
  type TemplateProfile,
} from "@/lib/contracts/template-engine";

interface ContractQuickWizardProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  templates: ContractTemplate[];
  clients: Client[];
  profile: TemplateProfile | null;
  onDone: () => void;
}

export function ContractQuickWizard({
  open,
  onOpenChange,
  templates,
  clients,
  profile,
  onDone,
}: ContractQuickWizardProps) {
  const [clientsLocal, setClientsLocal] = useState<Client[]>(clients);
  const [templateId, setTemplateId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [objet, setObjet] = useState("");
  const [montant, setMontant] = useState("");
  const [duree, setDuree] = useState("");
  const [customizing, setCustomizing] = useState(false);
  const [manualContent, setManualContent] = useState("");
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [creatingClient, setCreatingClient] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"send" | "pdf" | null>(null);

  useEffect(() => {
    setClientsLocal(clients);
  }, [clients]);

  // Reset + pre-select the NBHC template every time the wizard opens.
  useEffect(() => {
    if (!open) return;
    setClientId("");
    setObjet("");
    setMontant("");
    setDuree("");
    setCustomizing(false);
    setManualContent("");
    setShowNewClient(false);
    setNewClientName("");
    setNewClientEmail("");
    setCreatedId(null);

    const defaultTpl =
      templates.find((t) => t.category === "prestation" && t.is_system) ||
      templates.find((t) => t.is_system && t.content) ||
      templates[0];
    setTemplateId(defaultTpl?.id ?? "");
  }, [open, templates]);

  const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;
  const selectedClient = clientsLocal.find((c) => c.id === clientId) ?? null;

  const resolvedPreview = selectedTemplate?.content
    ? resolveVariables(selectedTemplate.content, {
        profile,
        client: selectedClient,
        custom: { objet, montant, duree },
      })
    : "";

  const previewContent = customizing ? manualContent : resolvedPreview;

  function startCustomizing() {
    setManualContent(resolvedPreview);
    setCustomizing(true);
  }

  async function handleCreateClient() {
    if (!newClientName.trim()) {
      toast.error("Le nom du client est requis");
      return;
    }
    setCreatingClient(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClientName.trim(),
          email: newClientEmail.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Erreur");
      }
      const json = await res.json() as { data: Client };
      setClientsLocal((prev) => [...prev, json.data]);
      setClientId(json.data.id);
      setShowNewClient(false);
      setNewClientName("");
      setNewClientEmail("");
      toast.success("Client créé");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreatingClient(false);
    }
  }

  // Creates the contract on first action, then reuses/updates the same
  // record so "Envoyer" then "Télécharger" (or vice-versa) don't duplicate.
  async function ensureContract(): Promise<string> {
    const payload = {
      title: selectedTemplate?.name || "Contrat de prestation",
      client_id: clientId || null,
      template_id: templateId || null,
      amount: parseFloat(montant) || 0,
      frequency: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      description: objet || null,
      document_type: selectedTemplate?.category === "prestation" ? "prestation" : "cgv",
      content: previewContent || null,
    };

    if (createdId) {
      const res = await fetch(`/api/contracts/${createdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Erreur");
      }
      return createdId;
    }

    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json() as { error?: string };
      throw new Error(err.error ?? "Erreur");
    }
    const json = await res.json() as { data: { id: string } };
    setCreatedId(json.data.id);
    return json.data.id;
  }

  async function handleSend() {
    if (!selectedClient) {
      toast.error("Sélectionnez un client");
      return;
    }
    if (!selectedClient.email) {
      toast.error("Ce client n'a pas d'adresse email");
      return;
    }
    setSubmitting("send");
    try {
      const id = await ensureContract();
      const res = await fetch(`/api/contracts/${id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedClient.email }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Erreur d'envoi");
      }
      toast.success("Contrat envoyé pour signature !");
      onDone();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleDownload() {
    setSubmitting("pdf");
    try {
      const id = await ensureContract();
      window.open(`/api/contracts/${id}/pdf`, "_blank");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Contrat rapide
          </DialogTitle>
        </DialogHeader>

        <p className="-mt-2 text-xs text-muted-foreground">
          Modèle fourni à titre indicatif — à faire valider par un professionnel du droit.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Left: inputs ── */}
          <div className="space-y-4">
            <div>
              <Label className="mb-1 flex items-center gap-2">
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">1</Badge>
                Modèle
              </Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un modèle…" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 flex items-center gap-2">
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">2</Badge>
                Client
              </Label>
              {!showNewClient ? (
                <div className="flex gap-2">
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner un client…" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsLocal.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewClient(true)}
                    title="Nouveau client"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border p-3">
                  <Input
                    placeholder="Nom du client *"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewClient(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateClient}
                      disabled={creatingClient}
                    >
                      {creatingClient ? "Création…" : "Créer le client"}
                    </Button>
                  </div>
                </div>
              )}
              {selectedClient && !selectedClient.email && (
                <p className="mt-1 text-xs text-amber-600">
                  Ce client n&apos;a pas d&apos;email — ajoutez-en un pour pouvoir l&apos;envoyer en signature.
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1 flex items-center gap-2">
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">3</Badge>
                Détails de la prestation
              </Label>
              <div className="space-y-2">
                <Textarea
                  placeholder="Objet — ex : mise en place d'un workflow d'automatisation de la facturation"
                  value={objet}
                  onChange={(e) => setObjet(e.target.value)}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Montant € HT"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                  />
                  <Input
                    placeholder="Durée — ex : 12 mois"
                    value={duree}
                    onChange={(e) => setDuree(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {!customizing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCustomizing}
                className="w-full"
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Personnaliser le texte
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Édition manuelle active — vos modifications ne changent pas le modèle d&apos;origine.
              </p>
            )}
          </div>

          {/* ── Right: live preview ── */}
          <div>
            <Label className="mb-1 flex items-center gap-2">
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">4</Badge>
              Aperçu en temps réel
            </Label>
            {customizing ? (
              <Textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                rows={20}
                className="font-mono text-xs"
              />
            ) : (
              <div className="max-h-[420px] overflow-y-auto rounded-lg border bg-slate-50/50 p-4 text-xs leading-relaxed">
                {previewContent ? (
                  previewContent.split("\n").map((line, i) => (
                    <p key={i} className={line.trim() === "" ? "h-2" : ""}>
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    Choisissez un modèle pour voir l&apos;aperçu.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Step 5: actions ── */}
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={submitting !== null}
          >
            {submitting === "pdf" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Télécharger PDF
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={submitting !== null}
          >
            {submitting === "send" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Envoyer pour signature
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
