"use client";

import { use, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SignatureCanvas } from "@/components/signature-canvas";
import { formatCurrency, formatDate } from "@/lib/utils/quote";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";

interface ContractData {
  contract: {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    documentType: string;
    amount: number;
    currency: string;
    frequency: string;
    startDate: string;
    endDate: string | null;
    status: string;
    isSigned: boolean;
    signedAt: string | null;
    signerName: string | null;
    createdAt: string;
  };
  client: { name: string; email: string | null } | null;
  company: {
    name: string;
    logoUrl: string | null;
    brandColor: string;
    email: string | null;
    address: string | null;
    siret: string | null;
  };
}

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  yearly: "Annuel",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  recurring: "Contrat",
  cgv: "CGV",
  sla: "SLA",
  nda: "NDA",
};

export default function ContractSignPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetch(`/api/contracts/sign/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Contrat introuvable");
        return res.json();
      })
      .then((d: ContractData) => {
        setData(d);
        if (d.contract.isSigned) setSigned(true);
      })
      .catch(() => setError("Contrat introuvable ou lien invalide"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSign() {
    if (!signerName.trim()) {
      toast.error("Veuillez entrer votre nom");
      return;
    }
    if (!signatureData) {
      toast.error("Veuillez signer dans le cadre ci-dessous");
      return;
    }

    setSigning(true);
    try {
      const res = await fetch(`/api/contracts/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName: signerName.trim(), signatureData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la signature");
      }

      setSigned(true);
      toast.success("Contrat signe avec succes !");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la signature"
      );
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Verifiez le lien ou contactez votre prestataire.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { contract, client, company } = data;
  const brandColor = company.brandColor || "#22D3A5";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
          >
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">{contract.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {company.name}
            {company.siret && ` — SIRET ${company.siret}`}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge variant="secondary">
              {DOC_TYPE_LABELS[contract.documentType] || "Contrat"}
            </Badge>
            {signed ? (
              <Badge className="bg-green-100 text-green-700">Signe</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700">
                En attente de signature
              </Badge>
            )}
          </div>
        </div>

        {/* Contract details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details du contrat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contract.description && (
              <p className="text-sm text-muted-foreground">
                {contract.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {contract.amount > 0 && (
                <div>
                  <p className="text-muted-foreground">Montant</p>
                  <p className="font-semibold">
                    {formatCurrency(contract.amount, contract.currency || "EUR")}
                    <span className="ml-1 font-normal text-muted-foreground">
                      / {FREQUENCY_LABELS[contract.frequency] || contract.frequency}
                    </span>
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Date de debut</p>
                <p className="flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(contract.startDate)}
                </p>
              </div>
              {contract.endDate && (
                <div>
                  <p className="text-muted-foreground">Date de fin</p>
                  <p className="font-medium">{formatDate(contract.endDate)}</p>
                </div>
              )}
              {client && (
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="flex items-center gap-1 font-medium">
                    <Building2 className="h-3.5 w-3.5" />
                    {client.name}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contract content (CGV/SLA body) */}
        {contract.content && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {DOC_TYPE_LABELS[contract.documentType] || "Contenu du contrat"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-h-[500px] overflow-y-auto rounded-lg border bg-white p-4 text-sm leading-relaxed">
                {contract.content.split("\n").map((line, i) => (
                  <p key={i} className={line.trim() === "" ? "h-3" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Already signed */}
        {signed && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-4 py-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Contrat signe</p>
                <p className="text-sm text-green-600">
                  {contract.signerName && `Par ${contract.signerName}`}
                  {contract.signedAt && ` le ${formatDate(contract.signedAt)}`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signature form */}
        {!signed && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signature electronique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="signer-name">Nom complet du signataire</Label>
                <Input
                  id="signer-name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Prenom Nom"
                  maxLength={200}
                />
              </div>

              <div>
                <Label>Votre signature</Label>
                <div className="mt-1.5 rounded-lg border bg-white p-2">
                  <SignatureCanvas
                    onSignatureChange={setSignatureData}
                    width={500}
                    height={200}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                En signant ce document, vous acceptez les termes du contrat
                ci-dessus. Cette signature a valeur juridique conformement au
                reglement eIDAS (UE 910/2014).
              </p>

              <Button
                onClick={handleSign}
                disabled={signing || !signerName.trim() || !signatureData}
                className="w-full"
                style={{ backgroundColor: brandColor }}
              >
                {signing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signature en cours...
                  </>
                ) : (
                  "Signer le contrat"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Document securise par{" "}
          <a
            href="https://devizly.fr"
            className="font-medium"
            style={{ color: brandColor }}
          >
            Devizly
          </a>
        </p>
      </div>
    </div>
  );
}
