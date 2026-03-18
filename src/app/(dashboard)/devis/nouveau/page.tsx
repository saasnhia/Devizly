"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  Save,
  Send,
  GripVertical,
  FileText,
} from "lucide-react";
import { calculateItemTotal, calculateTotals, formatCurrency } from "@/lib/utils/quote";
import { CURRENCIES } from "@/lib/currencies";
import type { Client, QuoteItemDraft } from "@/types";
import { TemplatePicker } from "@/components/templates/template-picker";
import { useTemplate } from "@/app/(dashboard)/templates/actions";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ItemWithId = QuoteItemDraft & { _id: string };

let _nextItemId = 1;
function genItemId(): string {
  return `item-${_nextItemId++}`;
}

function withIds(items: QuoteItemDraft[]): ItemWithId[] {
  return items.map((i) => ({ ...i, _id: genItemId() }));
}

function stripIds(items: ItemWithId[]): QuoteItemDraft[] {
  return items.map(({ _id: _, ...rest }) => rest);
}

function SortableItem({
  item,
  index,
  itemCount,
  currency,
  onUpdate,
  onRemove,
}: {
  item: ItemWithId;
  index: number;
  itemCount: number;
  currency: string;
  onUpdate: (index: number, field: keyof QuoteItemDraft, value: string | number) => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <Badge variant="secondary">Ligne {index + 1}</Badge>
        </div>
        {itemCount > 1 && (
          <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
      <Input
        placeholder="Description"
        value={item.description}
        onChange={(e) => onUpdate(index, "description", e.target.value)}
      />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Quantite</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={item.quantity}
            onChange={(e) => onUpdate(index, "quantity", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Prix unitaire</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.unit_price}
            onChange={(e) => onUpdate(index, "unit_price", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Total</Label>
          <Input
            value={formatCurrency(item.total, currency)}
            disabled
            className="bg-slate-50"
          />
        </div>
      </div>
    </div>
  );
}

const TVA_RATES = [
  { label: "20%", value: "20" },
  { label: "10%", value: "10" },
  { label: "5.5%", value: "5.5" },
  { label: "0%", value: "0" },
];

const emptyItem: QuoteItemDraft = {
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
};

export default function NouveauDevisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const templateId = searchParams.get("template");

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [tvaRate, setTvaRate] = useState("20");
  const [discount, setDiscount] = useState("0");
  const [currency, setCurrency] = useState("EUR");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(
    "Acompte de 50% à la signature, solde à la livraison"
  );
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [items, setItems] = useState<ItemWithId[]>(() => withIds([{ ...emptyItem }]));
  const [clients, setClients] = useState<Client[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const defaultsLoaded = useRef(false);

  // Q3: Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i._id === active.id);
      const newIndex = prev.findIndex((i) => i._id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  // Q4: Load default payment terms from user profile
  useEffect(() => {
    if (defaultsLoaded.current || editId) return;
    defaultsLoaded.current = true;
    async function loadDefaults() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.default_payment_terms) return;
      setPaymentTerms(user.user_metadata.default_payment_terms);
    }
    loadDefaults();
  }, [editId]);

  const fetchClients = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("clients").select("*").order("name");
    setClients((data || []) as Client[]);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (!editId) return;
    async function loadQuote() {
      const supabase = createClient();
      const { data } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("id", editId)
        .single();
      if (!data) return;
      setTitle(data.title);
      setClientId(data.client_id || "");
      setTvaRate(String(data.tva_rate));
      setDiscount(String(data.discount));
      setCurrency(data.currency || "EUR");
      setNotes(data.notes || "");
      setPaymentTerms(data.payment_terms || "Acompte de 50% à la signature, solde à la livraison");
      setValidUntil(data.valid_until || "");
      if (data.quote_items && data.quote_items.length > 0) {
        setItems(
          withIds(
            data.quote_items
              .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
              .map((item: { description: string; quantity: number; unit_price: number; total: number }) => ({
                description: item.description,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                total: Number(item.total),
              }))
          )
        );
      }
    }
    loadQuote();
  }, [editId]);

  // Load template if ?template=ID (run once)
  const templateLoaded = useRef(false);
  useEffect(() => {
    if (!templateId || templateLoaded.current) return;
    templateLoaded.current = true;
    async function loadTemplate() {
      try {
        const tpl = await useTemplate(templateId!);
        const tplItems = Array.isArray(tpl.items) ? tpl.items : [];
        if (tplItems.length > 0) {
          setItems(
            withIds(
              tplItems.map((item: { description: string; quantity: number; unit_price: number }) => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: calculateItemTotal(item.quantity, item.unit_price),
              }))
            )
          );
        }
        if (tpl.default_notes) setNotes(tpl.default_notes);
        if (tpl.default_validity_days) {
          const d = new Date();
          d.setDate(d.getDate() + tpl.default_validity_days);
          setValidUntil(d.toISOString().split("T")[0]);
        }
        toast.success(`Template "${tpl.name}" chargé`);
      } catch {
        toast.error("Impossible de charger le template");
      }
    }
    loadTemplate();
  }, [templateId]);

  function updateItem(index: number, field: keyof QuoteItemDraft, value: string | number) {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === "description") {
        item.description = value as string;
      } else {
        (item as Record<string, unknown>)[field] = Number(value) || 0;
      }
      item.total = calculateItemTotal(item.quantity, item.unit_price);
      updated[index] = item;
      return updated;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem, _id: genItemId() }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  // Q2: PDF preview
  async function handlePdfPreview() {
    if (!editId) {
      toast.info("Sauvegardez le devis en brouillon pour voir l\u2019aper\u00e7u PDF");
      return;
    }
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/quotes/${editId}/pdf`);
      if (!res.ok) {
        toast.error("Erreur lors de la g\u00e9n\u00e9ration du PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      setPdfPreviewOpen(true);
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setPdfLoading(false);
    }
  }

  const totals = calculateTotals(items, Number(tvaRate), Number(discount));

  async function handleAIGenerate() {
    if (!aiPrompt.trim()) {
      toast.error("Décrivez votre prestation");
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Erreur IA");
        return;
      }
      const data = result.data;
      if (data.title) setTitle(data.title);
      if (data.notes) setNotes(data.notes);
      if (data.items && Array.isArray(data.items)) {
        setItems(
          withIds(
            data.items.map((item: { description: string; quantity: number; unit_price: number }) => ({
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: calculateItemTotal(item.quantity, item.unit_price),
            }))
          )
        );
      }
      toast.success("Devis généré par l'IA !");
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave(status: "brouillon" | "envoyé" = "brouillon") {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (items.length === 0 || !items.some((i) => i.description.trim())) {
      toast.error("Ajoutez au moins une ligne");
      return;
    }

    setSaving(true);
    const validItems = stripIds(items.filter((i) => i.description.trim()));
    const payload = {
      title,
      client_id: clientId || null,
      currency,
      tva_rate: Number(tvaRate),
      discount: Number(discount),
      notes,
      payment_terms: paymentTerms || null,
      valid_until: validUntil || null,
      ai_prompt: aiPrompt || null,
      total_ht: totals.totalHT,
      total_ttc: totals.totalTTC,
      status,
      items: validItems,
    };

    try {
      const url = editId ? `/api/quotes/${editId}` : "/api/quotes";
      const method = editId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Erreur de sauvegarde");
        return;
      }
      toast.success(
        status === "envoyé" ? "Devis envoyé !" : "Devis sauvegardé !"
      );
      router.push("/devis");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {editId ? "Modifier le devis" : "Nouveau devis"}
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* AI Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Générer avec l&apos;IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Décrivez votre prestation en langage naturel... Ex: Site vitrine WordPress 5 pages pour un restaurant à Paris"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAIGenerate}
                disabled={aiLoading}
                variant="outline"
                className="w-full"
              >
                {aiLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Générer avec l&apos;IA
              </Button>
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails du devis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du devis</Label>
                <Input
                  id="title"
                  placeholder="Ex: Création site web"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valide jusqu&apos;au</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Conditions de paiement</Label>
                <Textarea
                  id="paymentTerms"
                  placeholder="Acompte de 50% à la signature, solde à la livraison"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Conditions particulières, délais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Live Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lignes du devis</CardTitle>
                <TemplatePicker
                  onApply={(data) => {
                    setItems(withIds(data.items));
                    if (data.notes) setNotes(data.notes);
                    if (data.validUntil) setValidUntil(data.validUntil);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item, index) => (
                    <SortableItem
                      key={item._id}
                      item={item}
                      index={index}
                      itemCount={items.length}
                      currency={currency}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <Button
                variant="outline"
                className="w-full"
                onClick={addItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TVA</Label>
                  <Select value={tvaRate} onValueChange={setTvaRate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TVA_RATES.map((rate) => (
                        <SelectItem key={rate.value} value={rate.value}>
                          {rate.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Remise (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{formatCurrency(totals.subtotalHT, currency)}</span>
                </div>
                {Number(discount) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Remise ({discount}%)</span>
                    <span>-{formatCurrency(totals.discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total HT</span>
                  <span>{formatCurrency(totals.totalHT, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    TVA ({tvaRate}%)
                  </span>
                  <span>{formatCurrency(totals.tvaAmount, currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span>{formatCurrency(totals.totalTTC, currency)}</span>
                </div>
              </div>

              {/* Q2: PDF Preview button */}
              {editId && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePdfPreview}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Aperçu PDF
                </Button>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSave("brouillon")}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Brouillon
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleSave("envoyé")}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Q2: PDF Preview Dialog */}
      <Dialog
        open={pdfPreviewOpen}
        onOpenChange={(open) => {
          setPdfPreviewOpen(open);
          if (!open && pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
            setPdfPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>Aperçu PDF</DialogTitle>
          </DialogHeader>
          {pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              className="w-full flex-1 rounded-lg border"
              style={{ height: "calc(85vh - 80px)" }}
              title="Aperçu du devis PDF"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
