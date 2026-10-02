"use client";

/**
 * Fun-mode flourishes, written against the DOM so the study engine can trigger them too.
 * Both are no-ops in Focus mode and with reduced motion, and both are decorative
 * (aria-hidden): the real feedback is always the text on the page.
 */

const TENNIS_CALLS = ["Ace.", "Clean winner.", "Down the line.", "Unreturnable.", "On the line. Good.", "Point."];

function quiet() {
  if (typeof window === "undefined") return true;
  return (
    document.documentElement.dataset.mode === "focus" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** A handful of clay grains pop out of a point and fall. */
export function burst(x: number, y: number, n = 14) {
  if (quiet()) return;
  for (let i = 0; i < n; i++) {
    const g = document.createElement("span");
    const size = 5 + Math.random() * 5;
    g.setAttribute("aria-hidden", "true");
    Object.assign(g.style, {
      position: "fixed",
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: "var(--clay)",
      pointerEvents: "none",
      zIndex: "60",
    });
    document.body.appendChild(g);
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.6;
    const d = 40 + Math.random() * 70;
    const dx = Math.cos(a) * d;
    const dy = Math.sin(a) * d - 30;
    g.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx * 1.15}px, ${dy + 110}px)`, opacity: 0 },
      ],
      { duration: 800 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.2,1)" },
    ).onfinish = () => g.remove();
  }
}

export function burstFrom(el: Element | null, n?: number) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, n);
}

/** A line call that drops in at the top of the screen, then leaves. */
export function callout(text?: string, big = false) {
  if (quiet()) return;
  const t = document.createElement("div");
  t.setAttribute("aria-hidden", "true");
  t.textContent = text ?? TENNIS_CALLS[Math.floor(Math.random() * TENNIS_CALLS.length)];
  Object.assign(t.style, {
    position: "fixed",
    left: "50%",
    top: "84px",
    transform: "translateX(-50%)",
    zIndex: "61",
    pointerEvents: "none",
    background: "var(--ink)",
    color: "var(--paper)",
    borderRadius: "9999px",
    padding: big ? "14px 26px" : "8px 18px",
    fontFamily: "var(--font-bricolage), sans-serif",
    fontWeight: "650",
    fontSize: big ? "28px" : "17px",
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
    boxShadow: "0 12px 32px -12px rgba(0,0,0,.35)",
  });
  document.body.appendChild(t);
  t.animate(
    [
      { opacity: 0, transform: "translate(-50%, -16px) scale(.96)" },
      { opacity: 1, transform: "translate(-50%, 0) scale(1)", offset: 0.15 },
      { opacity: 1, transform: "translate(-50%, 0) scale(1)", offset: 0.8 },
      { opacity: 0, transform: "translate(-50%, -8px) scale(.98)" },
    ],
    { duration: big ? 2600 : 1500, easing: "cubic-bezier(.2,.8,.2,1)" },
  ).onfinish = () => t.remove();
}

/** The big one: a match won. */
export function celebrate(text = "Game, set, match.") {
  if (quiet()) return;
  callout(text, true);
  const w = window.innerWidth;
  [0.2, 0.5, 0.8].forEach((f, i) => setTimeout(() => burst(w * f, 150, 22), i * 180));
}
