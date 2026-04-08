import type { Metadata } from "next";
import { TopBar } from "@/components/landing/sections/top-bar";
import { EditorialNav } from "@/components/landing/sections/editorial-nav";
import { MinimalFooter } from "@/components/landing/sections/minimal-footer";
import { DemoHeader } from "./_components/demo-header";
import { DemoWorkspace } from "./_components/demo-workspace";
import { DemoPostCta } from "./_components/demo-post-cta";

export const metadata: Metadata = {
  title: "Démo en direct — Générez un devis en 30 secondes",
  description:
    "Essayez Devizly sans inscription. L'IA Mistral génère un devis professionnel adapté à votre métier en 30 secondes. RGPD conforme.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <TopBar />
      <EditorialNav />
      <main className="pt-[33px]">
        <DemoHeader />
        <DemoWorkspace />
        <DemoPostCta />
      </main>
      <div className="mt-20">
        <MinimalFooter />
      </div>
    </div>
  );
}
