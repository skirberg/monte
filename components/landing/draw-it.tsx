"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import { animate, motion, useReducedMotion } from "motion/react";
import { ArrowRight, CalendarDays, Check, Leaf, PartyPopper, RotateCcw, Share2, Snowflake, TrafficCone, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { burstFrom } from "@/lib/fun";
import { feelRight } from "@/lib/feel";
import { localDay } from "@/lib/progress";
import { useToday, writeStore } from "@/lib/use-today";
import { SITE_URL } from "@/lib/seo";
import { ROUNDS, anchorFor, buildRound, drawTo, periodText, ruleForecast, score, verdict, type Round } from "@/lib/play/drawit";
import { dailyRound, dayBefore, parseDaily, recordDaily, shareText, sparks, streakOn, untilMidnight, type DailyResult, type DailyStore } from "@/lib/play/daily";
import { TickerzMark } from "@/components/brand/tickerz-mark";

/**
 * "What happens next?" A real series with its last stretch hidden: draw the rest, see the real line and how
 * a plain rule did. It opens on the daily chart (lib/play/daily.ts): one chart a day, the same for everyone,
 * scored once, shareable, with its own run of days. "More charts" plays the four newest stretches as practice,
 * XP once per chart per day. Saved under DAILY_KEY and KEY (both listed in lib/progress.ts).
 */

const KEY = "monte-drawit";
const DAILY_KEY = "monte-daily";
const XP = 10;
const DAILY_XP = 15;
const ICONS: Record<string, LucideIcon> = { fireworks: PartyPopper, co2: Leaf, seaice: Snowflake, potholes: TrafficCone };

type Day = { day: string; done: string[]; won: string[] };

function readDay(): Day {
  const day = localDay();
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (s?.day === day && Array.isArray(s.done)) return { day, done: s.done, won: Array.isArray(s.won) ? s.won : [] };
  } catch {}
  return { day, done: [], won: [] };
}

function readDaily(): DailyStore {
  try {
    return parseDaily(localStorage.getItem(DAILY_KEY));
  } catch {
    return parseDaily(null);
  }
}

/** `titleAs`: the chart's heading level, h3 under the home page's h2, h2 on /daily/ where the page title is the h1. */
export function DrawIt({ titleAs = "h3" }: { titleAs?: "h2" | "h3" }) {
  const today = useToday();
  const [practice, setPractice] = React.useState(false);
  if (today === null) return <div className="aspect-[5/3] max-h-[420px] w-full rounded-stage bg-paper" aria-hidden="true" />;
  return practice ? <Practice titleAs={titleAs} onDaily={() => setPractice(false)} /> : <DailyChart key={today} titleAs={titleAs} day={today} onMore={() => setPractice(true)} />;
}

function DailyChart({ day, onMore, titleAs }: { day: string; onMore: () => void; titleAs: "h2" | "h3" }) {
  const r = React.useMemo(() => dailyRound(day), [day]);
  const y = React.useMemo(() => (r.n > 1 ? dailyRound(dayBefore(day)) : null), [day, r.n]);
  const [store, setStore] = React.useState<DailyStore>(readDaily);
  const saved = store.days[day];
  const streak = streakOn(store, day);
  // Played earlier today: open on the result without pulling focus down the page.
  const [revisit] = React.useState(() => !!saved);

  const done = (res: DailyResult) => {
    const before = readDaily();
    const next = recordDaily(before, day, res);
    if (next === before) return;
    writeStore(DAILY_KEY, next);
    setStore(next);
    window.dispatchEvent(new CustomEvent("monte:xp", { detail: { xp: DAILY_XP, reason: "daily chart" } }));
    track("Daily chart finished", { n: r.n, result: res.you > res.rule ? "beat" : "lost" });
  };

  return (
    <div className="grid gap-6">
      <Play
        titleAs={titleAs}
        key={day}
        round={r}
        aside={<span className="ml-auto text-sm text-ink-muted tabular">No. {r.n}</span>}
        saved={saved?.guess}
        onResult={(res) => done({ n: r.n, ...res })}
        actions={(res) => (
          <>
            <ShareButton focus={!revisit} text={() => shareText(r, { n: r.n, ...res }, streakOn(readDaily(), day), `${SITE_URL}/daily/`)} />
            <button type="button" className="btn btn-secondary btn-sm" onClick={onMore}>
              More charts
            </button>
          </>
        )}
        note={<NextChart streak={streak} />}
      />
      {y && <Yesterday r={y} res={store.days[y.day]} />}
    </div>
  );
}

/** "3 days in a row. Next chart in 5h 12m." Ticks once a minute. */
function NextChart({ streak }: { streak: number }) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="text-sm text-ink-muted">
      {streak > 1 && <span className="font-medium text-ink">{streak} days in a row. </span>}
      Next chart in <span className="tabular">{untilMidnight(now)}</span>.
    </p>
  );
}

/** Share on a phone, copy anywhere else. The Shuffle uses it too, with its own event name. */
export function ShareButton({ text, focus, event = "Daily chart shared" }: { text: () => string; focus: boolean; event?: "Daily chart shared" | "Shuffle shared" }) {
  const [copied, setCopied] = React.useState(false);
  const share = async () => {
    const t = text();
    track(event);
    if (navigator.share && matchMedia("(pointer: coarse)").matches) return navigator.share({ text: t }).catch(() => {});
    try {
      await navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <button type="button" className="btn btn-primary btn-sm" onClick={share} autoFocus={focus}>
      {copied ? <Check className="size-4" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : "Share"}</span>
    </button>
  );
}

/** Yesterday's chart, answer shown: its hidden stretch as the real line and yours, the way a daily word game shows yesterday's word. */
function Yesterday({ r, res }: { r: Round & { n: number }; res?: DailyResult }) {
  const Icon = ICONS[r.id];
  const W = 120, H = 36;
  const all = [...r.actual, ...(res?.guess ?? [])];
  const lo = Math.min(...all), hi = Math.max(...all);
  const pts = (xs: number[]) => xs.map((v, i) => `${i ? "L" : "M"}${((i / (xs.length - 1)) * W).toFixed(1)} ${(H - 2 - ((v - lo) / (hi - lo || 1)) * (H - 4)).toFixed(1)}`).join(" ");
  const [real, mine] = sparks(r.actual, res?.guess ?? r.actual);
  return (
    <div className="flex items-center gap-3 rounded-card border border-line bg-paper/60 p-4 sm:gap-4 md:max-w-xl">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sand text-ink" aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink-muted">Yesterday</p>
        <p className="font-medium leading-tight">{r.name}</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-20 shrink-0 overflow-visible sm:w-28" role="img" aria-label={`The real line: ${real}.${res ? ` Yours: ${mine}.` : ""}`}>
        {res && <path d={pts(res.guess)} fill="none" stroke="var(--ink)" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />}
        <path d={pts(r.actual)} fill="none" stroke="var(--clay)" strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {res && (
        <p className="shrink-0 text-right font-mono text-sm tabular">
          <span className={cn("block text-base font-medium", res.you > res.rule && "text-clay-ink")}>{res.you}</span>
          <span className="text-ink-muted">vs {res.rule}</span>
        </p>
      )}
    </div>
  );
}

/** The four newest stretches, as many times as you like; the dots are today's scorecard (clay: you beat the rule). */
function Practice({ onDaily, titleAs }: { onDaily: () => void; titleAs: "h2" | "h3" }) {
  const [i, setI] = React.useState(0);
  const [day, setDay] = React.useState<Day | null>(null);
  const [run, setRun] = React.useState(0);
  const today = day ?? readDay();

  const record = (id: string, beat: boolean) => {
    const d = readDay();
    const first = !d.done.includes(id);
    if (first) d.done.push(id);
    if (beat && !d.won.includes(id)) d.won.push(id);
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch {}
    setDay(d);
    if (first) window.dispatchEvent(new CustomEvent("monte:xp", { detail: { xp: XP, reason: "what happens next" } }));
  };
  const go = (k: number) => {
    setI(k);
    setRun((n) => n + 1);
  };
  const r = ROUNDS[i];

  return (
    <Play
      titleAs={titleAs}
      key={`${i}-${run}`}
      round={buildRound(r)}
      aside={
        <div role="group" aria-label="More charts" className="-mr-3 ml-auto flex max-sm:basis-full max-sm:justify-end">
          <button type="button" onClick={onDaily} aria-label="Back to today's chart" className="grid size-11 place-items-center text-ink-muted transition-colors hover:text-ink">
            <CalendarDays className="size-5" aria-hidden />
          </button>
          {ROUNDS.map((x, k) => {
            const won = today.won.includes(x.id);
            const done = today.done.includes(x.id);
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => go(k)}
                aria-current={k === i ? "true" : undefined}
                aria-label={`${x.name}${won ? ", beat the rule" : done ? ", played" : ""}`}
                className="grid size-11 place-items-center"
              >
                <span
                  className={cn(
                    "size-3 rounded-full transition-colors",
                    won ? "bg-clay" : done ? "bg-ink-muted" : "border-2 border-line-strong",
                    k === i && "ring-2 ring-ink ring-offset-2 ring-offset-sand",
                  )}
                />
              </button>
            );
          })}
        </div>
      }
      onResult={(res) => record(r.id, res.you > res.rule)}
      actions={(_, again) => (
        <>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => go((i + 1) % ROUNDS.length)} autoFocus>
            Next <ArrowRight className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={again} aria-label="Draw it again" className="grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-paper hover:text-ink">
            <RotateCcw className="size-5" aria-hidden />
          </button>
        </>
      )}
    />
  );
}

/** Width of the svg in pixels, so the viewBox is real pixels and text stays 12px at any size. */
function useWidth() {
  const ref = React.useRef<SVGSVGElement>(null);
  const [W, setW] = React.useState(640);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w) setW(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, W] as const;
}

const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/** A score that counts up once, like a scoreboard. Still under reduced motion. */
function CountUp({ to, still }: { to: number; still?: boolean }) {
  const reduce = useReducedMotion() || still;
  const [v, setV] = React.useState(reduce ? to : 0);
  React.useEffect(() => {
    if (reduce) return;
    const c = animate(0, to, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [to, reduce]);
  return <>{reduce ? to : v}</>;
}

type Outcome = { you: number; rule: number; guess: number[] };

/**
 * One chart to draw. `saved` opens it already revealed with that line (a daily chart played earlier today);
 * `actions` are the buttons after the reveal; `note` sits under them.
 */
function Play({
  round: r,
  aside,
  saved,
  onResult,
  actions,
  note,
  titleAs,
}: {
  round: Round;
  aside: React.ReactNode;
  saved?: number[];
  onResult: (o: Outcome) => void;
  actions: (o: Outcome, again: () => void) => React.ReactNode;
  note?: React.ReactNode;
  titleAs: "h2" | "h3";
}) {
  const Title = titleAs;
  const K = r.known.length;
  const H = r.hide;
  const last = r.known[K - 1];
  // The score's scale comes from the whole window, so the same line scores the same on any screen.
  const range = Math.max(...r.values) - Math.min(...r.values);
  const [svgRef, W] = useWidth();
  // On a phone, show two years (or enough to give the hidden stretch a third of the width) so there is room to draw.
  const from = W < 640 ? Math.max(0, K - Math.max(r.period * 2, Math.round(H * 1.8))) : 0;
  const view = r.values.slice(from);
  const lo = Math.min(...view);
  const hi = Math.max(...view);
  const pad = (hi - lo) * 0.14;
  const y0 = lo >= 0 ? Math.max(0, lo - pad) : lo - pad;
  const y1 = hi + pad;

  const [guess, setGuess] = React.useState<(number | null)[]>(() => (saved?.length === H ? saved : Array(H).fill(null)));
  const [shown, setShown] = React.useState(saved?.length === H);
  // Opened already revealed (a return visit): show the scores as they are, no count-up.
  const [still] = React.useState(saved?.length === H);
  const [cursor, setCursor] = React.useState(0);
  const [focused, setFocused] = React.useState(false);
  const stroke = React.useRef<{ i: number; v: number } | null>(null);
  const verdictRef = React.useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();

  const complete = guess.every((g) => g !== null);
  const started = guess.some((g) => g !== null);
  const rule = React.useMemo(() => ruleForecast(r.known, H, r.rule, r.period), [r, H]);
  const you = complete ? score(guess as number[], r.actual, range) : 0;
  const ruleScore = score(rule, r.actual, range);
  const beat = you > ruleScore;
  const Icon = ICONS[r.id];

  // Geometry: the viewBox is the svg's real width, so 1 unit is 1 pixel.
  const h = Math.round(Math.max(240, Math.min(400, W * 0.5)));
  const L = 44, R = 12, T = 12, B = 28;
  const total = r.values.length - from;
  const step = (W - L - R) / (total - 1);
  const X = (i: number) => L + (i - from) * step;
  const Y = (v: number) => T + (1 - (v - y0) / (y1 - y0)) * (h - T - B);
  const toV = (y: number) => y0 + (1 - (y - T) / (h - T - B)) * (y1 - y0);
  const clampV = (v: number) => Math.min(y1, Math.max(y0, v));

  const toPoint = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const x = ((e.clientX - box.left) * W) / box.width;
    const y = ((e.clientY - box.top) * h) / box.height;
    const i = Math.min(H - 1, Math.max(0, Math.round((x - X(K)) / step)));
    return { i, v: clampV(toV(y)) };
  };

  const down = (e: React.PointerEvent<SVGRectElement>) => {
    if (shown) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toPoint(e);
    setGuess((g) => drawTo(g, anchorFor(g, p.i, last), p));
    setCursor(p.i);
    stroke.current = p;
  };
  const move = (e: React.PointerEvent<SVGRectElement>) => {
    if (shown || !stroke.current) return;
    const p = toPoint(e);
    const from = stroke.current;
    setGuess((g) => drawTo(g, from, p));
    setCursor(p.i);
    stroke.current = p;
  };
  const up = () => {
    stroke.current = null;
  };

  const reveal = () => {
    if (!complete || shown) return;
    setShown(true);
    const mine = score(guess as number[], r.actual, range);
    const won = mine > ruleScore;
    onResult({ you: mine, rule: ruleScore, guess: guess as number[] });
    track("Draw it finished", { round: r.id, result: won ? "beat" : "lost" });
    if (won) {
      feelRight();
      setTimeout(() => burstFrom(verdictRef.current), reduce ? 0 : 900);
    }
  };

  const key = (e: React.KeyboardEvent<SVGRectElement>) => {
    if (shown) return;
    const nudge = (y1 - y0) / 40;
    const here = guess[cursor] ?? anchorFor(guess, cursor, last).v;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const v = clampV(here + (e.key === "ArrowUp" ? nudge : -nudge));
      setGuess((g) => drawTo(g, anchorFor(g, cursor, last), { i: cursor, v }));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(H - 1, cursor + 1);
      setGuess((g) => (g[next] === null ? drawTo(g, anchorFor(g, next, last), { i: next, v: here }) : g));
      setCursor(next);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCursor(Math.max(0, cursor - 1));
    } else if (e.key === "Enter" && complete) reveal();
  };

  const again = () => {
    setGuess(Array(H).fill(null));
    setShown(false);
    setCursor(0);
  };

  // Year labels: January of each year in view.
  const years = r.labels.flatMap((l, i) => (i >= from && l.slice(5, 7) === "01" ? [[i, l.slice(0, 4)] as const] : []));
  const ticks = [0.2, 0.8].map((f) => y0 + f * (y1 - y0));
  const drawn: [number, number][] = [[X(K - 1), Y(last)]];
  for (let j = 0; j < H && guess[j] !== null; j++) drawn.push([X(K + j), Y(guess[j] as number)]);
  const real: [number, number][] = [[X(K - 1), Y(last)], ...r.actual.map((v, j) => [X(K + j), Y(v)] as [number, number])];
  const ruleLine: [number, number][] = [[X(K - 1), Y(last)], ...rule.map((v, j) => [X(K + j), Y(v)] as [number, number])];
  const hereV = guess[cursor] ?? anchorFor(guess, cursor, last).v;
  // The only "draw here" there is: the start point pulses and a short arrow points into the hidden stretch.
  // Flat on purpose, so it hints at nothing about the shape.
  const zone = W - R - X(K - 1);
  const hint = Math.min(64, zone * 0.4);

  const source = (
    <a
      href={`https://tickerz.com/x/${r.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Data: ${r.source}, via Tickerz`}
      title={`${r.source}, via Tickerz`}
      className="ml-auto grid size-11 place-items-center text-ink-muted transition-colors hover:text-ink"
    >
      <TickerzMark className="h-6 w-auto" />
    </a>
  );

  return (
    <div>
      {/* The title never breaks. Phones put the dots on their own row, so switching rounds never moves the chart. */}
      <div className="mb-3 flex flex-wrap items-center gap-x-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper text-ink" aria-hidden="true">
          <Icon className="size-5" />
        </span>
        <Title className="flex-1 whitespace-nowrap font-display text-xl font-semibold leading-tight sm:text-2xl">{r.name}</Title>
        {aside}
      </div>

      <div className="rounded-stage bg-paper p-2 sm:p-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${h}`}
          role="group"
          aria-label={`${r.name}, ${r.unit}, ${periodText(r.labels[from])} to ${periodText(r.labels[K - 1])}. The last ${H} months are hidden: draw them.`}
          className="block h-auto w-full select-none overflow-visible [&_text]:fill-ink-muted [&_text]:font-mono [&_text]:text-xs"
        >
          {ticks.map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="var(--line)" />
              <text x={L - 8} y={Y(v) + 4} textAnchor="end">
                {r.fmt(v)}
              </text>
            </g>
          ))}
          {years.map(([i, y]) => (
            <text key={i} x={X(i)} y={h - 8} textAnchor="middle">
              {y}
            </text>
          ))}

          <rect x={X(K - 1)} y={T} width={zone} height={h - T - B} rx={12} fill="var(--sand)" />
          {!started && !shown && (
            <g stroke="var(--ink-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.7}>
              <path d={`M${X(K - 1) + 14} ${Y(last)} H${X(K - 1) + hint}`} strokeDasharray="2 6" />
              <path d={`M${X(K - 1) + hint - 6} ${Y(last) - 6} L${X(K - 1) + hint} ${Y(last)} L${X(K - 1) + hint - 6} ${Y(last) + 6}`} />
            </g>
          )}
          {!started && !shown && !reduce && (
            <motion.circle
              cx={X(K - 1)}
              cy={Y(last)}
              fill="none"
              stroke="var(--clay)"
              strokeWidth={2}
              initial={{ r: 6, opacity: 0.8 }}
              animate={{ r: 20, opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut", repeat: Infinity, repeatDelay: 0.4 }}
            />
          )}

          <path d={path(r.known.slice(from).map((v, i) => [X(i + from), Y(v)]))} fill="none" stroke="var(--clay)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {shown && <path d={path(ruleLine)} fill="none" stroke="var(--ink-muted)" strokeWidth={1.75} strokeDasharray="5 5" strokeLinejoin="round" />}
          {drawn.length > 1 && <path d={path(drawn)} fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
          {shown && (
            <motion.path
              d={path(real)}
              fill="none"
              stroke="var(--clay)"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            />
          )}
          <circle cx={X(K - 1)} cy={Y(last)} r={5.5} fill="var(--clay)" stroke="var(--paper)" strokeWidth={2} />
          {focused && !shown && <circle cx={X(K + cursor)} cy={Y(hereV)} r={7} fill="none" stroke="var(--ink)" strokeWidth={2} />}

          {/* Where you draw: pointer, touch or keys. Only this strip takes touches, so the page still scrolls elsewhere. */}
          <rect
            x={X(K - 1) - step / 2}
            y={0}
            width={W - X(K - 1) + step / 2}
            height={h}
            fill="transparent"
            tabIndex={shown ? -1 : 0}
            role="slider"
            aria-label="Your line. Up and down set the value, left and right move through the months."
            aria-valuemin={Math.round(y0)}
            aria-valuemax={Math.round(y1)}
            aria-valuenow={Math.round(hereV)}
            aria-valuetext={`${periodText(r.labels[K + cursor])}: ${r.fmt(hereV)}`}
            className={cn("touch-none outline-none", shown ? "cursor-default" : "cursor-crosshair")}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onKeyDown={key}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </svg>
      </div>

      {!shown ? (
        <div className="mt-5 flex items-center gap-2">
          <button type="button" className="btn btn-primary" disabled={!complete} onClick={reveal}>
            Show me
          </button>
          {started && (
            <button type="button" onClick={again} aria-label="Start over" className="grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-paper hover:text-ink">
              <RotateCcw className="size-5" aria-hidden />
            </button>
          )}
          {source}
        </div>
      ) : (
        <div className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <p className="sr-only" aria-live="polite">
            You scored {you}. {r.ruleName} scored {ruleScore}. {verdict(you, ruleScore, r.ruleName)} {r.idea}
          </p>
          <div className="flex items-end gap-8 font-mono tabular" aria-hidden="true">
            <div>
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="h-0.5 w-4 rounded bg-ink" /> You
              </div>
              <div className={cn("text-figure font-medium leading-none tracking-tight", beat && "text-clay-ink")}>
                <CountUp to={you} still={still} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="w-4 border-t-2 border-dashed border-ink-muted" /> {r.ruleName}
              </div>
              <div className="text-figure font-medium leading-none tracking-tight text-ink-muted">
                <CountUp to={ruleScore} still={still} />
              </div>
            </div>
          </div>
          <div className="min-w-0" aria-hidden="true">
            <p ref={verdictRef} className={cn("font-display text-2xl font-semibold", beat && "text-clay-ink")}>
              {verdict(you, ruleScore, r.ruleName)}
            </p>
            <p className="text-ink-muted">{r.idea}</p>
          </div>
          <div className="flex items-center gap-2">
            {actions({ you, rule: ruleScore, guess: guess as number[] }, again)}
            {source}
          </div>
          {note && <div className="md:col-span-3">{note}</div>}
        </div>
      )}
    </div>
  );
}
