"use client";

import { useSyncExternalStore } from "react";
import { track } from "@vercel/analytics";
import { MODE_EVENT, MODE_KEY } from "@/lib/mode-script";

/**
 * Fun or Focus. One site, two behaviors (see DESIGN.md, "Modes"):
 * Fun shows Play, celebrates right answers and runs the hero film.
 * Focus hides all of that so the page is only the work.
 * The choice lives in localStorage and on <html data-mode>, set before paint by MODE_SCRIPT (lib/mode-script.ts).
 */
export type Mode = "fun" | "focus";

const KEY = MODE_KEY;
const EVENT = MODE_EVENT;

function read(): Mode {
  if (typeof document === "undefined") return "fun";
  return document.documentElement.dataset.mode === "focus" ? "focus" : "fun";
}

export function setMode(mode: Mode) {
  document.documentElement.dataset.mode = mode;
  try {
    localStorage.setItem(KEY, mode);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
  track("Mode switched", { mode });
}

export function useMode(): Mode {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => "fun",
  );
}
