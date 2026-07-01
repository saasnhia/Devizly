import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";

// Routes reachable from the onboarding wizard before completion (e.g. the
// "Créer mon 1er devis" step redirects here) — must bypass the guard below.
const ONBOARDING_ALLOWED_PATHS = ["/devis/nouveau"];

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Redirect new users to onboarding wizard
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const allowedDuringOnboarding = ONBOARDING_ALLOWED_PATHS.some((p) =>
    pathname.startsWith(p)
  );

  if (profile && !profile.onboarding_completed && !allowedDuringOnboarding) {
    redirect("/wizard");
  }

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
