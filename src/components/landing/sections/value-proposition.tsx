"use client";

export function ValueProposition() {
  return (
    <section className="relative">
      {/* Block A — Describe */}
      <div className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="reveal-left text-4xl font-bold text-white tracking-tight lg:text-6xl">
            Décrivez votre prestation<br className="hidden sm:block" /> en une phrase.
          </h2>
          <div className="reveal-left mt-8 max-w-2xl rounded-xl border border-white/[0.08] bg-white/[0.04] p-5">
            <p className="text-slate-400">
              &ldquo;Site e-commerce pour restaurant gastronomique avec réservation en ligne&rdquo;
            </p>
          </div>
          <p className="reveal-left mt-4 text-sm text-slate-500">
            L&apos;IA Mistral structure le reste.
          </p>
        </div>
      </div>

      {/* Block B — Sign */}
      <div className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="reveal-right text-4xl font-bold text-white tracking-tight lg:text-6xl lg:text-right lg:ml-auto">
            Votre client signe<br className="hidden sm:block" /> depuis son téléphone.
          </h2>
          <div className="reveal-right mt-8 lg:ml-auto lg:mr-0 w-fit">
            {/* Phone mockup */}
            <div className="mx-auto w-[220px] rounded-[2rem] border-2 border-white/[0.1] bg-white/[0.03] p-4 shadow-2xl lg:ml-auto">
              <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-white/[0.1]" />
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[10px] text-slate-500 mb-3">Votre signature</p>
                <svg viewBox="0 0 180 50" className="w-full h-10 text-slate-300">
                  <path d="M10 35 Q40 5 70 30 T130 15 T170 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-semibold text-green-400">Signé &#10003;</span>
                </div>
              </div>
              <div className="mx-auto mt-4 h-1 w-10 rounded-full bg-white/[0.06]" />
            </div>
          </div>
        </div>
      </div>

      {/* Block C — Get paid */}
      <div className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="reveal-left text-4xl font-bold text-white tracking-tight lg:text-6xl">
            L&apos;acompte tombe sur votre compte.<br className="hidden sm:block" /> Automatiquement.
          </h2>
          <div className="reveal-left mt-8 max-w-sm rounded-xl border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF]/15">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#635BFF]" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.19l-.888 5.534C5.016 22.96 7.97 24 11.33 24c2.6 0 4.719-.64 6.226-1.876 1.636-1.322 2.487-3.268 2.487-5.672 0-4.123-2.508-5.804-6.067-7.302z" />
                </svg>
              </div>
              <span className="text-xs text-slate-500">Stripe Connect</span>
            </div>
            <p className="text-2xl font-bold text-white">750,00 &euro; reçu</p>
            <p className="mt-1 text-xs text-slate-500">il y a 3 secondes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
