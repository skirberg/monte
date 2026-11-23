import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { NAME } from "@/lib/brand";
import { ICON_CURVE } from "./logo-art";

/**
 * Where the name comes from, drawn (DESIGN.md, "Name"; the design pass of Nov 20 2026): four small pictures in the
 * brand's devices, each with its name and one short line, on /about/ and /brand/. They used to be four boxes of
 * sentences. Each drawing moves once when it appears and again on hover or tap; reduced motion holds it still.
 */

const at = (i: number) => ({ "--i": i }) as CSSProperties;
const PILE = [1, 2, 4, 6, 4, 2, 1];

function Drawing({ k }: { k: number }) {
  const box = (children: React.ReactNode) => (
    <svg viewBox="0 0 100 64" className="ga ga-play h-16 w-auto overflow-visible" aria-hidden>
      {children}
      <line x1="2" x2="98" y1="60.5" y2="60.5" stroke="var(--line-strong)" strokeWidth="1.4" />
    </svg>
  );
  if (k === 0)
    // Monte Carlo: run it thousands of times, and the grains settle into the answer
    return box(
      <>
        {PILE.flatMap((h, c) =>
          Array.from({ length: h }, (_, j) => <circle key={`${c}-${j}`} className="ga-pop" style={at(c * 0.8 + j * 0.5)} cx={26 + c * 8} cy={56 - j * 7.6} r={3.4} fill="var(--clay)" />),
        )}
        {[[40, 6], [58, 14], [50, 2]].map(([x, y], i) => (
          <circle key={i} className="ga-pop" style={at(i)} cx={x} cy={y} r={2.6} fill="var(--ink-muted)" />
        ))}
      </>,
    );
  if (k === 1)
    // Monty Hall: three doors, the host swings one open, the car hops behind another
    return box(
      <>
        {[0, 1, 2].map((d) => (
          <rect key={d} className={d === 1 ? "ga-swing" : undefined} x={14 + d * 26} y={14} width={20} height={46} rx={3} fill={d === 1 ? "var(--sand)" : "var(--ink)"} stroke="var(--ink)" strokeWidth={1.6} />
        ))}
        <circle className="ga-hop" style={at(3)} cx={76} cy={8} r={4} fill="var(--clay)" />
      </>,
    );
  if (k === 2)
    // Three-card monte: three cups, the middle one lifted off the grain
    return box(
      <>
        {[0, 1, 2].map((c) => (
          <path key={c} className={c === 1 ? "ga-hop" : undefined} d={c === 1 ? "M42 10 L58 10 L64 40 L36 40 Z" : `M${16 + c * 30} 30 L${32 + c * 30} 30 L${38 + c * 30} 60 L${10 + c * 30} 60 Z`} fill="var(--ink)" />
        ))}
        <circle className="ga-pop" style={at(4)} cx={50} cy={54} r={5} fill="var(--clay)" />
      </>,
    );
  // Monte, mountain: the mark itself, the bell every pile settles into
  return box(
    <g transform="translate(10.3 1.3) scale(0.155)">
      <path className="ga-rise" d={ICON_CURVE} fill="var(--clay)" />
    </g>,
  );
}

export function NameRow({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-gutter gap-y-6 lg:grid-cols-4", className)}>
      {NAME.map((n, k) => (
        <li key={n.k} className="group grid content-start gap-2">
          <Drawing k={k} />
          <p className="font-semibold leading-snug">{n.k}</p>
          <p className="text-sm text-ink-muted">{n.v}</p>
        </li>
      ))}
    </ul>
  );
}
