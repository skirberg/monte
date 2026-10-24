"use client";

import { useEffect, useRef } from "react";
import { ENGINE_MARKUP } from "@/lib/engine/markup";
import DATA from "@/lib/engine/data.json";
import { boot } from "@/lib/engine/engine.js";
import { PORTED_SECTIONS } from "@/lib/site-data";
import { pathForHash } from "@/lib/study/routes";

const ported = (hash: string) => PORTED_SECTIONS.includes(hash.replace(/^#\/?/, "").split("/")[0]);

// The engine binds window listeners and reads the hash at boot, so it runs exactly once,
// on the client, after its markup is in the DOM. Links into /study are full page loads.
// Sections already ported to real routes never render here: their hashes (old bookmarks, the
// engine's own links) are sent to the route instead.
let booted = false;

export function EngineMount() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = () => {
      if (!ported(location.hash)) return false;
      location.replace(pathForHash(location.hash));
      return true;
    };
    if (away()) return;
    try {
      const saved = localStorage.getItem("sigmaRoute");
      if (saved && ported(saved)) localStorage.removeItem("sigmaRoute");
    } catch {}
    window.addEventListener("hashchange", away);
    if (!booted && ref.current) {
      booted = true;
      ref.current.innerHTML = ENGINE_MARKUP;
      boot(DATA);
    }
    return () => window.removeEventListener("hashchange", away);
  }, []);
  return <div ref={ref} className="engine" />;
}
