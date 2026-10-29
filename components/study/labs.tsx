"use client";

import * as React from "react";
import { cn } from "cn";
import { DATA, type LabId } from "@/lib/study/data";
import { Phi, PhiInv, Z, binom, fmt, gauss, histogram, mean, pois, r2, r3, sd } from "@/lib/study/math";
import { BarRow, Chart, Select, Slider, area, curve } from "@/components/study/chart";
import { btn } from "@/components/study/ui";
import { useHydrated } from "@/lib/hooks";
import { sym } from "@/lib/study/symbols";

// Labs: drag a control until the number makes sense. Each one is a small component on the shared
// <Chart> primitive. Labs that start from random draws only show them after hydration, so the
// server HTML and the first paint agree.

const L = DATA.labs;

function Lab({ title, sub, children, label }: { title: string; sub?: string; children: React.ReactNode; label: string }) {
  return (
    <section aria-label={label} className="grid gap-4 rounded-[18px] border border-line bg-paper p-5 md:p-6">
      <div className="grid gap-1">
        <h2 className="font-display text-[1.2rem] font-[650] tracking-[-0.02em]">{title}</h2>
        {sub && <p className="text-sm text-ink-muted">{sub}</p>}
      </div>
      {children}
    </section>
  );
}
function Note({ children, live = true }: { children: React.ReactNode; live?: boolean }) {
  return (
    <p className="text-[15px] [&_b]:font-semibold [&_b]:tabular-nums" aria-live={live ? "polite" : undefined}>
      {children}
    </p>
  );
}
function Btns({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
const axis = { stroke: "var(--line-strong)", strokeWidth: 1 };
const n0 = (n: number) => n.toLocaleString("en-US");

/** The bell with a cutoff: shared by the bell and any-normal labs. */
function Bell({ m, s, z, left, label }: { m: number; s: number; z: number; left?: boolean; label: string }) {
  return (
    <Chart ratio={0.34} minH={160} maxH={220} label={label}>
      {({ W, H }) => {
        const base = H - 28, top = 12, x0 = 12, x1 = W - 12;
        const X = (v: number) => x0 + ((v + 3.3) / 6.6) * (x1 - x0), Y = (v: number) => base - (base - top) * Math.exp((-v * v) / 2);
        const zc = Math.max(-3.3, Math.min(3.3, z));
        return (
          <>
            <path d={area(-3.3, 3.3, X, Y, base)} fill="var(--clay-tint)" />
            <path d={left ? area(-3.3, zc, X, Y, base) : area(zc, 3.3, X, Y, base)} fill="var(--clay)" fillOpacity={0.35} />
            <path d={curve(-3.3, 3.3, X, Y)} fill="none" stroke="var(--clay)" strokeWidth={2} />
            <line x1={x0} y1={base} x2={x1} y2={base} {...axis} />
            {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
              <text key={k} x={X(k)} y={base + 20} textAnchor="middle">
                {m + k * s}
              </text>
            ))}
            <line x1={X(zc)} y1={top - 4} x2={X(zc)} y2={base} stroke="var(--ink)" strokeWidth={1.5} />
          </>
        );
      }}
    </Chart>
  );
}

function BellLab() {
  const c = L.bell;
  const [x, setX] = React.useState(c.init);
  const z = (x - c.m) / c.s, above = 1 - Phi(z);
  const bands = [
    ["2.5%", `below ${c.m - 2 * c.s}`],
    ["13.5%", `${c.m - 2 * c.s} to ${c.m - c.s}`],
    ["34%", `${c.m - c.s} to ${c.m}`],
    ["34%", `${c.m} to ${c.m + c.s}`],
    ["13.5%", `${c.m + c.s} to ${c.m + 2 * c.s}`],
    ["2.5%", `above ${c.m + 2 * c.s}`],
  ];
  return (
    <Lab title={c.title} sub={c.sub} label="Bell curve lab">
      <Bell m={c.m} s={c.s} z={z} label="Bell curve with the share above the cutoff shaded" />
      <Slider id="bellX" label="Cutoff:" value={x} unit={c.unit} min={c.min} max={c.max} step={c.step} onChange={setX} />
      <Note>
        {x} is <b>{Math.abs(r2(z)).toFixed(1)} SD</b> {z >= 0 ? "above" : "below"} the average. Share above it: <b>{(above * 100).toFixed(1)}%</b>. Share below:{" "}
        <b>{((1 - above) * 100).toFixed(1)}%</b>.
      </Note>
      <div className="grid grid-cols-3 gap-1.5 text-center text-xs sm:grid-cols-6">
        {bands.map(([p, r], i) => (
          <div key={i} className={cn("grid gap-0.5 rounded-lg px-1 py-2", i === 2 || i === 3 ? "bg-clay-tint" : "bg-sand")}>
            <b className="font-mono text-sm tabular-nums">{p}</b>
            {r}
          </div>
        ))}
      </div>
    </Lab>
  );
}

function ControlChartLab() {
  const c = L.cc;
  const [s, setS] = React.useState(c.init);
  const [pts, setPts] = React.useState(() => Array.from({ length: 40 }, gauss));
  const fresh = () => setPts(Array.from({ length: 40 }, gauss));
  const ready = useHydrated();
  const UL = c.center + 3 * c.sdLimit, LL = c.center - 3 * c.sdLimit;
  const out = ready ? pts.filter((z) => Math.abs(z * s) > 3 * c.sdLimit).length : 0;
  return (
    <Lab title={c.title} sub={c.sub} label="Control chart lab">
      <Chart ratio={0.45} minH={200} maxH={270} label="Control chart">
        {({ W, H }) => {
          const lo = c.center - 5.5 * c.sdLimit, hi = c.center + 5.5 * c.sdLimit, x0 = 36, x1 = W - 8;
          const X = (i: number) => x0 + i * ((x1 - x0) / 39), Y = (v: number) => H - 16 - ((v - lo) / (hi - lo)) * (H - 28);
          const vals = ready ? pts.map((z) => c.center + z * s) : [], clamp = (v: number) => Math.max(lo, Math.min(hi, v));
          return (
            <>
              {([[UL, "UL"], [c.center, "CL"], [LL, "LL"]] as const).map(([v, l]) => (
                <g key={l}>
                  <line x1={x0 - 4} x2={x1} y1={Y(v)} y2={Y(v)} stroke={l === "CL" ? "var(--line-strong)" : "var(--ink-muted)"} strokeWidth={1.5} strokeDasharray={l === "CL" ? undefined : "6 5"} />
                  <text x={2} y={Y(v) + 4}>
                    {l}
                  </text>
                </g>
              ))}
              <path d={vals.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(clamp(v)).toFixed(1)}`).join(" ")} fill="none" stroke="var(--line)" strokeWidth={1.5} />
              {vals.map((v, i) => {
                const o = v > UL || v < LL;
                return <circle key={i} cx={X(i).toFixed(1)} cy={Y(clamp(v)).toFixed(1)} r={o ? 5 : 3.5} fill={o ? "var(--danger)" : "var(--clay)"} />;
              })}
            </>
          );
        }}
      </Chart>
      <Slider id="ccSd" label="Process SD:" value={s} unit={c.unit} min={c.min} max={c.max} step={1} onChange={setS} />
      <Btns>
        <button type="button" className={btn.ghost} onClick={fresh}>
          New data
        </button>
      </Btns>
      <Note>
        <b>{s <= c.sdLimit ? "In control." : "Out of control."}</b> Limits were set for an SD of {c.sdLimit}
        {c.unit} ({c.center} ± {3 * c.sdLimit}). At SD {s}, <b>{out} of 40</b> points broke a limit.
      </Note>
    </Lab>
  );
}

function CoinLab() {
  const [st, setSt] = React.useState({ h: 0, t: 0, pairs: 0, hh: 0, last: null as boolean | null, face: "H", spin: 0 });
  const flip = (n: number) =>
    setSt((o) => {
      let { h, t, pairs, hh, last } = o, x = true;
      for (let i = 0; i < n; i++) {
        x = Math.random() < 0.5;
        if (x) h++;
        else t++;
        if (last !== null) {
          pairs++;
          if (x && last) hh++;
          last = null;
        } else last = x;
      }
      return { h, t, pairs, hh, last, face: x ? "H" : "T", spin: o.spin + 1 };
    });
  const n = st.h + st.t;
  return (
    <Lab title="Coin: P(heads) = 1/2" label="Coin lab">
      <div className="flex items-center gap-4">
        <div key={st.spin} aria-hidden className={cn("grid size-[76px] place-items-center rounded-full border-2 border-clay bg-clay-tint font-mono text-2xl font-semibold", st.spin > 0 && "motion-safe:animate-[coin-spin_350ms_ease]")}>
          {st.face}
        </div>
        <p className="text-sm text-ink-muted">
          Flips <b className="font-mono tabular-nums text-ink">{n0(n)}</b>
        </p>
      </div>
      <Btns>
        <button type="button" className={btn.ghost} onClick={() => flip(1)}>Flip</button>
        <button type="button" className={btn.ghost} onClick={() => flip(100)}>Flip 100</button>
        <button type="button" className={btn.ghost} onClick={() => flip(1000)}>Flip 1,000</button>
        <button type="button" className={btn.ghost} onClick={() => setSt({ h: 0, t: 0, pairs: 0, hh: 0, last: null, face: "H", spin: 0 })}>Reset</button>
      </Btns>
      <div className="grid gap-2">
        <BarRow label="Heads" p={n ? st.h / n : 0} target={50} />
        <BarRow label="Tails" p={n ? st.t / n : 0} target={50} />
      </div>
      <Note>
        {n === 0 ? "Flip it. The dark line marks the true 50%." : n < 30 ? "Small sample: the split can be way off 50%. That is normal." : <><b>{n0(n)} flips:</b> heads at {((st.h / n) * 100).toFixed(1)}%. More flips, closer to 50%.</>}
      </Note>
      <Note live={false}>
        <b>Two heads in a row (and means multiply):</b> {st.hh} of {st.pairs} pairs{st.pairs ? ` (${((st.hh / st.pairs) * 100).toFixed(1)}%)` : ""}. True odds 0.5 × 0.5 = 25%.
      </Note>
    </Lab>
  );
}

const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function DiceLab() {
  const [dc, setDc] = React.useState([0, 0, 0, 0, 0, 0, 0]);
  const [face, setFace] = React.useState(1);
  const [spin, setSpin] = React.useState(0);
  const [given, setGiven] = React.useState(false);
  const roll = (k: number) => {
    const next = dc.slice();
    let f = 1;
    for (let i = 0; i < k; i++) {
      f = 1 + Math.floor(Math.random() * 6);
      next[f]++;
    }
    setDc(next);
    setFace(f);
    setSpin((s) => s + 1);
  };
  const n = dc.slice(1).reduce((a, b) => a + b, 0), ev = dc[2] + dc[4] + dc[6];
  return (
    <Lab title="Die: each face 1/6 (16.7%)" label="Die lab">
      <div className="flex items-center gap-4">
        <div key={spin} aria-hidden className={cn("grid size-[76px] grid-cols-3 grid-rows-3 place-items-center rounded-2xl border-2 border-ink p-2.5", spin > 0 && "motion-safe:animate-[die-shake_300ms_ease]")}>
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={cn("size-3 rounded-full", PIPS[face].includes(i) ? "bg-ink" : "bg-transparent")} />
          ))}
        </div>
        <p className="text-sm text-ink-muted">
          Rolls <b className="font-mono tabular-nums text-ink">{n0(n)}</b>
        </p>
      </div>
      <Btns>
        <button type="button" className={btn.ghost} onClick={() => roll(1)}>Roll</button>
        <button type="button" className={btn.ghost} onClick={() => roll(100)}>Roll 100</button>
        <button type="button" className={btn.ghost} onClick={() => roll(1000)}>Roll 1,000</button>
        <button type="button" className={btn.ghost} onClick={() => { setDc([0, 0, 0, 0, 0, 0, 0]); setFace(1); }}>Reset</button>
      </Btns>
      <div className="grid gap-2">
        {[1, 2, 3, 4, 5, 6].map((f) => (
          <BarRow key={f} label={`Face ${f}`} p={n ? dc[f] / n : 0} target={100 / 6} />
        ))}
      </div>
      <label className="flex min-h-11 items-center gap-2.5 text-[15px]">
        <input type="checkbox" checked={given} onChange={(e) => setGiven(e.target.checked)} className="size-5 accent-clay" /> {L.diceGiven}
      </label>
      <Note>
        {given ? (ev ? <><b>Even rolls only: {n0(ev)}.</b> Twos among them: {n0(dc[2])}, which is <b>{((dc[2] / ev) * 100).toFixed(1)}%</b>. True answer 33.3%.</> : "Roll first.") : "Turn this on to watch P(2 | even) head toward 1/3."}
      </Note>
      {n > 0 && (
        <Note live={false}>
          P(not a 6): <b>{(((n - dc[6]) / n) * 100).toFixed(1)}%</b> (true 83.3%). P(1 or 2): <b>{(((dc[1] + dc[2]) / n) * 100).toFixed(1)}%</b> (true 33.3%).
        </Note>
      )}
    </Lab>
  );
}

function PortfolioLab() {
  const c = L.port;
  const [wp, setW] = React.useState(c.w);
  const [rp, setR] = React.useState(c.rho);
  const w = wp / 100, rho = rp / 100;
  const sig = (t: number) => Math.sqrt(t * t * c.s1 * c.s1 + (1 - t) * (1 - t) * c.s2 * c.s2 + 2 * t * (1 - t) * rho * c.s1 * c.s2);
  const vv = sig(w), ee = w * c.e1 + (1 - w) * c.e2;
  return (
    <Lab title="Two-asset portfolio: drag the weight and the correlation" label="Portfolio lab">
      <Slider id="pw" label={`Weight in ${c.name1}:`} value={wp} show={`${wp}%`} min={0} max={100} step={5} onChange={setW} />
      <Slider id="pr" label="Correlation ρ:" value={rp} show={rho.toFixed(2)} min={-100} max={100} step={1} onChange={setR} />
      <Chart ratio={0.45} minH={220} maxH={280} label="Portfolio risk against the weight in the first asset">
        {({ W, H }) => {
          const x0 = 44, x1 = W - 12, y0 = H - 40, y1 = 16, X = (t: number) => x0 + t * (x1 - x0), Y = (v: number) => y0 - (v / c.ymax) * (y0 - y1);
          return (
            <>
              <line x1={x0} y1={y0} x2={x1} y2={y0} {...axis} />
              <line x1={x0} y1={y1} x2={x0} y2={y0} {...axis} />
              {[0, c.ymax / 2, c.ymax].map((v) => (
                <text key={v} x={x0 - 6} y={Y(v) + 4} textAnchor="end">{v}</text>
              ))}
              <text x={(x0 + x1) / 2} y={H - 8} textAnchor="middle">Weight in {c.name1}, 0% to 100%</text>
              <text x={x0 + 6} y={y1 + 4}>σ in %</text>
              <path d={curve(0, 1.0001, X, (t) => Y(sig(t)), 0.02)} fill="none" stroke="var(--clay)" strokeWidth={2.5} />
              <circle cx={X(w)} cy={Y(vv)} r={6} fill="var(--paper)" stroke="var(--clay)" strokeWidth={2.5} />
            </>
          );
        }}
      </Chart>
      <Note>
        {c.name1}: E {c.e1}%, σ {c.s1}%. {c.name2}: E {c.e2}%, σ {c.s2}%. Your mix: <b>E = {ee.toFixed(2)}%</b>, <b>σ = {vv.toFixed(2)}%</b>.{" "}
        {rho < 1 ? "Because ρ is below 1, the curve bends below the straight line between the two assets. That bend is diversification, though it doesn't always dip below the safer one." : "At ρ = 1 there is no dip; the mix is a straight line between the two."}
      </Note>
    </Lab>
  );
}

function BinomLab() {
  const [n, setN] = React.useState(L.binom.n);
  const [pp, setP] = React.useState(L.binom.p);
  const p = pp / 100, maxk = Math.min(n, 14);
  return (
    <Lab title="Binomial: drag n and p" label="Binomial lab">
      <Slider id="bn" label="n =" value={n} min={1} max={30} step={1} onChange={setN} />
      <Slider id="bp" label="p =" value={pp} show={p.toFixed(2)} min={1} max={99} step={1} onChange={setP} />
      <div className="grid gap-2">
        {Array.from({ length: maxk + 1 }, (_, k) => (
          <BarRow key={k} label={`y = ${k}`} p={binom(k, n, p)} />
        ))}
      </div>
      <Note>
        Mean np = <b>{fmt(n * p)}</b>. Variance np(1 − p) = <b>{fmt(n * p * (1 - p))}</b>. P(at least 1) = 1 − (1 − p)ⁿ = <b>{fmt(1 - (1 - p) ** n)}</b>.
        {maxk < n ? " Showing y up to 14." : ""}
      </Note>
    </Lab>
  );
}

function PoissonLab() {
  const [l, setL] = React.useState(L.pois.l);
  const kmax = Math.min(20, Math.ceil(l + 4 * Math.sqrt(l)));
  return (
    <Lab title="Poisson: drag λ" label="Poisson lab">
      <Slider id="pl" label="λ =" value={l} min={0.5} max={15} step={0.5} onChange={setL} />
      <div className="grid gap-2">
        {Array.from({ length: kmax + 1 }, (_, k) => (
          <BarRow key={k} label={`y = ${k}`} p={pois(k, l)} />
        ))}
      </div>
      <Note>
        Mean = variance = <b>{l}</b>. P(0) = e<sup>−λ</sup> = <b>{fmt(pois(0, l))}</b>. P(at least 2) = <b>{fmt(1 - pois(0, l) - pois(1, l))}</b>.
      </Note>
    </Lab>
  );
}

function NormalLab() {
  const c = L.z;
  const [m, setM] = React.useState(c.m);
  const [s, setS] = React.useState(c.s);
  const [x, setX] = React.useState(c.x);
  const z = (x - m) / s;
  return (
    <Lab title="Any normal: set μ, σ, and a cutoff" label="Normal curve lab">
      <Slider id="zm" label="μ =" value={m} min={0} max={c.mMax} step={1} onChange={setM} />
      <Slider id="zs" label="σ =" value={s} min={1} max={c.sMax} step={1} onChange={setS} />
      <Slider id="zx" label="Cutoff y =" value={x} min={0} max={c.xMax} step={1} onChange={setX} />
      <Bell m={m} s={s} z={z} left label="Normal curve with the area below the cutoff shaded" />
      <Note>
        z = ({x} − {m}) / {s} = <b>{fmt(r2(z))}</b>. P(Y &lt; {x}) = <b>{fmt(Phi(z))}</b> (shaded). P(Y &gt; {x}) = <b>{fmt(1 - Phi(z))}</b>.
      </Note>
    </Lab>
  );
}

function CltLab() {
  const [pop, setPop] = React.useState("skew");
  const [n, setN] = React.useState(5);
  const [means, setMeans] = React.useState<number[]>([]);
  const one = () => (pop === "die" ? 1 + Math.floor(Math.random() * 6) : pop === "uni" ? Math.random() * 6 : -Math.log(1 - Math.random()) * 2);
  const draw = (k: number) =>
    setMeans((ms) => {
      const next = ms.slice();
      for (let i = 0; i < k; i++) {
        let s = 0;
        for (let j = 0; j < n; j++) s += one();
        next.push(s / n);
      }
      return next;
    });
  const truth = { die: 3.5, uni: 3, skew: 2 }[pop as "die"];
  const over = histogram(means, 0, 6, 30).over;
  return (
    <Lab title="CLT: sample means turn into a bell" label="Central Limit Theorem lab">
      <Select id="cpop" label="Population shape" value={pop} onChange={(v) => { setPop(v); setMeans([]); }} options={[["skew", "Skewed, like incomes"], ["uni", "Flat, uniform"], ["die", "Die rolls"]]} />
      <Slider id="cn" label="Sample size n =" value={n} min={1} max={60} step={1} onChange={(v) => { setN(v); setMeans([]); }} />
      <Btns>
        <button type="button" className={btn.ghost} onClick={() => draw(1)}>Draw 1 sample</button>
        <button type="button" className={btn.ghost} onClick={() => draw(200)}>Draw 200</button>
        <button type="button" className={btn.ghost} onClick={() => draw(2000)}>Draw 2,000</button>
        <button type="button" className={btn.ghost} onClick={() => setMeans([])}>Reset</button>
      </Btns>
      <Chart ratio={0.36} minH={180} maxH={230} label="Histogram of sample means">
        {({ W, H }) => {
          const x0 = 24, x1 = W - 12, base = H - 24, bins = 30, h = histogram(means, 0, 6, bins).counts;
          const mx = Math.max(...h) || 1, bw = (x1 - x0) / bins, tx = x0 + (truth / 6) * (x1 - x0);
          return (
            <>
              {h.map((cnt, i) => (
                <rect key={i} x={(x0 + i * bw + 1).toFixed(1)} y={(base - (cnt / mx) * (base - 12)).toFixed(1)} width={Math.max(1, bw - 2).toFixed(1)} height={((cnt / mx) * (base - 12)).toFixed(1)} fill="var(--clay)" />
              ))}
              <line x1={x0} y1={base} x2={x1} y2={base} {...axis} />
              {[0, 1, 2, 3, 4, 5, 6].map((v) => (
                <text key={v} x={x0 + (v / 6) * (x1 - x0)} y={base + 18} textAnchor="middle">{v}</text>
              ))}
              <line x1={tx} y1={8} x2={tx} y2={base} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="5 4" />
            </>
          );
        }}
      </Chart>
      <Note>
        {means.length ? (
          <>
            <b>{n0(means.length)} sample means</b>, n = {n} each. Their average: <b>{fmt(r2(mean(means)))}</b> (true μ = {truth}). Their SD: <b>{fmt(r3(means.length > 1 ? sd(means) : 0))}</b>.{over ? ` ${n0(over)} ${over === 1 ? "is" : "are"} above 6, off the right edge.` : ""} Raise n and watch the pile narrow into a bell, even when the population is skewed.
          </>
        ) : (
          "Pick a population, set n, and draw. The dashed line is the true mean."
        )}
      </Note>
    </Lab>
  );
}

const CONFS = [90, 95, 99] as const;
/** 100 samples of size n from N(50, 10), each with its interval at confidence c. */
function intervals(n: number, c: (typeof CONFS)[number]) {
  const out: [number, number][] = [];
  for (let i = 0; i < 100; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += 50 + 10 * gauss();
    const xb = s / n, m = (Z[c] * 10) / Math.sqrt(n);
    out.push([xb - m, xb + m]);
  }
  return out;
}
function CiLab() {
  const [n, setN] = React.useState(25);
  const [ci, setCi] = React.useState(1);
  const [all, setRows] = React.useState(() => intervals(25, 95));
  const rows = useHydrated() ? all : [];
  const c = CONFS[ci], hit = rows.filter((r) => r[0] <= 50 && r[1] >= 50).length;
  return (
    <Lab title="100 confidence intervals: how many catch μ = 50?" label="Confidence interval lab">
      <Slider id="cin" label="n =" value={n} min={5} max={100} step={5} onChange={(v) => { setN(v); setRows(intervals(v, c)); }} />
      <Slider id="cic" label="Confidence:" value={ci} show={`${c}%`} min={0} max={2} step={1} onChange={(v) => { setCi(v); setRows(intervals(n, CONFS[v])); }} />
      <Btns>
        <button type="button" className={btn.ghost} onClick={() => setRows(intervals(n, c))}>Draw 100 samples</button>
      </Btns>
      <Chart ratio={0.5} minH={240} maxH={300} label="One hundred confidence intervals, with misses marked">
        {({ W, H }) => {
          const x0 = 16, x1 = W - 16, X = (v: number) => x0 + ((v - 30) / 40) * (x1 - x0), step = (H - 36) / 100;
          return (
            <>
              <line x1={X(50)} y1={4} x2={X(50)} y2={H - 24} stroke="var(--ink)" strokeWidth={1.5} />
              {rows.map((r, i) => {
                const ok = r[0] <= 50 && r[1] >= 50, y = (8 + i * step).toFixed(1);
                return <line key={i} x1={X(Math.max(30, r[0])).toFixed(1)} y1={y} x2={X(Math.min(70, r[1])).toFixed(1)} y2={y} stroke={ok ? "var(--clay)" : "var(--danger)"} strokeWidth={ok ? 1.2 : 2} />;
              })}
              {[30, 40, 50, 60, 70].map((v) => (
                <text key={v} x={X(v)} y={H - 6} textAnchor="middle">{v}</text>
              ))}
            </>
          );
        }}
      </Chart>
      <Note>
        <b>{hit} of 100</b> intervals caught μ = 50, with n = {n} at {c}% (expect about {c}). Misses are red. Bigger n makes the intervals shorter; higher confidence makes them longer.
      </Note>
    </Lab>
  );
}

function EveryLab() {
  const c = L.every, v = c.vals, N = v.length, mu = mean(v), s2 = v.reduce((a, x) => a + (x - mu) ** 2, 0) / N;
  const [n, setN] = React.useState(2);
  const [k, setK] = React.useState("mean");
  const isVar = k === "s2" || k === "v", target = isVar ? s2 : mu, letter = isVar ? "σ²" : "μ";
  const stat = (a: number[]) => {
    const m = mean(a);
    if (k === "mean") return m;
    if (k === "med") {
      const b = a.slice().sort((p, q) => p - q), len = b.length;
      return len % 2 ? b[(len - 1) / 2] : (b[len / 2 - 1] + b[len / 2]) / 2;
    }
    const ss = a.reduce((t, x) => t + (x - m) ** 2, 0);
    return k === "s2" ? ss / (a.length - 1) : ss / a.length;
  };
  const undefinedS2 = k === "s2" && n < 2;
  let samples: number[][] = [[]];
  for (let i = 0; i < n; i++) samples = samples.flatMap((a) => v.map((x) => [...a, x]));
  const xs = undefinedS2 ? [] : samples.map(stat), tot = samples.length;
  const E = xs.length ? mean(xs) : 0, sdS = xs.length ? Math.sqrt(xs.reduce((a, x) => a + (x - E) ** 2, 0) / tot) : 0;
  const unb = Math.abs(E - target) < 1e-9;
  const name = { mean: "sample means", med: "sample medians", s2: "s² values", v: "divide-by-n variances" }[k as "mean"];
  return (
    <Lab title={c.title} sub={c.sub} label="Every possible sample lab">
      <Slider id="evn" label="Sample size n =" value={n} min={1} max={5} step={1} onChange={setN} />
      <Select
        id="evs"
        label="Statistic"
        value={k}
        onChange={setK}
        options={[["mean", "Sample mean x̄, aiming at μ"], ["med", "Sample median, aiming at μ"], ["s2", "s², dividing by n − 1, aiming at σ²"], ["v", "Variance dividing by n, aiming at σ²"]]}
      />
      <Chart ratio={0.36} minH={180} maxH={230} label="Exact sampling distribution of the chosen statistic">
        {({ W, H }) => {
          const x0 = 24, x1 = W - 12, base = H - 24, top = 26, lo = isVar ? 0 : Math.min(...v), hi = isVar ? 13 : Math.max(...v);
          const X = (x: number) => x0 + ((x - lo) / (hi - lo)) * (x1 - x0), ticks: number[] = [];
          for (let t = lo; t <= hi; t += isVar ? 2 : 1) ticks.push(t);
          const bins = new Map<string, number>();
          xs.forEach((x) => bins.set(x.toFixed(6), (bins.get(x.toFixed(6)) ?? 0) + 1));
          const keys = [...bins.keys()].map(Number).sort((p, q) => p - q);
          let mx = 0, gap = Infinity;
          keys.forEach((x, i) => {
            mx = Math.max(mx, bins.get(x.toFixed(6))!);
            if (i) gap = Math.min(gap, X(x) - X(keys[i - 1]));
          });
          const bw = Math.max(3, Math.min(22, Number.isFinite(gap) ? gap * 0.7 : 22)), tx = X(target), ex = X(E);
          return (
            <>
              <line x1={x0} y1={base} x2={x1} y2={base} {...axis} />
              {ticks.map((t) => (
                <text key={t} x={X(t)} y={base + 18} textAnchor="middle">{t}</text>
              ))}
              {!undefinedS2 && (
                <>
                  {keys.map((x) => {
                    const h = (bins.get(x.toFixed(6))! / mx) * (base - top);
                    return <rect key={x} x={(X(x) - bw / 2).toFixed(1)} y={(base - h).toFixed(1)} width={bw.toFixed(1)} height={h.toFixed(1)} rx={1.5} fill="var(--clay)" />;
                  })}
                  <line x1={tx} y1={top - 6} x2={tx} y2={base} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="5 4" />
                  <text x={tx} y={12} textAnchor={unb ? "middle" : E < target ? "start" : "end"}>
                    {unb ? "average = " : ""}
                    {letter} = {fmt(target)}
                  </text>
                  {!unb && (
                    <>
                      <line x1={ex} y1={top - 6} x2={ex} y2={base} stroke="var(--danger)" strokeWidth={2} />
                      <text x={ex} y={12} textAnchor={E < target ? "end" : "start"} style={{ fill: "var(--danger)" }}>
                        average {fmt(r2(E))}
                      </text>
                    </>
                  )}
                </>
              )}
            </>
          );
        }}
      </Chart>
      <Note>
        {undefinedS2 ? (
          "One value has no spread, and dividing by n − 1 = 0 is undefined. Raise n to 2 or more."
        ) : (
          <>
            <b>{n0(tot)} possible samples</b> of n = {n} (4 choices per draw, so 4<sup>{n}</sup>). The {name} average <b>{fmt(r3(E))}</b> against a target of {letter} = {fmt(target)}:{" "}
            {unb ? <b>unbiased</b> : <><b>biased</b>, {fmt(r3(Math.abs(E - target)))}{E < target ? " too low" : " too high"} on average</>}. Spread across samples (SD): <b>{fmt(r3(sdS))}</b>
            {k === "mean"
              ? `, exactly σ / √n = √${fmt(s2)} / √${n}.`
              : k === "med"
                ? n < 3
                  ? ". With one or two values the median is the mean. Try n = 3."
                  : sym(`. x̄ has SD ${fmt(r3(Math.sqrt(s2 / n)))} at this n and sits on target, so x̄ is the more efficient estimator.`)
                : k === "v"
                  ? n < 2
                    ? ". One value always has a spread of 0."
                    : `. Dividing by n runs low by the factor (n − 1)/n = ${n - 1}/${n}. That is why s² divides by n − 1.`
                  : ". Dividing by n − 1 instead of n is what puts the average on σ²."}
          </>
        )}
      </Note>
      {!undefinedS2 && n <= 2 && (
        <ul aria-label="Every sample and its value" className="grid list-none grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-x-4 gap-y-0.5 font-mono text-[13px] tabular-nums text-ink-muted">
          {samples.map((a, i) => (
            <li key={i}>
              ({a.join(", ")}) → {fmt(r3(stat(a)))}
            </li>
          ))}
        </ul>
      )}
    </Lab>
  );
}

function TestLab() {
  const c = L.test;
  const [xb, setXb] = React.useState(248.5);
  const [n, setN] = React.useState(36);
  const [side, setSide] = React.useState("two");
  const [a, setA] = React.useState("0.05");
  const al = +a, se = c.s / Math.sqrt(n), z = (xb - c.mu) / se;
  const p = side === "two" ? 2 * (1 - Phi(Math.abs(z))) : side === "less" ? Phi(z) : 1 - Phi(z);
  const crit = side === "two" ? PhiInv(1 - al / 2) : PhiInv(1 - al), rej = p < al;
  return (
    <Lab title={c.title} sub={c.sub} label="Hypothesis test lab">
      <Slider id="tsx" label={sym("Sample mean x̄ =")} value={xb} show={xb.toFixed(1)} unit=" ml" min={244} max={256} step={0.1} onChange={setXb} />
      <Slider id="tsn" label="Sample size n =" value={n} min={4} max={100} step={1} onChange={setN} />
      <div className="grid grid-cols-2 gap-3">
        <Select id="tss" label="H₁" value={side} onChange={setSide} options={[["two", "μ ≠ 250, two-sided"], ["less", "μ < 250, pours short"], ["greater", "μ > 250, pours long"]]} />
        <Select id="tsa" label="α" value={a} onChange={setA} options={[["0.1", "0.10"], ["0.05", "0.05"], ["0.01", "0.01"]]} />
      </div>
      <Chart ratio={0.34} minH={170} maxH={230} label="Sampling distribution under H₀ with the rejection region and the observed sample mean">
        {({ W, H }) => {
          const base = H - 28, top = 22, x0 = 12, x1 = W - 12, R = 4;
          const X = (v: number) => x0 + ((v + R) / (2 * R)) * (x1 - x0), Y = (v: number) => base - (base - top) * Math.exp((-v * v) / 2);
          const zc = Math.max(-R, Math.min(R, z));
          return (
            <>
              <path d={area(-R, R, X, Y, base)} fill="var(--clay-tint)" />
              {side !== "greater" && <path d={area(-R, -crit, X, Y, base)} fill="var(--danger)" fillOpacity={0.35} />}
              {side !== "less" && <path d={area(crit, R, X, Y, base)} fill="var(--danger)" fillOpacity={0.35} />}
              <path d={curve(-R, R, X, Y)} fill="none" stroke="var(--clay)" strokeWidth={2} />
              <line x1={x0} y1={base} x2={x1} y2={base} {...axis} />
              {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
                <text key={k} x={X(k)} y={base + 20} textAnchor="middle">{fmt(r2(c.mu + k * se))}</text>
              ))}
              <line x1={X(zc)} y1={top - 6} x2={X(zc)} y2={base} stroke="var(--ink)" strokeWidth={2} />
              <text x={X(zc)} y={12} textAnchor={zc < -2.5 ? "start" : zc > 2.5 ? "end" : "middle"} style={{ fill: "var(--ink)" }}>
                x̄ = {xb.toFixed(1)}
              </text>
            </>
          );
        }}
      </Chart>
      <Note>
        z = ({xb.toFixed(1)} − {c.mu}) / ({c.s} / √{n}) = <b>{fmt(r2(z))}</b>. p-value = <b>{fmt(r3(p))}</b>.{" "}
        {rej ? <><b>Reject H₀</b> at α = {al}: a sample this far out would be rare if the machine were fine.</> : <><b>Fail to reject H₀</b> at α = {al}: samples like this are common when the machine is fine.</>} Red is the rejection region, beyond z ={" "}
        {side === "two" ? "±" : side === "less" ? "−" : ""}
        {fmt(r2(crit))}.
      </Note>
    </Lab>
  );
}

function fit(pts: [number, number][]) {
  const n = pts.length;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  pts.forEach(([x, y]) => {
    sx += x; sy += y; sxy += x * y; sxx += x * x;
  });
  const b1 = (n * sxy - sx * sy) / (n * sxx - sx * sx), b0 = sy / n - (b1 * sx) / n, ybar = sy / n;
  let sst = 0, sse = 0;
  pts.forEach(([x, y]) => {
    sst += (y - ybar) ** 2;
    sse += (y - (b0 + b1 * x)) ** 2;
  });
  return { b0, b1, r2: 1 - sse / sst };
}
function RegLab() {
  const c = L.reg;
  const [x, setX] = React.useState(c.x);
  const [y, setY] = React.useState(c.y);
  const [on, setOn] = React.useState(false);
  const F0 = fit(c.pts), F = on ? fit([...c.pts, [x, y]]) : F0;
  return (
    <Lab title={c.title} label="Regression lab">
      <Slider id="rx" label="Your point x =" value={x} min={0} max={12} step={0.5} onChange={setX} />
      <Slider id="ry" label="Your point y =" value={y} min={0} max={16} step={0.2} onChange={setY} />
      <label className="flex min-h-11 items-center gap-2.5 text-[15px]">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="size-5 accent-clay" /> Include my point
      </label>
      <Chart ratio={0.5} minH={240} maxH={300} label="Scatter plot with the fitted line">
        {({ W, H }) => {
          const x0 = 32, x1 = W - 12, y0 = H - 36, y1 = 12, X = (v: number) => x0 + (v / 12) * (x1 - x0), Y = (v: number) => y0 - (v / 16) * (y0 - y1);
          return (
            <>
              <line x1={x0} y1={y0} x2={x1} y2={y0} {...axis} />
              <line x1={x0} y1={y1} x2={x0} y2={y0} {...axis} />
              {[0, 3, 6, 9, 12].map((v) => (
                <text key={v} x={X(v)} y={y0 + 16} textAnchor="middle">{v}</text>
              ))}
              {[0, 8, 16].map((v) => (
                <text key={v} x={x0 - 6} y={Y(v) + 4} textAnchor="end">{v}</text>
              ))}
              <text x={(x0 + x1) / 2} y={H - 4} textAnchor="middle">Advertising (x)</text>
              <line x1={X(0)} y1={Y(F0.b0)} x2={X(12)} y2={Y(F0.b0 + 12 * F0.b1)} stroke="var(--line-strong)" strokeWidth={1.5} strokeDasharray="5 4" />
              <line x1={X(0)} y1={Y(F.b0)} x2={X(12)} y2={Y(F.b0 + 12 * F.b1)} stroke="var(--clay)" strokeWidth={2.5} />
              {c.pts.map(([px, py], i) => (
                <circle key={i} cx={X(px)} cy={Y(py)} r={5} fill="var(--clay)" />
              ))}
              {on && <circle cx={X(x)} cy={Y(y)} r={7} fill="var(--paper)" stroke="var(--ink)" strokeWidth={2} />}
            </>
          );
        }}
      </Chart>
      <Note>
        {c.prefix}: Sales = {F0.b0.toFixed(2)} + {F0.b1.toFixed(2)} Adv, R² = {(F0.r2 * 100).toFixed(1)}%.{" "}
        {on ? (
          <>
            With your point: <b>y = {F.b0.toFixed(2)} + {F.b1.toFixed(2)} x</b>, R² = <b>{(F.r2 * 100).toFixed(1)}%</b>. Drag x far right and see how much one high-leverage point swings the line.
          </>
        ) : (
          "Tick the box to add a point you control."
        )}
      </Note>
    </Lab>
  );
}

const LABS: Record<LabId, () => React.ReactNode> = {
  bell: BellLab, cc: ControlChartLab, coin: CoinLab, dice: DiceLab, port: PortfolioLab, binom: BinomLab, pois: PoissonLab,
  z: NormalLab, clt: CltLab, ci: CiLab, every: EveryLab, test: TestLab, reg: RegLab,
};

export function TopicLab({ id }: { id: LabId }) {
  const C = LABS[id];
  return <C />;
}
