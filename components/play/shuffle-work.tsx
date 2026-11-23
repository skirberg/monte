import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { Fig } from "@/lib/play/shuffle";
import { chain, crowd, doorGrains, gamma, lognormal, normal, sample } from "@/lib/play/shuffle-fig";

/**
 * The Shuffle's work as a picture (DESIGN.md, "The Shuffle": the design pass of Nov 20 2026). The reveal used to
 * write the work out line by line; now it draws it: the two curves and the tail for an average, a thousand dots for
 * a positive test, a line for every pair in a birthday room, the grains moving off an opened door. The numbers on
 * the picture are the work's own (lib/play/shuffle.ts builds both from the same lines), the grain's answer in clay.
 * The steps stay one tap away, under the picture. Every drawing moves once as it appears (.ga-play) and holds still
 * under reduced motion.
 */

const W = 320;
const at = (i: number): CSSProperties => ({ "--i": i }) as CSSProperties;
const mono = "font-mono";
const word = "font-sans";
/** Text on the picture: chart units, which scale with it (DESIGN.md, "Type": the SVG exception). */
const T = { s: 11, m: 12.5, l: 15 };
const fmt = (x: number, d = 0) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const pct = (x: number) => `${+(x * 100).toFixed(x < 0.1 ? 1 : 0)}%`;
const cents = (x: number) => `${x < 0 ? "−" : "+"}$${Math.abs(x).toFixed(2)}`;
/** The sampled curve's height nearest x. */
const yAt = (pts: [number, number][], x: number) => pts.reduce((b, p) => (Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b))[1];
const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/** `label` is the grain cup's answer as the table shows it; `alt` says the picture in a sentence. */
export function ShuffleWork({ fig, answer, className }: { fig: Fig; answer: string; className?: string }) {
  const { body, h, alt } = draw(fig, answer);
  return (
    <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label={alt} className={cn("sw ga ga-play block h-auto w-full overflow-visible", className)}>
      {body}
    </svg>
  );
}

function draw(f: Fig, answer: string): { body: React.ReactNode; h: number; alt: string } {
  switch (f.kind) {
    case "curves":
      return curves(f, answer);
    case "skew":
      return skew(f, answer);
    case "ranges":
      return ranges(f);
    case "people":
      return people(f, answer);
    case "chain":
      return chainFig(f, answer);
    case "groups":
      return groups(f, answer);
    case "pairs":
      return pairs(f, answer);
    case "doors":
      return doors(f, answer);
    case "wheel":
      return wheel(f, answer);
  }
}

// ---------- a value against an average: two curves, one cutoff, the grain's tail in clay

function curves(f: Extract<Fig, { kind: "curves" }>, answer: string) {
  const h = 172, base = 132, top = 18, L = 8, R = W - 8;
  const span = 3.4 * f.sd;
  let lo = f.skew ? 0 : f.mu - span, hi = f.mu + span * (f.skew ? 1.2 : 1);
  lo = Math.min(lo, f.cut - 0.5 * f.sd);
  hi = Math.max(hi, f.cut + 0.5 * f.sd);
  const one = sample(f.skew ? gamma(f.mu, f.sd) : normal(f.mu, f.sd), lo, hi, 180);
  const avg = sample(normal(f.mu, f.se), lo, hi, 360);
  const grain = f.grain === "average" ? avg : one;
  const trap = f.grain === "average" ? one : avg;
  const sg = f.grain === "average" ? f.se : f.sd;
  // The grain's curve fills the height; a taller trap curve runs off the top (clipped), its area still honest.
  const peak = Math.max(...grain.map((p) => p[1]));
  const X = (x: number) => L + ((x - lo) / (hi - lo)) * (R - L);
  const Y = (y: number) => base - (y / peak) * (base - top);
  const toPx = (pts: [number, number][]) => pts.map(([x, y]) => [X(x), Y(y)] as [number, number]);
  const s = f.dir === "above" ? 1 : -1;
  const tail = grain.filter(([x]) => s * (x - f.cut) >= 0);
  const yAtCut = yAt(grain, f.cut);
  const tailPath = tail.length ? `${poly(toPx([[f.cut, 0], [f.cut, yAtCut], ...tail, [tail[tail.length - 1][0], 0]]))} Z` : "";
  const cx = X(f.cut);
  // The answer sits beside the grain's curve, just into the tail.
  const ax = Math.abs(f.cut - f.mu) > 1.3 * sg ? f.cut : f.mu + s * 1.3 * sg;
  const ay = Math.min(base - 12, Y(yAt(grain, ax)) - 4);
  // The grain's name on the side away from the tail; the trap's on its own far shoulder.
  const gx = f.grain === "average" ? f.mu : f.mu - s * 1.3 * sg;
  const gy = f.grain === "average" ? top - 4 : Y(yAt(grain, gx)) - 6;
  const tx = f.grain === "average" ? f.mu - s * 2 * f.sd : f.mu - s * 1.7 * f.se;
  const ty = f.grain === "average" ? Y(yAt(trap, tx)) - 7 : top + 8;
  const id = `clip-${f.grain}-${Math.round(f.cut * 100)}`;
  const alt = `${f.grain === "average" ? `The ${f.many} spreads far less than one ${f.one}` : `One ${f.one} spreads by σ; dividing by the crate's √n would draw the narrow curve`}. Past ${f.cutLabel} ${f.unit}, the ${f.grain === "average" ? f.many : `one ${f.one}`} curve holds ${answer}.`;
  return {
    h,
    alt,
    body: (
      <>
        <defs>
          <clipPath id={id}>
            <rect x={0} y={top - 10} width={W} height={base - top + 10} />
          </clipPath>
        </defs>
        <line x1={L} x2={R} y1={base} y2={base} stroke="var(--line-strong)" strokeWidth={1.25} />
        <path className="ga-draw" style={at(0)} pathLength={1} clipPath={`url(#${id})`} d={poly(toPx(trap))} fill="none" stroke="var(--ink-muted)" strokeWidth={1.5} strokeDasharray={f.grain === "average" ? undefined : "4 4"} />
        {tailPath && <path className="ga-fade" style={at(6)} d={tailPath} fill="var(--clay)" fillOpacity={0.32} />}
        <path className="ga-draw" style={at(2)} pathLength={1} d={poly(toPx(grain))} fill="none" stroke="var(--clay)" strokeWidth={2.5} strokeLinejoin="round" />
        <line x1={cx} x2={cx} y1={top - 6} y2={base + 4} stroke="var(--ink)" strokeWidth={1.25} strokeDasharray="3 3" />
        <text x={cx} y={base + 17} textAnchor="middle" fontSize={T.s} className={cn(mono, "fill-ink")}>
          {f.cutLabel} {f.unit}
        </text>
        <text x={X(f.mu)} y={base + 17} textAnchor="middle" fontSize={T.s} className={cn(mono, "fill-ink-muted")} opacity={Math.abs(X(f.mu) - cx) > 64 ? 1 : 0}>
          {fmt(f.mu, f.mu % 1 ? 1 : 0)}
        </text>
        <text x={X(gx) - (f.grain === "average" ? 0 : s * 4)} y={gy} textAnchor={f.grain === "average" ? "middle" : s > 0 ? "end" : "start"} fontSize={T.m} className={cn(word, "fill-ink font-medium")}>
          {f.grain === "average" ? f.many : `one ${f.one}`}
        </text>
        <text x={Math.min(R - 34, Math.max(L + 34, X(tx) - (f.grain === "average" ? 0 : s * 4)))} y={ty} textAnchor={f.grain === "average" ? "middle" : s > 0 ? "end" : "start"} fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          {f.grain === "average" ? `one ${f.one}` : f.trap}
        </text>
        <text style={at(8)} x={X(ax) + s * 7} y={ay} textAnchor={s > 0 ? "start" : "end"} fontSize={T.l} className={cn(mono, "ga-fade fill-clay-ink font-semibold")}>
          {answer}
        </text>
      </>
    ),
  };
}

// ---------- not enough to tell: shapes with the same mean and SD, and different tails

function skew(f: Extract<Fig, { kind: "skew" }>, answer: string) {
  const h = 172, base = 132, top = 30, L = 8, R = W - 8;
  const sd = f.sd / Math.sqrt(f.n);
  const many = f.n > 1;
  const lo = 0, hi = Math.max(f.mu + (many ? 3.2 * f.sd : 4.2 * sd), f.cut + sd);
  // One value: two skewed shapes with the very mean and SD given, and the normal. An average of a few: one value's
  // skewed shape, the average's (a lognormal with σ/√n, close to the real average's skew), and the normal.
  const a = sample(many ? lognormal(f.mu, f.sd) : gamma(f.mu, sd), lo, hi, 220);
  const b = sample(lognormal(f.mu, sd), lo, hi, 220);
  const c = sample(normal(f.mu, sd), lo, hi, 220);
  const peak = Math.max(...[b, c, ...(many ? [] : [a])].flat().map((p) => p[1]));
  const X = (x: number) => L + ((x - lo) / (hi - lo)) * (R - L);
  const Y = (y: number) => base - (y / peak) * (base - top);
  const px = (pts: [number, number][]) => pts.map(([x, y]) => [X(x), Y(y)] as [number, number]);
  const cx = X(f.cut);
  const unit = f.unit === "$k" ? "" : ` ${f.unit}`;
  const cut = f.unit === "$k" ? `$${fmt(f.cut)}k` : fmt(f.cut, f.cut % 1 ? 1 : 0);
  const who = many ? `average of ${f.n}` : `one ${f.one}`;
  const nx = f.mu + 0.35 * sd;
  return {
    h,
    alt: many
      ? `One ${f.one}'s shape is strongly skewed, and the ${who} is still skewed: the normal curve laid over it misses its tail past ${cut}${unit}. ${answer}.`
      : `Two skewed shapes with the same mean and SD as the facts, and the normal curve. Past ${cut}${unit} their tails differ, so the facts can't give the chance: ${answer}.`,
    body: (
      <>
        <text x={L} y={12} fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          {many ? `${who}: still skewed` : "same mean, same SD"}
        </text>
        <text style={at(7)} x={R} y={12} textAnchor="end" fontSize={T.l} className={cn(word, "ga-fade fill-clay-ink font-semibold")}>
          {answer}
        </text>
        <line x1={L} x2={R} y1={base} y2={base} stroke="var(--line-strong)" strokeWidth={1.25} />
        <path className="ga-draw" style={at(0)} pathLength={1} d={poly(px(c))} fill="none" stroke="var(--ink-muted)" strokeWidth={1.5} strokeDasharray="4 4" />
        <path className="ga-draw" style={at(2)} pathLength={1} d={poly(px(a))} fill="none" stroke="var(--ink)" strokeWidth={many ? 1.25 : 2} strokeOpacity={many ? 0.45 : 1} />
        <path className="ga-draw" style={at(4)} pathLength={1} d={poly(px(b))} fill="none" stroke="var(--ink)" strokeWidth={2} strokeOpacity={many ? 1 : 0.55} />
        <line x1={cx} x2={cx} y1={top - 6} y2={base + 4} stroke="var(--ink)" strokeWidth={1.25} strokeDasharray="3 3" />
        <text x={cx} y={base + 17} textAnchor="middle" fontSize={T.s} className={cn(mono, "fill-ink")}>
          {cut}
          {unit}
        </text>
        <text x={X(nx) + 6} y={Y(yAt(c, nx)) - 5} fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          normal
        </text>
        {many && (
          <text x={X(f.mu + 1.6 * f.sd)} y={Y(yAt(a, f.mu + 1.6 * f.sd)) - 8} fontSize={T.s} className={cn(word, "fill-ink-muted")}>
            one {f.one}
          </text>
        )}
      </>
    ),
  };
}

// ---------- a range for a mean: three ranges on one line

function ranges(f: Extract<Fig, { kind: "ranges" }>) {
  const h = 136, L = 10, R = W - 10;
  const lo = Math.min(f.wide[0], f.grain[0]), hi = Math.max(f.wide[1], f.grain[1]);
  const pad = (hi - lo) * 0.04;
  const X = (x: number) => L + ((x - (lo - pad)) / (hi - lo + 2 * pad)) * (R - L);
  // Ends written the way the cups write them (toFixed), so the picture and the table agree to the last digit.
  const d = (x: number) => x.toFixed(f.dp);
  const row = (y: number, [a, b]: [number, number], kind: "grain" | "near" | "wide", i: number) => (
    <g>
      <line className="ga-grow" style={at(i)} x1={X(a)} x2={X(b)} y1={y} y2={y} stroke={kind === "grain" ? "var(--clay)" : "var(--ink-muted)"} strokeWidth={kind === "grain" ? 7 : 2} strokeLinecap="round" strokeDasharray={kind === "near" ? "3 4" : undefined} />
      {kind === "wide" && [a, b].map((x) => <line key={x} x1={X(x)} x2={X(x)} y1={y - 6} y2={y + 6} stroke="var(--ink-muted)" strokeWidth={2} />)}
    </g>
  );
  const mid = X(f.xbar);
  return {
    h,
    alt: `A 95% range for the mean, ${d(f.grain[0])} to ${d(f.grain[1])} ${f.unit}, is narrow because it uses the standard error. Where one ${f.one} lands, ${d(f.wide[0])} to ${d(f.wide[1])}, is far wider.`,
    body: (
      <>
        <line x1={mid} x2={mid} y1={24} y2={116} stroke="var(--line-strong)" strokeDasharray="2 3" />
        <text x={mid} y={126} textAnchor="middle" fontSize={T.s} className={cn(mono, "fill-ink-muted")}>
          x̄ {fmt(f.xbar, f.dp)}
        </text>
        <text x={mid} y={18} textAnchor="middle" fontSize={T.m} className={cn(mono, "fill-clay-ink font-semibold")}>
          {d(f.grain[0])}–{d(f.grain[1])}
        </text>
        {row(30, f.grain, "grain", 2)}
        <text x={X(f.grain[1]) + 8} y={34} fontSize={T.m} className={cn(mono, "fill-clay-ink font-semibold")}>
          ± {f.crit} SE
        </text>
        {row(62, f.near, "near", 4)}
        <text x={X(f.near[1]) + 8} y={66} fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          {f.nearTag}
        </text>
        {row(94, f.wide, "wide", 6)}
        <text x={X(f.wide[0])} y={84} fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          one {f.one}
        </text>
      </>
    ),
  };
}

// ---------- a positive result: a thousand dots

function people(f: Extract<Fig, { kind: "people" }>, answer: string) {
  const cols = 50, gap = 6.08, r = 2.05, x0 = 11, y0 = 8;
  const rows = Math.ceil(f.per / cols);
  const dots = crowd(f.per, f.sick, f.hit, f.fa);
  const gridH = y0 + (rows - 1) * gap;
  const by = gridH + 26, flagged = f.hit + f.fa, bw = W - 2 * x0;
  const split = x0 + (f.hit / flagged) * bw;
  const [has, not] = f.who;
  return {
    h: by + 38,
    alt: `Out of ${fmt(f.per)}: ${fmt(f.sick)} ${has}, and ${fmt(f.hit)} of them get flagged. ${fmt(f.fa)} that ${not} get flagged too. Of the ${fmt(flagged)} flagged, ${fmt(f.hit)} ${has}: ${answer}.`,
    body: (
      <>
        {dots.map((k, i) => {
          const cx = x0 + (i % cols) * gap, cy = y0 + Math.floor(i / cols) * gap;
          if (k === "rest") return <circle key={i} cx={cx} cy={cy} r={r} fill="var(--line)" />;
          if (k === "miss") return <circle key={i} cx={cx} cy={cy} r={r - 0.5} fill="none" stroke="var(--clay)" strokeWidth={1} />;
          return <circle key={i} className="ga-pop" style={at(Math.min(12, i / 14))} cx={cx} cy={cy} r={r} fill={k === "hit" ? "var(--clay)" : "var(--ink)"} />;
        })}
        <text x={x0} y={by - 9} fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          the {fmt(flagged)} flagged
        </text>
        <rect className="ga-grow-l" style={at(10)} x={x0} y={by} width={bw} height={10} rx={5} fill="var(--ink)" />
        <rect className="ga-grow-l" style={at(12)} x={x0} y={by} width={Math.max(10, split - x0)} height={10} rx={5} fill="var(--clay)" />
        <text x={x0} y={by + 27} fontSize={T.m} className={cn(word, "fill-clay-ink font-medium")}>
          <tspan className={cn(mono, "font-semibold")}>{fmt(f.hit)}</tspan> {has}: <tspan className={cn(mono, "font-semibold")}>{answer}</tspan>
        </text>
        <text x={W - x0} y={by + 27} textAnchor="end" fontSize={T.m} className={cn(word, "fill-ink")}>
          <tspan className={mono}>{fmt(f.fa)}</tspan> {not}
        </text>
      </>
    ),
  };
}

// ---------- at least one: each one keeps (1 − p) of what is left

function chainFig(f: Extract<Fig, { kind: "chain" }>, answer: string) {
  const L = 10, R = W - 10, bw = R - L, gap = 22, y0 = 10;
  const steps = chain(f.p, f.n);
  const yEnd = y0 + f.n * gap + 6;
  const keep = fmt(1 - f.p, 2).replace(/0+$/, "");
  const added = Math.min(1, f.n * f.p);
  return {
    h: yEnd + 46,
    alt: `Each of ${f.n} keeps ${pct(1 - f.p)} of what is left: none goes wrong ${pct(f.none)} of the time, so at least one goes wrong ${answer}. Adding the chances would say ${pct(f.n * f.p)}.`,
    body: (
      <>
        {steps.map((s, i) => {
          const y = y0 + i * gap;
          const kept = L + s.left * (1 - f.p) * bw;
          const edge = L + s.left * bw;
          return (
            <g key={i}>
              {i > 0 && <rect x={edge} y={y} width={R - edge} height={12} rx={3} fill="var(--clay)" fillOpacity={0.28} />}
              <rect className="ga-grow-l" style={at(i * 2)} x={L} y={y} width={kept - L} height={12} rx={3} fill="var(--line)" />
              <rect className="ga-grow-l" style={at(i * 2 + 1)} x={kept} y={y} width={Math.max(2, edge - kept)} height={12} rx={2} fill="var(--clay)" />
              <text x={kept - 5} y={y + 9.5} textAnchor="end" fontSize={T.s} className={cn(mono, "fill-ink")}>
                × {keep}
              </text>
            </g>
          );
        })}
        <line x1={L + added * bw} x2={L + added * bw} y1={y0 - 4} y2={yEnd + 2} stroke="var(--ink-muted)" strokeDasharray="2 3" />
        <text x={L + added * bw - 4} y={yEnd + 2} textAnchor="end" fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          added: {pct(f.n * f.p)}
        </text>
        <text x={L} y={yEnd + 24} fontSize={T.m} className={cn(word, "fill-ink")}>
          none <tspan className={mono}>{pct(f.none)}</tspan>
        </text>
        <text x={R} y={yEnd + 24} textAnchor="end" fontSize={T.l} className={cn(word, "fill-clay-ink font-semibold")}>
          at least one <tspan className={mono}>{answer}</tspan>
        </text>
      </>
    ),
  };
}

// ---------- a given: the given group becomes the whole

function groups(f: Extract<Fig, { kind: "groups" }>, answer: string) {
  const L = 10, R = W - 10, top = 24, H = 86, bw = R - L;
  const ax = L + (f.A / f.N) * bw;
  const abH = (f.AB / f.A) * H;
  const bOnly = (f.B - f.AB) / (f.N - f.A);
  return {
    h: top + H + 46,
    alt: `Of ${fmt(f.N)} in all, ${fmt(f.A)} are ${f.a}: they are the new total. ${fmt(f.AB)} of them ${f.b === "loan" ? "have a loan" : "got hurt"}: ${fmt(f.AB)} ÷ ${fmt(f.A)} = ${answer}.`,
    body: (
      <>
        <rect x={L} y={top} width={bw} height={H} rx={6} fill="none" stroke="var(--line-strong)" />
        <rect x={ax} y={top} width={R - ax} height={bOnly * H} fill="var(--ink-muted)" fillOpacity={0.22} />
        <rect className="ga-rise" style={at(2)} x={L} y={top + H - abH} width={ax - L} height={abH} fill="var(--clay)" />
        <rect className="ga-fade" style={at(4)} x={L} y={top} width={ax - L} height={H} rx={6} fill="none" stroke="var(--ink)" strokeWidth={2.5} />
        <text x={L} y={top - 8} fontSize={T.m} className={cn(word, "fill-ink font-medium")}>
          <tspan className={mono}>{fmt(f.A)}</tspan> {f.a}
        </text>
        <text x={R} y={top - 8} textAnchor="end" fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          <tspan className={mono}>{fmt(f.N)}</tspan> in all
        </text>
        {/* the overlap's count: inside the clay when it fits (no halo there), else just above it */}
        <text x={(L + ax) / 2} y={abH >= 18 ? top + H - abH / 2 + 4 : top + H - abH - 5} textAnchor="middle" fontSize={T.m} style={abH >= 18 ? { stroke: "none" } : undefined} className={cn(mono, abH >= 18 ? "fill-paper font-semibold" : "fill-clay-ink font-semibold")}>
          {fmt(f.AB)}
        </text>
        <text x={L} y={top + H + 24} fontSize={T.l} className={cn(mono, "fill-clay-ink font-semibold")}>
          {fmt(f.AB)} ÷ {fmt(f.A)} = {answer}
        </text>
        <text x={R} y={top + H + 24} textAnchor="end" fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          not ÷ <tspan className={mono}>{fmt(f.N)}</tspan>
        </text>
      </>
    ),
  };
}

// ---------- the birthday room: a line for every pair

function pairs(f: Extract<Fig, { kind: "pairs" }>, answer: string) {
  const cx = 82, cy = 82, rad = 70;
  const pts = Array.from({ length: f.n }, (_, i) => {
    const a = (i / f.n) * 2 * Math.PI - Math.PI / 2;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)] as [number, number];
  });
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < f.n; i++) for (let j = i + 1; j < f.n; j++) lines.push(<line key={`${i}-${j}`} x1={pts[i][0]} y1={pts[i][1]} x2={pts[j][0]} y2={pts[j][1]} stroke="var(--ink-muted)" strokeOpacity={0.22} strokeWidth={0.6} />);
  const tx = 176;
  return {
    h: 166,
    alt: `${f.n} people make ${fmt(f.k)} pairs, a line for each, and every pair is a chance to share a birthday. At least one pair matches ${answer} of the time.`,
    body: (
      <>
        <g className="ga-fade" style={at(1)}>{lines}</g>
        <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[Math.floor(f.n / 2)][0]} y2={pts[Math.floor(f.n / 2)][1]} stroke="var(--clay)" strokeWidth={2} className="ga-draw" style={at(6)} pathLength={1} />
        {pts.map(([x, y], i) => (
          <circle key={i} className="ga-pop" style={at(i * 0.3)} cx={x} cy={y} r={4} fill={i === 0 || i === Math.floor(f.n / 2) ? "var(--clay)" : "var(--ink)"} />
        ))}
        <text x={tx} y={56} fontSize={30} className={cn(mono, "fill-ink font-semibold")}>
          {fmt(f.k)}
        </text>
        <text x={tx} y={74} fontSize={T.m} className={cn(word, "fill-ink-muted")}>
          pairs from {f.n} people
        </text>
        <text x={tx} y={112} fontSize={30} className={cn(mono, "fill-clay-ink font-semibold")}>
          {answer}
        </text>
        <text x={tx} y={130} fontSize={T.m} className={cn(word, "fill-ink-muted")}>
          at least one match
        </text>
      </>
    ),
  };
}

// ---------- the host's doors: the chance as grains, moved off the opened doors

function doors(f: Extract<Fig, { kind: "doors" }>, answer: string) {
  const grains = doorGrains(f.v, f.opened);
  const left = f.v - 1 - f.opened;
  const dw = f.v === 3 ? 62 : f.v === 4 ? 54 : 46, gap = f.v === 3 ? 26 : 14;
  const x0 = (W - (f.v * dw + (f.v - 1) * gap)) / 2;
  const top = 22, dh = 84, floor = top + dh;
  return {
    h: floor + 52,
    alt: `Door 1 keeps its 1 in ${f.v}. The host opened ${f.opened === 1 ? "a door" : `${f.opened} doors`} he knew were empty, so their share moves to the ${left === 1 ? "closed door" : `${left} closed doors`}: ${answer} each.`,
    body: (
      <>
        <line x1={6} x2={W - 6} y1={floor} y2={floor} stroke="var(--line-strong)" strokeWidth={1.25} />
        {grains.map((g, d) => {
          const x = x0 + d * (dw + gap);
          const open = d > left;
          const n = open ? 2 : g;
          return (
            <g key={d}>
              {open ? (
                <>
                  <rect x={x} y={top} width={dw} height={dh} rx={4} fill="none" stroke="var(--line-strong)" strokeWidth={1.5} />
                  <path d={`M${x} ${top} L${x + dw * 0.32} ${top + 8} L${x + dw * 0.32} ${floor - 2} L${x} ${floor}`} fill="var(--sand)" stroke="var(--line-strong)" strokeWidth={1.25} />
                </>
              ) : (
                <rect x={x} y={top} width={dw} height={dh} rx={4} fill="var(--ink)" />
              )}
              {d === 0 && <circle cx={x + dw - 10} cy={top + dh / 2} r={2.5} fill="var(--paper)" />}
              {/* the door's grains on the floor in front of it; an opened door's two are ghosts that left */}
              {Array.from({ length: n }, (_, k) => {
                const per = Math.min(n, 4), row = Math.floor(k / per), col = k % per;
                const cx = x + dw / 2 + (col - (Math.min(per, n - row * per) - 1) / 2) * 10;
                const cy = floor + 10 + row * 10;
                return open ? (
                  <circle key={k} cx={cx} cy={cy} r={3.6} fill="none" stroke="var(--line-strong)" strokeDasharray="2 2" />
                ) : (
                  <circle key={k} className="ga-pop" style={at(d === 0 ? k : 4 + k)} cx={cx} cy={cy} r={4} fill={d === 0 ? "var(--ink)" : "var(--clay)"} />
                );
              })}
              <text x={x + dw / 2} y={top - 7} textAnchor="middle" fontSize={d > 0 && !open ? T.m : T.s} className={cn(mono, d > 0 && !open ? "fill-clay-ink font-semibold" : "fill-ink-muted")}>
                {d === 0 ? `1/${f.v}` : open ? "0" : f.v === 3 ? "2/3" : answer}
              </text>
              {d === 0 && (
                <text x={x + dw / 2} y={floor + 40} textAnchor="middle" fontSize={T.s} className={cn(word, "fill-ink-muted")}>
                  yours
                </text>
              )}
            </g>
          );
        })}
      </>
    ),
  };
}

// ---------- the house edge: the pockets, then what a spin is worth

function wheel(f: Extract<Fig, { kind: "wheel" }>, answer: string) {
  const L = 10, R = W - 10, step = (R - L) / (f.pockets - 1);
  const zero = W / 2, scale = (W / 2 - 112) / Math.max(f.win, f.lose);
  const lost = f.pockets - 18;
  return {
    h: 128,
    alt: `${f.pockets} pockets: 18 win your $${f.bet}, ${lost} lose it. Wins are worth ${cents(f.win)} a spin and losses ${cents(-f.lose)}, so a spin is worth ${answer}.`,
    body: (
      <>
        {Array.from({ length: f.pockets }, (_, i) => {
          const green = i >= 36;
          const win = i < 18;
          // red and black alternate round a real wheel; here the 18 that win come first, then the 18 that lose, then the green
          const x = L + i * step;
          return green ? (
            <circle key={i} className="ga-pop" style={at(6)} cx={x} cy={16} r={3.4} fill="none" stroke="var(--clay)" strokeWidth={2} />
          ) : (
            <circle key={i} className="ga-pop" style={at(i / 9)} cx={x} cy={16} r={3.4} fill={win ? "var(--ink)" : "none"} stroke={win ? "none" : "var(--ink-muted)"} strokeWidth={1.25} />
          );
        })}
        <text x={L} y={38} fontSize={T.s} className={cn(word, "fill-ink")}>
          18 win
        </text>
        <text x={R} y={38} textAnchor="end" fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          {lost} lose, {f.pockets - 36} green
        </text>
        <line x1={zero} x2={zero} y1={52} y2={130} stroke="var(--line-strong)" />
        <rect className="ga-grow-l" style={at(4)} x={zero} y={58} width={f.win * scale} height={14} rx={3} fill="var(--ink)" />
        <text x={zero + f.win * scale + 6} y={69} fontSize={T.m} className={cn(mono, "fill-ink")}>
          {cents(f.win)} <tspan className={word} fontSize={T.s}>wins</tspan>
        </text>
        <rect className="ga-grow" style={at(6)} x={zero - f.lose * scale} y={80} width={f.lose * scale} height={14} rx={3} fill="var(--ink-muted)" fillOpacity={0.5} />
        <text x={zero - f.lose * scale - 6} y={91} textAnchor="end" fontSize={T.m} className={cn(mono, "fill-ink-muted")}>
          <tspan className={word} fontSize={T.s}>losses</tspan> {cents(-f.lose)}
        </text>
        <rect className="ga-grow" style={at(9)} x={zero - Math.abs(f.ev) * scale} y={104} width={Math.max(3, Math.abs(f.ev) * scale)} height={14} rx={2} fill="var(--clay)" />
        <text x={zero - Math.abs(f.ev) * scale - 6} y={115} textAnchor="end" fontSize={T.l} className={cn(mono, "fill-clay-ink font-semibold")}>
          {answer}
        </text>
        <text x={zero + 8} y={115} fontSize={T.s} className={cn(word, "fill-ink-muted")}>
          a spin
        </text>
      </>
    ),
  };
}
