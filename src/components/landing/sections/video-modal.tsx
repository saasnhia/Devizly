"use client";

import { X } from "lucide-react";

export function VideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.06] bg-[#08090a]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/[0.06] p-2 text-white transition-opacity hover:opacity-80"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
        <video autoPlay playsInline controls className="w-full">
          <source src="/marketing/demo-devizly-v2.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
