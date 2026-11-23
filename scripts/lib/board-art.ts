// A still frame of the home page's Galton board, for the brand kit's banners: the same pegs, bins, physics and seed
// as the live board (lib/board.ts), caught mid-pour, with grains streaming through the pegs onto a pile that has
// already found its curve. Nothing here is drawn by hand: move the board in lib/board.ts and the banners follow.
import {
  BASE, BINS, BW, CX, PEG_Y0, R, ROWS, ROW_H, SEED,
  areaPath, binX, curvePath, grainPos, layerFor, rng, restX, restY, spawnGrain, type Grain,
} from "@/lib/board";

export type BoardColors = { clay: string; ink: string; line: string; lineStrong: string };
/** Which part of the board to show: all of it, or the pile and the last rows of pegs (for short, wide banners). */
export type Crop = "full" | "pile";
export const CROPS: Record<Crop, [x: number, y: number, w: number, h: number]> = {
  full: [60, 40, 880, 880],
  pile: [60, 462, 880, 458],
};

/** The frame: `landed` grains on the pile and `flying` more in the air, released one every `gap` ms. */
export function boardFrame(landed = 360, flying = 44, gap = 34) {
  const rand = rng(SEED);
  const counts: number[] = new Array(BINS).fill(0);
  const pile: Grain[] = Array.from({ length: landed }, () => spawnGrain(rand, counts, 0));
  const air = Array.from({ length: flying }, (_, i) => spawnGrain(rand, counts, -(i + 1) * gap));
  const layerH = layerFor(counts);
  const dots = pile.map((g) => [restX(g), restY(g, layerH)] as [number, number]);
  for (const g of air) {
    const t = -g.t0;
    if (t >= g.landAt - g.t0) continue;
    const p = grainPos(g, t, layerH);
    if (p) dots.push(p);
  }
  const n = pile.length;
  const mean = pile.reduce((s, g) => s + g.bin + 1, 0) / n;
  const sd = Math.sqrt(pile.reduce((s, g) => s + (g.bin + 1 - mean) ** 2, 0) / (n - 1));
  return { dots, curve: curvePath(n * layerH), n, mean, sd };
}

/** The board as an SVG string at `px` wide, cropped, in one theme's colours. */
export function boardSvg(c: BoardColors, crop: Crop = "full", px = 600) {
  const [x, y, w, h] = CROPS[crop];
  const { dots, curve } = boardFrame();
  let s = "";
  for (let r = 0; r < ROWS; r++)
    for (let j = 0; j <= r; j++) s += `<circle cx="${CX + (j - r / 2) * BW}" cy="${PEG_Y0 + r * ROW_H}" r="3.2" fill="${c.lineStrong}" opacity="0.9"/>`;
  for (let k = 0; k <= BINS; k++) s += `<line x1="${binX(k - 0.5)}" x2="${binX(k - 0.5)}" y1="${BASE}" y2="${BASE - 210}" stroke="${c.line}" stroke-width="1.5"/>`;
  // A grain cut by the crop's top edge reads as a stray mark: leave it out.
  const grains = dots.filter(([, gy]) => gy - R >= y).map(([gx, gy]) => `<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${R}"/>`).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${Math.round((px * h) / w)}" viewBox="${x} ${y} ${w} ${h}">` +
    `<path d="${areaPath(curve)}" fill="${c.clay}" fill-opacity="0.16"/>${s}<g fill="${c.clay}">${grains}</g>` +
    `<line x1="${CX}" x2="${CX}" y1="${BASE}" y2="${BASE - 196}" stroke="${c.ink}" stroke-width="1.5" stroke-dasharray="5 6"/>` +
    `<path d="${curve}" fill="none" stroke="${c.clay}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<line x1="${binX(-0.5)}" x2="${binX(BINS - 0.5)}" y1="${BASE}" y2="${BASE}" stroke="${c.ink}" stroke-width="2.5" stroke-linecap="round"/></svg>`
  );
}
