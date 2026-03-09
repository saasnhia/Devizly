"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  FileText,
  Play,
  LayoutTemplate,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/quote";
import { calculateItemTotal } from "@/lib/utils/quote";
import type { QuoteTemplate, QuoteTemplateItem } from "@/types";
import { TemplateModal } from "@/components/templates/template-modal";
import {
  getUserTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from "./actions";
import { toast } from "sonner";

const CATEGORY_TABS = [
  { label: "Tous", value: "all" },
  { label: "Web", value: "web" },
  { label: "Design", value: "design" },
  { label: "Conseil", value: "conseil" },
  { label: "Artisan", value: "artisan" },
  { label: "Autre", value: "autre" },
];

function getCategoryLabel(value: string) {
  return CATEGORY_TABS.find((c) => c.value === value)?.label || value;
}

function getTemplateTotal(items: QuoteTemplateItem[]) {
  if (!Array.isArray(items)) return 0;
  return items.reduce(
    (sum, item) => sum + calculateItemTotal(item.quantity, item.unit_price),
    0
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(
    null
  );

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await getUserTemplates(
        categoryFilter === "all" ? undefined : categoryFilter
      );
      setTemplates(data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function handleNew() {
    setEditingTemplate(null);
    setModalOpen(true);
  }

  function handleEdit(template: QuoteTemplate) {
    setEditingTemplate(template);
    setModalOpen(true);
  }

  async function handleSave(data: Parameters<typeof createTemplate>[0]) {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data);
      toast.success("Template modifié");
    } else {
      await createTemplate(data);
      toast.success("Template créé");
    }
    fetchTemplates();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce template ?")) return;
    try {
      await deleteTemplate(id);
      toast.success("Template supprimé");
      fetchTemplates();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateTemplate(id);
      toast.success("Template dupliqué");
      fetchTemplates();
    } catch {
      toast.error("Erreur lors de la duplication");
    }
  }

  function handleUse(template: QuoteTemplate) {
    // Navigate to devis creation with template ID
    router.push(`/devis/nouveau?template=${template.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes templates</h1>
          <p className="text-muted-foreground">
            Réutilisez vos devis types en 1 clic
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau template
        </Button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1">
        {CATEGORY_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={categoryFilter === tab.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setCategoryFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Chargement...
        </div>
      ) : templates.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <LayoutTemplate className="mx-auto mb-4 h-16 w-16 opacity-30" />
          <p className="text-lg font-medium">Aucun template</p>
          <p className="mt-1">
            Sauvegardez votre premier devis comme template
          </p>
          <Button onClick={handleNew} variant="outline" className="mt-4">
            Créer un template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const items = Array.isArray(template.items) ? template.items : [];
            const total = getTemplateTotal(items);

            return (
              <Card key={template.id} className="group relative">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUse(template)}>
                          <Play className="mr-2 h-4 w-4" />
                          Utiliser
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(template.id)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary">
                      {getCategoryLabel(template.category)}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {items.length} ligne{items.length > 1 ? "s" : ""} ·{" "}
                      {formatCurrency(total, "EUR")}
                    </span>
                    <span>
                      Utilisé {template.times_used} fois
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => handleUse(template)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Utiliser ce template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TemplateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        template={editingTemplate}
        onSave={handleSave}
      />
    </div>
  );
}
