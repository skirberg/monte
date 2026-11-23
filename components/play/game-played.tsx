"use client";

import * as React from "react";
import { track } from "@vercel/analytics";

/** Counts a game as played (Vercel custom event) on the visitor's first click or key press inside it, once per visit. */
export function GamePlayed({ game, children }: { game: string; children: React.ReactNode }) {
  const sent = React.useRef(false);
  const once = () => {
    if (sent.current) return;
    sent.current = true;
    track("Game played", { game });
  };
  return (
    <div onPointerDownCapture={once} onKeyDownCapture={once}>
      {children}
    </div>
  );
}
