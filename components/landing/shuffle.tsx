"use client";

import { useMemo, useState } from "react";
import { useHydrated } from "@/lib/hooks";
import { ArrowRight, RotateCcw } from "lucide-react";
import { KINDS, makeCases, pickNote, type Case, type Kind } from "@/lib/study/start";
import { study } from "@/lib/study/routes";

/**
 * Find the grain: the home page's front door. Three-card monte with a statistics problem.
 * The mark follows the problem's story; Monte asks which idea is underneath. One problem a day
 * (seeded by the local date), three cups, one hides the grain. See brand/monte-story-2026-10-29.md.
 */

const LABEL: Record<Kind, string> = Object.fromEntries(KINDS.map((k) => [k.id, k.label])) as Record<Kind, string>;
/** Where each idea is taught. "Not enough information" goes to the module that drills the decision itself. */
const LEARN: Record<Kind, { href: string; name: string }> = {
  one: { href: "/learn/normal/", name: "The normal curve" },
  mean: { href: "/learn/clt/", name: "Sampling and the CLT" },
  ci: { href: "/learn/ci/", name: "Confidence intervals" },
  none: { href: "/learn/start/", name: "Same number, three questions" },
};

function dayNumber(d = new Date()) {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** The right idea plus two others, in a seeded order. "Not enough information" only appears when it's the answer or the seed asks for it. */
function cupsFor(c: Case, seed: number): Kind[] {
  const others = (["one", "mean", "ci", "none"] as Kind[]).filter((k) => k !== c.kind);
  const pool = c.kind === "none" ? others : seed % 3 === 0 ? others : others.filter((k) => k !== "none");
  const two = [pool[seed % pool.length], pool[(seed + 1) % pool.length]];
  const three = [c.kind, ...two];
  const at = seed % 3;
  [three[0], three[at]] = [three[at], three[0]];
  return three;
}

export function Shuffle() {
  // The build renders a fixed problem; the visitor's own day takes over once the page is live.
  const day = useHydrated() ? dayNumber() : null;
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const seed = (day ?? 1) + round * 7;
  const { c, cups } = useMemo(() => {
    const all = makeCases(day === null ? 1 : seed);
    const c = all[(day === null ? 0 : seed) % all.length];
    return { c, cups: cupsFor(c, seed) };
  }, [day, seed]);

  const done = picked !== null;
  const right = done && cups[picked] === c.kind;
  const learn = LEARN[c.kind];

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <p className="text-lead text-ink">{c.setup}</p>
        <p className="mt-4 text-lead font-semibold text-ink">{c.q}</p>
        <p className="mt-6 text-base text-ink-muted">Before any formula: which idea is this, really? Lift the cup with the grain.</p>
      </div>

      <div className="lg:col-span-7">
        <div className="grid grid-cols-3 gap-3 sm:gap-6" role="group" aria-label="Three cups">
          {cups.map((k, i) => {
            const hasGrain = k === c.kind;
            const lifted = done && (i === picked || hasGrain);
            return (
              <button
                key={`${seed}-${i}`}
                type="button"
                disabled={done}
                onClick={() => setPicked(i)}
                aria-label={`Cup ${i + 1}: ${LABEL[k]}`}
                className="group flex flex-col items-center gap-3 rounded-3xl p-2 text-center outline-offset-4 disabled:cursor-default"
              >
                <span className="relative block aspect-square w-full max-w-[150px]">
                  {/* the grain, under the cup */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
                    <ellipse cx="50" cy="86" rx="34" ry="6" fill="var(--sand-2)" />
                    {hasGrain && <circle cx="50" cy="78" r="9" fill="var(--clay)" />}
                  </svg>
                  {/* the cup, lifted on reveal */}
                  <svg
                    viewBox="0 0 100 100"
                    className={`absolute inset-0 size-full transition-transform duration-300 ease-out ${
                      lifted ? "-translate-y-[62%]" : done ? "" : "group-hover:-translate-y-[4%] group-active:translate-y-[2%]"
                    }`}
                    aria-hidden
                  >
                    <path d="M22 86 L32 22 Q50 12 68 22 L78 86 Z" fill="var(--ink)" />
                    <ellipse cx="50" cy="86" rx="28" ry="6" fill="var(--ink)" />
                    <path d="M33 30 Q50 22 67 30" stroke="var(--paper)" strokeOpacity="0.25" strokeWidth="3" fill="none" />
                  </svg>
                </span>
                <span className={`text-sm font-medium leading-snug sm:text-base ${done && !hasGrain && i !== picked ? "text-ink-muted" : "text-ink"}`}>
                  {LABEL[k]}
                </span>
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="mt-8">
          {done && (
            <div>
              <p className="text-lead font-semibold text-ink">
                {right ? `Found it: ${LABEL[c.kind].toLowerCase()}.` : `Not that cup. The grain was under ${LABEL[c.kind].toLowerCase()}.`}
              </p>
              <p className="mt-2 max-w-[60ch] text-base text-ink">{pickNote(c, cups[picked])}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <a
                  href={learn.href}
                  className="btn btn-primary"
                >
                  Learn it: {learn.name} <ArrowRight className="size-4" aria-hidden />
                </a>
                <a href={study.start} className="inline-flex min-h-11 items-center font-medium text-clay-ink underline-offset-4 hover:underline">
                  Work the numbers
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setPicked(null);
                    setRound((r) => r + 1);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  <RotateCcw className="size-4" aria-hidden /> Shuffle again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
