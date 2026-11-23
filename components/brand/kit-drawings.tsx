import { LOCKUP, LOCKUP_CURVE, LOCKUP_WORD } from "./logo-art";
import { Wordmark } from "./logo";

/*
  The rules for the logo, drawn rather than described (the /brand/ page): clear space, the smallest size, and the
  ways not to use it. Every drawing is the real lockup from logo-art.ts, so a change to the mark shows up here too.
*/

const W = LOCKUP.width, H = LOCKUP.height;
// The x-height of the word, measured on the m: its top (120) to the baseline the curve and letters stand on (662).
const X = 542;

/** Clear space: one x-height of the word on every side, shown as the measured x and a dashed boundary. */
export function ClearSpace() {
  const pad = X, vw = W + 2 * pad, vh = H + 2 * pad;
  const tick = (x1: number, y1: number, x2: number, y2: number, lx: number, ly: number) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--clay)" strokeWidth={14} />
      <text x={lx} y={ly} fill="var(--clay-ink)" fontSize={170} fontFamily="var(--font-num), ui-monospace, monospace" textAnchor="middle" dominantBaseline="central">
        x
      </text>
    </g>
  );
  return (
    <svg viewBox={`${-pad} ${-pad} ${vw} ${vh}`} className="w-full" role="img" aria-label="Clear space: one x-height of the word on every side of the logo.">
      <rect x={-pad + 7} y={-pad + 7} width={vw - 14} height={vh - 14} fill="none" stroke="var(--line-strong)" strokeWidth={10} strokeDasharray="40 36" />
      <path d={LOCKUP_CURVE} fill="var(--clay)" />
      <path d={LOCKUP_WORD} fill="var(--ink)" />
      {tick(-pad, H / 2, 0, H / 2, -pad / 2, H / 2 - 150)}
      {tick(W, H / 2, W + pad, H / 2, W + pad / 2, H / 2 - 150)}
      {tick(W / 2, -pad, W / 2, 0, W / 2 + 140, -pad / 2)}
      {tick(W / 2, H, W / 2, H + pad, W / 2 + 140, H + pad / 2)}
    </svg>
  );
}

/** The smallest sizes, at their real size on screen. */
export function MinSize({ lockupPx, markPx }: { lockupPx: number; markPx: number }) {
  return (
    <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
      <figure className="grid gap-3">
        <Wordmark className="h-4.5" />
        <figcaption className="font-mono text-sm tabular-nums text-ink-muted">{lockupPx} px</figcaption>
      </figure>
      <figure className="grid gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/app/favicon.svg" alt="The app icon at 16 pixels" width={markPx} height={markPx} />
        <figcaption className="font-mono text-sm tabular-nums text-ink-muted">{markPx} px</figcaption>
      </figure>
    </div>
  );
}

/** A few seeded grains in every colour, the busy ground the logo should never sit on. */
function busy() {
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const hues = ["#2f9e44", "#1c7ed6", "#e64980", "#fab005", "#7048e8", "#12b886"];
  return Array.from({ length: 260 }, (_, i) => (
    <circle key={i} cx={Math.round(r() * 4400 - 100)} cy={Math.round(r() * 1400 - 100)} r={Math.round(40 + r() * 90)} fill={hues[i % hues.length]} opacity={0.8} />
  ));
}

const MISUSE: { name: string; art: React.ReactNode }[] = [
  {
    name: "Stretched",
    art: (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-4 w-full sm:h-5" aria-hidden>
        <path d={LOCKUP_CURVE} fill="var(--clay)" />
        <path d={LOCKUP_WORD} fill="var(--ink)" />
      </svg>
    ),
  },
  {
    name: "Recoloured",
    art: (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-5 w-auto sm:h-6 lg:h-7" aria-hidden>
        <path d={LOCKUP_CURVE} fill="#2f9e44" />
        <path d={LOCKUP_WORD} fill="#1c7ed6" />
      </svg>
    ),
  },
  {
    name: "On a busy ground",
    art: (
      <>
        <svg viewBox="0 0 4200 1200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
          {busy()}
        </svg>
        <svg viewBox={`0 0 ${W} ${H}`} className="relative h-5 w-auto sm:h-6 lg:h-7" aria-hidden>
          <path d={LOCKUP_CURVE} fill="var(--clay)" />
          <path d={LOCKUP_WORD} fill="var(--ink)" />
        </svg>
      </>
    ),
  },
  {
    name: "Outlined",
    art: (
      <svg viewBox={`-20 -20 ${W + 40} ${H + 40}`} className="h-5 w-auto sm:h-6 lg:h-7" aria-hidden>
        <path d={LOCKUP_CURVE} fill="none" stroke="var(--clay)" strokeWidth={22} />
        <path d={LOCKUP_WORD} fill="none" stroke="var(--ink)" strokeWidth={22} />
      </svg>
    ),
  },
  {
    name: "In another face",
    art: (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-5 w-auto sm:h-6 lg:h-7" aria-hidden>
        <path d={LOCKUP_CURVE} fill="var(--clay)" />
        <text x={1411} y={662} fontFamily="Georgia, 'Times New Roman', serif" fontSize={760} fontStyle="italic" fill="var(--ink)">
          Monte
        </text>
      </svg>
    ),
  },
];

/** The ways not to use it, each drawn with the real lockup. */
export function Misuse() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {MISUSE.map((m) => (
        <li key={m.name} className="grid gap-3">
          <div className="relative grid aspect-[5/3] place-items-center overflow-hidden rounded-inner bg-sand p-4">
            {m.art}
            <svg viewBox="0 0 24 24" className="absolute right-3 top-3 size-5 text-danger" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium">{m.name}</p>
        </li>
      ))}
    </ul>
  );
}
