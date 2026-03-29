import { Sparkles, Send, CreditCard } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Sparkles className="h-6 w-6" />,
    title: "Décrivez votre prestation",
    description:
      "Tapez en langage naturel ce que vous allez réaliser. L'IA Mistral structure le devis avec des prix marché.",
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
  },
  {
    number: "02",
    icon: <Send className="h-6 w-6" />,
    title: "Envoyez en un clic",
    description:
      "Partagez par email, lien ou WhatsApp. Votre client consulte, signe et paie depuis son mobile.",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
  },
  {
    number: "03",
    icon: <CreditCard className="h-6 w-6" />,
    title: "Encaissez automatiquement",
    description:
      "Acompte 30% ou 50% via Stripe. Facture auto-générée. Relances J+2, J+5, J+7.",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`rounded-xl border ${step.border} bg-white/[0.03] p-6`}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.bg} ${step.color}`}
            >
              {step.icon}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-widest ${step.color}`}
            >
              Étape {step.number}
            </span>
          </div>
          <h3 className="text-lg font-semibold">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}
