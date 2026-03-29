import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  variant?: "violet" | "emerald";
}

export function CTABanner({
  title = "Prêt à créer votre premier devis ?",
  subtitle = "Gratuit, sans carte bancaire, en 30 secondes avec l'IA.",
  cta = "Essayer gratuitement",
  href = "/signup",
  variant = "violet",
}: CTABannerProps) {
  const gradient =
    variant === "emerald"
      ? "from-emerald-600/20 to-teal-500/20"
      : "from-violet-600/20 to-indigo-500/20";
  const btnGradient =
    variant === "emerald"
      ? "from-emerald-600 to-teal-500 shadow-emerald-500/25 hover:shadow-emerald-500/40"
      : "from-violet-600 to-indigo-500 shadow-violet-500/25 hover:shadow-violet-500/40";

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-10 text-center`}
    >
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-slate-400">{subtitle}</p>
      <Link
        href={href}
        className={`mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${btnGradient} px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:brightness-110`}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
