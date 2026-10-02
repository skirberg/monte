"use client";

import * as React from "react";
import { cn } from "cn";
import { burstFrom } from "@/lib/fun";

type Phase = "pick" | "decide" | "reveal";
type Tally = { plays: number; wins: number };

const rand3 = () => Math.floor(Math.random() * 3);

/** One honest game: the host knows where the car is and always opens a goat door you did not pick. */
function hostOpens(pick: number, car: number) {
  const options = [0, 1, 2].filter((d) => d !== pick && d !== car);
  return options[Math.floor(Math.random() * options.length)];
}

function simulate(games: number) {
  const out = { stay: { plays: 0, wins: 0 }, swap: { plays: 0, wins: 0 } };
  for (let i = 0; i < games; i++) {
    for (const strategy of ["stay", "swap"] as const) {
      const car = rand3();
      const pick = rand3();
      const opened = hostOpens(pick, car);
      const final = strategy === "stay" ? pick : [0, 1, 2].find((d) => d !== pick && d !== opened)!;
      out[strategy].plays++;
      if (final === car) out[strategy].wins++;
    }
  }
  return out;
}

const pct = (t: Tally) => (t.plays ? `${((t.wins / t.plays) * 100).toFixed(1)}%` : "–");

function Bar({ label, t }: { label: string; t: Tally }) {
  const w = t.plays ? (t.wins / t.plays) * 100 : 0;
  return (
    <div className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-3 font-mono text-sm tabular">
      <span className="text-ink-muted">{label}</span>
      <span className="relative h-4 overflow-hidden rounded-full bg-sand-2">
        <span className="absolute inset-y-0 left-0 rounded-full bg-clay transition-[width] duration-500" style={{ width: `${w}%` }} />
      </span>
      <span className="text-right">{pct(t)}</span>
    </div>
  );
}

export function MontyHall() {
  const [car, setCar] = React.useState(() => rand3());
  const [pick, setPick] = React.useState<number | null>(null);
  const [opened, setOpened] = React.useState<number | null>(null);
  const [final, setFinal] = React.useState<number | null>(null);
  const [phase, setPhase] = React.useState<Phase>("pick");
  const [mine, setMine] = React.useState({ stay: { plays: 0, wins: 0 }, swap: { plays: 0, wins: 0 } });
  const [sim, setSim] = React.useState({ stay: { plays: 0, wins: 0 }, swap: { plays: 0, wins: 0 } });
  const doorRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (d: number) => {
    if (phase === "pick") {
      setPick(d);
      setOpened(hostOpens(d, car));
      setPhase("decide");
    }
  };

  const decide = (swap: boolean) => {
    if (pick === null || opened === null) return;
    const f = swap ? [0, 1, 2].find((d) => d !== pick && d !== opened)! : pick;
    setFinal(f);
    setPhase("reveal");
    const key = swap ? "swap" : "stay";
    const won = f === car;
    setMine((m) => ({ ...m, [key]: { plays: m[key].plays + 1, wins: m[key].wins + (won ? 1 : 0) } }));
    if (won) requestAnimationFrame(() => burstFrom(doorRefs.current[f]));
  };

  const again = () => {
    setCar(rand3());
    setPick(null);
    setOpened(null);
    setFinal(null);
    setPhase("pick");
  };

  const runSim = () => {
    const r = simulate(1000);
    setSim((s) => ({
      stay: { plays: s.stay.plays + r.stay.plays, wins: s.stay.wins + r.stay.wins },
      swap: { plays: s.swap.plays + r.swap.plays, wins: s.swap.wins + r.swap.wins },
    }));
  };

  const prompt =
    phase === "pick"
      ? "Pick a door. One hides a car, two hide goats."
      : phase === "decide"
        ? `The host, who knows where the car is, opens door ${opened! + 1}: a goat. Stay with door ${pick! + 1}, or switch?`
        : final === car
          ? `Door ${final! + 1}: the car. ${final === pick ? "Staying" : "Switching"} won this one.`
          : `Door ${final! + 1}: a goat. The car was behind door ${car + 1}.`;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-6 lg:col-span-7">
        <p className="min-h-14 text-lg" aria-live="polite">
          {prompt}
        </p>
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {[0, 1, 2].map((d) => {
            const isOpen = d === opened || phase === "reveal";
            const hasCar = d === car;
            const chosen = d === (final ?? pick);
            return (
              <button
                key={d}
                ref={(el) => {
                  doorRefs.current[d] = el;
                }}
                type="button"
                disabled={phase !== "pick"}
                onClick={() => choose(d)}
                aria-label={`Door ${d + 1}${isOpen ? (hasCar ? ", car" : ", goat") : ""}${chosen ? ", your door" : ""}`}
                className={cn(
                  "group relative flex aspect-[3/4] flex-col items-center justify-between rounded-[22px] border-2 p-3 transition-all duration-200 sm:p-5",
                  isOpen ? "border-line bg-sand" : "border-ink bg-paper enabled:hover:-translate-y-1 enabled:hover:bg-sand",
                  chosen && "ring-4 ring-clay/40",
                )}
              >
                <span className="self-start font-mono text-sm text-ink-muted tabular">0{d + 1}</span>
                <span
                  className={cn(
                    "font-display text-2xl font-[680] tracking-[-0.03em] sm:text-4xl",
                    isOpen ? (hasCar ? "text-clay-ink" : "text-ink-muted") : "",
                  )}
                  style={{ fontVariationSettings: "'wdth' 82" }}
                >
                  {isOpen ? (hasCar ? "CAR" : "goat") : null}
                </span>
                <span className={cn("h-1.5 w-1/3 rounded-full", isOpen ? "bg-line" : "bg-ink")} aria-hidden />
                {chosen && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-paper">
                    Yours
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          {phase === "decide" && (
            <>
              <button type="button" onClick={() => decide(false)} className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium hover:border-ink hover:bg-sand">
                Stay with door {pick! + 1}
              </button>
              {/* Same weight as Stay, so the page does not hint at the answer. */}
              <button type="button" onClick={() => decide(true)} className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium hover:border-ink hover:bg-sand">
                Switch to door {[0, 1, 2].find((d) => d !== pick && d !== opened)! + 1}
              </button>
            </>
          )}
          {phase === "reveal" && (
            <button type="button" onClick={again} autoFocus className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85">
              Play again
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8 lg:col-span-5">
        <section aria-labelledby="mine-t" className="space-y-4 rounded-2xl border border-line p-5">
          <h2 id="mine-t" className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
            Your games ({mine.stay.plays + mine.swap.plays})
          </h2>
          <Bar label="Stayed" t={mine.stay} />
          <Bar label="Switched" t={mine.swap} />
          <p className="text-sm text-ink-muted">A handful of games proves nothing. That is what the button below is for.</p>
        </section>
        <section aria-labelledby="sim-t" className="space-y-4 rounded-2xl bg-sand p-5">
          <h2 id="sim-t" className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
            Simulated games ({sim.stay.plays.toLocaleString()} each way)
          </h2>
          <Bar label="Stay" t={sim.stay} />
          <Bar label="Switch" t={sim.swap} />
          <button type="button" onClick={runSim} className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper hover:bg-ink/85">
            Run 1,000 more each way
          </button>
        </section>
      </div>
    </div>
  );
}
