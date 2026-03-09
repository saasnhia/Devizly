"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function BriefingActions() {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/daily-briefing", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la generation");
        return;
      }
      toast.success("Briefing genere avec succes");
      window.location.reload();
    } catch {
      toast.error("Erreur reseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={loading} variant="outline">
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Generation..." : "Generer maintenant"}
    </Button>
  );
}
