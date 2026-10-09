"use client";

import { useEffect } from "react";
import { pageview, track } from "@vercel/analytics";

const slug = (s: string | null | undefined) => (s && /^[a-z0-9-]{1,32}$/.test(s) ? s : "other");
const scoreBand = (pct: number) => (pct >= 80 ? "80-100" : pct >= 60 ? "60-79" : pct >= 40 ? "40-59" : "0-39");

/**
 * Study analytics for Vercel Web Analytics (Pro: custom events, two properties each).
 * Page views: the engine routes with #hashes, so each section is reported as its own page
 * (/study/practice/drill/). Events: drill started and finished (with a score band), quick math
 * started, a solver's answers shown or a new practice problem, and the formula sheet printed.
 * Only fixed route words and the engine's own button ids are sent, never anything a visitor types.
 */
export function StudyRouteAnalytics() {
  useEffect(() => {
    let last = "";
    const fromHash = () => {
      const parts = location.hash
        .replace(/^#\/?/, "")
        .split("/")
        .filter((p) => /^[a-z0-9-]{1,32}$/.test(p))
        .slice(0, 3);
      if (!parts.length) return;
      const path = `/study/${parts.join("/")}/`;
      if (path === last) return;
      last = path;
      pageview({ route: path, path });
    };
    // The engine restores the last route with replaceState, which fires no hashchange: read it once after boot.
    const boot = window.setTimeout(fromHash, 0);
    window.addEventListener("hashchange", fromHash);

    let mode = "ten";
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("button");
      if (!el) return;
      const start = el.getAttribute("data-start");
      if (start) {
        mode = slug(start);
        track("Drill started", { mode });
        return;
      }
      const solver = el.getAttribute("data-sv");
      const act = el.getAttribute("data-act");
      if (solver && (act === "show" || act === "new")) {
        track("Solver used", { solver: slug(solver), action: act === "show" ? "show answers" : "new problem" });
        return;
      }
      const quick = { "math-learn": "learn", "math-sprint": "sprint 60s", "math-sprint3": "sprint 3min" }[el.id];
      if (quick) track("Quick math started", { mode: quick });
      else if (el.id === "print-sheet") track("Formula sheet printed");
    };
    document.addEventListener("click", onClick, true);

    let finished = false;
    const mo = new MutationObserver(() => {
      const result = document.getElementById("drill-result");
      const shown = !!result && !result.hidden;
      if (shown && !finished) {
        const pct = parseInt(document.getElementById("r-score")?.textContent ?? "", 10);
        track("Drill finished", { mode, score: Number.isFinite(pct) ? scoreBand(pct) : "unknown" });
      }
      finished = shown;
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["hidden"] });

    return () => {
      window.clearTimeout(boot);
      window.removeEventListener("hashchange", fromHash);
      document.removeEventListener("click", onClick, true);
      mo.disconnect();
    };
  }, []);
  return null;
}
