export function DemoHeader() {
  return (
    <div className="px-6 pb-12 pt-20 text-center sm:pt-24">
      {/* Badge */}
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5B5BD6]/30 bg-[#5B5BD6]/10 px-4 py-1.5 text-sm font-medium text-[#818cf8]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        D&eacute;mo en direct &mdash; sans inscription
      </span>

      {/* H1 */}
      <h1
        className="mx-auto mt-5 max-w-3xl font-bold tracking-tight text-white"
        style={{ fontSize: "clamp(32px, 8vw, 64px)" }}
      >
        G&eacute;n&eacute;rez votre premier devis en{" "}
        <span className="font-serif italic text-[#818cf8]">30 secondes.</span>
      </h1>

      {/* Sub */}
      <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
        L&rsquo;IA Mistral cr&eacute;e un devis professionnel adapt&eacute; &agrave; votre m&eacute;tier.
        Essayez maintenant, sans cr&eacute;er de compte.
      </p>
    </div>
  );
}
