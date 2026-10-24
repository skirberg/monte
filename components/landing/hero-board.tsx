"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Plus, RotateCcw } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks";
import { useMode } from "@/lib/mode";

/**
 * The hero: a Galton board the visitor plays with. Grains (data points) fall through twelve rows of pegs,
 * each bounce a coin flip, and pile into the board's thirteen bins (0 to 12 bounces right). A short pour plays on load; tap to
 * drop a grain, hold to pour. The ink curve is Binomial(12, .5) scaled to the grains landed so far, and the
 * running mean and sd settle toward its 7 and 1.73. The board is SVG; the grains are one canvas, drawn only
 * while something moves. With reduced motion or in Focus mode the pile arrives finished and grains land at once.
 */

const SIZE = 1000;
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
// The pile never rises above the μ line; past that the layers pack tighter, like sand settling.
const MAX_H = 196;
const SD = Math.sqrt(ROWS * 0.25);
const SIGMA_PX = SD * BW;

// Timing, in milliseconds (the board was first drawn at 30 frames a second).
const FRAME = 1000 / 30;
const HOPPER_MS = 8 * FRAME;
const ROW_MS = 2 * FRAME;
const PEGS_MS = ROWS * ROW_MS;
const AUTO_N = 360;
const AUTO_MS = 3000; // the load pour lands in under five seconds, so it needs no pause control
const BURST_MS = 1200;
const HOLD_MS = 180;
const POUR_MS = 30;
const CAP = 2000;
const CURVE_AT = 60;
const SEED = 7;

const binX = (k: number) => CX + (k - ROWS / 2) * BW;

/** Small seeded generator, so the finished pile is the same on every load. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The bell curve over the bins, its height in pixels per unit of `scale` (grains landed times layer height). */
function curvePath(scale: number) {
  const k0 = scale / PER_LAYER / (SD * Math.sqrt(2 * Math.PI));
  let d = "";
  for (let i = 0; i <= 160; i++) {
    const k = -0.9 + (i / 160) * (ROWS + 1.8);
    const h = k0 * Math.exp(-((k - ROWS / 2) ** 2) / (2 * SD * SD));
    d += `${i ? " L" : "M"}${binX(k).toFixed(1)} ${(BASE - h - 4).toFixed(1)}`;
  }
  return d;
}

type Grain = { t0: number; xs: number[]; bin: number; slot: number; jitter: number; fallMs: number; landAt: number };
type PileStats = { n: number; mean: number; sd: number };
type Readout = { n: SVGTSpanElement; mean: SVGTSpanElement; sd: SVGTSpanElement };

const restX = (g: Grain) => {
  const layer = Math.floor(g.slot / PER_LAYER);
  return binX(g.bin) + ((g.slot % PER_LAYER) - (PER_LAYER - 1) / 2) * COL + (layer % 2 ? 2.4 : -2.4) + g.jitter;
};
const restY = (g: Grain, layerH: number) => BASE - R - 1 - Math.floor(g.slot / PER_LAYER) * layerH;

/** The simulation and its drawing loop. Plain code outside React: nothing here re-renders per frame. */
function createBoard(
  canvas: HTMLCanvasElement,
  curve: SVGPathElement,
  readout: Readout,
  isStill: () => boolean,
  onChange: (s: PileStats, settled: boolean) => void,
) {
  const ctx = canvas.getContext("2d")!;
  let rand = rng(SEED);
  let epoch = 0;
  let counts: number[] = new Array(BINS).fill(0);
  let flying: Grain[] = [];
  let pile: Grain[] = [];
  let n = 0;
  let sum = 0;
  let sq = 0;
  let layerH = LAYER;
  let clock = 0;
  let last = 0;
  let raf = 0;
  let visible = false;
  let pouring = false;
  let nextPour = 0;

  const total = () => pile.length + flying.length;
  const target = () => {
    const layers = Math.ceil(Math.max(...counts) / PER_LAYER);
    return layers ? Math.min(LAYER, MAX_H / layers) : LAYER;
  };

  function spawn(t0: number): Grain {
    let rights = 0;
    const xs = [CX];
    for (let r = 0; r < ROWS; r++) {
      if (rand() < 0.5) rights++;
      xs.push(CX + (rights - (r + 1) / 2) * BW);
    }
    const g: Grain = { t0, xs, bin: rights, slot: counts[rights]++, jitter: (rand() - 0.5) * 2.2, fallMs: 0, landAt: 0 };
    g.fallMs = (6 + (restY(g, target()) - EXIT_Y) / 45) * FRAME;
    g.landAt = t0 + HOPPER_MS + PEGS_MS + g.fallMs;
    return g;
  }

  function land(g: Grain) {
    pile.push(g);
    n++;
    sum += g.bin + 1;
    sq += (g.bin + 1) ** 2;
  }

  function stats(): PileStats {
    const mean = n ? sum / n : 0;
    return { n, mean, sd: n > 1 ? Math.sqrt(Math.max(0, sq - n * mean * mean) / (n - 1)) : 0 };
  }

  function report(settled: boolean) {
    const s = stats();
    readout.n.textContent = String(s.n).padStart(3, " ");
    readout.mean.textContent = s.n ? s.mean.toFixed(2) : "    ";
    readout.sd.textContent = s.n > 1 ? s.sd.toFixed(2) : "    ";
    onChange(s, settled);
  }

  function pos(g: Grain): [number, number] | null {
    const t = clock - g.t0;
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

  function draw() {
    const s = canvas.width / SIZE;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!s) return;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.fillStyle = "#cd5811";
    ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("--clay").trim() || "#cd5811";
    ctx.beginPath();
    const dot = (x: number, y: number) => {
      ctx.moveTo(x + R, y);
      ctx.arc(x, y, R, 0, Math.PI * 2);
    };
    for (const g of pile) dot(restX(g), restY(g, layerH));
    for (const g of flying) {
      const p = pos(g);
      if (p) dot(p[0], p[1]);
    }
    ctx.fill();
    curve.setAttribute("d", curvePath(n * layerH));
  }

  function add(g: Grain) {
    if (isStill()) land(g);
    else flying.push(g);
  }

  function frame(now: number) {
    raf = 0;
    const dt = last ? Math.min(now - last, 50) : 16;
    last = now;
    clock += dt;
    if (pouring && clock >= nextPour) {
      if (total() < CAP) add(spawn(clock));
      nextPour = clock + POUR_MS;
    }
    const n0 = n;
    if (flying.length) {
      const air: Grain[] = [];
      for (const g of flying) {
        if (clock >= g.landAt) land(g);
        else air.push(g);
      }
      flying = air;
    }
    const t = target();
    layerH = isStill() || Math.abs(t - layerH) < 0.01 ? t : layerH + (t - layerH) * (1 - Math.exp(-dt / 220));
    draw();
    const busy = flying.length > 0 || pouring || layerH !== t;
    if (n !== n0 || (!busy && pile.length)) report(!busy);
    if (busy && visible) raf = requestAnimationFrame(frame);
    else last = 0;
  }

  const kick = () => {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  };

  /** Drop `count` grains spread over `span` ms; with reduced motion they land at once. */
  function drop(count: number, span: number) {
    const room = CAP - total();
    for (let i = 0; i < Math.min(count, room); i++) add(spawn(clock + (count > 1 ? (i * span) / count : 0)));
    if (isStill()) settle();
    else kick();
  }

  function settle() {
    for (const g of flying) land(g);
    flying = [];
    layerH = target();
    draw();
    report(true);
  }

  function clear() {
    rand = rng(SEED + ++epoch);
    counts = new Array(BINS).fill(0);
    flying = [];
    pile = [];
    n = sum = sq = 0;
    layerH = LAYER;
    pouring = false;
    draw();
    report(true);
  }

  return {
    draw,
    drop,
    settle,
    clear,
    total,
    autoplay: () => drop(AUTO_N, AUTO_MS),
    startPour: () => {
      pouring = true;
      nextPour = clock + HOLD_MS;
      kick();
    },
    stopPour: () => {
      pouring = false;
    },
    setVisible: (v: boolean) => {
      visible = v;
      if (v) kick();
    },
    stop: () => {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

type Board = ReturnType<typeof createBoard>;

const mono = { fontFamily: "var(--font-num), var(--font-geologica), ui-monospace, monospace" } as const;
const STILL_QUERY = "(prefers-reduced-motion: reduce)";
const readStill = () => window.matchMedia(STILL_QUERY).matches || document.documentElement.dataset.mode === "focus";

// The board itself never changes: pegs and bin walls behind the grains, the baseline and bin numbers in front.
const PEGS = (
  <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full" aria-hidden>
    {Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: r + 1 }, (_, j) => (
        <circle key={`${r}-${j}`} cx={CX + (j - r / 2) * BW} cy={PEG_Y0 + r * ROW_H} r={3.2} fill="var(--line-strong)" opacity={0.9} />
      )),
    )}
    {Array.from({ length: BINS + 1 }, (_, k) => (
      <line key={k} x1={binX(k - 0.5)} x2={binX(k - 0.5)} y1={BASE} y2={BASE - 210} stroke="var(--line)" strokeWidth={1.5} />
    ))}
  </svg>
);

const COURT = (
  <>
    <line x1={binX(-0.5)} x2={binX(BINS - 0.5)} y1={BASE} y2={BASE} stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" />
    <g style={mono} fontSize="19" fill="var(--ink-muted)">
      {Array.from({ length: BINS }, (_, k) => (
        <text key={k} x={binX(k)} y={BASE + 28} textAnchor="middle">
          {String(k + 1).padStart(2, "0")}
        </text>
      ))}
    </g>
  </>
);

const describe = (s: PileStats) =>
  s.n === 0
    ? "An empty Galton board with twelve rows of pegs over thirteen bins. Drop grains to build the pile."
    : `A Galton board: ${s.n} grain${s.n === 1 ? "" : "s"} fell through twelve rows of pegs and piled into thirteen bins` +
      (s.n >= CURVE_AT ? " in the shape of the bell curve" : "") +
      `. Sample mean ${s.mean.toFixed(2)}${s.n > 1 ? `, standard deviation ${s.sd.toFixed(2)}` : ""}; the curve is centered on 7 with a spread of 1.73.`;

/** The interactive hero board. Tap or click to drop a grain, hold to pour, or use the buttons. */
export function HeroBoard({ className }: { className?: string }) {
  const box = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const curve = React.useRef<SVGPathElement>(null);
  const nRef = React.useRef<SVGTSpanElement>(null);
  const meanRef = React.useRef<SVGTSpanElement>(null);
  const sdRef = React.useRef<SVGTSpanElement>(null);
  const board = React.useRef<Board | null>(null);
  const acted = React.useRef(false);
  const reduced = useMediaQuery(STILL_QUERY);
  const focus = useMode() === "focus";
  const still = reduced || focus;
  const coarse = useMediaQuery("(pointer: coarse)");
  const [showCurve, setShowCurve] = React.useState(false);
  const [label, setLabel] = React.useState(
    "A Galton board: grains fall through twelve rows of pegs and pile into a bell curve across thirteen bins, centered on 7 with a spread of 1.73.",
  );
  const [status, setStatus] = React.useState("");

  React.useEffect(() => {
    const c = canvas.current!;
    const b = createBoard(c, curve.current!, { n: nRef.current!, mean: meanRef.current!, sd: sdRef.current! }, readStill, (s, settled) => {
      setShowCurve(s.n >= CURVE_AT);
      if (!settled) return;
      setLabel(describe(s));
      if (acted.current)
        setStatus(s.n ? `${s.n} grain${s.n === 1 ? "" : "s"}. Mean ${s.mean.toFixed(2)}, sd ${s.sd.toFixed(2)}.` : "Board cleared.");
    });
    board.current = b;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(c.clientWidth * dpr);
      if (w && w !== c.width) {
        c.width = c.height = w;
        b.draw();
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    // Recolor an idle pile when the theme flips.
    const mo = new MutationObserver(() => b.draw());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-mode"] });
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        b.setVisible(e.isIntersecting);
        if (e.isIntersecting && !started) {
          started = true;
          b.autoplay();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(box.current!);
    return () => {
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      b.stop();
      board.current = null;
    };
  }, []);

  // Turning on reduced motion or Focus mode mid-pour lands every grain in place.
  React.useEffect(() => {
    if (still) board.current?.settle();
  }, [still]);

  const act = () => {
    acted.current = true;
  };
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    act();
    board.current?.drop(1, 0);
    board.current?.startPour();
  };
  const onUp = () => board.current?.stopPour();
  const drop100 = () => {
    const b = board.current;
    if (!b) return;
    act();
    if (b.total() + 100 > CAP) b.clear();
    b.drop(100, BURST_MS);
  };
  const clear = () => {
    act();
    board.current?.clear();
  };

  return (
    <div ref={box} className={className}>
      <div
        role="img"
        aria-label={label}
        className="relative aspect-square cursor-pointer touch-manipulation select-none [-webkit-touch-callout:none]"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onLostPointerCapture={onUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {PEGS}
        <canvas ref={canvas} className="absolute inset-0 size-full" aria-hidden />
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full" aria-hidden>
          {/* readout: n first, the smoke test reads it from the figure's text */}
          <g style={mono} fontSize="28" fill="var(--ink-muted)">
            <text x="84" y="64">
              n{" "}
              <tspan ref={nRef} fill="var(--ink)">
                {"  0"}
              </tspan>
            </text>
            <text x="916" y="64" textAnchor="end">
              mean{" "}
              <tspan ref={meanRef} fill="var(--ink)">
                {"    "}
              </tspan>
              {"   "}sd{" "}
              <tspan ref={sdRef} fill="var(--ink)">
                {"    "}
              </tspan>
            </text>
          </g>

          {/* the line, drawn once enough grains have landed, then rising with the pile */}
          <motion.path
            ref={curve}
            d={curvePath(0)}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: showCurve ? 1 : 0, opacity: showCurve ? 1 : 0 }}
            transition={still ? { duration: 0 } : { pathLength: { duration: 1.1, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.2 } }}
          />

          {/* μ and σ of the curve: the readout's mean and sd settle on these */}
          <motion.g
            style={mono}
            fontSize="20"
            fill="var(--ink)"
            initial={false}
            animate={{ opacity: showCurve ? 1 : 0 }}
            transition={{ duration: still ? 0 : 0.6, delay: showCurve && !still ? 0.8 : 0 }}
          >
            <line x1={CX} x2={CX} y1={BASE} y2={BASE - 196} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="5 6" />
            <path d={`M${CX - SIGMA_PX} ${BASE + 58} v-10 H${CX + SIGMA_PX} v10`} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
            <text x={CX} y={BASE + 88} textAnchor="middle">
              μ ± 1σ
            </text>
          </motion.g>

          {COURT}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 pl-2">
        <p className="text-sm leading-snug text-ink-muted">{coarse ? "Tap" : "Click"} to drop a grain. Hold to pour.</p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={drop100}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line-strong px-4 text-sm font-medium transition-colors hover:border-ink hover:bg-paper"
            aria-label="Drop 100 grains"
          >
            <Plus className="size-4" aria-hidden />
            Drop 100
          </button>
          <button
            type="button"
            onClick={clear}
            className="grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-paper hover:text-ink"
            aria-label="Clear the board"
            title="Clear the board"
          >
            <RotateCcw className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
