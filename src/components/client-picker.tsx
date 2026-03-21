"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2, Users, Loader2, Plus, X } from "lucide-react";
import type { Client } from "@/types";

/* ── INSEE types ─────────────────────────────────── */

interface InseeResult {
  nom_complet: string;
  siren: string;
  siege: {
    siret: string;
    adresse: string;
    code_postal: string;
    libelle_commune: string;
    numero_voie: string;
    type_voie: string;
    libelle_voie: string;
  };
  nature_juridique: string;
}

interface InseeApiResponse {
  results: InseeResult[];
}

function legalLabel(code: string): string {
  const m: Record<string, string> = {
    "1000": "EI", "5498": "EURL", "5499": "SAS", "5505": "SA",
    "5510": "SAS", "5515": "SAS", "5520": "SAS", "5530": "SASU",
    "5532": "SASU", "5570": "SAS", "5599": "SAS", "5710": "SAS",
    "5720": "SASU", "5800": "SARL", "5485": "SARL", "5899": "SARL",
  };
  return m[code] || "";
}

/* ── Component ────────────────────────────────────── */

interface ClientPickerProps {
  clients: Client[];
  selectedId: string;
  onSelect: (clientId: string) => void;
  onClientCreated: (client: Client) => void;
}

export function ClientPicker({
  clients,
  selectedId,
  onSelect,
  onClientCreated,
}: ClientPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [inseeResults, setInseeResults] = useState<InseeResult[]>([]);
  const [inseeLoading, setInseeLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [inlineForm, setInlineForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [inlineSaving, setInlineSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedId);

  // Filter local clients
  const filteredClients = query.length >= 1
    ? clients.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  // Debounced INSEE search
  const searchInsee = useCallback(async (q: string) => {
    if (q.length < 3) { setInseeResults([]); return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setInseeLoading(true);
    try {
      const res = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(q)}&limit=4`,
        { signal: controller.signal }
      );
      const data: InseeApiResponse = await res.json();
      setInseeResults(data.results || []);
    } catch (err) {
      if ((err as Error).name !== "AbortError") setInseeResults([]);
    } finally {
      setInseeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setInseeResults([]);
      return;
    }
    const timer = setTimeout(() => searchInsee(query), 400);
    return () => clearTimeout(timer);
  }, [query, searchInsee]);

  // Click outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowInlineForm(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Select existing client
  function handleSelectExisting(client: Client) {
    onSelect(client.id);
    setQuery("");
    setOpen(false);
  }

  // Create client from INSEE result then select
  async function handleSelectInsee(company: InseeResult) {
    setCreating(true);
    const siege = company.siege;
    const address = [siege.numero_voie, siege.type_voie, siege.libelle_voie]
      .filter(Boolean).join(" ");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: company.nom_complet,
          siret: siege.siret || "",
          address: address || siege.adresse || "",
          city: siege.libelle_commune || "",
          postal_code: siege.code_postal || "",
        }),
      });
      const result = await res.json();
      if (res.ok && result.data) {
        onClientCreated(result.data);
        onSelect(result.data.id);
        setQuery("");
        setOpen(false);
      }
    } catch { /* silent */ }
    finally { setCreating(false); }
  }

  // Create client from inline form
  async function handleInlineCreate() {
    if (!inlineForm.name.trim()) return;
    setInlineSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inlineForm),
      });
      const result = await res.json();
      if (res.ok && result.data) {
        onClientCreated(result.data);
        onSelect(result.data.id);
        setQuery("");
        setOpen(false);
        setShowInlineForm(false);
        setInlineForm({ name: "", email: "", phone: "", address: "" });
      }
    } catch { /* silent */ }
    finally { setInlineSaving(false); }
  }

  // Clear selection
  function handleClear() {
    onSelect("");
    setQuery("");
  }

  const hasResults = filteredClients.length > 0 || inseeResults.length > 0 || query.length >= 2;

  return (
    <div ref={containerRef} className="relative">
      {selectedClient ? (
        /* Selected state */
        <div className="flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2">
          <Users className="h-4 w-4 shrink-0 text-violet-500" />
          <span className="flex-1 truncate text-sm font-medium">{selectedClient.name}</span>
          {selectedClient.city && (
            <span className="text-xs text-slate-400">{selectedClient.city}</span>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Search input */
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => { if (query.length >= 1) setOpen(true); }}
            placeholder="Rechercher ou créer un client (optionnel)"
          />
          {(inseeLoading || creating) && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && !selectedClient && hasResults && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="max-h-80 overflow-y-auto">
            {/* Section 1: Existing clients */}
            {filteredClients.length > 0 && (
              <>
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Vos clients
                </p>
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-violet-50"
                    onClick={() => handleSelectExisting(c)}
                  >
                    <Users className="h-4 w-4 shrink-0 text-violet-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                      {c.city && <p className="text-xs text-slate-400">{c.city}</p>}
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Separator */}
            {filteredClients.length > 0 && (inseeResults.length > 0 || inseeLoading) && (
              <div className="border-t border-slate-100" />
            )}

            {/* Section 2: INSEE results */}
            {(inseeResults.length > 0 || inseeLoading) && (
              <>
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Annuaire officiel
                </p>
                {inseeLoading && inseeResults.length === 0 && (
                  <div className="flex items-center gap-2 px-3 py-3 text-xs text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Recherche en cours...
                  </div>
                )}
                {inseeResults.map((co) => (
                  <button
                    key={co.siege?.siret || co.siren}
                    type="button"
                    disabled={creating}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-blue-50 disabled:opacity-50"
                    onClick={() => handleSelectInsee(co)}
                  >
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{co.nom_complet}</p>
                      <p className="truncate text-xs text-slate-400">
                        SIRET {co.siege?.siret || co.siren}
                        {co.siege?.libelle_commune && ` · ${co.siege.libelle_commune}`}
                        {legalLabel(co.nature_juridique) && ` · ${legalLabel(co.nature_juridique)}`}
                      </p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Create new client */}
          {query.length >= 2 && (
            <div className="border-t border-slate-100">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50"
                onClick={() => {
                  setShowInlineForm(true);
                  setInlineForm({ ...inlineForm, name: query });
                }}
              >
                <Plus className="h-4 w-4" />
                Créer &quot;{query}&quot; comme nouveau client
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline create form */}
      {showInlineForm && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Nouveau client</p>
            <button
              type="button"
              onClick={() => setShowInlineForm(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nom *</Label>
              <Input
                value={inlineForm.name}
                onChange={(e) => setInlineForm({ ...inlineForm, name: e.target.value })}
                placeholder="Nom ou raison sociale"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={inlineForm.email}
                  onChange={(e) => setInlineForm({ ...inlineForm, email: e.target.value })}
                  placeholder="client@exemple.fr"
                />
              </div>
              <div>
                <Label className="text-xs">Téléphone</Label>
                <Input
                  value={inlineForm.phone}
                  onChange={(e) => setInlineForm({ ...inlineForm, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Adresse</Label>
              <Input
                value={inlineForm.address}
                onChange={(e) => setInlineForm({ ...inlineForm, address: e.target.value })}
                placeholder="123 rue de la Paix, 75001 Paris"
              />
            </div>
            <Button
              className="w-full"
              size="sm"
              disabled={!inlineForm.name.trim() || inlineSaving}
              onClick={handleInlineCreate}
            >
              {inlineSaving ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="mr-2 h-3.5 w-3.5" />
              )}
              Créer et sélectionner
            </Button>
          </div>
        </div>
      )}

      <p className="mt-1 text-xs text-slate-400">
        Tapez un nom pour chercher parmi vos clients ou dans l&apos;annuaire officiel
      </p>
    </div>
  );
}
