interface DevisExampleProps {
  metier?: string;
  lines?: { description: string; qty: number; unit: string; price: number }[];
}

const defaultLines = [
  { description: "Design UX/UI (maquettes)", qty: 1, unit: "forfait", price: 1200 },
  { description: "Développement Next.js", qty: 1, unit: "forfait", price: 2800 },
  { description: "Hébergement + déploiement", qty: 1, unit: "forfait", price: 350 },
];

export function DevisExample({
  metier = "Développeur web",
  lines = defaultLines,
}: DevisExampleProps) {
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const tva = Math.round(subtotal * 0.2);
  const total = subtotal + tva;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
      {/* Header */}
      <div className="border-b border-white/5 px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Devis exemple
            </p>
            <p className="mt-0.5 text-sm font-semibold">{metier}</p>
          </div>
          <span className="rounded-md bg-violet-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400">
            Généré par IA
          </span>
        </div>
      </div>

      {/* Lines */}
      <div className="divide-y divide-white/5 px-5">
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 text-sm"
          >
            <div className="flex-1">
              <p className="text-slate-200">{line.description}</p>
              <p className="text-xs text-slate-500">
                {line.qty} {line.unit}
              </p>
            </div>
            <p className="font-medium tabular-nums">
              {(line.qty * line.price).toLocaleString("fr-FR")} €
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Total HT</span>
          <span>{subtotal.toLocaleString("fr-FR")} €</span>
        </div>
        <div className="mt-1 flex justify-between text-slate-400">
          <span>TVA 20%</span>
          <span>{tva.toLocaleString("fr-FR")} €</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-bold">
          <span>Total TTC</span>
          <span className="text-violet-400">
            {total.toLocaleString("fr-FR")} €
          </span>
        </div>
      </div>
    </div>
  );
}
