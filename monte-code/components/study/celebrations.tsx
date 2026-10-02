"use client";

import { useEffect } from "react";
import { burstFrom, callout, celebrate } from "@/lib/fun";

/**
 * Fun-mode reactions to the study engine, without touching its code: watch the engine's own
 * feedback nodes and react once per question. Wrong answers get nothing (DESIGN.md, Voice).
 * lib/fun makes every call a no-op in Focus mode and with reduced motion.
 */
export function Celebrations() {
  useEffect(() => {
    const seen = new Set<string>();
    let raf = 0;
    const visible = (el: Element | null) => !!el && !(el as HTMLElement).hidden;

    const check = () => {
      raf = 0;
      // Drill: one reaction per question.
      const fb = document.getElementById("d-fb");
      if (visible(fb) && fb!.querySelector(".status.ok")) {
        const key = `d:${document.getElementById("d-prog")?.textContent}:${document.getElementById("d-q")?.textContent}`;
        if (!seen.has(key)) {
          seen.add(key);
          burstFrom(document.getElementById("d-in"));
          callout();
        }
      }
      // Quick math: grains only, it moves too fast for words.
      const mfb = document.getElementById("m-fb");
      if (visible(mfb) && mfb!.querySelector(".status.ok")) {
        const key = `m:${document.getElementById("m-prog")?.textContent}:${document.getElementById("m-q")?.textContent}`;
        if (!seen.has(key)) {
          seen.add(key);
          burstFrom(document.getElementById("m-in"), 10);
        }
      }
      // A drill of 80% or better: the engine says "Match won."
      const res = document.getElementById("drill-result");
      const text = document.getElementById("r-text")?.textContent ?? "";
      if (visible(res) && text.includes("Match won")) {
        const key = `r:${text}`;
        if (!seen.has(key)) {
          seen.add(key);
          celebrate();
        }
      }
    };

    const mo = new MutationObserver(() => {
      if (!raf) raf = requestAnimationFrame(check);
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"] });
    return () => {
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
