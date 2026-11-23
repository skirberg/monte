"use client";

import * as React from "react";
import { readNumber, testResult, wholeCounts } from "@/lib/decide/math";
import { useMediaQuery } from "@/lib/hooks";
import { HowItWorks, NumField, Presets, ResultBar, Stat, Stats, chance, oneIn, useToolXp } from "@/components/decide/fields";
import { HOW_BAYES } from "@/lib/decide/how";

/** The words each example uses, so the plain-English sentence reads right for people, purchases or emails. */
type Words = { who: string; have: string; others: string; flagged: string; isIt: string; stillIs: string };
type Preset = { label: string; note: string; base: string; catches: string; falseAlarm: string; words: Words };

/** Made-up but believable rates. The first is the classic screening example from the research on how people read test results. */
const PRESETS: Preset[] = [
  {
    label: "A rare condition screening",
    note: "A screening test for a condition 1 in 100 people have. It catches 90% of real cases and false-alarms on 9% of the rest.",
    base: "1",
    catches: "90",
    falseAlarm: "9",
    words: { who: "people", have: "have the condition", others: "who don't", flagged: "test positive", isIt: "has it", stillIs: "still has it" },
  },
  {
    label: "A fraud alert on a card",
    note: "About 1 in 200 purchases like this one is fraud. The alert catches 98% of fraud and flags 3% of honest purchases.",
    base: "0.5",
    catches: "98",
    falseAlarm: "3",
    words: { who: "purchases", have: "are fraud", others: "honest ones", flagged: "get an alert", isIt: "is fraud", stillIs: "is fraud anyway" },
  },
  {
    label: "A spam filter",
    note: "Close to half of all email is spam. The filter catches 99% of it, and sends 1% of real mail to the spam folder by mistake.",
    base: "45",
    catches: "99",
    falseAlarm: "1",
    words: { who: "emails", have: "are spam", others: "real ones", flagged: "go to spam", isIt: "is spam", stillIs: "is spam anyway" },
  },
];

/** Dot looks for the four groups: shape and size differ, not only color. */
const GROUPS = [
  { key: "tp", name: "real, and flagged" },
  { key: "fp", name: "false alarms" },
  { key: "fn", name: "real, but missed" },
  { key: "tn", name: "rightly cleared" },
] as const;

const k = (n: number) => n.toLocaleString("en-US");

export function Bayes() {
  const [preset, setPreset] = React.useState(0);
  const [words, setWords] = React.useState<Words>(PRESETS[0].words);
  const [base, setBase] = React.useState(PRESETS[0].base);
  const [catches, setCatches] = React.useState(PRESETS[0].catches);
  const [falseAlarm, setFalseAlarm] = React.useState(PRESETS[0].falseAlarm);
  const xp = useToolXp("bayes");

  const choose = (i: number) => {
    const p = PRESETS[i];
    setPreset(i);
    setWords(p.words);
    setBase(p.base);
    setCatches(p.catches);
    setFalseAlarm(p.falseAlarm);
    xp();
  };
  const edit = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPreset(-1);
    xp();
  };

  const b = readNumber(base) / 100;
  const c = readNumber(catches) / 100;
  const f = readNumber(falseAlarm) / 100;
  const errors = [
    !(b > 0 && b < 1) && "How common it is runs from just above 0% to just under 100%.",
    !(c >= 0 && c <= 1) && "How often it catches it runs from 0% to 100%.",
    !(f >= 0 && f <= 1) && "How often it false-alarms runs from 0% to 100%.",
  ].filter(Boolean) as string[];
  const ok = errors.length === 0 && (c > 0 || f > 0);
  const r = ok ? testResult(b, c, f) : null;
  const grid = r ? wholeCounts([r.tp, r.fp, r.fn, r.tn], 1000) : null;

  const bar: [string, string] = r ? [chance(r.realIfPos, 1), `of the ${words.who} that ${words.flagged} really ${words.have}.`] : ["", "Fix the numbers to see what a yes means."];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-5">
          <ResultBar lead={bar[0]} rest={bar[1]} />
          <div className="space-y-2">
            <Presets label="Example tests" items={PRESETS.map((x) => x.label)} value={preset} onChange={choose} />
            <p className="text-sm text-ink-muted">Made-up numbers.</p>
          </div>
          <div className="space-y-4">
            <NumField id="by-base" label="How common it is" suffix="%" value={base} onChange={edit(setBase)} invalid={!(b > 0 && b < 1)} describedBy="by-hint" />
            <div className="grid grid-cols-2 gap-3">
              <NumField id="by-catch" label="How often it catches it" suffix="%" value={catches} onChange={edit(setCatches)} invalid={!(c >= 0 && c <= 1)} describedBy="by-hint" />
              <NumField id="by-false" label="How often it false-alarms" suffix="%" value={falseAlarm} onChange={edit(setFalseAlarm)} invalid={!(f >= 0 && f <= 1)} describedBy="by-hint" />
            </div>
            {/* Only when something needs fixing: the labels and the picture say the rest. */}
            {(errors.length > 0 || !ok) && (
              <p id="by-hint" className="text-sm text-ink-muted">
                {errors.length ? errors.join(" ") : "A test that never says yes has nothing to read. Give it a catch rate."}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          {r && grid && (
            <>
              <figure className="space-y-3 rounded-stage bg-sand p-4 sm:p-5">
                <DotGrid counts={grid} who={words.who} />
                <figcaption>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-ink-muted sm:grid-cols-4">
                    {GROUPS.map((g, i) => (
                      <li key={g.key} className="flex items-center gap-2">
                        <svg viewBox="0 0 12 12" className="size-3 shrink-0" aria-hidden="true">
                          <Dot kind={g.key} x={6} y={6} cell={12} />
                        </svg>
                        <span>
                          <span className="font-mono text-ink tabular">{k(grid[i])}</span> {g.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </figcaption>
              </figure>
              <Stats className="grid-cols-2">
                <Stat k="When it says yes" v={chance(r.realIfPos, 1)} tone="clay" sub={`the chance it really ${words.isIt}`} />
                <Stat k="When it says no" v={chance(r.realIfNeg, 2)} sub={`the chance it ${words.stillIs}: ${oneIn(r.realIfNeg)}`} />
                <Stat k="False alarms" v={chance(r.falseShare, 1)} sub={`of all the ${words.who} that ${words.flagged}`} />
                <Stat k="Says yes overall" v={chance(r.pos, 1)} sub={`of all ${words.who} checked`} />
              </Stats>
            </>
          )}

        </div>
      </div>

      <HowItWorks id="by" {...HOW_BAYES} />
    </div>
  );
}

/** One dot. Real and flagged: a full clay dot. False alarm: a full ink dot. Missed: a clay ring. Cleared: a small faint dot. */
function Dot({ kind, x, y, cell }: { kind: (typeof GROUPS)[number]["key"]; x: number; y: number; cell: number }) {
  if (kind === "tp") return <circle cx={x} cy={y} r={cell * 0.42} fill="var(--clay)" />;
  if (kind === "fp") return <circle cx={x} cy={y} r={cell * 0.42} fill="var(--ink)" />;
  if (kind === "fn") return <circle cx={x} cy={y} r={cell * 0.32} fill="none" stroke="var(--clay)" strokeWidth={cell * 0.14} />;
  return <circle cx={x} cy={y} r={cell * 0.2} fill="var(--line-strong)" />;
}

/** 1,000 dots, the flagged ones first (real, then false alarms), then the missed, then the cleared. */
function DotGrid({ counts, who }: { counts: number[]; who: string }) {
  const narrow = useMediaQuery("(max-width: 639px)");
  const cols = narrow ? 40 : 50;
  const W = narrow ? 360 : 560;
  const cell = W / cols;
  const H = (1000 / cols) * cell;
  const kinds = GROUPS.flatMap((g, i) => Array.from({ length: counts[i] }, () => g.key));
  const [tp, fp, fn, tn] = counts;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`1,000 ${who}, one dot each. Flagged: ${tp + fp}, of which ${tp} real and ${fp} false alarms. Real but missed: ${fn}. Rightly cleared: ${tn}.`}
    >
      {kinds.map((kind, i) => (
        <Dot key={i} kind={kind} x={(i % cols) * cell + cell / 2} y={Math.floor(i / cols) * cell + cell / 2} cell={cell} />
      ))}
    </svg>
  );
}
