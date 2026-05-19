"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DevizlyLogo } from "@/components/devizly-logo";
import { toast } from "sonner";
import {
  Building2,
  UserPlus,
  FileText,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowRight,
  Check,
  Loader2,
  SkipForward,
  Upload,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Configuration des etapes ──────────────────────────── */

interface StepConfig {
  icon: LucideIcon;
  title: string;
  desc: string;
  gradient: string;
}

const STEPS: StepConfig[] = [
  {
    icon: Building2,
    title: "Votre entreprise",
    desc: "Vos informations légales — indispensables pour des devis conformes",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    icon: UserPlus,
    title: "Votre 1er client",
    desc: "Ajoutez un client pour pouvoir lui adresser un devis",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: FileText,
    title: "Votre 1er devis",
    desc: "Créez un devis professionnel en 30 secondes avec l'IA",
    gradient: "from-orange-500 to-rose-600",
  },
  {
    icon: CreditCard,
    title: "Encaissez vos clients",
    desc: "Connectez Stripe pour recevoir acomptes et paiements",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Calendar,
    title: "Votre Calendly",
    desc: "Vos clients prennent RDV directement depuis vos devis partagés",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: Sparkles,
    title: "Tout est prêt !",
    desc: "Voici ce que vous venez de débloquer avec Devizly",
    gradient: "from-violet-500 to-fuchsia-600",
  },
];

const TOTAL_STEPS = STEPS.length;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIRET_TAKEN_MSG =
  "Ce SIRET est déjà associé à un compte Devizly. Si c'est vous, connectez-vous avec votre email d'origine.";

const RECAP_FEATURES = [
  "Génération de devis par IA",
  "Factures Factur-X (PDF/A-3) conformes 2026",
  "Relances automatiques J+2, J+5, J+7",
  "Signature électronique eIDAS",
  "Briefing quotidien de votre activité",
  "Export PDF professionnel",
];

/* ── Composant ─────────────────────────────────────────── */

export default function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [stripeStatus, setStripeStatus] = useState("not_connected");

  // Étape 1 — entreprise
  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");
  const [tvaNumber, setTvaNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);

  // Étape 2 — client
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);

  // Étape 5 — Calendly
  const [calendlyUrl, setCalendlyUrl] = useState("");

  /* ── Persistance de la progression ── */
  const persistStep = useCallback(
    (n: number, uid: string | null) => {
      if (!uid) return;
      const supabase = createClient();
      // onboarding_step (migration 039) — fire-and-forget, non bloquant
      supabase
        .from("profiles")
        .update({ onboarding_step: n })
        .eq("id", uid)
        .then(() => {});
    },
    []
  );

  const goToStep = useCallback(
    (n: number) => {
      const clamped = Math.min(Math.max(n, 1), TOTAL_STEPS);
      setStep(clamped);
      persistStep(clamped, userId);
    },
    [persistStep, userId]
  );

  /* ── Chargement initial ── */
  const init = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "stripe_connect_status, calendly_url, onboarding_completed, subscription_status, company_name, company_siret, tva_number, company_address, company_city, company_postal_code, logo_url"
      )
      .eq("id", user.id)
      .single();

    if (profile?.onboarding_completed) {
      router.push("/dashboard");
      return;
    }

    if (profile?.subscription_status) setUserPlan(profile.subscription_status);
    if (profile?.stripe_connect_status) setStripeStatus(profile.stripe_connect_status);
    if (profile?.calendly_url) setCalendlyUrl(profile.calendly_url);
    if (profile?.company_name) setCompanyName(profile.company_name);
    if (profile?.company_siret) setSiret(profile.company_siret);
    if (profile?.tva_number) setTvaNumber(profile.tva_number);
    if (profile?.company_address) setAddress(profile.company_address);
    if (profile?.company_city) setCity(profile.company_city);
    if (profile?.company_postal_code) setPostalCode(profile.company_postal_code);
    if (profile?.logo_url) setLogoUrl(profile.logo_url);

    // Restauration du step sauvegardé (requête isolée : la colonne
    // onboarding_step peut ne pas encore être migrée — fallback step 1).
    let savedStep = 1;
    const { data: stepData } = await supabase
      .from("profiles")
      .select("onboarding_step")
      .eq("id", user.id)
      .single();
    if (
      stepData?.onboarding_step &&
      stepData.onboarding_step >= 1 &&
      stepData.onboarding_step <= TOTAL_STEPS
    ) {
      savedStep = stepData.onboarding_step;
    }

    // Pré-remplir le 1er client si un client existe déjà
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, email, phone")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);
    if (clients && clients.length > 0) {
      setCreatedClientId(clients[0].id);
      setClientName(clients[0].name ?? "");
      setClientEmail(clients[0].email ?? "");
      setClientPhone(clients[0].phone ?? "");
    }

    // Le param ?step= (retour Stripe Connect) prime sur le step sauvegardé
    const returnStep = searchParams.get("step");
    if (returnStep) {
      const parsed = parseInt(returnStep, 10);
      if (parsed >= 1 && parsed <= TOTAL_STEPS) {
        setStep(parsed);
        return;
      }
    }
    setStep(savedStep);
  }, [router, searchParams]);

  useEffect(() => {
    init();
  }, [init]);

  /* ── Étape 1 — logo ── */
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image (PNG, JPEG)");
      return;
    }
    if (file.size > 500_000) {
      toast.error("Logo trop volumineux (500KB max)");
      return;
    }
    setLogoLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await fetch("/api/admin/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: dataUrl }),
      });
      if (res.ok) {
        setLogoUrl(dataUrl);
        toast.success("Logo enregistré");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de l'upload");
      }
      setLogoLoading(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleLogoDelete() {
    setLogoLoading(true);
    const res = await fetch("/api/admin/logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logo_url: null }),
    });
    if (res.ok) setLogoUrl(null);
    setLogoLoading(false);
  }

  /* ── Étape 1 — sauvegarde entreprise ── */
  async function handleSaveCompany() {
    if (!userId) return;
    if (!companyName.trim()) {
      toast.error("La raison sociale est requise");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const siretRaw = siret.trim();

      // Anti-abus : SIRET unique cross-comptes (idx_profiles_company_siret_unique)
      if (siretRaw) {
        const candidates = Array.from(
          new Set([siretRaw, siretRaw.replace(/\s/g, "")].filter(Boolean))
        );
        const { data: dups } = await supabase
          .from("profiles")
          .select("id")
          .in("company_siret", candidates)
          .neq("id", userId)
          .limit(1);
        if (dups && dups.length > 0) {
          toast.error(SIRET_TAKEN_MSG);
          setLoading(false);
          return;
        }
      }

      const fields = {
        company_name: companyName.trim() || null,
        company_siret: siretRaw || null,
        tva_number: tvaNumber.trim() || null,
        company_address: address.trim() || null,
        company_city: city.trim() || null,
        company_postal_code: postalCode.trim() || null,
      };

      // Sync metadata (lu par la page Paramètres) + table profiles (lue par les API)
      await supabase.auth.updateUser({ data: fields });
      const { error } = await supabase
        .from("profiles")
        .update(fields)
        .eq("id", userId);

      if (error) {
        const msg = error.message || "";
        if (
          error.code === "23505" &&
          (msg.includes("idx_profiles_company_siret") ||
            msg.toLowerCase().includes("siret"))
        ) {
          toast.error(SIRET_TAKEN_MSG);
        } else {
          toast.error(msg || "Erreur lors de la sauvegarde");
        }
        setLoading(false);
        return;
      }

      goToStep(2);
    } finally {
      setLoading(false);
    }
  }

  /* ── Étape 2 — création client réel ── */
  async function handleCreateClient() {
    if (!userId) return;

    // Client déjà existant : on continue simplement
    if (createdClientId) {
      goToStep(3);
      return;
    }

    if (!clientName.trim()) {
      toast.error("Le nom du client est requis");
      return;
    }
    if (clientEmail.trim() && !EMAIL_RE.test(clientEmail.trim())) {
      toast.error("Adresse email du client invalide");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: userId,
          name: clientName.trim(),
          email: clientEmail.trim() || null,
          phone: clientPhone.trim() || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      setCreatedClientId(data.id);
      toast.success("Client créé");
      goToStep(3);
    } catch {
      toast.error("Impossible de créer le client");
    } finally {
      setLoading(false);
    }
  }

  /* ── Étape 3 — créer le 1er devis ── */
  async function handleCreateQuote() {
    if (!userId) return;
    setLoading(true);
    try {
      // On avance le step à 4 AVANT de quitter le wizard : si l'utilisateur
      // revient au dashboard, il reprend à l'étape Paiements (pas de boucle).
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ onboarding_step: 4 })
        .eq("id", userId);

      const params = new URLSearchParams();
      if (createdClientId) params.set("client_id", createdClientId);
      router.push(
        `/devis/nouveau${params.toString() ? `?${params.toString()}` : ""}`
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Étape 5 — Calendly ── */
  async function handleSaveCalendly() {
    if (!userId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ calendly_url: calendlyUrl.trim() || null })
        .eq("id", userId);
      goToStep(6);
    } finally {
      setLoading(false);
    }
  }

  /* ── Stripe Connect ── */
  function handleStripeConnect() {
    window.location.href = "/api/stripe/connect/authorize?from=wizard";
  }

  /* ── Finalisation / skip global ── */
  async function completeOnboarding() {
    if (!userId) {
      router.push("/dashboard");
      return;
    }
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);
    localStorage.setItem("devizly_wizard_done", "true");
    router.push("/dashboard");
  }

  async function handleFinish() {
    setLoading(true);
    try {
      await completeOnboarding();
    } finally {
      setLoading(false);
    }
  }

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;
  const stripeConnected =
    stripeStatus === "connected" || stripeStatus === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">
        <DevizlyLogo width={140} height={36} />
        <button
          onClick={handleFinish}
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
          Étape {step} sur {TOTAL_STEPS}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          {/* Step icon */}
          <div className="flex justify-center mb-8">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentStep.gradient} flex items-center justify-center shadow-lg`}
            >
              <StepIcon className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Title + description */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {currentStep.title}
            </h1>
            <p className="text-lg text-slate-500 max-w-md mx-auto">
              {currentStep.desc}
            </p>
          </div>

          {/* ── Étape 1 — Entreprise ── */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="grid gap-3">
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Raison sociale *"
                  className="h-12 text-base px-4"
                />
                <Input
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="N° SIRET (14 chiffres)"
                  className="h-12 text-base px-4"
                />
                <Input
                  value={tvaNumber}
                  onChange={(e) => setTvaNumber(e.target.value)}
                  placeholder="N° TVA intracommunautaire (ex: FR12345678901)"
                  className="h-12 text-base px-4"
                />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Adresse"
                  className="h-12 text-base px-4"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Code postal"
                    className="h-12 text-base px-4"
                  />
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ville"
                    className="h-12 text-base px-4"
                  />
                </div>
              </div>

              {/* Logo */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-12 w-12 rounded-lg object-contain border border-slate-100"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Logo de l&apos;entreprise
                  </p>
                  <p className="text-xs text-slate-400">
                    Affiché sur vos devis — PNG ou JPEG, 500KB max
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {logoUrl ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogoDelete}
                    disabled={logoLoading}
                    className="text-rose-500 hover:text-rose-600"
                  >
                    {logoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoLoading}
                  >
                    {logoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              <Button
                size="lg"
                className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 transition-opacity`}
                onClick={handleSaveCompany}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Check className="mr-2 h-5 w-5" />
                )}
                Enregistrer et continuer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => goToStep(2)}
              >
                <SkipForward className="mr-1 h-4 w-4" />
                Compléter plus tard
              </Button>
            </div>
          )}

          {/* ── Étape 2 — Client ── */}
          {step === 2 && (
            <div className="space-y-3">
              {createdClientId ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">
                    {clientName ? `Client « ${clientName} » prêt` : "Client déjà créé"}
                  </span>
                </div>
              ) : (
                <div className="grid gap-3">
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nom du client / société *"
                    className="h-12 text-base px-4"
                  />
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Email du client"
                    className="h-12 text-base px-4"
                  />
                  <Input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Téléphone (optionnel)"
                    className="h-12 text-base px-4"
                  />
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
                ) : createdClientId ? (
                  <ArrowRight className="mr-2 h-5 w-5" />
                ) : (
                  <UserPlus className="mr-2 h-5 w-5" />
                )}
                {createdClientId ? "Continuer" : "Créer ce client"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => goToStep(3)}
              >
                <SkipForward className="mr-1 h-4 w-4" />
                Passer (aucun client ne sera créé)
              </Button>
            </div>
          )}

          {/* ── Étape 3 — 1er devis ── */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <p className="font-medium text-slate-900">
                  Décrivez votre prestation, l&apos;IA rédige le devis
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {createdClientId
                    ? "Votre client sera pré-sélectionné automatiquement."
                    : "Vous pourrez choisir ou créer un client dans l'éditeur."}
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
                onClick={() => goToStep(4)}
              >
                <SkipForward className="mr-1 h-4 w-4" />
                Plus tard
              </Button>
            </div>
          )}

          {/* ── Étape 4 — Paiements ── */}
          {step === 4 && (
            <div className="space-y-4">
              {userPlan === "free" ? (
                <>
                  <div className="rounded-xl bg-violet-50 border border-violet-200 p-5">
                    <p className="text-sm text-slate-600 mb-3 text-center">
                      Avec le plan gratuit, vous créez jusqu&apos;à 3 devis par
                      mois. L&apos;encaissement automatique via Stripe est inclus
                      dans le plan Pro.
                    </p>
                    <div className="rounded-lg bg-white border border-violet-100 p-4 text-left text-sm">
                      <p className="font-semibold text-violet-600 mb-2">
                        🎁 Offre Fondateur — 9€/mois à vie{" "}
                        <span className="font-normal text-slate-400 line-through">
                          19€
                        </span>
                      </p>
                      <ul className="space-y-1 text-slate-500">
                        <li>→ Acomptes 30%/50% encaissés automatiquement</li>
                        <li>→ Devis illimités + envoi de contrats</li>
                        <li>→ Relances personnalisées</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 transition-opacity`}
                    onClick={() => goToStep(5)}
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  {stripeConnected ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">
                        Stripe{" "}
                        {stripeStatus === "connected"
                          ? "connecté"
                          : "en cours de vérification"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 transition-opacity`}
                        onClick={handleStripeConnect}
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        Connecter Stripe
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-xs text-center text-amber-600">
                        Stripe vérifie votre identité (KYC) et verse les
                        paiements sur votre compte bancaire sous 2-7 jours.
                      </p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => goToStep(5)}
                  >
                    {stripeConnected ? (
                      <>
                        Continuer <ArrowRight className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <SkipForward className="mr-1 h-4 w-4" />
                        Configurer plus tard
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── Étape 5 — Calendly ── */}
          {step === 5 && (
            <div className="space-y-3">
              <Input
                type="url"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                placeholder="https://calendly.com/votre-nom/30min"
                className="h-14 text-base px-4"
              />
              <p className="text-xs text-slate-400 px-1">
                Calendly est un outil gratuit de prise de rendez-vous. Collez
                ici votre lien — il apparaîtra sur vos devis partagés.
              </p>
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
                {calendlyUrl.trim() ? "Enregistrer" : "Continuer sans Calendly"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => goToStep(6)}
              >
                <SkipForward className="mr-1 h-4 w-4" />
                Passer
              </Button>
            </div>
          )}

          {/* ── Étape 6 — Récapitulatif ── */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-900 mb-4 text-center">
                  Votre compte Devizly est opérationnel — voici ce qui est
                  inclus, gratuitement :
                </p>
                <ul className="space-y-2.5">
                  {RECAP_FEATURES.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-slate-700"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                size="lg"
                className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${currentStep.gradient} hover:opacity-90 transition-opacity`}
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Aller au dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step indicators */}
          <div className="flex justify-center gap-4 sm:gap-6 mt-12">
            {STEPS.map((s, i) => {
              const Ico = s.icon;
              return (
                <button
                  key={i}
                  onClick={() => goToStep(i + 1)}
                  aria-label={s.title}
                  className={`flex flex-col items-center gap-1 transition-opacity ${
                    i + 1 === step
                      ? "opacity-100"
                      : "opacity-40 hover:opacity-60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i < step - 1
                        ? "bg-indigo-600 text-white"
                        : i === step - 1
                          ? `bg-gradient-to-br ${s.gradient} text-white`
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {i < step - 1 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Ico className="h-4 w-4" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
