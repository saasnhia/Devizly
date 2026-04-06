"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { gsap } from "gsap";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  as?: "a" | "button" | "div";
  href?: string;
  onClick?: () => void;
  [key: string]: unknown;
}

export function MagneticButton({
  children,
  className = "",
  as: Tag = "button",
  ...props
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;

    const rect = wrapper.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 80;

    if (dist < maxDist) {
      const strength = 1 - dist / maxDist;
      gsap.to(wrapper.firstElementChild, {
        x: dx * strength * 0.1,
        y: dy * strength * 0.1,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(inner, {
        x: -dx * strength * 0.04,
        y: -dy * strength * 0.04,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;
    gsap.to(wrapper.firstElementChild, { x: 0, y: 0, scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    gsap.to(inner, { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
  }, []);

  const onMouseDown = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    gsap.to(wrapper.firstElementChild, { scale: 0.97, duration: 0.1 });
  }, []);

  const onMouseUp = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    gsap.to(wrapper.firstElementChild, { scale: 1.02, duration: 0.2, ease: "power2.out" });
  }, []);

  // Filter out unknown props for the HTML tag
  const { as: _as, ...tagProps } = props;

  return (
    <div
      ref={wrapperRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      className="inline-block"
      style={{ padding: "16px", margin: "-16px" }}
    >
      <Tag className={`will-change-transform ${className}`} {...tagProps}>
        <span ref={innerRef} className="inline-flex items-center gap-2 will-change-transform">
          {children}
        </span>
      </Tag>
    </div>
  );
}
