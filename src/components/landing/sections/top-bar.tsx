import Link from "next/link";

export function TopBar() {
  return (
    <Link
      href="/pricing"
      className="block w-full bg-gradient-to-r from-[#0d0d14] via-[#12101f] to-[#0d0d14] border-b border-[#5B5BD6]/20 py-2 px-3 text-center text-xs hover:bg-[#111120] transition-colors cursor-pointer z-50 relative"
    >
      <span className="text-slate-400">&#11088;</span>{" "}
      {/* Desktop */}
      <span className="hidden sm:inline">
        <span className="text-slate-400">Offre Fondateur</span>
        <span className="text-slate-500 mx-1">&mdash;</span>
        <span className="text-slate-400 line-through mr-1">19&euro;/mois</span>
        <span className="text-white font-semibold">9&euro;/mois &agrave; vie</span>
        <span className="text-slate-500 mx-1">&middot;</span>
        <span className="text-slate-400">100 premi&egrave;res places</span>
        <span className="text-[#5B5BD6] font-semibold ml-2">En profiter &rarr;</span>
      </span>
      {/* Mobile */}
      <span className="sm:hidden">
        <span className="text-white font-semibold">9&euro;/mois &agrave; vie</span>
        <span className="text-slate-500 mx-1">&middot;</span>
        <span className="text-slate-400">100 places</span>
        <span className="text-[#5B5BD6] font-semibold ml-1">&rarr;</span>
      </span>
    </Link>
  );
}
