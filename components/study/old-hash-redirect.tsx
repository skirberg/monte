"use client";

import { useEffect } from "react";
import { pathForHash } from "@/lib/study/routes";

/**
 * The study app used to route with #hashes (/study/#learn/topics/normal). Old bookmarks, shared
 * links and saved routes land here and are sent to the page that replaced each one. Unknown ids
 * fall back to their section, so nothing typed into a hash ever becomes a path.
 */
export function OldHashRedirect() {
  useEffect(() => {
    const go = () => {
      const h = location.hash.replace(/^#\/?/, "");
      if (!h || h === "main" || h === "home") return;
      const to = pathForHash(location.hash);
      if (to !== location.pathname) location.replace(to);
    };
    go();
    try {
      localStorage.removeItem("sigmaRoute");
    } catch {}
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);
  return null;
}
