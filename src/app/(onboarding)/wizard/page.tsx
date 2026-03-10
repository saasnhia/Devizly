"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DevizlyLogo } from "@/components/devizly-logo";
import {
  CreditCard,
  Calendar,
  UserPlus,
  FileText,
  ArrowRight,
  Check,
  Loader2,
  SkipForward,
} from "lucide-react";

interface StepConfig {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
}

const STEPS: StepConfig[] = [
  {
    icon: <CreditCard className="h-8 w-8 text-white" />,
    title: "Active les paiements",
    desc: "Connecte Stripe pour encaisser tes clients directement depuis tes devis",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    icon: <Calendar className="h-8 w-8 text-white" />,
    title: "Ajoute ton Calendly",
    desc: "Tes clients pourront prendre RDV directement depuis le devis partagé",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: <UserPlus className="h-8 w-8 text-white" />,
    title: "Crée ton 1er client",
    desc: "Un client demo pour tester immédiatement le parcours complet",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    title: "Envoie ton 1er devis",
    desc: "Utilise un template pro pour créer ton premier devis en 30 secondes",
    gradient: "from-orange-500 to-rose-600",
  },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState("not_connected");
  const [demoClientId, setDemoClientId] = useState<string | null>(null);

  // Load profile data and detect return from Stripe Connect
  const init = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_connect_status, calendly_url, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile?.onboarding_completed) {
      router.push("/dashboard");
      return;
    }

    if (profile?.stripe_connect_status) {
      setStripeStatus(profile.stripe_connect_status);
    }
    if (profile?.calendly_url) {
      setCalendlyUrl(profile.calendly_url);
    }

    // Check if returning from Stripe Connect
    const returnStep = searchParams.get("step");
    if (returnStep) {
      setStep(parseInt(returnStep, 10));
    } else if (
      profile?.stripe_connect_status === "connected" ||
      profile?.stripe_connect_status === "pending"
    ) {
      // Auto-advance past Stripe step if already connected
      setStep(2);
    }

    // Check for existing demo client
    const { data: clients } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (clients && clients.length > 0) {
      setDemoClientId(clients[0].id);
    }
  }, [router, searchParams]);

  useEffect(() => {
    init();
  }, [init]);

  // Step 1: Stripe Connect
  function handleStripeConnect() {
    // Redirect to Stripe Connect authorize with wizard return flag
    window.location.href = "/api/stripe/connect/authorize?from=wizard";
  }

  // Step 2: Save Calendly URL
  async function handleSaveCalendly() {
    if (!userId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ calendly_url: calendlyUrl || null })
        .eq("id", userId);
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Create demo client
  async function handleCreateClient() {
    if (!userId) return;
    setLoading(true);
    try {
      const supabase = createClient();

      // Check if user already has a client
      if (demoClientId) {
        setStep(4);
        return;
      }

      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: userId,
          name: "SARL Demo Client",
          email: "demo@client.fr",
          company: "Demo SARL",
          address: "123 Rue de la Paix",
          city: "Paris",
          postal_code: "75001",
        })
        .select("id")
        .single();

      if (error) throw error;
      setDemoClientId(data.id);
      setStep(4);
    } finally {
      setLoading(false);
    }
  }

  // Step 4: Go create first quote
  async function handleCreateQuote() {
    if (!userId) return;
    setLoading(true);
    try {
      // Mark onboarding as completed
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);

      localStorage.setItem("devizly_wizard_done", "true");

      // Navigate to quote creation with demo client pre-selected
      const params = new URLSearchParams();
      if (demoClientId) {
        params.set("client_id", demoClientId);
      }
      router.push(`/devis/nouveau${params.toString() ? `?${params}` : ""}`);
    } finally {
      setLoading(false);
    }
  }

  // Skip current step
  async function handleSkip() {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Skip final step = go to dashboard
      if (!userId) return;
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);
      localStorage.setItem("devizly_wizard_done", "true");
      router.push("/dashboard");
    }
  }

  const currentStep = STEPS[step - 1];
  const stripeConnected =
    stripeStatus === "connected" || stripeStatus === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">
        <DevizlyLogo width={140} height={36} />
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Passer la configuration
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-8 max-w-2xl mx-auto w-full">
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i < step
                  ? "bg-indigo-600"
                  : i === step - 1
                    ? "bg-indigo-400"
                    : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Étape {step} sur {STEPS.length}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          {/* Step icon */}
          <div className="flex justify-center mb-8">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentStep.gradient} flex items-center justify-center shadow-lg`}
            >
              {currentStep.icon}
            </div>
          </div>

          {/* Title + description */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {currentStep.title}
            </h1>
            <p className="text-lg text-slate-500 max-w-md mx-auto">
              {currentStep.desc}
            </p>
          </div>

          {/* Step-specific content */}
          <div className="space-y-4">
            {step === 1 && (
              <>
                {stripeConnected ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">
                      Stripe {stripeStatus === "connected" ? "connecté" : "en cours de vérification"}
                    </span>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 transition-opacity`}
                    onClick={handleStripeConnect}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Connecter Stripe
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setStep(2)}
                >
                  {stripeConnected ? (
                    <>
                      Continuer <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <SkipForward className="mr-1 h-4 w-4" />
                      Passer pour le moment
                    </>
                  )}
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  type="url"
                  value={calendlyUrl}
                  onChange={(e) => setCalendlyUrl(e.target.value)}
                  placeholder="https://calendly.com/votre-nom/30min"
                  className="h-14 text-base px-4"
                />
                <Button
                  size="lg"
                  className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 transition-opacity`}
                  onClick={handleSaveCalendly}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Calendar className="mr-2 h-5 w-5" />
                  )}
                  {calendlyUrl ? "Enregistrer" : "Continuer sans Calendly"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setStep(3)}
                >
                  <SkipForward className="mr-1 h-4 w-4" />
                  Passer
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                {demoClientId ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Client demo déjà créé</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                        DS
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          SARL Demo Client
                        </p>
                        <p className="text-sm text-slate-500">
                          demo@client.fr
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      123 Rue de la Paix, 75001 Paris
                    </p>
                  </div>
                )}
                <Button
                  size="lg"
                  className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 transition-opacity`}
                  onClick={handleCreateClient}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : demoClientId ? (
                    <ArrowRight className="mr-2 h-5 w-5" />
                  ) : (
                    <UserPlus className="mr-2 h-5 w-5" />
                  )}
                  {demoClientId ? "Continuer" : "Créer le client demo"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setStep(4)}
                >
                  <SkipForward className="mr-1 h-4 w-4" />
                  Passer
                </Button>
              </>
            )}

            {step === 4 && (
              <>
                <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="font-medium text-slate-900">
                    Choisis un template et crée ton 1er devis
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Tu pourras le personnaliser, l&apos;envoyer et le faire
                    signer
                  </p>
                </div>
                <Button
                  size="lg"
                  className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 transition-opacity`}
                  onClick={handleCreateQuote}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-5 w-5" />
                  )}
                  Créer mon 1er devis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleSkip}
                >
                  <SkipForward className="mr-1 h-4 w-4" />
                  Aller au dashboard
                </Button>
              </>
            )}
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-6 mt-12">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                className={`flex flex-col items-center gap-1 transition-opacity ${
                  i + 1 === step ? "opacity-100" : "opacity-40 hover:opacity-60"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i < step
                      ? "bg-indigo-600 text-white"
                      : i === step - 1
                        ? `bg-gradient-to-br ${STEPS[i].gradient} text-white`
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i < step - 1 ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
