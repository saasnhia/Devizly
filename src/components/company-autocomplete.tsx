"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Building2, Loader2 } from "lucide-react";

interface CompanyResult {
  nom_complet: string;
  siren: string;
  siret: string;
  siege: {
    adresse: string;
    code_postal: string;
    libelle_commune: string;
    numero_voie: string;
    type_voie: string;
    libelle_voie: string;
  };
  nature_juridique: string;
  nombre_etablissements: number;
}

interface GouvApiResponse {
  results: CompanyResult[];
  total_results: number;
}

export interface CompanyData {
  name: string;
  siret: string;
  siren: string;
  address: string;
  city: string;
  postal_code: string;
  legal_form: string;
  vat_number: string;
}

// Map INSEE nature_juridique codes to readable labels
function legalFormLabel(code: string): string {
  const map: Record<string, string> = {
    "1000": "EI",
    "5498": "EURL",
    "5499": "SAS",
    "5505": "SA",
    "5510": "SAS",
    "5515": "SAS",
    "5520": "SAS",
    "5530": "SASU",
    "5532": "SASU",
    "5570": "SAS",
    "5599": "SAS",
    "5610": "SCA",
    "5710": "SAS",
    "5720": "SASU",
    "5785": "SAS",
    "5800": "SARL",
    "5485": "SARL",
    "5899": "SARL",
  };
  return map[code] || code;
}

// Compute French intra-community VAT number from SIREN
function computeVatNumber(siren: string): string {
  const s = siren.replace(/\s/g, "");
  if (s.length !== 9 || !/^\d+$/.test(s)) return "";
  const key = (12 + 3 * (parseInt(s, 10) % 97)) % 97;
  return `FR${String(key).padStart(2, "0")}${s}`;
}

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (company: CompanyData) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CompanyAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Nom ou raison sociale",
  disabled = false,
}: CompanyAutocompleteProps) {
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isParticulier, setIsParticulier] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&limit=5`,
        { signal: controller.signal }
      );
      const data: GouvApiResponse = await res.json();
      setResults(data.results || []);
      setOpen(data.results?.length > 0);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setResults([]);
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (isParticulier || !value.trim() || value.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(() => search(value), 400);
    return () => clearTimeout(timer);
  }, [value, isParticulier, search]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(company: CompanyResult) {
    const siege = company.siege;
    const addressParts = [siege.numero_voie, siege.type_voie, siege.libelle_voie]
      .filter(Boolean)
      .join(" ");

    const data: CompanyData = {
      name: company.nom_complet,
      siret: company.siret,
      siren: company.siren,
      address: addressParts || siege.adresse || "",
      city: siege.libelle_commune || "",
      postal_code: siege.code_postal || "",
      legal_form: legalFormLabel(company.nature_juridique),
      vat_number: computeVatNumber(company.siren),
    };

    onSelect(data);
    onChange(data.name);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Toggle Particulier / Entreprise */}
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIsParticulier(false);
            setOpen(false);
          }}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            !isParticulier
              ? "bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="mr-1 inline h-3 w-3" />
          Entreprise
        </button>
        <button
          type="button"
          onClick={() => {
            setIsParticulier(true);
            setOpen(false);
            setResults([]);
          }}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            isParticulier
              ? "bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Particulier
        </button>
      </div>

      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isParticulier ? "Nom du particulier" : placeholder}
          disabled={disabled}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {results.map((company) => (
            <button
              key={company.siret}
              type="button"
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
              onClick={() => handleSelect(company)}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {company.nom_complet}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  SIRET {company.siret}
                  {company.siege?.libelle_commune && ` · ${company.siege.libelle_commune}`}
                </p>
                <p className="text-xs text-slate-500">
                  {legalFormLabel(company.nature_juridique)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
