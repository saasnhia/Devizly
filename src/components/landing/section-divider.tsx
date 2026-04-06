"use client";

export function SectionDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <div className="section-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-[#5B5BD6]/10 to-transparent" />
    </div>
  );
}
