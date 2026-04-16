"use client";

import { useReveal } from "../hooks/useReveal";

/* ── Mini-visuals for each step ── */

function TerminalVisual() {
  return (
    <div className="mt-5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] p-4 font-mono text-xs">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28ca41]" />
      </div>
      <p className="text-slate-500">
        <span className="text-[#5B5BD6]">$</span> d&eacute;crivez votre prestation&hellip;
      </p>
      <p className="mt-2 text-slate-300">
        &quot;R&eacute;novation compl&egrave;te cuisine 12m&sup2;&quot;
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: "3px",
            height: "16px",
            backgroundColor: "#a5b4fc",
            marginLeft: "4px",
            verticalAlign: "middle",
            animation: "cursor-blink-hero 1s steps(2, start) infinite",
          }}
        />
      </p>
      <p className="mt-2 text-green-400/70">&#10003; Devis g&eacute;n&eacute;r&eacute; &mdash; 7 lignes, 16&nbsp;596&nbsp;&euro; TTC</p>
    </div>
  );
}

function SignatureVisual() {
  return (
    <div className="mt-5 flex flex-col items-center rounded-lg border border-white/[0.06] bg-[#0a0a0f] p-5">
      <p className="mb-3 text-xs text-slate-500">Signature du client</p>
      <svg viewBox="0 0 200 50" className="h-10 w-40 text-white/80">
        <path
          d="M10 35 Q30 8 60 28 T120 12 T185 30"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="sig-draw-loop"
        />
      </svg>
      <div className="mt-3 flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-xs font-medium text-green-400">Sign&eacute; &#10003;</span>
      </div>
    </div>
  );
}

function PaymentVisual() {
  return (
    <div className="mt-5 rounded-lg border border-white/[0.06] bg-[#0a0a0f] p-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div>
          <p className="text-xs text-slate-500">Acompte 30%</p>
          <p className="text-lg font-bold text-white">4&nbsp;978,80&nbsp;&euro;</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF]/15">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#635BFF]" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.19l-.888 5.534C5.016 22.96 7.97 24 11.33 24c2.6 0 4.719-.64 6.226-1.876 1.636-1.322 2.487-3.268 2.487-5.672 0-4.123-2.508-5.804-6.067-7.302z" />
          </svg>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-slate-300">Re&ccedil;u</span>
        <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-400">
          &#10003; Vir&eacute; sur votre compte
        </span>
      </div>
    </div>
  );
}

/* ── Steps data ── */

const steps = [
  {
    num: "01",
    title: "Décrivez",
    titleAccent: "votre prestation",
    description:
      "En quelques mots, l'IA structure votre devis avec des prix marché. Vous ajustez tout librement.",
    Visual: TerminalVisual,
  },
  {
    num: "02",
    title: "Envoyez,",
    titleAccent: "faites signer",
    description:
      "Votre client reçoit un lien, consulte le devis et signe électroniquement depuis son navigateur.",
    Visual: SignatureVisual,
  },
  {
    num: "03",
    title: "Encaissez",
    titleAccent: "immédiatement",
    description:
      "Acompte Stripe intégré. Votre client paie en ligne, les fonds arrivent sous 48h.",
    Visual: PaymentVisual,
  },
];

/* ── Main component ── */

export function FlowSteps() {
  const ref = useReveal<HTMLElement>();
  const gridRef = useReveal<HTMLDivElement>(0.2);

  return (
    <section ref={ref} id="fonctionnalites" className="reveal-fade py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section label */}
        <p className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#818cf8]">
          Fonctionnement
        </p>

        {/* Heading */}
        <h2
          className="mx-auto max-w-2xl text-center font-bold tracking-tight text-white"
          style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
        >
          3 &eacute;tapes. 2 minutes.{" "}
          <span className="font-serif italic text-[#818cf8]">C&rsquo;est tout.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-base text-slate-400">
          De la description &agrave; l&rsquo;encaissement, tout se passe dans Devizly.
        </p>

        {/* Steps grid */}
        <div
          ref={gridRef}
          className="steps-grid relative mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6"
        >
          {/* Connecting line (desktop only) */}
          <div className="pointer-events-none absolute top-10 left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent md:block" />

          {steps.map((step) => (
            <div
              key={step.num}
              className="step-card card-lift-sm relative rounded-2xl border border-transparent p-4 md:p-5"
            >
              {/* Number badge */}
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366f1]/[0.12]">
                <span className="font-serif text-lg italic text-[#818cf8]">
                  {step.num}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white">
                {step.title}{" "}
                <span className="font-serif italic text-[#818cf8]">
                  {step.titleAccent}
                </span>
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {step.description}
              </p>

              {/* Mini visual */}
              <step.Visual />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
