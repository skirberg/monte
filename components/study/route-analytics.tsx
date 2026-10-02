"use client";

import { useEffect } from "react";
import { pageview } from "@vercel/analytics";

/**
 * The study engine routes with #hashes, so Vercel's page counts would only ever see /study/.
 * Report each section as its own page (/study/practice/drill/) and a finished drill as
 * /study/practice/drill/finished/, which turns plain page views into a funnel: Hobby Web Analytics
 * has no custom events. Only route words are sent; any part that is not a short lowercase slug is
 * dropped, so nothing typed by a visitor can leave the browser.
 */
export function StudyRouteAnalytics() {
  useEffect(() => {
    let last = "";
    const send = (path: string) => {
      if (path === last) return;
      last = path;
      pageview({ route: path, path });
    };
    const fromHash = () => {
      const parts = location.hash
        .replace(/^#\/?/, "")
        .split("/")
        .filter((p) => /^[a-z0-9-]{1,32}$/.test(p))
        .slice(0, 3);
      if (parts.length) send(`/study/${parts.join("/")}/`);
    };
    // The engine restores the last route with replaceState, which fires no hashchange: read it once after boot.
    const boot = window.setTimeout(fromHash, 0);
    window.addEventListener("hashchange", fromHash);

    let finished = false;
    const mo = new MutationObserver(() => {
      const result = document.getElementById("drill-result");
      const shown = !!result && !result.hidden;
      if (shown && !finished) send("/study/practice/drill/finished/");
      finished = shown;
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["hidden"] });

    return () => {
      window.clearTimeout(boot);
      window.removeEventListener("hashchange", fromHash);
      mo.disconnect();
    };
  }, []);
  return null;
}
