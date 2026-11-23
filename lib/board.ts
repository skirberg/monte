/**
 * The Galton board's geometry and physics, in one place: the home page's hero board (components/landing/hero-board.tsx)
 * runs it live, and the brand kit (scripts/lib/board-art.ts) draws a still frame of the same board for the banners,
 * so the banners show the real board, not a drawing of it. All sizes are in the board's 1000-unit square.
 */

export const SIZE = 1000;
export const ROWS = 12;
export const BINS = ROWS + 1;
export const BW = 64;
export const CX = 500;
export const TOP = 64;
export const PEG_Y0 = 150;
export const ROW_H = 30;
export const EXIT_Y = PEG_Y0 + ROWS * ROW_H;
export const BASE = 900;
export const R = 5;
export const PER_LAYER = 5;
export const COL = 11.2;
export const LAYER = 10.2;
// The pile never rises above the μ line; past that the layers pack tighter, like sand settling.
export const MAX_H = 196;
export const SD = Math.sqrt(ROWS * 0.25);
export const SIGMA_PX = SD * BW;

// Timing, in milliseconds (the board was first drawn at 30 frames a second).
export const FRAME = 1000 / 30;
export const HOPPER_MS = 8 * FRAME;
export const ROW_MS = 2 * FRAME;
export const PEGS_MS = ROWS * ROW_MS;
export const SEED = 7;

export const binX = (k: number) => CX + (k - ROWS / 2) * BW;

/** Small seeded generator, so the finished pile is the same on every load. */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The bell curve over the bins, its height in pixels per unit of `scale` (grains landed times layer height). */
export function curvePath(scale: number) {
  const k0 = scale / PER_LAYER / (SD * Math.sqrt(2 * Math.PI));
  let d = "";
  for (let i = 0; i <= 160; i++) {
    // From the first bin wall to the last, so the tails end on the baseline instead of past it.
    const k = -0.5 + (i / 160) * (ROWS + 1);
    const h = k0 * Math.exp(-((k - ROWS / 2) ** 2) / (2 * SD * SD));
    d += `${i ? " L" : "M"}${binX(k).toFixed(1)} ${(BASE - h - 4).toFixed(1)}`;
  }
  return d;
}

/** The curve closed down to the baseline: the clay mountain under the pile, the logo's shape. */
export const areaPath = (d: string) => `${d} L${binX(ROWS + 0.5).toFixed(1)} ${BASE} L${binX(-0.5).toFixed(1)} ${BASE} Z`;

export type Grain = { t0: number; xs: number[]; bin: number; slot: number; jitter: number; fallMs: number; landAt: number };

export const restX = (g: Grain) => {
  const layer = Math.floor(g.slot / PER_LAYER);
  return binX(g.bin) + ((g.slot % PER_LAYER) - (PER_LAYER - 1) / 2) * COL + (layer % 2 ? 2.4 : -2.4) + g.jitter;
};
export const restY = (g: Grain, layerH: number) => BASE - R - 1 - Math.floor(g.slot / PER_LAYER) * layerH;

/** The layer height the pile settles to: full height until the tallest bin would pass the μ line. */
export const layerFor = (counts: number[]) => {
  const layers = Math.ceil(Math.max(...counts) / PER_LAYER);
  return layers ? Math.min(LAYER, MAX_H / layers) : LAYER;
};

/** A new grain released at `t0`: twelve coin flips decide its bin; `counts` gives it the next slot there. */
export function spawnGrain(rand: () => number, counts: number[], t0: number): Grain {
  let rights = 0;
  const xs = [CX];
  for (let r = 0; r < ROWS; r++) {
    if (rand() < 0.5) rights++;
    xs.push(CX + (rights - (r + 1) / 2) * BW);
  }
  const g: Grain = { t0, xs, bin: rights, slot: counts[rights]++, jitter: (rand() - 0.5) * 2.2, fallMs: 0, landAt: 0 };
  g.fallMs = (6 + (restY(g, layerFor(counts)) - EXIT_Y) / 45) * FRAME;
  g.landAt = t0 + HOPPER_MS + PEGS_MS + g.fallMs;
  return g;
}

/** Where a grain is `t` ms after its release: in the hopper, bouncing down the pegs, or falling onto the pile. */
export function grainPos(g: Grain, t: number, layerH: number): [number, number] | null {
  if (t < 0) return null;
  // 1. drop in from the hopper
  if (t < HOPPER_MS) {
    // already moving as it leaves, so a fast pour reads as a stream of grains rather than a bar
    const p = t / HOPPER_MS;
    return [CX + g.jitter * p, TOP + (PEG_Y0 - 10 - TOP) * (0.45 * p + 0.55 * p * p)];
  }
  // 2. bounce down the pegs, one coin flip per row
  const pt = t - HOPPER_MS;
  if (pt < PEGS_MS) {
    const r = Math.floor(pt / ROW_MS);
    const p = (pt % ROW_MS) / ROW_MS;
    const e = 1 - (1 - p) * (1 - p);
    return [g.xs[r] + (g.xs[r + 1] - g.xs[r]) * e, PEG_Y0 - 10 + (r + p) * ROW_H];
  }
  // 3. fall into the bin and settle on the pile
  const p = Math.min(1, (pt - PEGS_MS) / g.fallMs) ** 2;
  return [g.xs[ROWS] + (restX(g) - g.xs[ROWS]) * p, EXIT_Y - 10 + (restY(g, layerH) - (EXIT_Y - 10)) * p];
}
