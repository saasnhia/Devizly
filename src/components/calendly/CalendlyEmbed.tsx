"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface CalendlyEmbedProps {
  url: string;
  userName?: string;
}

export function CalendlyEmbed({ url, userName }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;

    script.onload = () => setLoading(false);
    script.onerror = () => {
      setLoading(false);
      setError(true);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center text-sm text-orange-700">
        Impossible de charger le calendrier. Vous pouvez{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline font-medium">
          prendre rendez-vous ici
        </a>.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          📅 Planifier l&apos;intervention
        </h3>
        {userName && (
          <p className="text-sm text-muted-foreground mt-1">
            Choisissez un créneau directement dans le calendrier de {userName}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement du calendrier...</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="calendly-inline-widget"
        data-url={url}
        style={{ minWidth: "320px", height: "700px" }}
      />
    </div>
  );
}
