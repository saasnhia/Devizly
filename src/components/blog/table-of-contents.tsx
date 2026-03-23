"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
}

export function TableOfContents({ headings }: { headings: TocItem[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" },
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
        <List className="h-4 w-4 text-violet-400" />
        Sommaire
      </h3>
      <nav className="mt-3 space-y-0.5">
        {headings.map(({ id, text }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`block rounded-md px-3 py-1.5 text-xs leading-snug transition-all ${
              activeId === id
                ? "bg-violet-500/15 font-medium text-violet-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {text}
          </a>
        ))}
      </nav>
    </div>
  );
}
