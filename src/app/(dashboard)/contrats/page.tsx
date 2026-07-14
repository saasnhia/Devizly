"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  MoreHorizontal,
  FileSignature,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
  StopCircle,
  TrendingUp,
  CalendarClock,
  FileText,
  Copy,
  Send,
  Download,
  Zap,
} from "lucide-react";
import type { ContractWithClient, ContractTemplate, Client } from "@/types";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/quote";
import {
  resolveVariables,
  type TemplateProfile,
} from "@/lib/contracts/template-engine";
import {
  ContractQuickWizard,
  type QuoteOption,
} from "@/components/contracts/contract-quick-wizard";

// ── Helpers ───────────────────────────────────────────────────

function frequencyLabel(freq: string): string {
  switch (freq) {
    case "monthly":
      return "Mensuel";
    case "quarterly":
      return "Trimestriel";
    case "yearly":
      return "Annuel";
    default:
      return freq;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
          Actif
        </Badge>
      );
    case "paused":
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
          En pause
        </Badge>
      );
    case "draft":
      return (
        <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">
          Brouillon
        </Badge>
      );
    case "ended":
      return (
        <Badge className="bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100">
          Terminé
        </Badge>
      );
    case "pending_signature":
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
          En attente de signature
        </Badge>
      );
    case "signed":
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
          Signé
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// ── Contract Form Modal ───────────────────────────────────────

interface ContractFormData {
  title: string;
  client_id: string;
  amount: string;
  frequency: string;
  start_date: string;
  end_date: string;
  notes: string;
  description: string;
  document_type: string;
  content: string;
}

const defaultFormData: ContractFormData = {
  title: "",
  client_id: "",
  amount: "",
  frequency: "monthly",
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  notes: "",
  description: "",
  document_type: "recurring",
  content: "",
};

function ContractModal({
  open,
  onOpenChange,
  contract,
  clients,
  templates,
  profile,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contract: ContractWithClient | null;
  clients: Client[];
  templates: ContractTemplate[];
  profile: TemplateProfile | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ContractFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  // Raw {{variable}} template body — kept separate from `form.content` so
  // switching the selected client can re-resolve it without losing the
  // original template text.
  const [rawTemplateContent, setRawTemplateContent] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (contract) {
      setForm({
        title: contract.title,
        client_id: contract.client_id ?? "",
        amount: String(contract.amount),
        frequency: contract.frequency,
        start_date: contract.start_date,
        end_date: contract.end_date ?? "",
        notes: contract.notes ?? "",
        description: contract.description ?? "",
        document_type: contract.document_type ?? "recurring",
        content: contract.content ?? "",
      });
      setRawTemplateContent(null);
    } else {
      setForm(defaultFormData);
      setRawTemplateContent(null);
    }
  }, [contract, open]);

  function applyTemplate(templateId: string) {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setRawTemplateContent(tpl.content ?? null);

    const selectedClient = clients.find((c) => c.id === form.client_id) ?? null;
    const resolvedContent = tpl.content
      ? resolveVariables(tpl.content, { profile, client: selectedClient })
      : "";

    setForm((prev) => ({
      ...prev,
      title: tpl.name,
      description: tpl.description ?? "",
      amount: tpl.default_amount !== null ? String(tpl.default_amount) : "",
      frequency: tpl.default_frequency,
      document_type: tpl.category === "prestation" ? "prestation" : prev.document_type,
      content: resolvedContent || prev.content,
    }));
  }

  // Re-resolve the template body whenever the selected client changes, so
  // {{client_nom}}, {{client_siret}}, etc. stay in sync with the picker.
  function handleClientChange(clientId: string) {
    setForm((prev) => ({ ...prev, client_id: clientId }));
    if (!rawTemplateContent) return;
    const selectedClient = clients.find((c) => c.id === clientId) ?? null;
    setForm((prev) => ({
      ...prev,
      content: resolveVariables(rawTemplateContent, {
        profile,
        client: selectedClient,
      }),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        client_id: form.client_id || null,
        amount: parseFloat(form.amount) || 0,
        frequency: form.frequency,
        start_date: form.start_date,
        end_date: form.end_date || null,
        notes: form.notes || null,
        description: form.description || null,
        document_type: form.document_type || "recurring",
        content: form.content || null,
      };

      let res: Response;
      if (contract) {
        res = await fetch(`/api/contracts/${contract.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/contracts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Erreur inconnue");
      }

      toast.success(contract ? "Contrat modifié" : "Contrat créé");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {contract ? "Modifier le contrat" : "Nouveau contrat"}
          </DialogTitle>
        </DialogHeader>

        {/* Template picker (only on creation) */}
        {!contract && templates.length > 0 && (
          <div className="mb-2">
            <Label className="mb-1 block text-xs text-muted-foreground">
              Partir d&apos;un modèle (optionnel)
            </Label>
            <Select onValueChange={applyTemplate}>
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
            {rawTemplateContent && (
              <p className="mt-2 text-xs text-muted-foreground">
                Ce modèle est fourni à titre indicatif. Faites-le valider par
                un professionnel du droit avant tout usage commercial.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Ex : Maintenance site web"
              required
            />
          </div>

          <div>
            <Label htmlFor="client_id">Client</Label>
            <Select
              value={form.client_id}
              onValueChange={(v) => handleClientChange(v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Fréquence</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, frequency: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="quarterly">Trimestriel</SelectItem>
                  <SelectItem value="yearly">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Date de début *</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, start_date: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, end_date: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Description du contrat…"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="doc-type">Type de document</Label>
            <Select
              value={form.document_type}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, document_type: v }))
              }
            >
              <SelectTrigger id="doc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Contrat recurrent</SelectItem>
                <SelectItem value="prestation">Prestation de services</SelectItem>
                <SelectItem value="cgv">CGV</SelectItem>
                <SelectItem value="sla">SLA</SelectItem>
                <SelectItem value="nda">NDA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.document_type !== "recurring" && (
            <div>
              <Label htmlFor="content">
                Contenu du document ({form.document_type.toUpperCase()})
              </Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="Redigez ou collez vos conditions ici…"
                rows={8}
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Notes privées…"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : contract ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function ContratsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contracts, setContracts] = useState<ContractWithClient[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<QuoteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string>("free");
  const [companyProfile, setCompanyProfile] = useState<TemplateProfile | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [quickWizardOpen, setQuickWizardOpen] = useState(false);
  const [editingContract, setEditingContract] =
    useState<ContractWithClient | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Get plan + company info (for template variable resolution)
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "subscription_status, company_name, company_siret, company_address, company_postal_code, company_city, full_name"
        )
        .single();
      if (profile?.subscription_status) {
        setPlan(profile.subscription_status);
      }
      if (profile) {
        setCompanyProfile({
          company_name: profile.company_name,
          company_siret: profile.company_siret,
          company_address: profile.company_address,
          company_postal_code: profile.company_postal_code,
          company_city: profile.company_city,
          full_name: profile.full_name,
        });
      }
      if (!profile || profile.subscription_status === "free") {
        return;
      }

      // Contracts
      const res = await fetch("/api/contracts");
      if (res.ok) {
        const json = await res.json() as { data: ContractWithClient[] };
        setContracts(json.data ?? []);
      }

      // Contract templates
      const { data: tplData } = await supabase
        .from("contract_templates")
        .select("*")
        .order("name");
      setTemplates((tplData as ContractTemplate[]) ?? []);

      // Clients
      const clientRes = await fetch("/api/clients");
      if (clientRes.ok) {
        const cj = await clientRes.json() as { data: Client[] };
        setClients(cj.data ?? []);
      }

      // Quotes (for the "à partir d'un devis" wizard mode)
      const { data: quotesData } = await supabase
        .from("quotes")
        .select("id, number, title, total_ht, currency, client_id, clients(name)")
        .order("created_at", { ascending: false });
      setQuotes((quotesData as unknown as QuoteOption[]) ?? []);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Deep link from the devis page ("Voir le contrat" → /contrats?open=<id>):
  // auto-open the edit modal once contracts are loaded, then clean the URL.
  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId || contracts.length === 0) return;
    const target = contracts.find((c) => c.id === openId);
    if (target) {
      setEditingContract(target);
      setModalOpen(true);
      router.replace("/contrats");
    }
  }, [searchParams, contracts, router]);

  const availableQuotes = quotes.filter(
    (q) => !contracts.some((c) => c.quote_id === q.id)
  );

  // ── Plan gate ──────────────────────────────────────────────
  if (!loading && plan === "free") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Contrats</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
              <FileSignature className="h-8 w-8 text-violet-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              Envoi de contrats — Plan Pro
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Créez des contrats avec signature électronique eIDAS, gérez vos
              revenus récurrents et générez automatiquement des factures pour
              chaque période.
            </p>
            <Button asChild>
              <Link href="/pricing">Passer au Pro — 9€/mois à vie</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Actions ────────────────────────────────────────────────

  function handleNew() {
    setEditingContract(null);
    setModalOpen(true);
  }

  function handleEdit(c: ContractWithClient) {
    setEditingContract(c);
    setModalOpen(true);
  }

  async function handleStatusChange(
    c: ContractWithClient,
    newStatus: string
  ) {
    try {
      const res = await fetch(`/api/contracts/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Erreur");
      }
      toast.success("Statut mis à jour");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function handleDelete(c: ContractWithClient) {
    if (
      !confirm(
        `Supprimer le contrat "${c.title}" ? Cette action est irréversible.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/contracts/${c.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Erreur");
      }
      toast.success("Contrat supprimé");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function handleSendForSignature(c: ContractWithClient) {
    if (!c.clients?.email) {
      toast.error("Le client n'a pas d'adresse email");
      return;
    }
    try {
      const res = await fetch(`/api/contracts/${c.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: c.clients.email }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Erreur");
      }
      toast.success("Contrat envoye pour signature !");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'envoi");
    }
  }

  function handleDownloadPdf(c: ContractWithClient) {
    window.open(`/api/contracts/${c.id}/pdf`, "_blank");
  }

  async function handleUseTemplate(tpl: ContractTemplate) {
    setEditingContract(null);
    // Pre-fill via template picker in modal; just open modal
    setModalOpen(true);
  }

  // ── Stats ──────────────────────────────────────────────────

  const activeContracts = contracts.filter((c) => c.status === "active");
  const mrr = activeContracts.reduce((sum, c) => {
    if (c.frequency === "monthly") return sum + Number(c.amount);
    if (c.frequency === "quarterly") return sum + Number(c.amount) / 3;
    if (c.frequency === "yearly") return sum + Number(c.amount) / 12;
    return sum;
  }, 0);

  const nextInvoiceDates = activeContracts
    .filter((c) => c.next_invoice_date)
    .map((c) => c.next_invoice_date as string)
    .sort();
  const nextInvoiceDate = nextInvoiceDates[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contrats</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos contrats récurrents et votre revenu mensuel garanti.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/5"
            onClick={() => setQuickWizardOpen(true)}
          >
            <Zap className="mr-2 h-4 w-4" />
            Contrat rapide
          </Button>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau contrat
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Contrats actifs
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {activeContracts.length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 flex items-start gap-3">
          <TrendingUp className="mt-1 h-5 w-5 text-violet-500 shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Revenu mensuel récurrent
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(mrr)}
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 flex items-start gap-3">
          <CalendarClock className="mt-1 h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Prochaine facturation
            </p>
            <p className="mt-1 text-lg font-bold">
              {nextInvoiceDate ? formatDate(nextInvoiceDate) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Contracts table */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Chargement…
        </div>
      ) : contracts.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <FileSignature className="mx-auto mb-4 h-16 w-16 opacity-20" />
          <p className="text-lg font-medium text-muted-foreground">
            Aucun contrat
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez votre premier contrat récurrent ou utilisez un modèle
            ci-dessous.
          </p>
          <Button onClick={handleNew} variant="outline" className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Créer un contrat
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Titre
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Fréquence
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Prochaine facture
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.title}</div>
                      {c.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {c.description}
                        </div>
                      )}
                      {c.quote_id && c.quotes && (
                        <Link
                          href={`/devis?open=${c.quote_id}`}
                          className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          Depuis devis DEV-{String(c.quotes.number).padStart(4, "0")}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.clients?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(Number(c.amount), c.currency)}
                      {c.quote_id && c.quotes && Number(c.amount) !== Number(c.quotes.total_ht) && (
                        <div className="text-[10px] font-normal text-amber-600">
                          Modifié vs devis ({formatCurrency(Number(c.quotes.total_ht))})
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {frequencyLabel(c.frequency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {statusBadge(c.status)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.next_invoice_date
                        ? formatDate(c.next_invoice_date)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(c)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPdf(c)}>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger PDF
                          </DropdownMenuItem>
                          {(c.status === "draft" || c.status === "active") && c.clients?.email && (
                            <DropdownMenuItem onClick={() => handleSendForSignature(c)}>
                              <Send className="mr-2 h-4 w-4" />
                              Envoyer pour signature
                            </DropdownMenuItem>
                          )}
                          {c.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(c, "active")}
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Activer sans signature
                            </DropdownMenuItem>
                          )}
                          {c.status === "active" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(c, "paused")}
                            >
                              <PauseCircle className="mr-2 h-4 w-4" />
                              Mettre en pause
                            </DropdownMenuItem>
                          )}
                          {c.status === "paused" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(c, "active")}
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Reprendre
                            </DropdownMenuItem>
                          )}
                          {(c.status === "active" ||
                            c.status === "paused") && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(c, "ended")}
                            >
                              <StopCircle className="mr-2 h-4 w-4" />
                              Terminer le contrat
                            </DropdownMenuItem>
                          )}
                          {(c.status === "draft" ||
                            c.status === "pending_signature") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(c)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System templates section */}
      {templates.filter((t) => t.is_system).length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Modèles de contrats</h2>
            <p className="text-sm text-muted-foreground">
              Modèles prêts à l&apos;emploi pour démarrer rapidement.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates
              .filter((t) => t.is_system)
              .map((tpl) => (
                <Card
                  key={tpl.id}
                  className="border-dashed border-primary/30"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {tpl.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="shrink-0 text-xs text-primary border-primary/30"
                          >
                            Devizly
                          </Badge>
                        </div>
                        {tpl.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {tpl.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          {tpl.default_amount !== null && (
                            <span className="font-medium text-foreground">
                              {formatCurrency(tpl.default_amount)}
                            </span>
                          )}
                          <span>{frequencyLabel(tpl.default_frequency)}</span>
                          {tpl.default_duration_months && (
                            <span>{tpl.default_duration_months} mois</span>
                          )}
                        </div>
                      </div>
                      <FileText className="h-5 w-5 shrink-0 text-primary/50 mt-0.5" />
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => handleUseTemplate(tpl)}
                      >
                        <Copy className="mr-2 h-3 w-3" />
                        Utiliser ce modèle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <ContractModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        contract={editingContract}
        clients={clients}
        templates={templates}
        profile={companyProfile}
        onSaved={fetchData}
      />

      <ContractQuickWizard
        open={quickWizardOpen}
        onOpenChange={setQuickWizardOpen}
        clients={clients}
        templates={templates}
        quotes={availableQuotes}
        profile={companyProfile}
        onDone={fetchData}
      />
    </div>
  );
}
