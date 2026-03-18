"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  FileText,
  Share2,
  Eye,
  EyeOff,
  Save,
  Send,
  PenLine,
  CreditCard,
  GitBranch,
  Bell,
  Receipt,
  Download,
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils/quote";
import type { QuoteWithClient, QuoteStatus, Client } from "@/types";
import { ShareModal } from "@/components/quotes/ShareModal";
import { RelanceModal } from "@/components/quotes/relance-modal";
import { SaveTemplateModal } from "@/components/templates/save-template-modal";
import { QuotePreviewDrawer } from "@/components/quotes/quote-preview-drawer";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

const statusTabs: { label: string; value: QuoteStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Brouillon", value: "brouillon" },
  { label: "Envoyé", value: "envoyé" },
  { label: "Signé", value: "signé" },
  { label: "Payé", value: "payé" },
  { label: "Refusé", value: "refusé" },
];

type ViewTab = "actifs" | "archives";

export default function DevisPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [viewTab, setViewTab] = useState<ViewTab>("actifs");
  const [loading, setLoading] = useState(true);
  const [templateModalQuote, setTemplateModalQuote] =
    useState<QuoteWithClient | null>(null);
  const [quota, setQuota] = useState<{
    plan: string;
    used: number;
    limit: number;
  } | null>(null);
  const [reminderCounts, setReminderCounts] = useState<Record<string, number>>(
    {}
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  // Drawer state
  const [previewQuoteId, setPreviewQuoteId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // PDF download loading per quote
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    const supabase = createClient();
    const [quotesRes, profileRes, remindersRes, clientsRes] = await Promise.all(
      [
        supabase
          .from("quotes")
          .select("*, clients(*)")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("subscription_status, devis_used")
          .single(),
        supabase.from("quote_reminders").select("quote_id"),
        supabase.from("clients").select("id, name").order("name"),
      ]
    );
    setQuotes((quotesRes.data || []) as QuoteWithClient[]);
    if (profileRes.data) {
      const plan = profileRes.data.subscription_status || "free";
      const used = profileRes.data.devis_used || 0;
      const limit = plan === "free" ? 3 : -1;
      setQuota({ plan, used, limit });
    }
    if (remindersRes.data) {
      const counts: Record<string, number> = {};
      for (const r of remindersRes.data) {
        counts[r.quote_id] = (counts[r.quote_id] || 0) + 1;
      }
      setReminderCounts(counts);
    }
    if (clientsRes.data) {
      setClients(clientsRes.data as Client[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Filtered + paginated quotes
  const filtered = useMemo(() => {
    return quotes.filter((q) => {
      // View tab: archived vs active
      const isArchived = !!q.archived_at;
      if (viewTab === "archives" && !isArchived) return false;
      if (viewTab === "actifs" && isArchived) return false;

      // Status filter
      const matchStatus = statusFilter === "all" || q.status === statusFilter;

      // Search (title, client name, or quote number)
      const searchLower = search.toLowerCase();
      const quoteNumber = `DEV-${String(q.number).padStart(4, "0")}`.toLowerCase();
      const matchSearch =
        !search ||
        q.title.toLowerCase().includes(searchLower) ||
        q.clients?.name?.toLowerCase().includes(searchLower) ||
        quoteNumber.includes(searchLower);

      // Client filter
      const matchClient =
        clientFilter === "all" || q.client_id === clientFilter;

      // Date range filter
      const createdAt = new Date(q.created_at);
      const matchDateFrom = !dateFrom || createdAt >= new Date(dateFrom);
      const matchDateTo =
        !dateTo || createdAt <= new Date(dateTo + "T23:59:59");

      return (
        matchStatus && matchSearch && matchClient && matchDateFrom && matchDateTo
      );
    });
  }, [quotes, viewTab, statusFilter, search, clientFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [viewTab, statusFilter, search, clientFilter, dateFrom, dateTo]);

  const archivedCount = quotes.filter((q) => !!q.archived_at).length;

  async function handleArchive(id: string) {
    // Optimistic UI
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, archived_at: new Date().toISOString() } : q
      )
    );
    toast.success("Devis archivé");

    const res = await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    if (!res.ok) {
      toast.error("Erreur lors de l'archivage");
      fetchQuotes(); // rollback
    }
  }

  async function handleUnarchive(id: string) {
    // Optimistic UI
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, archived_at: null } : q))
    );
    toast.success("Devis désarchivé");

    const res = await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unarchive" }),
    });
    if (!res.ok) {
      toast.error("Erreur lors du désarchivage");
      fetchQuotes(); // rollback
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Archiver ce devis ? Il sera déplacé dans les archives."))
      return;
    await handleArchive(id);
  }

  async function handleDuplicate(quoteOrId: QuoteWithClient | string) {
    const quote =
      typeof quoteOrId === "string"
        ? quotes.find((q) => q.id === quoteOrId)
        : quoteOrId;
    if (!quote) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newQuote, error } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        client_id: quote.client_id,
        title: `${quote.title} (copie)`,
        status: "brouillon",
        total_ht: quote.total_ht,
        tva_rate: quote.tva_rate,
        discount: quote.discount,
        total_ttc: quote.total_ttc,
        currency: quote.currency || "EUR",
        notes: quote.notes,
        payment_terms: quote.payment_terms,
        valid_until: quote.valid_until,
      })
      .select()
      .single();

    if (error || !newQuote) {
      toast.error("Erreur lors de la duplication");
      return;
    }

    const { data: items } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id);

    if (items && items.length > 0) {
      await supabase.from("quote_items").insert(
        items.map((item) => ({
          quote_id: newQuote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          position: item.position,
        }))
      );
    }

    toast.success("Devis dupliqué");
    fetchQuotes();
  }

  async function handleNewVersion(quote: QuoteWithClient) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const newVersion = (quote.version || 1) + 1;
    const { data: newQuote, error } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        client_id: quote.client_id,
        title: quote.title,
        total_ht: quote.total_ht,
        tva_rate: quote.tva_rate,
        discount: quote.discount,
        total_ttc: quote.total_ttc,
        currency: quote.currency || "EUR",
        notes: quote.notes,
        valid_until: quote.valid_until,
        version: newVersion,
        parent_quote_id: quote.parent_quote_id || quote.id,
      })
      .select()
      .single();

    if (error || !newQuote) {
      toast.error("Erreur lors de la création de version");
      return;
    }

    const { data: items } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id);

    if (items && items.length > 0) {
      await supabase.from("quote_items").insert(
        items.map((item) => ({
          quote_id: newQuote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          position: item.position,
        }))
      );
    }

    toast.success(`Version ${newVersion} créée`);
    router.push(`/devis/nouveau?edit=${newQuote.id}`);
  }

  async function handleStatusChange(id: string, newStatus: QuoteStatus) {
    const supabase = createClient();
    const { error } = await supabase
      .from("quotes")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Erreur lors de la mise à jour");
      return;
    }
    toast.success(`Statut changé: ${getStatusLabel(newStatus)}`);
    fetchQuotes();
  }

  async function handleGenerateInvoice(quoteId: string) {
    const res = await fetch("/api/invoices/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "PLAN_REQUIRED") {
        toast.error("Facturation Pro requise", {
          action: {
            label: "Upgrade",
            onClick: () => router.push("/pricing"),
          },
        });
      } else if (res.status === 409) {
        toast.info("Facture déjà générée pour ce devis");
        router.push("/dashboard/factures");
      } else {
        toast.error(data.error || "Erreur génération facture");
      }
      return;
    }
    toast.success(`Facture ${data.invoice.invoice_number} créée`);
    router.push("/dashboard/factures");
  }

  async function handleDownloadPdf(quoteId: string) {
    setPdfLoadingId(quoteId);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/pdf`);
      if (!res.ok) {
        toast.error("Erreur lors de la génération du PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devis-${quoteId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setPdfLoadingId(null);
    }
  }

  function openPreview(quoteId: string) {
    setPreviewQuoteId(quoteId);
    setDrawerOpen(true);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setClientFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  const hasActiveFilters =
    search || statusFilter !== "all" || clientFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Devis</h1>
        <Button asChild>
          <Link href="/devis/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Link>
        </Button>
      </div>

      {/* Analytics bar */}
      {!loading && quotes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Envoyés",
              count: quotes.filter(
                (q) => q.status === "envoyé" && !q.archived_at
              ).length,
              icon: Send,
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Ouverts",
              count: quotes.filter((q) => q.viewed_at && !q.archived_at).length,
              icon: Eye,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Signés",
              count: quotes.filter(
                (q) =>
                  (q.status === "signé" || q.status === "accepté") &&
                  !q.archived_at
              ).length,
              icon: PenLine,
              color: "text-green-600 bg-green-50",
            },
            {
              label: "Payés",
              count: quotes.filter(
                (q) => q.status === "payé" && !q.archived_at
              ).length,
              amount: quotes
                .filter((q) => q.status === "payé" && !q.archived_at)
                .reduce((sum, q) => sum + Number(q.total_ttc), 0),
              icon: CreditCard,
              color: "text-violet-600 bg-violet-50",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.label}
                    {"amount" in stat && stat.amount
                      ? ` — ${formatCurrency(stat.amount)}`
                      : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quota banner */}
      {quota && (
        <div
          className={`rounded-xl p-4 ${
            quota.limit === -1
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
              : quota.used >= quota.limit
                ? "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
                : "bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200"
          }`}
        >
          {quota.limit === -1 ? (
            <p className="text-sm font-semibold text-green-700">
              Plan {quota.plan === "pro" ? "Pro" : "Business"} — Devis illimités
            </p>
          ) : (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Gratuit : {quota.used}/{quota.limit} devis utilisés ce mois
                </p>
                {quota.used >= quota.limit && (
                  <p className="text-sm text-red-600 mt-0.5">
                    Limite atteinte.{" "}
                    <Link
                      href="/pricing"
                      className="underline font-semibold hover:text-red-800"
                    >
                      Passez Pro (19€) pour des devis illimités
                    </Link>
                  </p>
                )}
              </div>
              {quota.used < quota.limit && (
                <Link
                  href="/pricing"
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Passer Pro — illimité
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          {/* View tabs: Actifs / Archivés */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setViewTab("actifs")}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                viewTab === "actifs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setViewTab("archives")}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                viewTab === "archives"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              Archivés
              {archivedCount > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {archivedCount}
                </Badge>
              )}
            </button>
          </div>

          {/* Status tabs + Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1">
              {statusTabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={statusFilter === tab.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher n°, titre, client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Advanced filters */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-36 h-9 text-sm"
                placeholder="Du"
              />
              <span className="text-xs text-muted-foreground">→</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-36 h-9 text-sm"
                placeholder="Au"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 text-xs text-muted-foreground"
              >
                <X className="mr-1 h-3 w-3" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p className="text-lg font-medium">
                {viewTab === "archives"
                  ? "Aucun devis archivé"
                  : "Aucun devis trouvé"}
              </p>
              <p className="mt-1">
                {viewTab === "archives"
                  ? "Les devis archivés apparaîtront ici"
                  : "Créez votre premier devis pour commencer"}
              </p>
              {viewTab === "actifs" && (
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/devis/nouveau">Créer un devis</Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    {viewTab === "actifs" && <TableHead>Relances</TableHead>}
                    <TableHead>Créé le</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead className="w-32" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((quote) => (
                    <TableRow
                      key={quote.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openPreview(quote.id)}
                    >
                      <TableCell className="font-mono text-sm">
                        DEV-{String(quote.number).padStart(4, "0")}
                      </TableCell>
                      <TableCell className="font-medium">
                        <span>{quote.title}</span>
                        {quote.version > 1 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            v{quote.version}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{quote.clients?.name || "—"}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          Number(quote.total_ttc),
                          quote.currency || "EUR"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className={getStatusColor(quote.status)}
                          >
                            {getStatusLabel(quote.status)}
                          </Badge>
                          {quote.status === "envoyé" &&
                            (quota && quota.plan !== "free" ? (
                              quote.viewed_at ? (
                                <span
                                  className="inline-flex items-center gap-1 text-xs text-emerald-600"
                                  title={`Consulté le ${formatDate(quote.viewed_at)}`}
                                >
                                  <Eye className="h-3 w-3" /> Vu
                                  {quote.view_count > 1
                                    ? ` ${quote.view_count}x`
                                    : ""}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                  <EyeOff className="h-3 w-3" /> Non lu
                                </span>
                              )
                            ) : (
                              <a
                                href="/pricing"
                                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye className="h-3 w-3" /> Tracking Pro
                              </a>
                            ))}
                          {quote.deposit_percent && quote.deposit_paid_at && (
                            <Badge
                              variant="outline"
                              className="text-xs text-violet-600 border-violet-200"
                            >
                              Acompte {quote.deposit_percent}%
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {viewTab === "actifs" && (
                        <TableCell>
                          {quote.status === "envoyé" ||
                          quote.status === "signé" ? (
                            <div className="flex items-center gap-1.5">
                              <Bell
                                className={`h-3.5 w-3.5 ${
                                  (reminderCounts[quote.id] || 0) > 0
                                    ? "text-indigo-500"
                                    : "text-slate-300"
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  (reminderCounts[quote.id] || 0) >= 3
                                    ? "text-emerald-600"
                                    : (reminderCounts[quote.id] || 0) > 0
                                      ? "text-indigo-600"
                                      : "text-slate-400"
                                }`}
                              >
                                {reminderCounts[quote.id] || 0}/3
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-sm">
                        {formatDate(quote.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {quote.valid_until ? (
                          <span
                            className={
                              new Date(quote.valid_until) < new Date()
                                ? "text-red-600"
                                : "text-muted-foreground"
                            }
                          >
                            {formatDate(quote.valid_until)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Inline Duplicate */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDuplicate(quote)}
                            title="Dupliquer"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>

                          {/* Inline PDF download */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownloadPdf(quote.id)}
                            disabled={pdfLoadingId === quote.id}
                            title="Télécharger PDF"
                          >
                            {pdfLoadingId === quote.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>

                          {/* Relance button */}
                          {viewTab === "actifs" &&
                            quote.status === "envoyé" &&
                            quote.clients?.name && (
                              <RelanceModal
                                quoteId={quote.id}
                                clientName={quote.clients.name}
                                variant="icon"
                              />
                            )}

                          {/* Share button */}
                          {quote.share_token && (
                            <ShareModal
                              shareToken={quote.share_token}
                              quoteTitle={quote.title}
                              clientEmail={quote.clients?.email}
                            />
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {viewTab === "archives" ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleUnarchive(quote.id)}
                                  >
                                    <ArchiveRestore className="mr-2 h-4 w-4" />
                                    Désarchiver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDuplicate(quote)}
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Dupliquer
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/devis/nouveau?edit=${quote.id}`
                                      )
                                    }
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDuplicate(quote)}
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Dupliquer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleNewVersion(quote)}
                                  >
                                    <GitBranch className="mr-2 h-4 w-4" />
                                    Nouvelle version
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setTemplateModalQuote(quote)
                                    }
                                  >
                                    <Save className="mr-2 h-4 w-4" />
                                    Sauvegarder comme template
                                  </DropdownMenuItem>
                                  {(quote.status === "signé" ||
                                    quote.status === "accepté" ||
                                    quote.status === "payé") && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleGenerateInvoice(quote.id)
                                      }
                                    >
                                      <Receipt className="mr-2 h-4 w-4" />
                                      Générer facture
                                    </DropdownMenuItem>
                                  )}
                                  {quote.status === "brouillon" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(quote.id, "envoyé")
                                      }
                                    >
                                      Marquer envoyé
                                    </DropdownMenuItem>
                                  )}
                                  {quote.status === "envoyé" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(quote.id, "signé")
                                      }
                                    >
                                      Marquer signé
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleArchive(quote.id)}
                                    className="text-orange-600"
                                  >
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archiver
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <p className="text-sm text-muted-foreground">
                    {filtered.length} devis — page {page}/{totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-9"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Template modal */}
      {templateModalQuote && (
        <SaveTemplateModal
          open={!!templateModalQuote}
          onOpenChange={(open) => {
            if (!open) setTemplateModalQuote(null);
          }}
          quoteId={templateModalQuote.id}
          quoteTitle={templateModalQuote.title}
        />
      )}

      {/* Quote preview drawer */}
      <QuotePreviewDrawer
        quoteId={previewQuoteId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDuplicate={(id) => handleDuplicate(id)}
      />
    </div>
  );
}
