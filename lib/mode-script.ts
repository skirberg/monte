// Shared by the server layout (inline, runs before paint) and the client hook in lib/mode.ts.
// Storage keys keep the original "sigma" prefix on purpose: renaming them would wipe every visitor's saved progress.
export const MODE_KEY = "sigmaMode";
export const MODE_EVENT = "sigma-mode";
export const MODE_SCRIPT = `try{document.documentElement.dataset.mode=localStorage.getItem("${MODE_KEY}")==="focus"?"focus":"fun"}catch(e){document.documentElement.dataset.mode="fun"}`;
