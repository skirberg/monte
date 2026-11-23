"use client";

import { useSyncExternalStore } from "react";
import { localDay } from "@/lib/progress";

/** Tells React the date may have changed: just after the next local midnight, and when the tab comes back into view
 *  (a sleeping tab can miss its timer). */
function subscribeDay(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const arm = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 1, 0);
    timer = setTimeout(() => {
      onChange();
      arm();
    }, next.getTime() - now.getTime());
  };
  arm();
  const wake = () => {
    if (document.visibilityState === "visible") onChange();
  };
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("focus", onChange);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", wake);
    window.removeEventListener("focus", onChange);
  };
}

/** Today, read after hydration so the static page never shows a stale day, and moved on when the date changes.
 *  Null on the server and during hydration. The daily chart and the Shuffle both use it. */
export function useToday() {
  return useSyncExternalStore(subscribeDay, () => localDay(), () => null);
}

/** Saves a daily store and tells everything on the page that reads it (the Today row on the home page) to look again. */
export function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  window.dispatchEvent(new StorageEvent("storage", { key }));
}
