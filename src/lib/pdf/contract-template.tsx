import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";

/* ── Types ─────────────────────────────────────── */

interface PdfClient {
  name: string;
  email?: string | null;
}

interface PdfCompany {
  name?: string;
  address?: string;
  siret?: string;
  logo_url?: string | null;
}

export interface ContractPdfProps {
  title: string;
  documentType: string;
  content: string | null;
  amount: number;
  currency: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  status: string;
  client?: PdfClient | null;
  company: PdfCompany;
  signatureData?: string | null;
  signerName?: string | null;
  signedAt?: string | null;
  signerIp?: string | null;
  documentHash?: string | null;
  createdAt: string;
  ownerPlan?: string;
}

/* ── Colors ────────────────────────────────────── */

const C = {
  primary: "#6366F1",
  dark: "#0F172A",
  muted: "#64748B",
  light: "#F8FAFC",
  border: "#E2E8F0",
  green: "#16A34A",
  greenBg: "#F0FDF4",
  white: "#FFFFFF",
};

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "mensuel",
  quarterly: "trimestriel",
  yearly: "annuel",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  recurring: "CONTRAT RECURRENT",
  prestation: "CONTRAT DE PRESTATION",
  cgv: "CGV",
  sla: "SLA",
  nda: "NDA",
};

/* ── Styles ────────────────────────────────────── */

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.dark,
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: { width: 40, height: 40 },
  brandName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
  },
  companyInfo: { fontSize: 8, color: C.muted, marginTop: 2 },
  docLabel: { fontSize: 9, color: C.muted, textAlign: "right" as const },
  docTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    textAlign: "right" as const,
    maxWidth: 260,
  },
  statusBadge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
    textAlign: "center" as const,
    alignSelf: "flex-end" as const,
  },
  metaBox: {
    backgroundColor: C.light,
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaCol: { flexDirection: "column" },
  metaLabel: {
    fontSize: 7,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase" as const,
    marginBottom: 2,
  },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  disclaimer: {
    fontSize: 7,
    color: C.muted,
    fontStyle: "italic" as const,
    marginBottom: 16,
    lineHeight: 1.4,
  },
  bodyText: {
    fontSize: 9.5,
    lineHeight: 1.6,
    marginBottom: 2,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 16,
  },
  signatureCol: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 12,
    minHeight: 110,
  },
  signatureColSigned: {
    borderColor: "#BBF7D0",
    backgroundColor: C.greenBg,
  },
  signatureLabel: {
    fontSize: 8,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase" as const,
    marginBottom: 8,
  },
  signatureImage: { width: 160, height: 64, marginBottom: 6 },
  signatureInfo: { fontSize: 8, color: C.green },
  signaturePlaceholderLine: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginTop: 40,
    marginBottom: 4,
  },
  signaturePlaceholderText: { fontSize: 7, color: C.muted },
  footer: {
    position: "absolute" as const,
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: C.muted,
    textAlign: "center" as const,
    lineHeight: 1.6,
  },
});

/* ── Helpers ───────────────────────────────────── */

function fmt(n: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency })
    .format(n)
    .replace(/[\u202f\u00a0]/g, " ");
}

function fmtDate(d: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

function statusStyle(status: string) {
  if (status === "signed") return { backgroundColor: C.greenBg, color: C.green };
  if (status === "pending_signature")
    return { backgroundColor: "#EFF6FF", color: "#2563EB" };
  if (status === "ended") return { backgroundColor: C.light, color: C.muted };
  return { backgroundColor: "#FEF3C7", color: "#92400E" };
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "BROUILLON",
    active: "ACTIF",
    paused: "EN PAUSE",
    ended: "TERMINE",
    pending_signature: "EN ATTENTE DE SIGNATURE",
    signed: "SIGNE",
  };
  return map[status] || status.toUpperCase();
}

/* ── Component ─────────────────────────────────── */

export function ContractPdf(props: ContractPdfProps) {
  const {
    title,
    documentType,
    content,
    amount,
    currency,
    frequency,
    startDate,
    endDate,
    status,
    client,
    company,
    signatureData,
    signerName,
    signedAt,
    signerIp,
    documentHash,
    createdAt,
  } = props;

  const isSigned = status === "signed" && !!signatureData;
  const paragraphs = (content || "").split("\n");

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <View style={s.headerLeft}>
              {company.logo_url && <Image src={company.logo_url} style={s.logo} />}
              <Text style={s.brandName}>{company.name || "Prestataire"}</Text>
            </View>
            {company.address && <Text style={s.companyInfo}>{company.address}</Text>}
            <Text style={s.companyInfo}>
              {company.siret ? `SIRET : ${company.siret}` : "SIRET en cours d'immatriculation"}
            </Text>
          </View>
          <View>
            <Text style={s.docLabel}>{DOC_TYPE_LABELS[documentType] || "CONTRAT"}</Text>
            <Text style={s.docTitle}>{title}</Text>
            <View style={[s.statusBadge, statusStyle(status)]}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                {statusLabel(status)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Meta ── */}
        <View style={s.metaBox}>
          <View style={s.metaCol}>
            <Text style={s.metaLabel}>Client</Text>
            <Text style={s.metaValue}>{client?.name || "—"}</Text>
          </View>
          {amount > 0 && (
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Montant</Text>
              <Text style={s.metaValue}>
                {fmt(amount, currency)}
                {documentType === "recurring" ? ` / ${FREQUENCY_LABELS[frequency] || frequency}` : ""}
              </Text>
            </View>
          )}
          <View style={s.metaCol}>
            <Text style={s.metaLabel}>Date de debut</Text>
            <Text style={s.metaValue}>{fmtDate(startDate)}</Text>
          </View>
          {endDate && (
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Date de fin</Text>
              <Text style={s.metaValue}>{fmtDate(endDate)}</Text>
            </View>
          )}
        </View>

        {/* ── Legal disclaimer ── */}
        <Text style={s.disclaimer}>
          Ce document est genere a partir d&apos;un modele fourni a titre indicatif. Il est
          recommande de le faire valider par un professionnel du droit avant toute
          utilisation commerciale. Devizly ne fournit pas de conseil juridique.
        </Text>

        {/* ── Body ── */}
        {paragraphs.map((line, i) => (
          <Text key={i} style={[s.bodyText, line.trim() === "" ? { height: 8 } : {}]}>
            {line}
          </Text>
        ))}

        {/* ── Signatures ── */}
        <View style={s.signatureRow} wrap={false}>
          <View style={[s.signatureCol, isSigned ? s.signatureColSigned : {}]}>
            <Text style={s.signatureLabel}>Le Prestataire</Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
              {company.name || "—"}
            </Text>
            <View style={s.signaturePlaceholderLine} />
            <Text style={s.signaturePlaceholderText}>Signature</Text>
          </View>
          <View style={[s.signatureCol, isSigned ? s.signatureColSigned : {}]}>
            <Text style={s.signatureLabel}>Le Client</Text>
            {isSigned ? (
              <>
                <Image src={signatureData!} style={s.signatureImage} />
                {signerName && (
                  <Text style={s.signatureInfo}>Signe par : {signerName}</Text>
                )}
                {signedAt && (
                  <Text style={s.signatureInfo}>
                    Le {new Date(signedAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={{ fontSize: 9, marginBottom: 4 }}>{client?.name || "—"}</Text>
                <View style={s.signaturePlaceholderLine} />
                <Text style={s.signaturePlaceholderText}>Signature</Text>
              </>
            )}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {company.name || "Devizly"}
            {company.siret ? ` — SIRET ${company.siret}` : ""}
            {company.address ? ` — ${company.address}` : ""}
          </Text>
          <Text style={s.footerText}>
            Document genere le {fmtDate(createdAt)} — modele fourni a titre indicatif, a
            faire valider par un professionnel du droit.
          </Text>
          {props.ownerPlan === "free" ? (
            <Link src="https://devizly.fr" style={{ fontSize: 7, color: "#94a3b8", textDecoration: "none" }}>
              Cree avec Devizly — Essai gratuit sur devizly.fr
            </Link>
          ) : (
            <Text style={s.footerText}>Document genere par Devizly — devizly.fr</Text>
          )}
        </View>
      </Page>

      {/* ── eIDAS Certificate Page ── */}
      {isSigned && documentHash && (
        <Page size="A4" style={s.page}>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: C.primary, marginBottom: 4 }}>
              Certificat de signature electronique
            </Text>
            <Text style={{ fontSize: 9, color: C.muted }}>
              Conforme au reglement eIDAS (UE) n°910/2014
            </Text>
          </View>

          <View style={{ backgroundColor: C.light, borderRadius: 6, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 8, color: C.muted, fontFamily: "Helvetica-Bold", textTransform: "uppercase" as const, marginBottom: 8 }}>
              Document
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ fontSize: 9, color: C.muted, width: 120 }}>Titre</Text>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{title}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ fontSize: 9, color: C.muted, width: 120 }}>Date de creation</Text>
              <Text style={{ fontSize: 9 }}>{fmtDate(createdAt)}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ fontSize: 9, color: C.muted, width: 120 }}>Emetteur</Text>
              <Text style={{ fontSize: 9 }}>{company.name || "Non renseigne"}</Text>
            </View>
            {client && (
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 9, color: C.muted, width: 120 }}>Destinataire</Text>
                <Text style={{ fontSize: 9 }}>{client.name}</Text>
              </View>
            )}
          </View>

          <View style={{ backgroundColor: C.light, borderRadius: 6, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 8, color: C.muted, fontFamily: "Helvetica-Bold", textTransform: "uppercase" as const, marginBottom: 8 }}>
              Signature
            </Text>
            {signerName && (
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: C.muted, width: 120 }}>Signataire</Text>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{signerName}</Text>
              </View>
            )}
            {signedAt && (
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: C.muted, width: 120 }}>Date de signature</Text>
                <Text style={{ fontSize: 9 }}>{new Date(signedAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</Text>
              </View>
            )}
            {signerIp && (
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: C.muted, width: 120 }}>Adresse IP</Text>
                <Text style={{ fontSize: 9, fontFamily: "Courier" }}>{signerIp}</Text>
              </View>
            )}
          </View>

          <View style={{ backgroundColor: C.light, borderRadius: 6, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 8, color: C.muted, fontFamily: "Helvetica-Bold", textTransform: "uppercase" as const, marginBottom: 8 }}>
              Integrite du document
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ fontSize: 9, color: C.muted, width: 120 }}>Algorithme</Text>
              <Text style={{ fontSize: 9 }}>SHA-256</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 9, color: C.muted, width: 120 }}>Empreinte</Text>
              <Text style={{ fontSize: 7, fontFamily: "Courier", maxWidth: 350 }}>{documentHash}</Text>
            </View>
          </View>

          {signatureData && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 8, color: C.muted, fontFamily: "Helvetica-Bold", textTransform: "uppercase" as const, marginBottom: 8 }}>
                Signature visuelle
              </Text>
              <Image src={signatureData} style={{ width: 200, height: 80 }} />
            </View>
          )}

          <View style={{ borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 }}>
            <Text style={{ fontSize: 8, color: C.muted, lineHeight: 1.6 }}>
              Ce certificat atteste que le document reference ci-dessus a ete signe electroniquement
              via la plateforme Devizly (devizly.fr). La signature a ete realisee conformement au
              reglement eIDAS (UE) n°910/2014 relatif a l&apos;identification electronique et aux
              services de confiance pour les transactions electroniques. L&apos;empreinte SHA-256
              garantit l&apos;integrite du document au moment de la signature.
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
