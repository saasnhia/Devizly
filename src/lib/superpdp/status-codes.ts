// AFNOR lifecycle status codes (norme XP Z12-012, "ProcessConditionCode",
// MDT-105) as transported verbatim by the SUPER PDP API in `status_code`
// (no transcoding between the wire format and the reform's own codes).
// Reference: XP Z12-012 BR-FR-CDV-CL-05/06, cross-checked against the
// SUPER PDP reference implementation (hello-lemon/module-dolibarr-lemonsuperpdp).

export const SUPERPDP_STATUS_LABELS: Record<string, string> = {
  "fr:200": "Déposée",
  "fr:201": "Émise par la plateforme",
  "fr:202": "Reçue par la plateforme",
  "fr:203": "Mise à disposition",
  "fr:204": "Prise en charge",
  "fr:205": "Approuvée",
  "fr:206": "Approuvée partiellement",
  "fr:207": "En litige",
  "fr:208": "Suspendue",
  "fr:209": "Complétée",
  "fr:210": "Refusée",
  "fr:211": "Paiement transmis",
  "fr:212": "Encaissée",
  "fr:213": "Rejetée",
  "fr:501": "Irrecevable",
};

export type SuperPdpStatusCode = keyof typeof SUPERPDP_STATUS_LABELS;

/** Statuses that require a reason code per BR-FR-CDV-15. */
export const SUPERPDP_REASON_REQUIRED = new Set<SuperPdpStatusCode>([
  "fr:206",
  "fr:207",
  "fr:208",
  "fr:210",
  "fr:213",
  "fr:501",
]);

/** Statuses that represent a definitively negative outcome. */
export const SUPERPDP_NEGATIVE_STATUSES = new Set<SuperPdpStatusCode>([
  "fr:210", // Refusée
  "fr:213", // Rejetée
  "fr:501", // Irrecevable
]);

export function superpdpStatusLabel(code: string | null | undefined): string {
  if (!code) return "—";
  return SUPERPDP_STATUS_LABELS[code] ?? code;
}
