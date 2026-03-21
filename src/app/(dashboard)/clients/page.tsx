"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, Users, ExternalLink, Copy, Upload, Loader2, FileText } from "lucide-react";
import { CompanyAutocomplete } from "@/components/company-autocomplete";
import type { CompanyData } from "@/components/company-autocomplete";
import type { Client } from "@/types";
import { toast } from "sonner";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [csvImporting, setCsvImporting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    siret: "",
  });

  const fetchClients = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("clients").select("*").order("name");
      setClients((data || []) as Client[]);
    } catch {
      toast.error("Erreur de chargement des clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  function resetForm() {
    setForm({ name: "", email: "", phone: "", address: "", city: "", postal_code: "", siret: "" });
    setEditingClient(null);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      city: client.city || "",
      postal_code: client.postal_code || "",
      siret: client.siret || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
    const method = editingClient ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const result = await response.json();
      toast.error(result.error || "Erreur");
      return;
    }

    toast.success(editingClient ? "Client modifié" : "Client ajouté");
    setDialogOpen(false);
    resetForm();
    fetchClients();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce client ?")) return;
    const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Erreur lors de la suppression");
      return;
    }
    toast.success("Client supprimé");
    fetchClients();
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setCsvImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("Le fichier CSV est vide ou ne contient qu\u2019une ligne d\u2019en-t\u00eate");
        return;
      }

      const sep = lines[0].includes(";") ? ";" : ",";
      const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
      const colMap: Record<string, number> = {};
      const aliases: Record<string, string[]> = {
        name: ["nom", "name", "raison sociale", "raison_sociale", "societe", "société", "client"],
        email: ["email", "e-mail", "mail", "courriel"],
        phone: ["phone", "telephone", "téléphone", "tel", "tél", "portable"],
        address: ["address", "adresse", "rue"],
        city: ["city", "ville"],
        postal_code: ["postal_code", "code_postal", "code postal", "cp", "zip"],
        siret: ["siret", "siren"],
      };

      for (const [field, names] of Object.entries(aliases)) {
        const idx = headers.findIndex((h) => names.includes(h));
        if (idx !== -1) colMap[field] = idx;
      }

      if (!("name" in colMap)) {
        toast.error("Colonne \u00ab nom \u00bb introuvable dans le CSV. Colonnes attendues : nom, email, phone, adresse, ville, code_postal, siret");
        return;
      }

      const MAX_ROWS = 500;
      const allRows = lines.slice(1);
      if (allRows.length > MAX_ROWS) {
        toast.error(`Le fichier contient ${allRows.length} lignes. Maximum autoris\u00e9 : ${MAX_ROWS}`);
        return;
      }

      // Build set of existing emails for dedup
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const existingEmails = new Set(
        clients.filter((c) => c.email).map((c) => c.email!.toLowerCase())
      );

      const rows = allRows;
      let imported = 0;
      let skippedDuplicates = 0;
      let invalidEmails = 0;
      let errors = 0;

      for (const row of rows) {
        const cols = row.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
        const name = cols[colMap.name] || "";
        if (!name) continue;

        const payload: Record<string, string> = { name };
        for (const field of ["email", "phone", "address", "city", "postal_code", "siret"] as const) {
          if (field in colMap && cols[colMap[field]]) {
            payload[field] = cols[colMap[field]];
          }
        }

        // Validate email if present
        if (payload.email) {
          if (!emailRegex.test(payload.email)) {
            invalidEmails++;
            continue;
          }
          // Dedup: skip if email already exists
          const emailLower = payload.email.toLowerCase();
          if (existingEmails.has(emailLower)) {
            skippedDuplicates++;
            continue;
          }
        }

        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          imported++;
          if (payload.email) existingEmails.add(payload.email.toLowerCase());
        } else {
          errors++;
        }
      }

      // Summary toast
      const parts: string[] = [];
      if (imported > 0) parts.push(`${imported} import\u00e9${imported > 1 ? "s" : ""}`);
      if (skippedDuplicates > 0) parts.push(`${skippedDuplicates} ignor\u00e9${skippedDuplicates > 1 ? "s" : ""} (doublons)`);
      if (invalidEmails > 0) parts.push(`${invalidEmails} invalide${invalidEmails > 1 ? "s" : ""} (email)`);
      if (errors > 0) parts.push(`${errors} en erreur`);

      if (parts.length === 0) {
        toast.info("Aucun client trouv\u00e9 dans le fichier");
      } else if (imported > 0) {
        toast.success(parts.join(", "));
        fetchClients();
      } else {
        toast.warning(parts.join(", "));
      }
    } catch {
      toast.error("Erreur lors de la lecture du fichier CSV");
    } finally {
      setCsvImporting(false);
    }
  }

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => document.getElementById("csv-import")?.click()}
            disabled={csvImporting}
          >
            {csvImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Importer CSV
          </Button>
          <input
            id="csv-import"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvImport}
          />
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Modifier le client" : "Nouveau client"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <CompanyAutocomplete
                  value={form.name}
                  onChange={(val) => setForm({ ...form, name: val })}
                  onSelect={(c: CompanyData) =>
                    setForm({
                      ...form,
                      name: c.name,
                      siret: c.siret,
                      address: c.address,
                      city: c.city,
                      postal_code: c.postal_code,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="client@exemple.fr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01 23 45 67 89"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 rue de la Paix"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Paris"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code postal</Label>
                  <Input
                    value={form.postal_code}
                    onChange={(e) =>
                      setForm({ ...form, postal_code: e.target.value })
                    }
                    placeholder="75001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>SIRET</Label>
                <Input
                  value={form.siret}
                  onChange={(e) => setForm({ ...form, siret: e.target.value })}
                  placeholder="123 456 789 00012"
                />
              </div>
              <Button className="w-full" onClick={handleSave}>
                {editingClient ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p className="text-lg font-medium">Aucun client</p>
              <p className="mt-1">Ajoutez votre premier client</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead className="hidden sm:table-cell">SIRET</TableHead>
                  <TableHead>Portail</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email || "—"}</TableCell>
                    <TableCell>{client.phone || "—"}</TableCell>
                    <TableCell className="hidden font-mono text-sm sm:table-cell">
                      {client.siret || "—"}
                    </TableCell>
                    <TableCell>
                      {client.portal_token ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ouvrir le portail"
                            onClick={() =>
                              window.open(
                                `/portal/${client.portal_token}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Copier le lien"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/portal/${client.portal_token}`
                              );
                              toast.success("Lien portail copie");
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Nouveau devis"
                          onClick={() =>
                            window.location.href = `/devis/nouveau?client_id=${client.id}`
                          }
                        >
                          <FileText className="h-4 w-4 text-violet-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Modifier"
                          onClick={() => openEdit(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Supprimer"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
