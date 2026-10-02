"use client";

import * as React from "react";
import { STUDY_NAV } from "@/lib/site-data";

/** Which /study page the hash points at ("home" when empty or unknown). Null until mounted. */
export function useHashPage(enabled: boolean) {
  const [page, setPage] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!enabled) return;
    const read = () => {
      const p = window.location.hash.replace(/^#\/?/, "").split("/")[0] || "home";
      setPage(STUDY_NAV.some((n) => n.page === p) ? p : "home");
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [enabled]);
  return page;
}
