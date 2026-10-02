"use client";

import * as React from "react";
import { BELL_LAB as L, Phi } from "@/lib/site-data";

const W = 800;
const H = 300;
const X0 = 24;
const X1 = W - 24;
const BASE = H - 40;
const TOP = 24;
const Z = 3.3;

const X = (z: number) => X0 + ((z + Z) / (2 * Z)) * (X1 - X0);
const Y = (z: number) => BASE - (BASE - TOP) * Math.exp((-z * z) / 2);
const area = (a: number, b: number) => {
  let d = `M${X(a)} ${BASE}`;
  for (let z = a; z <= b + 1e-9; z += 0.05) d += ` L${X(z).toFixed(1)} ${Y(z).toFixed(1)}`;
  return `${d} L${X(b)} ${BASE}Z`;
};
const CURVE = (() => {
  let d = "";
  for (let z = -Z; z <= Z + 1e-9; z += 0.05) d += `${d ? " L" : "M"}${X(z).toFixed(1)} ${Y(z).toFixed(1)}`;
  return d;
})();

/** Same lab the engine uses on "How spread out is it", rebuilt for the landing page. */
export function CutoffLab() {
  const [x, setX] = React.useState(L.init);
  const svg = React.useRef<SVGSVGElement>(null);
  const dragging = React.useRef(false);
  const z = (x - L.m) / L.s;
  const zc = Math.max(-Z, Math.min(Z, z));
  const above = 1 - Phi(z);

  const fromPointer = (clientX: number) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return;
    const zx = ((((clientX - r.left) / r.width) * W - X0) / (X1 - X0)) * 2 * Z - Z;
    const v = Math.round((L.m + zx * L.s) / L.step) * L.step;
    setX(Math.max(L.min, Math.min(L.max, v)));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-7">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none select-none"
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            fromPointer(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          aria-hidden
        >
          <path d={area(-Z, Z)} fill="var(--sand-2)" />
          <path d={area(zc, Z)} fill="var(--clay)" opacity={0.85} />
          <path d={CURVE} fill="none" stroke="var(--ink)" strokeWidth={3} strokeLinejoin="round" />
          <line x1={X0} x2={X1} y1={BASE} y2={BASE} stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />
          {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
            <g key={k} className="font-mono" fontSize="17" fill="var(--ink-muted)">
              <line x1={X(k)} x2={X(k)} y1={BASE} y2={BASE + 6} stroke="var(--ink-muted)" />
              <text x={X(k)} y={BASE + 28} textAnchor="middle">
                {L.m + k * L.s}
              </text>
            </g>
          ))}
          <line x1={X(zc)} x2={X(zc)} y1={TOP - 8} y2={BASE} stroke="var(--ink)" strokeWidth={2} />
          <circle cx={X(zc)} cy={TOP - 8} r={11} fill="var(--paper)" stroke="var(--ink)" strokeWidth={2.5} className="cursor-ew-resize" />
          <rect x={X0} y={0} width={X1 - X0} height={H} fill="transparent" className="cursor-ew-resize" />
        </svg>
        <label className="mt-4 block">
          <span className="sr-only">Cutoff, in coffees per day</span>
          <input
            type="range"
            min={L.min}
            max={L.max}
            step={L.step}
            value={x}
            onChange={(e) => setX(+e.target.value)}
            className="h-11 w-full accent-[var(--clay)]"
            aria-valuetext={`${x} coffees, ${(above * 100).toFixed(1)} percent of days sell more`}
          />
        </label>
      </div>

      <div className="space-y-6 lg:col-span-5" aria-live="polite">
        <p className="text-ink-muted">{L.sub} How often do you sell more than the cutoff?</p>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">P(more than {x} coffees)</p>
          <p className="font-mono text-[clamp(3.5rem,8vw,5.5rem)] font-medium leading-none tracking-[-0.05em] text-clay-ink tabular">
            {(above * 100).toFixed(1)}%
          </p>
        </div>
        <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper font-mono text-sm tabular">
          <div className="flex items-baseline justify-between gap-4 px-5 py-4">
            <dt className="text-xs uppercase tracking-[0.08em] text-ink-muted">z</dt>
            <dd className="text-right text-base">
              ({x} − {L.m}) / {L.s} = {z.toFixed(2).replace("-", "−")}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 px-5 py-4">
            <dt className="text-xs uppercase tracking-[0.08em] text-ink-muted">How often</dt>
            <dd className="text-right text-base">{above > 0.0005 ? `about 1 day in ${Math.max(1, Math.round(1 / above))}` : "almost never"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
