"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  shareToken: string;
  quoteTitle: string;
  clientEmail?: string | null;
}

export function ShareModal({
  shareToken,
  quoteTitle,
  clientEmail,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/devis/${shareToken}`
      : `/devis/${shareToken}`;

  const shareText = `Bonjour, voici votre devis "${quoteTitle}" : ${shareUrl}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  }

  function handleEmail() {
    const subject = encodeURIComponent(`Devis : ${quoteTitle}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint votre devis "${quoteTitle}".\n\nConsultez-le en ligne : ${shareUrl}\n\nCordialement`
    );
    const mailto = clientEmail
      ? `mailto:${clientEmail}?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`;
    window.open(mailto);
  }

  function handleSMS() {
    const smsBody = encodeURIComponent(shareText);
    window.open(`sms:?body=${smsBody}`);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager le devis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Copy link */}
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="text-sm" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Separator />

          {/* Share channels */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex flex-col gap-1 py-4"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span className="text-xs">WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col gap-1 py-4"
              onClick={handleEmail}
            >
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-xs">Email</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col gap-1 py-4"
              onClick={handleSMS}
            >
              <Smartphone className="h-5 w-5 text-purple-600" />
              <span className="text-xs">SMS</span>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Le client pourra consulter, accepter ou refuser le devis en ligne.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
