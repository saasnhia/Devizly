"use client";

import { useEffect, useState, useCallback } from "react";
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
  Trash2,
  Code,
  Link2,
  Check,
  Copy,
  FileInput,
} from "lucide-react";
import type { LeadForm, LeadFormFields } from "@/types";
import { FormConfigModal } from "@/components/lead-forms/form-config-modal";
import { EmbedModal } from "@/components/lead-forms/embed-modal";
import {
  getUserForms,
  createLeadForm,
  updateLeadForm,
  deleteLeadForm,
} from "./actions";
import { toast } from "sonner";

export default function LeadFormsPage() {
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<LeadForm | null>(null);
  const [embedSlug, setEmbedSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    try {
      const data = await getUserForms();
      setForms(data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  function handleNew() {
    setEditingForm(null);
    setConfigModalOpen(true);
  }

  function handleEdit(form: LeadForm) {
    setEditingForm(form);
    setConfigModalOpen(true);
  }

  async function handleSave(
    data: {
      name: string;
      title: string;
      subtitle: string;
      button_text: string;
      accent_color: string;
      fields: LeadFormFields;
      auto_pipeline_stage: string;
      notification_email: string | null;
      redirect_url: string | null;
    }
  ) {
    if (editingForm) {
      await updateLeadForm(editingForm.id, data);
      toast.success("Formulaire modifié");
    } else {
      await createLeadForm(data);
      toast.success("Formulaire créé");
    }
    fetchForms();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce formulaire ?")) return;
    try {
      await deleteLeadForm(id);
      toast.success("Formulaire supprimé");
      fetchForms();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  async function handleToggleActive(form: LeadForm) {
    try {
      await updateLeadForm(form.id, { is_active: !form.is_active });
      toast.success(
        form.is_active ? "Formulaire désactivé" : "Formulaire activé"
      );
      fetchForms();
    } catch {
      toast.error("Erreur");
    }
  }

  function handleCopyUrl(slug: string) {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Formulaires de contact</h1>
          <p className="text-muted-foreground">
            Recevez des demandes directement dans votre pipeline
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un formulaire
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Chargement...
        </div>
      ) : forms.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <FileInput className="mx-auto mb-4 h-16 w-16 opacity-30" />
          <p className="text-lg font-medium">Aucun formulaire</p>
          <p className="mt-1">
            Créez un formulaire embeddable pour recevoir des leads
          </p>
          <Button onClick={handleNew} variant="outline" className="mt-4">
            Créer un formulaire
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{form.name}</h3>
                      <Badge
                        variant={form.is_active ? "default" : "secondary"}
                        className="shrink-0 cursor-pointer"
                        onClick={() => handleToggleActive(form)}
                      >
                        {form.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleCopyUrl(form.slug)}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Copier le lien
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEmbedSlug(form.slug)}
                      >
                        <Code className="mr-2 h-4 w-4" />
                        Code embed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(form)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(form.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Public URL */}
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-slate-100 px-2 py-1 text-xs text-muted-foreground">
                    /f/{form.slug}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-7 w-7"
                    onClick={() => handleCopyUrl(form.slug)}
                  >
                    {copiedSlug === form.slug ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEmbedSlug(form.slug)}
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Code embed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(form)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FormConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        form={editingForm}
        onSave={handleSave}
      />

      {embedSlug && (
        <EmbedModal
          open={!!embedSlug}
          onOpenChange={(open) => {
            if (!open) setEmbedSlug(null);
          }}
          slug={embedSlug}
        />
      )}
    </div>
  );
}
