import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";

/**
 * GaltonPile: the brand concept as a film. Grains (data points) fall through
 * twelve rows of pegs, each bounce a coin flip, and pile into thirteen bins,
 * one per topic. The line is drawn over the pile, and the running mean and SD
 * of the landed grains tick toward 7 and 1.73. 300 frames at 30 fps, loops.
 */

export const GALTON = { width: 1000, height: 1000, fps: 30, durationInFrames: 300 } as const;

const N = 360;
const ROWS = 12;
const BINS = ROWS + 1;
const BW = 64;
const CX = 500;
const TOP = 64;
const PEG_Y0 = 150;
const ROW_H = 30;
const EXIT_Y = PEG_Y0 + ROWS * ROW_H;
const BASE = 900;
const R = 5;
const PER_LAYER = 5;
const COL = 11.2;
const LAYER = 10.2;
const FRAMES_PER_ROW = 2;
const DROP_START = 12;
const DROP_SPAN = 178;

const FADE_FROM = 282;
const LINE_FROM = 205;
const LINE_TO = 245;

type Grain = { t0: number; xs: number[]; bin: number; x: number; y: number; land: number; fall: number };

const binX = (k: number) => CX + (k - ROWS / 2) * BW;

const GRAINS: Grain[] = (() => {
  const counts = new Array(BINS).fill(0);
  return Array.from({ length: N }, (_, i) => {
    let rights = 0;
    const xs = [CX];
    for (let r = 0; r < ROWS; r++) {
      if (random(`g-${i}-${r}`) < 0.5) rights++;
      xs.push(CX + (rights - (r + 1) / 2) * BW);
    }
    const bin = rights;
    const s = counts[bin]++;
    const layer = Math.floor(s / PER_LAYER);
    const col = s % PER_LAYER;
    const jitter = (random(`j-${i}`) - 0.5) * 2.2;
    const x = binX(bin) + (col - (PER_LAYER - 1) / 2) * COL + (layer % 2 ? 2.4 : -2.4) + jitter;
    const y = BASE - R - 1 - layer * LAYER;
    const t0 = DROP_START + (i / N) * DROP_SPAN;
    const pegsDone = t0 + 8 + ROWS * FRAMES_PER_ROW;
    const fall = 6 + (y - EXIT_Y) / 45;
    return { t0, xs, bin, x, y, land: pegsDone + fall, fall };
  });
})();

// Binomial(12, .5) pmf, scaled to the same pixels as the pile, for the drawn line.
const LINE_PATH = (() => {
  const sd = Math.sqrt(ROWS * 0.25);
  const scale = ((N / PER_LAYER) * LAYER) / (sd * Math.sqrt(2 * Math.PI));
  let d = "";
  for (let i = 0; i <= 160; i++) {
    const k = -0.9 + (i / 160) * (ROWS + 1.8);
    const h = scale * Math.exp(-((k - ROWS / 2) ** 2) / (2 * sd * sd));
    d += `${i ? " L" : "M"}${binX(k).toFixed(1)} ${(BASE - h - 4).toFixed(1)}`;
  }
  return d;
})();
const SIGMA_PX = Math.sqrt(ROWS * 0.25) * BW;

function grainPos(g: Grain, f: number): [number, number] | null {
  const t = f - g.t0;
  if (t < 0) return null;
  // 1. drop in from the hopper
  if (t < 8) return [CX, interpolate(t, [0, 8], [TOP, PEG_Y0 - 10], { easing: Easing.in(Easing.quad) })];
  // 2. bounce down the pegs, one coin flip per row
  const pt = t - 8;
  if (pt < ROWS * FRAMES_PER_ROW) {
    const r = Math.floor(pt / FRAMES_PER_ROW);
    const p = (pt % FRAMES_PER_ROW) / FRAMES_PER_ROW;
    const x = interpolate(Easing.out(Easing.quad)(p), [0, 1], [g.xs[r], g.xs[r + 1]]);
    const y = PEG_Y0 - 10 + (r + p) * ROW_H;
    return [x, y];
  }
  // 3. fall into the bin and settle on the pile
  const ft = pt - ROWS * FRAMES_PER_ROW;
  if (ft < g.fall) {
    const p = Easing.in(Easing.quad)(ft / g.fall);
    return [interpolate(p, [0, 1], [g.xs[ROWS], g.x]), interpolate(p, [0, 1], [EXIT_Y - 10, g.y])];
  }
  return [g.x, g.y];
}

const mono = { fontFamily: "var(--font-num), var(--font-geologica), ui-monospace, monospace" } as const;

export function GaltonPile() {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [FADE_FROM, GALTON.durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineDraw = interpolate(frame, [LINE_FROM, LINE_TO], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const marks = interpolate(frame, [LINE_TO - 8, LINE_TO + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Running statistics of the grains that have landed, bins numbered 1 to 13.
  let n = 0;
  let sum = 0;
  let sq = 0;
  for (const g of GRAINS) {
    if (frame >= g.land) {
      n++;
      sum += g.bin + 1;
      sq += (g.bin + 1) ** 2;
    }
  }
  const mean = n ? sum / n : 0;
  const s = n > 1 ? Math.sqrt((sq - n * mean * mean) / (n - 1)) : 0;

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${GALTON.width} ${GALTON.height}`} width="100%" height="100%">
        {/* readout */}
        <g style={mono} fontSize="28" fill="var(--ink-muted)">
          <text x="84" y="64">
            n <tspan fill="var(--ink)">{String(n).padStart(3, " ")}</tspan>
          </text>
          <text x="916" y="64" textAnchor="end">
            mean <tspan fill="var(--ink)">{n ? mean.toFixed(2) : "    "}</tspan>
            {"   "}sd <tspan fill="var(--ink)">{n > 1 ? s.toFixed(2) : "    "}</tspan>
          </text>
        </g>

        {/* pegs: the board is permanent, only the grains come and go */}
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: r + 1 }, (_, j) => {
            return (
              <circle
                key={`${r}-${j}`}
                cx={CX + (j - r / 2) * BW}
                cy={PEG_Y0 + r * ROW_H}
                r={3.2}
                fill="var(--line-strong)"
                opacity={0.9}
              />
            );
          }),
        )}

        {/* bin walls */}
        {Array.from({ length: BINS + 1 }, (_, k) => (
          <line
            key={k}
            x1={binX(k - 0.5)}
            x2={binX(k - 0.5)}
            y1={BASE}
            y2={BASE - 210}
            stroke="var(--line)"
            strokeWidth={1.5}
          />
        ))}

        {/* grains */}
        <g fill="var(--clay)" opacity={fadeOut}>
          {GRAINS.map((g, i) => {
            const p = grainPos(g, frame);
            return p ? <circle key={i} cx={p[0]} cy={p[1]} r={R} /> : null;
          })}
        </g>

        {/* the line */}
        <path
          d={LINE_PATH}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - lineDraw}
          opacity={fadeOut}
        />

        {/* μ and σ */}
        <g opacity={marks * fadeOut} style={mono} fontSize="20" fill="var(--ink)">
          <line x1={CX} x2={CX} y1={BASE} y2={BASE - 196} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="5 6" />
          <path
            d={`M${CX - SIGMA_PX} ${BASE + 58} v-10 H${CX + SIGMA_PX} v10`}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={1.5}
          />
          <text x={CX} y={BASE + 88} textAnchor="middle">
            μ ± 1σ
          </text>
        </g>

        {/* court baseline and bin numbers, one per topic */}
        <line
          x1={binX(-0.5)}
          x2={binX(BINS - 0.5)}
          y1={BASE}
          y2={BASE}
          stroke="var(--ink)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <g style={mono} fontSize="19" fill="var(--ink-muted)">
          {Array.from({ length: BINS }, (_, k) => (
            <text key={k} x={binX(k)} y={BASE + 28} textAnchor="middle">
              {String(k + 1).padStart(2, "0")}
            </text>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
}
