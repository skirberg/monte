/** Small layout rules for the decide charts, kept pure so they can be tested. */

export type LabelSpot = { x: number; anchor: "start" | "end"; beside: boolean };

/**
 * Where a range bar's name goes so it never sits on the dashed "your line" at lx.
 * First choice: just right of the bar's end. Then just left of its start. Last: above the bar, slid to whichever side of the line has room.
 * x0 and x1 are the bar's ends, w the label's width, and [min, max] the drawing's edges, all in the same units.
 */
export function placeLabel({ x0, x1, lx, w, min, max, gap = 8, clear = 6 }: { x0: number; x1: number; lx: number; w: number; min: number; max: number; gap?: number; clear?: number }): LabelSpot {
  const crosses = (a: number, b: number) => Number.isFinite(lx) && lx >= a - clear && lx <= b + clear;
  const fits = (a: number, b: number) => a >= min && b <= max;
  const ra = x1 + gap;
  if (fits(ra, ra + w) && !crosses(ra, ra + w)) return { x: ra, anchor: "start", beside: true };
  const lb = x0 - gap;
  if (fits(lb - w, lb) && !crosses(lb - w, lb)) return { x: lb, anchor: "end", beside: true };
  const clamp = (a: number) => Math.min(max - w, Math.max(min, a));
  let a = clamp(x0);
  if (crosses(a, a + w)) {
    const leftRoom = lx - clear - w >= min;
    const rightRoom = lx + clear + w <= max;
    // Prefer the side the bar mostly sits on.
    const mid = (x0 + x1) / 2;
    a = (mid < lx && leftRoom) || !rightRoom ? clamp(lx - clear - w) : clamp(lx + clear);
  }
  return { x: a, anchor: "start", beside: false };
}

/** A rough width for a line of the site's sans text at a size, for laying out SVG labels before they render. */
export const textWidth = (s: string, size = 12) => s.length * size * 0.56;
