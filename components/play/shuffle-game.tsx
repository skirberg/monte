"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CalendarDays, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { burstFrom } from "@/lib/fun";
import { feelRight, feelWrong } from "@/lib/feel";
import { useMode } from "@/lib/mode";
import { SITE_URL } from "@/lib/seo";
import { topicLabel, playHref, GAMES } from "@/lib/site-data";
import { study } from "@/lib/study/routes";
import { useToday, writeStore } from "@/lib/use-today";
import { parseDaily, recordDaily, streakOn, untilMidnight, type DayStore } from "@/lib/play/daily";
import { afterThrow, liftsText, practiceRound, shareShuffle, shuffleRound, type ShuffleResult, type ShuffleRound } from "@/lib/play/shuffle";
import { ShareButton } from "@/components/landing/draw-it";
import { ShuffleWork } from "@/components/play/shuffle-work";

/**
 * The Shuffle (DESIGN.md, "The Shuffle"): three-card monte with a statistics question, one round a day, the same
 * for everyone. The answers sit on the table, one of them the grain. The cups come down and are thrown, you lift
 * one, and the reveal shows the work. Scored once; a return visit opens on the result. Saved under SHUFFLE_KEY
 * (listed in lib/progress.ts) in the daily chart's shape, so the backup code and its merge carry it.
 */

export const SHUFFLE_KEY = "monte-shuffle";
const XP = 15;
const SIDE = ["left", "middle", "right"];

type Store = DayStore<ShuffleResult>;
function readStore(): Store {
  try {
    return parseDaily<ShuffleResult>(localStorage.getItem(SHUFFLE_KEY));
  } catch {
    return parseDaily<ShuffleResult>(null);
  }
}

/** `titleAs`: the round's heading level, h3 under the home page's h2, h2 on /shuffle/ where the page title is the h1. */
export function ShuffleGame({ titleAs = "h3" }: { titleAs?: "h2" | "h3" }) {
  const today = useToday();
  const [practice, setPractice] = React.useState<number | null>(null);
  // The static page holds the table's place so nothing jumps when the day's round arrives.
  if (today === null) return <div className="min-h-[34rem] w-full" aria-hidden="true" />;
  if (practice !== null)
    return (
      <Round
        key={`p${practice}`}
        titleAs={titleAs}
        round={practiceRound(practice)}
        onDone={() => {}}
        actions={() => (
          <>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setPractice((p) => (p ?? 0) + 1 + Math.floor(Math.random() * 97))} autoFocus>
              Another round <ArrowRight className="size-4" aria-hidden />
            </button>
            <button type="button" onClick={() => setPractice(null)} aria-label="Back to today's Shuffle" title="Back to today's Shuffle" className="grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-ink">
              <CalendarDays className="size-5" aria-hidden />
            </button>
          </>
        )}
      />
    );
  return <Daily key={today} day={today} titleAs={titleAs} onMore={() => setPractice(1 + Math.floor(Math.random() * 1e6))} />;
}

function Daily({ day, titleAs, onMore }: { day: string; titleAs: "h2" | "h3"; onMore: () => void }) {
  const round = React.useMemo(() => shuffleRound(day), [day]);
  const [store, setStore] = React.useState<Store>(readStore);
  const saved = store.days[day];

  const done = (lifts: number, picks: number[]) => {
    const before = readStore();
    const next = recordDaily(before, day, { n: round.n, lifts, picks });
    if (next === before) return;
    writeStore(SHUFFLE_KEY, next);
    setStore(next);
    window.dispatchEvent(new CustomEvent("monte:xp", { detail: { xp: XP, reason: "the shuffle" } }));
    track("Shuffle finished", { n: round.n, lifts });
  };

  return (
    <Round
      titleAs={titleAs}
      round={round}
      saved={saved}
      onDone={done}
      actions={(lifts) => (
        <>
          <ShareButton event="Shuffle shared" focus={false} text={() => shareShuffle({ n: round.n, lifts, picks: [] }, streakOn(readStore(), day), `${SITE_URL}/shuffle/`)} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={onMore}>
            Another round
          </button>
        </>
      )}
      note={<NextShuffle streak={streakOn(store, day)} />}
    />
  );
}

/** "3 days in a row. Next shuffle in 5h 12m." Ticks once a minute. */
function NextShuffle({ streak }: { streak: number }) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="text-sm text-ink-muted">
      {streak > 1 && <span className="font-medium text-ink">{streak} days in a row. </span>}
      Next shuffle in <span className="tabular">{untilMidnight(now)}</span>.
    </p>
  );
}

type Phase = "deal" | "throw" | "pick" | "done";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** A swap's length: the throw speeds up, like a dealer's hands, from 0.56 s to 0.36 s. */
const swapMs = (i: number, count: number) => Math.round(560 - (200 * i) / Math.max(1, count - 1));
const EASE = [0.65, 0, 0.35, 1] as const;
const SETTLE = [0.2, 0.8, 0.2, 1] as const;

/**
 * One round on the table. `saved` opens it already played (all cups up, the work shown). `actions` are the buttons
 * after the reveal; `note` sits under them.
 */
function Round({
  round: r,
  saved,
  onDone,
  actions,
  note,
  titleAs: Title,
}: {
  round: ShuffleRound;
  saved?: ShuffleResult;
  onDone: (lifts: number, picks: number[]) => void;
  actions: (lifts: number) => React.ReactNode;
  note?: React.ReactNode;
  titleAs: "h2" | "h3";
}) {
  const reduce = useReducedMotion() ?? false;
  const fun = useMode() !== "focus";
  const total = r.swaps.length;
  const [phase, setPhase] = React.useState<Phase>(saved ? "done" : "deal");
  const [step, setStep] = React.useState(saved ? total : 0);
  const [picks, setPicks] = React.useState<number[]>(saved?.picks ?? []);
  const [all, setAll] = React.useState(!!saved);
  // The answers stay in sight until the cups have come down over them.
  const [covered, setCovered] = React.useState(!!saved);
  const alive = React.useRef(true);
  const table = React.useRef<HTMLDivElement>(null);
  const grainRef = React.useRef<HTMLSpanElement>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // The reveal takes the focus (without scrolling), so a screen reader reads the result next.
  const [played] = React.useState(!saved);
  React.useEffect(() => {
    if (all && played) resultRef.current?.focus({ preventScroll: true });
  }, [all, played]);

  const slots = React.useMemo(() => afterThrow(r.swaps.slice(0, step)), [r.swaps, step]);
  const active = phase === "throw" && step > 0 ? r.swaps[step - 1] : null;
  const grain = r.cups.findIndex((c) => c.right);
  const lifts = saved?.lifts ?? (picks.includes(grain) ? picks.indexOf(grain) + 1 : 0);
  const up = (id: number) => phase === "deal" || all || picks.includes(id);

  const go = async () => {
    setPhase("throw");
    table.current?.focus({ preventScroll: true });
    await sleep(reduce ? 0 : 300);
    setCovered(true);
    await sleep(reduce ? 400 : 320);
    for (let i = 1; i <= total; i++) {
      if (!alive.current) return;
      setStep(i);
      await sleep(reduce ? 650 : swapMs(i - 1, total) + 40);
    }
    if (!alive.current) return;
    setPhase("pick");
  };

  const lift = (id: number) => {
    if (phase !== "pick" || picks.includes(id)) return;
    const next = [...picks, id];
    setPicks(next);
    if (id === grain || next.length === 2) {
      // Found it, or two misses: the last cup must hold it, and it lifts on its own.
      const final = id === grain ? next : [...next, grain];
      const n = final.length;
      setPhase("done");
      window.setTimeout(() => {
        if (!alive.current) return;
        if (id !== grain) setPicks(final);
        setAll(true);
        onDone(n, final);
        if (n === 1 && fun) {
          feelRight();
          if (!reduce) burstFrom(grainRef.current);
        }
      }, id === grain ? (reduce ? 0 : 450) : reduce ? 300 : 900);
      if (id !== grain && fun) feelWrong();
    } else {
      if (fun) feelWrong();
      table.current?.focus({ preventScroll: true });
    }
  };

  const missed = phase === "pick" && picks.length ? r.cups[picks[picks.length - 1]] : null;
  const swapsText = r.swaps.map(([a, b]) => `${SIDE[a]} and ${SIDE[b]}`).join(", then ");
  const learn = r.game ? { href: playHref(r.game), name: GAMES.find((g) => g.slug === r.game)?.name ?? "the game" } : { href: study.topic(r.topic), name: topicLabel(r.topic) };

  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand text-ink" aria-hidden="true">
            <CupsGlyph className="h-4 w-auto" />
          </span>
          <Title className="flex-1 font-display text-xl font-semibold leading-tight sm:text-2xl">The Shuffle</Title>
          <span className="text-sm text-ink-muted tabular">{r.day ? `No. ${r.n}` : "Practice"}</span>
        </div>
        <p className="text-lg text-ink">{r.setup}</p>
        <p className="mt-4 font-display text-heading font-semibold" style={{ fontVariationSettings: "'wdth' 88" }}>
          {r.q}
        </p>
      </div>

      <div className="lg:col-span-7">
        {/* The table: three cups on the court line, an answer under each. */}
        <div className="rounded-stage bg-sand px-2 pb-2 pt-3 sm:px-6 sm:pt-5">
          <div ref={table} tabIndex={-1} role="group" aria-label="Three cups" className="relative mx-auto grid max-w-[30rem] grid-cols-3 outline-none">
            {/* The court line the cups stand on: the table's, so it stays put while the cups move. */}
            <svg viewBox="0 -12 360 176" className="pointer-events-none absolute inset-x-0 top-0 w-full overflow-visible" aria-hidden="true">
              <line x1="-6" x2="366" y1="152" y2="152" stroke="var(--line-strong)" strokeWidth="1.5" />
            </svg>
            {r.cups.map((c, id) => {
              const slot = slots[id];
              const moving = !!active && (slot === active[0] || slot === active[1]);
              // One cup of the pair passes in front (lower, larger), the other behind: you can follow which went where.
              const front = moving && (step + id) % 2 === 0;
              const dur = active ? swapMs(step - 1, total) / 1000 : 0;
              const lifted = up(id);
              const show = phase === "deal" || (phase === "throw" && !covered) || lifted;
              const where = SIDE[slot];
              return (
                <motion.div
                  key={id}
                  className="col-start-1 row-start-1 w-full"
                  style={{ zIndex: moving ? (front ? 3 : 1) : 2 }}
                  initial={false}
                  animate={{
                    x: `${slot * 100}%`,
                    y: moving && !reduce ? ["0%", front ? "7%" : "-7%", "0%"] : "0%",
                    scale: moving && !reduce ? [1, front ? 1.06 : 0.94, 1] : 1,
                  }}
                  transition={reduce || !active ? { duration: 0 } : { duration: dur, ease: EASE, times: [0, 0.5, 1] }}
                >
                  <button
                    type="button"
                    disabled={phase !== "pick" || picks.includes(id)}
                    onClick={() => lift(id)}
                    aria-label={
                      show ? `${where} cup: ${c.label}${phase === "done" && c.right ? ", the grain" : ""}` : phase === "pick" ? `Lift the ${where} cup` : `The ${where} cup`
                    }
                    className={cn(
                      "group relative block w-full rounded-inner outline-offset-2 disabled:cursor-default",
                      phase === "pick" && !picks.includes(id) && "cursor-pointer",
                      reduce && moving && "ring-2 ring-ink",
                    )}
                  >
                    <Cup label={c} lifted={lifted} tilt={lifted && phase !== "deal"} show={show} dealt={phase === "deal"} reduce={reduce} grain={c.right && (all || picks.includes(id)) && phase !== "deal"} grainRef={c.right ? grainRef : undefined} pickable={phase === "pick" && !picks.includes(id)} />
                  </button>
                  <p className={cn("h-5 text-center text-xs leading-5", c.right ? "font-medium text-clay-ink" : "text-ink-muted")} aria-hidden="true">
                    {phase === "done" && all ? c.tag : ""}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          {phase === "deal" && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button type="button" className="btn btn-primary" onClick={go}>
                Shuffle
              </button>
              <p className="text-ink-muted">One answer is the grain. Follow its cup.</p>
            </div>
          )}
          <p className="sr-only" aria-live="polite">
            {phase === "throw" && step === 0 ? "The cups come down." : ""}
            {phase === "pick" && !picks.length ? `The cups swapped ${swapsText}. Lift a cup.` : ""}
          </p>
          {phase === "throw" && <p className="min-h-12 text-ink-muted" aria-hidden="true">Follow the cup.</p>}
          {phase === "pick" && (
            <div className="min-h-12" aria-live="polite">
              {missed ? (
                <p>
                  <span className="font-semibold">Not quite.</span> {missed.note} <span className="font-medium">Lift another.</span>
                </p>
              ) : (
                <p className="font-medium">Lift a cup.</p>
              )}
            </div>
          )}
          {phase === "done" && all && (
            <div ref={resultRef} tabIndex={-1} className="outline-none" aria-live="polite">
              {/* The coach's line, and the lifts as the share row draws them: a ring per miss, the grain in clay. */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className={cn("font-display text-2xl font-semibold", lifts === 1 && "text-clay-ink")}>
                  {lifts === 1 ? "Found the grain, first lift." : "Not quite. Here is the work."}
                </p>
                <Lifts lifts={lifts} />
              </div>
              {/* The work, drawn: the picture first, the idea in a line, the steps a tap away. */}
              <figure className="mt-5 max-w-[30rem]">
                <ShuffleWork fig={r.fig} answer={r.cups[grain].label} />
                <figcaption className="mt-4 max-w-measure-short font-medium">{r.grain}</figcaption>
              </figure>
              <details className="group mt-2 max-w-measure-short">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-medium text-ink-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
                  Every step <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden />
                </summary>
                <ol className="mt-1 space-y-1.5 border-l-2 border-line pl-4">
                  {r.work.map((w, i) => (
                    <li key={i} className={cn(i === r.work.length - 1 && "font-medium text-clay-ink")}>
                      {w}
                    </li>
                  ))}
                </ol>
                <ul className="mt-4 space-y-1 text-sm text-ink-muted">
                  {r.cups.filter((c) => !c.right).map((c) => (
                    <li key={c.label}>
                      <span className="font-mono tracking-tight text-ink tabular">{c.label}</span> {c.note}
                    </li>
                  ))}
                </ul>
              </details>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {actions(lifts)}
                <a href={learn.href} className="inline-flex min-h-11 items-center gap-1.5 px-2 font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {r.game ? `Play it: ${learn.name}` : `Learn it: ${learn.name}`}
                </a>
              </div>
              {note && <div className="mt-3">{note}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** One cup and what is under it, drawn in one SVG so the cup always covers its answer exactly. */
function Cup({
  label: c,
  lifted,
  tilt,
  show,
  dealt,
  reduce,
  grain,
  grainRef,
  pickable,
}: {
  label: ShuffleRound["cups"][number];
  lifted: boolean;
  /** A hand lifts a cup with a little tilt; the dealer shows them straight. */
  tilt: boolean;
  show: boolean;
  dealt: boolean;
  reduce: boolean;
  grain: boolean;
  grainRef?: React.Ref<HTMLSpanElement>;
  pickable: boolean;
}) {
  const clay = grain;
  const words = !c.lines && !/[\d$]/.test(c.label);
  return (
    <span className="relative block">
      <svg viewBox="0 -12 120 176" className={cn("block w-full overflow-visible", pickable && "transition-[translate] duration-150 group-hover:-translate-y-1 group-active:translate-y-0.5")} aria-hidden="true">
        {/* The cup's shadow on the table: smaller and lighter as the cup lifts. */}
        <motion.ellipse cx="60" cy="152" fill="var(--ink)" initial={false} animate={{ rx: lifted ? 24 : 36, ry: lifted ? 3 : 4.5, opacity: lifted ? 0.07 : 0.14 }} transition={{ duration: reduce ? 0 : 0.3 }} />

        {/* What is under it: only drawn while it can be seen, so nothing peeks out mid-throw. */}
        {show && (
          <g>
            {grain && (
              <motion.circle cx="60" cy="106" r="7" fill="var(--clay)" initial={reduce ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 420, damping: 18, delay: reduce ? 0 : 0.15 }} style={{ transformOrigin: "60px 106px" }} />
            )}
            {c.lines ? (
              <text x="60" y="128" textAnchor="middle" className={cn("font-mono", clay ? "fill-clay-ink" : "fill-ink")} fontSize="14.5" letterSpacing="-0.04em">
                <tspan x="60" dy="0">{c.lines[0]}</tspan>
                <tspan x="60" dy="16">to {c.lines[1]}</tspan>
              </text>
            ) : (
              <text x="60" y="142" textAnchor="middle" className={cn(words ? "font-sans font-medium" : "font-mono", clay ? "fill-clay-ink" : "fill-ink")} fontSize={words ? 15 : c.label.length > 6 ? 17 : 20} fontWeight={clay ? 600 : 500} letterSpacing={words ? undefined : "-0.05em"}>
                {c.label}
              </text>
            )}
          </g>
        )}

        {/* The cup, upside down: lifts on a spring and tilts a little, like a hand took it. */}
        <motion.g
          initial={dealt && !reduce ? { y: 0, rotate: 0 } : false}
          animate={{ y: lifted ? -70 : 0, rotate: tilt ? -6 : 0 }}
          transition={reduce ? { duration: 0 } : lifted ? { type: "spring", stiffness: 240, damping: 19, delay: dealt ? 0.15 : 0 } : { duration: 0.28, ease: SETTLE }}
          style={{ transformOrigin: "60px 152px" }}
        >
          <rect x="35" y="60" width="50" height="12" rx="4" fill="var(--ink)" />
          <path d="M39 70 L81 70 L93 146 L27 146 Z" fill="var(--ink)" />
          <rect x="21" y="140" width="78" height="12" rx="5" fill="var(--ink)" />
          <path d="M38 84 L82 84" stroke="var(--paper)" strokeOpacity="0.2" strokeWidth="2.5" />
          <path d="M33 126 L87 126" stroke="var(--paper)" strokeOpacity="0.2" strokeWidth="2.5" />
          <path d="M45 92 L41 120" stroke="var(--paper)" strokeOpacity="0.14" strokeWidth="5" strokeLinecap="round" />
        </motion.g>
      </svg>
      {grainRef && <span ref={grainRef} className="pointer-events-none absolute left-1/2 top-[62%] size-0" aria-hidden="true" />}
    </span>
  );
}

/** How the lifts went, as Share draws them: a ring for each miss, then the grain. A screen reader hears the sentence. */
function Lifts({ lifts }: { lifts: number }) {
  return (
    <p className="flex items-center gap-1.5">
      {Array.from({ length: lifts }, (_, i) =>
        i < lifts - 1 ? <span key={i} aria-hidden className="size-3.5 rounded-full border-2 border-line-strong" /> : <span key={i} aria-hidden className="size-3.5 rounded-full bg-clay" />,
      )}
      <span className="sr-only">{liftsText(lifts)}.</span>
    </p>
  );
}

/** Three small cups, the middle one lifted off a clay grain: the Shuffle's glyph. */
export function CupsGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden="true">
      <path d="M4 10 L10 10 L13 23 L1 23 Z" fill="currentColor" />
      <path d="M17 1 L23 1 L26 14 L14 14 Z" fill="currentColor" />
      <circle cx="20" cy="20.5" r="2.8" fill="var(--clay)" />
      <path d="M30 10 L36 10 L39 23 L27 23 Z" fill="currentColor" />
    </svg>
  );
}
