"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, CreditCard, Building, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function ParametresPage() {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [profile, setProfile] = useState({
    full_name: "",
    company_name: "",
    company_address: "",
    company_siret: "",
    company_phone: "",
    default_tva_rate: "20",
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.user_metadata) {
        setProfile({
          full_name: user.user_metadata.full_name || "",
          company_name: user.user_metadata.company_name || "",
          company_address: user.user_metadata.company_address || "",
          company_siret: user.user_metadata.company_siret || "",
          company_phone: user.user_metadata.company_phone || "",
          default_tva_rate: user.user_metadata.default_tva_rate || "20",
        });
      }

      const { data } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      if (data?.subscription_status) {
        setSubscriptionStatus(data.subscription_status);
      }
    }
    loadProfile();
  }, []);

  async function handleSave() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: profile });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Paramètres sauvegardés");
    }
    setLoading(false);
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setPortalLoading(false);
    }
  }

  const planLabel =
    subscriptionStatus === "business"
      ? "Business"
      : subscriptionStatus === "pro"
        ? "Pro"
        : "Free";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Profil & Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom de l&apos;entreprise</Label>
              <Input
                value={profile.company_name}
                onChange={(e) =>
                  setProfile({ ...profile, company_name: e.target.value })
                }
                placeholder="Ma Société SAS"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={profile.company_address}
                onChange={(e) =>
                  setProfile({ ...profile, company_address: e.target.value })
                }
                placeholder="123 rue de la Paix, 75001 Paris"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SIRET</Label>
                <Input
                  value={profile.company_siret}
                  onChange={(e) =>
                    setProfile({ ...profile, company_siret: e.target.value })
                  }
                  placeholder="123 456 789 00012"
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={profile.company_phone}
                  onChange={(e) =>
                    setProfile({ ...profile, company_phone: e.target.value })
                  }
                  placeholder="01 23 45 67 89"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Taux de TVA par défaut</Label>
              <Select
                value={profile.default_tva_rate}
                onValueChange={(v) =>
                  setProfile({ ...profile, default_tva_rate: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="5.5">5.5%</SelectItem>
                  <SelectItem value="0">0%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Sauvegarder
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Abonnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Plan {planLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionStatus === "free"
                      ? "3 devis/mois"
                      : subscriptionStatus === "pro"
                        ? "50 devis/mois"
                        : "Devis illimités"}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    subscriptionStatus === "free"
                      ? ""
                      : "bg-green-100 text-green-700"
                  }
                >
                  {planLabel}
                </Badge>
              </div>
            </div>

            {subscriptionStatus !== "free" ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Gérer mon abonnement
              </Button>
            ) : (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Pro</p>
                      <p className="text-sm text-muted-foreground">
                        50 devis/mois + IA avancée
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">19€<span className="text-sm font-normal text-muted-foreground">/mois HT</span></p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div>
                      <p className="font-medium">Business</p>
                      <p className="text-sm text-muted-foreground">
                        Devis illimités + Signature
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">49€<span className="text-sm font-normal text-muted-foreground">/mois HT</span></p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <a href="/pricing">Voir les tarifs</a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
