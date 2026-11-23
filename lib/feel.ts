// Sound and touch for answers (DESIGN.md, "Feel"). Learned from Brilliant, whose fun lives in "the types of
// sounds, feedback, and haptics we provide as you interact": a right answer clicks like a grain landing,
// a wrong one is a soft low knock. No audio files: two short tones made in the browser.
// Only in Fun mode, never in Focus, and only after the visitor has touched the page.

let ctx: AudioContext | null = null;

const on = () =>
  typeof document !== "undefined" &&
  document.documentElement.dataset.mode !== "focus" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function tone(freq: number, start: number, dur: number, gain: number, type: OscillatorType = "sine") {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function audio() {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return true;
  } catch {
    return false;
  }
}

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}

/** A right answer: two quick rising ticks and a short tap. */
export function feelRight() {
  if (!on()) return;
  buzz(12);
  if (!audio()) return;
  tone(880, 0, 0.09, 0.07, "triangle");
  tone(1320, 0.07, 0.14, 0.06, "triangle");
}

/** A wrong answer: one soft low knock and a double tap. Never a buzzer. */
export function feelWrong() {
  if (!on()) return;
  buzz([10, 50, 10]);
  if (!audio()) return;
  tone(220, 0, 0.16, 0.06, "sine");
}
