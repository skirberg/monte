"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { STUDY_NAV } from "@/lib/site-data";
import { sectionFor } from "@/lib/study/routes";

/**
 * Which study section is showing ("home", "learn", "practice"...), or null outside /study.
 * Ported sections are real routes and come from the path. The legacy engine at /study/ still
 * routes by #hash, so there the hash decides, after mount.
 */
export function useHashPage(enabled: boolean) {
  const pathname = usePathname();
  const [hashPage, setHashPage] = React.useState<string | null>(null);
  const onEngine = pathname === "/study/" || pathname === "/study";
  React.useEffect(() => {
    if (!enabled || !onEngine) return;
    const read = () => {
      const p = window.location.hash.replace(/^#\/?/, "").split("/")[0] || "home";
      setHashPage(STUDY_NAV.some((n) => n.page === p) ? p : "home");
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [enabled, onEngine]);
  if (!enabled) return null;
  return onEngine ? hashPage : sectionFor(pathname);
}
