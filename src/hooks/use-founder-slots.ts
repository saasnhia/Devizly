"use client";

import { useEffect, useState } from "react";

/**
 * Live founder-offer availability, backed by GET /api/founder-slots
 * (same is_founder < 100 check as the checkout coupon logic, so the
 * displayed price can never diverge from what gets charged).
 *
 * Defaults to available while loading — avoids a price flash for the
 * common case (seats remaining); corrects itself once the fetch
 * resolves, including on the rare sold-out case.
 */
export function useFounderSlots() {
  const [isFounderAvailable, setIsFounderAvailable] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/founder-slots")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setIsFounderAvailable(Boolean(data.isFounderAvailable));
        setRemaining(typeof data.remaining === "number" ? data.remaining : null);
      })
      .catch(() => {
        // Network error — keep the optimistic default rather than
        // hiding a live offer over a transient fetch failure.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isFounderAvailable, remaining, loading };
}
