import type { CSSProperties } from "react";
import { hold } from "@/lib/play/tennis";

/**
 * Each game's mark: a small drawing of the idea it hides, in the brand's devices (grains and one line).
 * The marks move: hover, focus or press a card (and open a game's page) and each one plays its own short move,
 * the idea in a second. The moves live in app/globals.css (".ga"); reduced motion keeps them still.
 */

// Fixed points so the server and client draw the same thing.
const SCATTER = [
  [8, 70], [14, 62], [19, 66], [24, 55], [29, 60], [33, 49], [38, 53], [42, 44], [47, 47], [51, 40],
  [56, 43], [60, 34], [64, 38], [69, 30], [73, 33], [78, 24], [82, 28], [87, 20], [91, 22], [95, 14],
];

/** The stagger index each moving part reads (--i). */
const at = (i: number) => ({ "--i": i }) as CSSProperties;

export function GameArt({ slug, className = "w-full" }: { slug: string; className?: string }) {
  const svg = (children: React.ReactNode) => (
    <svg viewBox="0 0 100 80" className={`ga ${className}`} aria-hidden>
      {children}
    </svg>
  );

  if (slug === "correlation")
    // the cloud pops in, then the line draws through it
    return svg(
      <>
        {SCATTER.map(([x, y], i) => (
          <circle key={i} className="ga-pop" style={at(i * 0.4)} cx={x} cy={y} r={2.8} fill="var(--clay)" />
        ))}
        <line className="ga-draw" style={at(4)} pathLength={1} x1={6} y1={70} x2={97} y2={16} stroke="var(--ink)" strokeWidth={1.6} strokeLinecap="round" />
      </>,
    );

  if (slug === "shuffle") {
    // three cups on the court line; the middle one hops off the clay grain
    const cup = (cx: number, y = 0) => (
      <>
        <rect x={cx - 7} y={33 + y} width={14} height={4} rx={1.5} fill="var(--ink)" />
        <path d={`M${cx - 6} ${36 + y} L${cx + 6} ${36 + y} L${cx + 10} ${62 + y} L${cx - 10} ${62 + y} Z`} fill="var(--ink)" />
        <rect x={cx - 12} y={60 + y} width={24} height={5} rx={2} fill="var(--ink)" />
      </>
    );
    return svg(
      <>
        <line x1={4} x2={96} y1={66} y2={66} stroke="var(--line-strong)" strokeWidth={1.2} strokeLinecap="round" />
        <circle className="ga-pop" style={at(2)} cx={50} cy={61} r={3.6} fill="var(--clay)" />
        {cup(20)}
        <g className="ga-hop" style={at(0)}>
          {cup(50, -20)}
        </g>
        {cup(80)}
      </>,
    );
  }

  if (slug === "daily")
    // a real line draws up to the hidden stretch, then stops at its edge
    return svg(
      <>
        <rect x={66} y={8} width={30} height={64} rx={6} fill="var(--sand-2)" />
        <path className="ga-draw" style={at(0)} pathLength={1} d="M4 52 L10 40 L16 46 L22 30 L28 38 L34 24 L40 34 L46 20 L52 30 L58 18 L66 26" fill="none" stroke="var(--clay)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        <circle className="ga-pop" style={at(6)} cx={66} cy={26} r={3.4} fill="var(--clay)" />
      </>,
    );

  if (slug === "monty-hall")
    // the host swings a goat door open; the car behind the last door hops
    return svg(
      <>
        {[0, 1, 2].map((d) => (
          <g key={d} className={d === 1 ? "ga-swing" : undefined}>
            <rect x={8 + d * 30} y={12} width={24} height={56} rx={5} fill={d === 1 ? "var(--sand-2)" : "var(--paper)"} stroke="var(--ink)" strokeWidth={1.6} />
            <rect x={14 + d * 30} y={60} width={12} height={2} rx={1} fill="var(--ink)" />
          </g>
        ))}
        <circle className="ga-hop" style={at(3)} cx={80} cy={40} r={5} fill="var(--clay)" />
      </>,
    );

  if (slug === "fake-coin") {
    // twenty coins flip in a wave: clay heads, open tails
    const seq = "HHTHTTTTHHTHHHTTHTHH";
    return svg(
      seq.split("").map((c, i) => {
        const x = 10 + (i % 10) * 9;
        const y = 28 + Math.floor(i / 10) * 18;
        return c === "H" ? (
          <circle key={i} className="ga-flip" style={at(i * 0.5)} cx={x} cy={y} r={3.6} fill="var(--clay)" />
        ) : (
          <circle key={i} className="ga-flip" style={at(i * 0.5)} cx={x} cy={y} r={3} fill="none" stroke="var(--ink)" strokeWidth={1.4} />
        );
      }),
    );
  }

  if (slug === "house-edge") {
    // a roulette wheel (18 clay, 18 ink, one blank 0) spins one way, the ball the other
    const n = 37;
    const R = 34, r = 24, cx = 50, cy = 40;
    const p = (a: number, rad: number) => `${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
    return svg(
      <>
        <g className="ga-spin">
          {Array.from({ length: n }, (_, i) => {
            const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
            const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
            const fill = i === 0 ? "var(--paper)" : i % 2 ? "var(--clay)" : "var(--ink)";
            return <path key={i} d={`M${p(a0, r)} L${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} L${p(a1, r)} A${r} ${r} 0 0 0 ${p(a0, r)}Z`} fill={fill} stroke="var(--sand)" strokeWidth={0.6} />;
          })}
        </g>
        <circle cx={cx} cy={cy} r={9} fill="none" stroke="var(--ink)" strokeWidth={1.6} />
        {/* an invisible ring the size of the wheel, so the ball turns about the wheel's centre */}
        <g className="ga-spin-back">
          <circle cx={cx} cy={cy} r={R} fill="none" />
          <circle cx={62} cy={18} r={2.6} fill="var(--paper)" stroke="var(--ink)" strokeWidth={1} />
        </g>
      </>,
    );
  }

  if (slug === "odds")
    // both sides of the line fill in, then the bookmaker's cut pushes the total past 100%
    return svg(
      <>
        <rect className="ga-grow-l" x={10} y={22} width={41} height={14} rx={3} fill="var(--ink)" />
        <rect className="ga-grow-l" style={at(2)} x={53} y={22} width={41} height={14} rx={3} fill="var(--line-strong)" />
        <rect className="ga-pop" style={at(5)} x={86} y={22} width={8} height={14} rx={2} fill="var(--clay)" />
        <line x1={86} x2={86} y1={14} y2={46} stroke="var(--ink)" strokeWidth={1.4} strokeDasharray="2.5 2.5" />
        <text x={86} y={56} textAnchor="middle" fontSize="7" className="font-mono" fill="var(--ink-muted)">100%</text>
      </>,
    );

  if (slug === "ab-test") {
    // a running test wanders across the line: the dot is the day someone would have peeked
    const ys = [10, 22, 16, 30, 24, 40, 33, 52, 45, 58, 50, 44, 49, 38];
    return svg(
      <>
        <line x1={6} x2={96} y1={52} y2={52} stroke="var(--clay)" strokeWidth={1.4} strokeDasharray="4 3" />
        <path className="ga-draw" pathLength={1} d={ys.map((y, i) => `${i ? "L" : "M"}${8 + i * 6.6} ${y + 6}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth={1.8} strokeLinejoin="round" />
        <circle className="ga-pop" style={at(5)} cx={8 + 7 * 6.6} cy={58} r={3.4} fill="var(--clay)" />
      </>,
    );
  }

  if (slug === "long-run") {
    // futures fan out one after another; the clay one is the average
    const line = (g: number, wob: number) => {
      let d = "";
      for (let i = 0; i <= 20; i++) {
        const x = 8 + i * 4.3;
        const y = 66 - (Math.pow(1 + g, i) - 1) * 30 + Math.sin(i * 1.7 + wob) * 2.5;
        d += `${i ? "L" : "M"}${x.toFixed(1)} ${Math.max(6, y).toFixed(1)}`;
      }
      return d;
    };
    return svg(
      <>
        {[0.01, 0.03, 0.05, 0.07].map((g, i) => (
          <path key={g} className="ga-draw" style={at(i * 1.5)} pathLength={1} d={line(g, i)} fill="none" stroke={i === 2 ? "var(--ink)" : "var(--line-strong)"} strokeWidth={i === 2 ? 2 : 1.2} />
        ))}
        <path className="ga-fade" style={at(6)} d={line(0.06, 9)} fill="none" stroke="var(--clay)" strokeWidth={1.6} strokeDasharray="3 3" />
      </>,
    );
  }

  if (slug === "options") {
    // stock paths race out from today's price; the clay ones finish past the strike
    const paths = [[0, 2, -1, 3, 5, 4, 8, 11], [0, -2, -1, -4, -3, -6, -5, -8], [0, 1, 3, 2, 6, 9, 8, 14], [0, -1, 1, 0, -2, 1, 2, 1], [0, 3, 2, 5, 4, 7, 6, 4]];
    return svg(
      <>
        <line x1={8} x2={94} y1={34} y2={34} stroke="var(--ink)" strokeWidth={1.3} strokeDasharray="3 3" />
        {paths.map((pts, k) => {
          const end = pts[pts.length - 1];
          return <path key={k} className="ga-draw" style={at(k)} pathLength={1} d={pts.map((v, i) => `${i ? "L" : "M"}${8 + i * 12} ${40 - v * 2.2}`).join(" ")} fill="none" stroke={end > 2 ? "var(--clay)" : "var(--line-strong)"} strokeWidth={1.6} />;
        })}
        <circle cx={8} cy={40} r={2.6} fill="var(--ink)" />
      </>,
    );
  }

  if (slug === "election") {
    // each poll's range opens around its estimate; all of them together make the short clay one
    const rows = [[36, 36], [62, 32], [52, 40], [70, 30], [42, 36]];
    return svg(
      <>
        <line x1={50} x2={50} y1={6} y2={74} stroke="var(--line-strong)" strokeWidth={1.2} strokeDasharray="3 3" />
        {rows.map(([c, w], i) => (
          <g key={i}>
            <line className="ga-grow" style={at(i)} x1={c - w / 2} x2={c + w / 2} y1={12 + i * 11} y2={12 + i * 11} stroke="var(--ink)" strokeWidth={1.8} strokeLinecap="round" />
            <circle cx={c} cy={12 + i * 11} r={2.6} fill="var(--clay)" />
          </g>
        ))}
        <line className="ga-grow" style={at(6)} x1={46} x2={66} y1={68} y2={68} stroke="var(--clay)" strokeWidth={4.4} strokeLinecap="round" />
        <circle className="ga-pop" style={at(7)} cx={56} cy={68} r={3.4} fill="var(--ink)" />
      </>,
    );
  }

  // serve: the hold curve draws against the diagonal, then the 60% server lands on it
  let d = "";
  for (let i = 0; i <= 40; i++) {
    const p = 0.3 + (i / 40) * 0.6;
    d += `${i ? " L" : "M"}${(8 + ((p - 0.3) / 0.6) * 86).toFixed(1)} ${(72 - hold(p) * 64).toFixed(1)}`;
  }
  return svg(
    <>
      <line x1={8} y1={72 - 0.3 * 64} x2={94} y2={72 - 0.9 * 64} stroke="var(--line-strong)" strokeDasharray="3 3" />
      <path className="ga-draw" pathLength={1} d={d} fill="none" stroke="var(--ink)" strokeWidth={1.8} />
      <circle className="ga-pop" style={at(5)} cx={8 + ((0.6 - 0.3) / 0.6) * 86} cy={72 - hold(0.6) * 64} r={3.6} fill="var(--clay)" />
    </>,
  );
}
