"use client";

// The site-wide XP store (lib/progress.ts) listens for these through <ProgressBridge />.
const send = (type: string, detail: unknown) => {
  try {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  } catch {}
};
export const awardXp = (xp: number, reason: string) => send("monte:xp", { xp, reason });
export const awardBadge = (id: string) => send("monte:badge", id);
export const countUp = (name: string) => send("monte:count", name);
