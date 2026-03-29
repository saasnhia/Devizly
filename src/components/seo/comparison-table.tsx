import { Check, X, Minus } from "lucide-react";

interface ComparisonRow {
  feature: string;
  excel: "yes" | "no" | "partial";
  competitor: "yes" | "no" | "partial";
  devizly: "yes" | "no" | "partial";
}

interface ComparisonTableProps {
  competitorName?: string;
  rows?: ComparisonRow[];
}

const DEFAULT_ROWS: ComparisonRow[] = [
  { feature: "Génération IA", excel: "no", competitor: "no", devizly: "yes" },
  { feature: "Signature électronique eIDAS", excel: "no", competitor: "partial", devizly: "yes" },
  { feature: "Paiement Stripe intégré", excel: "no", competitor: "no", devizly: "yes" },
  { feature: "Relances automatiques", excel: "no", competitor: "partial", devizly: "yes" },
  { feature: "Mentions légales auto", excel: "no", competitor: "yes", devizly: "yes" },
  { feature: "TVA multi-taux", excel: "no", competitor: "yes", devizly: "yes" },
  { feature: "Pipeline suivi devis", excel: "no", competitor: "no", devizly: "yes" },
  { feature: "Prix", excel: "yes", competitor: "no", devizly: "yes" },
];

function StatusIcon({ status }: { status: "yes" | "no" | "partial" }) {
  if (status === "yes") return <Check className="h-4 w-4 text-emerald-400" />;
  if (status === "partial") return <Minus className="h-4 w-4 text-amber-400" />;
  return <X className="h-4 w-4 text-red-400/60" />;
}

export function ComparisonTable({
  competitorName = "Tolteck",
  rows = DEFAULT_ROWS,
}: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-3 pr-4 text-left font-medium text-slate-400">
              Fonctionnalité
            </th>
            <th className="px-4 py-3 text-center font-medium text-slate-500">
              Excel / Word
            </th>
            <th className="px-4 py-3 text-center font-medium text-slate-500">
              {competitorName}
            </th>
            <th className="px-4 py-3 text-center font-medium text-violet-400">
              Devizly
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-b border-white/5">
              <td className="py-3 pr-4 text-slate-300">{row.feature}</td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <StatusIcon status={row.excel} />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <StatusIcon status={row.competitor} />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <StatusIcon status={row.devizly} />
                </div>
              </td>
            </tr>
          ))}
          {/* Price row */}
          <tr className="border-t border-white/10">
            <td className="py-3 pr-4 font-medium text-white">Prix</td>
            <td className="px-4 py-3 text-center text-slate-400">0€</td>
            <td className="px-4 py-3 text-center text-slate-400">25-39€/mois</td>
            <td className="px-4 py-3 text-center font-semibold text-emerald-400">
              0€ gratuit
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
