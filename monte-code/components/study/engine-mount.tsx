"use client";

import { useEffect, useRef } from "react";
import { ENGINE_MARKUP } from "@/lib/engine/markup";
import DATA from "@/lib/engine/data.json";
import { boot } from "@/lib/engine/engine.js";

// The engine binds window listeners and reads the hash at boot, so it runs exactly once,
// on the client, after its markup is in the DOM. Links into /study are full page loads.
let booted = false;

export function EngineMount() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (booted || !ref.current) return;
    booted = true;
    ref.current.innerHTML = ENGINE_MARKUP;
    boot(DATA);
  }, []);
  return <div ref={ref} className="engine" />;
}
