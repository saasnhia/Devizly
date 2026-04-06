"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

export function ChatWidget() {
  const [chatShown, setChatShown] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChatShown(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {chatShown && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#08090a]/90 px-5 py-3 backdrop-blur-xl transition-all hover:scale-[1.02]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B5BD6]/15">
            <MessageCircle className="h-5 w-5 text-[#5B5BD6]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-[#eeeef0]">Une question sur les tarifs ?</p>
            <p className="text-xs text-[#8b8d9e]">Je réponds en 2min</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setChatShown(false); }}
            className="ml-1 rounded-full p-1 text-[#8b8d9e] hover:text-[#eeeef0]"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </button>
      )}

      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08090a]/95 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#5B5BD6]/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B5BD6]/15">
                <MessageCircle className="h-4 w-4 text-[#5B5BD6]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Devizly</p>
                <p className="text-xs text-[#8b8d9e]">Support en ligne</p>
              </div>
            </div>
            <button
              onClick={() => { setChatOpen(false); setChatShown(false); }}
              className="rounded-full p-1.5 text-[#8b8d9e] hover:bg-white/[0.06] hover:text-[#eeeef0]"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <div className="mb-4 rounded-xl bg-white/[0.03] px-4 py-3">
              <p className="text-sm text-[#8b8d9e]">
                Bonjour ! Une question sur les tarifs ou les fonctionnalités ? Envoyez-nous un message, on répond en moins de 2 minutes.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem("message") as HTMLInputElement;
                const email = form.elements.namedItem("email") as HTMLInputElement;
                if (!input.value.trim() || !email.value.trim()) return;
                fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: email.value, message: input.value }),
                }).then(() => {
                  form.reset();
                  setChatOpen(false);
                  setChatShown(false);
                }).catch(() => {});
              }}
              className="space-y-3"
            >
              <input
                name="email"
                type="email"
                required
                placeholder="Votre email"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#eeeef0] placeholder-[#8b8d9e] outline-none focus:border-[#5B5BD6]/50"
              />
              <textarea
                name="message"
                required
                rows={3}
                placeholder="Votre question..."
                className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#eeeef0] placeholder-[#8b8d9e] outline-none focus:border-[#5B5BD6]/50"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#5B5BD6] py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
