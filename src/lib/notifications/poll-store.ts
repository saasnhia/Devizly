"use client";

import { useCallback, useEffect, useState } from "react";
import type { Notification } from "@/types";

type Subscriber = (data: Notification[]) => void;

const POLL_INTERVAL = 30_000;

const subscribers = new Set<Subscriber>();
let cache: Notification[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;
let inFlight: Promise<void> | null = null;

function notify(): void {
  for (const sub of subscribers) sub(cache);
}

function fetchOnce(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = (await res.json()) as { notifications?: Notification[] };
      cache = json.notifications ?? [];
      notify();
    } catch {
      // Silently ignore network errors during polling
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

function startPolling(): void {
  if (intervalId !== null) return;
  void fetchOnce();
  intervalId = setInterval(() => {
    void fetchOnce();
  }, POLL_INTERVAL);
}

function stopPolling(): void {
  if (intervalId === null) return;
  clearInterval(intervalId);
  intervalId = null;
}

function subscribe(cb: Subscriber): () => void {
  subscribers.add(cb);
  if (cache.length > 0) cb(cache);
  if (subscribers.size === 1) startPolling();
  return () => {
    subscribers.delete(cb);
    if (subscribers.size === 0) stopPolling();
  };
}

function updateCache(updater: (prev: Notification[]) => Notification[]): void {
  cache = updater(cache);
  notify();
}

export function useNotificationsPoll(): {
  notifications: Notification[];
  setNotifications: (updater: (prev: Notification[]) => Notification[]) => void;
  refresh: () => Promise<void>;
} {
  const [notifications, setLocal] = useState<Notification[]>(cache);

  useEffect(() => {
    return subscribe(setLocal);
  }, []);

  const setNotifications = useCallback(
    (updater: (prev: Notification[]) => Notification[]) => {
      updateCache(updater);
    },
    [],
  );

  const refresh = useCallback(() => fetchOnce(), []);

  return { notifications, setNotifications, refresh };
}
