"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy } from "lucide-react";

interface EmbedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
}

export function EmbedModal({ open, onOpenChange, slug }: EmbedModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://devizly.fr";
  const formUrl = `${siteUrl}/f/${slug}`;

  const options = [
    {
      title: "Iframe (universel)",
      description: "Intègre le formulaire directement dans votre page",
      code: `<iframe\n  src="${formUrl}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border-radius:12px;border:1px solid #e5e7eb"\n></iframe>`,
    },
    {
      title: "Lien direct",
      description: "Partagez ce lien avec vos prospects",
      code: formUrl,
    },
    {
      title: "Bouton popup (JavaScript)",
      description: "Ajoutez un bouton qui ouvre le formulaire",
      code: `<script src="${siteUrl}/embed.js"></script>\n<button onclick="Devizly.openForm('${slug}')">\n  Demander un devis\n</button>`,
    },
  ];

  function handleCopy(index: number) {
    navigator.clipboard.writeText(options[index].code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Code d&apos;intégration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {options.map((option, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{option.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(i)}
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copier
                    </>
                  )}
                </Button>
              </div>
              <pre className="mt-2 overflow-x-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                <code>{option.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
