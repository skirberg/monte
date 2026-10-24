"use client";

import * as React from "react";
import { TOOL_IDS, toolHref } from "@/lib/decide/tools";

/** Old links like /decide/#bayes pointed at a section of one long page. Each tool has its own page now, so send them there. */
export function HashRedirect() {
  React.useEffect(() => {
    const go = () => {
      const id = window.location.hash.slice(1);
      if (TOOL_IDS.includes(id)) window.location.replace(toolHref(id));
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);
  return null;
}
