"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "cn";
import { TOPICS, studyHref, type Topic } from "@/lib/site-data";
import { useStoredString } from "@/lib/hooks";

type Stat = { asked: number; correct: number; best: number };

/** Reads the engine's saved progress (same origin as /study). */
function useProgress(): Record<string, Stat> {
  const raw = useStoredString("sigma");
  return React.useMemo(() => {
    try {
      return raw ? (JSON.parse(raw).drill ?? {}) : {};
    } catch {
      return {};
    }
  }, [raw]);
}

function status(s?: Stat) {
  if (!s || !s.asked) return { label: "Not played", won: false };
  if (s.best >= 0.8 && s.asked >= 8) return { label: "Won", won: true };
  return { label: `Best ${Math.round(s.best * 100)}%`, won: false };
}

/** The curriculum as a distribution: thirteen columns, this topic's column in clay. */
function MiniPile({ n, className }: { n: number; className?: string }) {
  const pmf = (k: number) => {
    let c = 1;
    for (let i = 1; i <= k; i++) c = (c * (12 - k + i)) / i;
    return c / 4096;
  };
  return (
    <svg viewBox="0 0 130 64" className={className} aria-hidden>
      {Array.from({ length: 13 }, (_, k) => {
        const dots = Math.max(1, Math.round(pmf(k) * 26));
        return Array.from({ length: dots }, (_, d) => (
          <circle
            key={`${k}-${d}`}
            cx={5 + k * 10}
            cy={58 - d * 8}
            r={3.4}
            fill={k + 1 === n ? "var(--clay)" : "var(--line-strong)"}
            opacity={k + 1 === n ? 1 : 0.55}
          />
        ));
      })}
    </svg>
  );
}

function Preview({ t, stat }: { t: Topic; stat?: Stat }) {
  const st = status(stat);
  return (
    <motion.div
      key={t.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex h-full flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[5.5rem] leading-[0.8] font-medium tracking-[-0.06em] text-clay tabular">
          {String(t.n).padStart(2, "0")}
        </span>
        <MiniPile n={t.n} className="mt-2 w-32" />
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-3xl font-[650] leading-tight" style={{ fontVariationSettings: "'wdth' 88" }}>
          {t.name}
        </h3>
        <p className="text-[1.05rem] leading-relaxed text-ink-muted">{t.line}</p>
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
        {st.won ? <span className="text-clay-ink">Match won</span> : st.label}
      </p>
      <div className="mt-auto flex flex-wrap gap-2">
        <a
          href={studyHref(`#learn/topics/${t.id}`)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
        >
          Learn it <ArrowRight className="size-4" />
        </a>
        <a
          href={studyHref(`#practice/drill/topic/${t.id}`)}
          className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-sm font-medium transition-colors hover:border-ink hover:bg-sand"
        >
          Drill it, 8 questions
        </a>
      </div>
    </motion.div>
  );
}

export function TheDraw() {
  const drill = useProgress();
  const [active, setActive] = React.useState(TOPICS[8].id);
  const t = TOPICS.find((x) => x.id === active) ?? TOPICS[0];
  const won = TOPICS.filter((x) => status(drill[x.id]).won).length;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <ol className="border-t border-ink lg:col-span-7">
        {TOPICS.map((x) => {
          const st = status(drill[x.id]);
          const on = x.id === active;
          return (
            <li key={x.id} className="border-b border-line">
              <a
                href={studyHref(`#learn/topics/${x.id}`)}
                onMouseEnter={() => setActive(x.id)}
                onFocus={() => setActive(x.id)}
                className={cn(
                  "group grid min-h-14 grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-3 pr-2 transition-colors",
                  on && "lg:bg-sand",
                )}
              >
                <span className={cn("pl-2 font-mono text-sm text-ink-muted tabular", on && "lg:text-clay-ink")}>
                  {String(x.n).padStart(2, "0")}
                </span>
                <span
                  className="font-display text-[1.2rem] font-[600] leading-snug md:text-[1.35rem]"
                  style={{ fontVariationSettings: "'wdth' 92" }}
                >
                  {x.name}
                </span>
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  {st.won ? (
                    <span className="inline-flex items-center gap-1 text-clay-ink">
                      <Check className="size-3.5" /> Won
                    </span>
                  ) : (
                    <span className="hidden sm:inline">{st.label}</span>
                  )}
                  <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
                </span>
              </a>
            </li>
          );
        })}
        <li className="flex items-center justify-between gap-3 py-4 pl-2 font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
          <span>Final: timed closed-book mock, 20 questions</span>
          <span className="tabular">{won} of 13 won</span>
        </li>
      </ol>

      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-24 min-h-[440px] rounded-[28px] bg-sand p-8">
          <AnimatePresence mode="wait">
            <Preview t={t} stat={drill[t.id]} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
