"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { testResult, wholeCounts } from "@/lib/decide/math";
import { decideHref } from "@/lib/site-data";

/** How common the thing is, as steps a slider can land on: rare things need fine steps. In percent. */
const BASES = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 30, 50];
const DOTS = 100;

const pctText = (v: number) => `${v < 1 ? v.toFixed(1) : Math.round(v)}%`;
const oneIn = (v: number) => (v >= 50 ? "1 in 2" : `1 in ${Math.round(100 / v).toLocaleString("en-US")}`);

function Range({
  id,
  label,
  shown,
  value,
  min,
  max,
  valueText,
  onChange,
}: {
  id: string;
  label: string;
  shown: string;
  value: number;
  min: number;
  max: number;
  valueText: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-ink-muted">
          {label}
        </label>
        <span className="font-mono text-lg tabular" aria-hidden="true">
          {shown}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        aria-valuetext={valueText}
        className="h-11 w-full accent-[var(--clay)]"
      />
    </div>
  );
}

/**
 * "Is this test result real?" in three sliders, for the home page. Same math as /decide/bayes/ (lib/decide/math.ts):
 * of everyone who tests positive, the share who really have it. The answer is drawn as 100 grains, real ones in clay.
 */
export function TestResultMini() {
  const [baseIdx, setBaseIdx] = React.useState(3);
  const [catches, setCatches] = React.useState(90);
  const [falseAlarm, setFalseAlarm] = React.useState(9);

  const base = BASES[baseIdx];
  const r = testResult(base / 100, catches / 100, falseAlarm / 100);
  const real = r.realIfPos;
  const [realDots] = wholeCounts([real, 1 - real], DOTS);
  const [tp, , fp] = wholeCounts([r.tp, r.fn, r.fp, r.tn], 1000);
  const answer = `${Math.round(real * 100)}%`;
  const sentence = `A positive result is real ${answer} of the time.`;

  return (
    <div className="grid gap-8 rounded-[28px] bg-sand p-5 sm:p-8 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-5 lg:col-span-5">
        <Range
          id="mini-base"
          label="How common it is"
          shown={`${oneIn(base)} · ${pctText(base)}`}
          value={baseIdx}
          min={0}
          max={BASES.length - 1}
          valueText={`${oneIn(base)} people, ${pctText(base)}`}
          onChange={setBaseIdx}
        />
        <Range
          id="mini-catch"
          label="The test catches"
          shown={`${catches}%`}
          value={catches}
          min={50}
          max={99}
          valueText={`${catches}% of real cases`}
          onChange={setCatches}
        />
        <Range
          id="mini-false"
          label="False alarms"
          shown={`${falseAlarm}%`}
          value={falseAlarm}
          min={1}
          max={30}
          valueText={`${falseAlarm}% of people who don't have it`}
          onChange={setFalseAlarm}
        />
      </div>

      <div className="flex flex-col gap-5 lg:col-span-7">
        <div>
          <p className="text-sm text-ink-muted">If you test positive, the chance you really have it</p>
          <p className="font-mono text-[clamp(3.4rem,2.4rem+4vw,5.5rem)] font-medium leading-none tracking-[-0.05em] text-clay-ink tabular" aria-hidden="true">
            {answer}
          </p>
          <p className="sr-only" aria-live="polite">
            {sentence}
          </p>
        </div>

        <div>
          <svg
            viewBox="0 0 400 104"
            className="w-full max-w-[520px]"
            role="img"
            aria-label={`Of every ${DOTS} positive results, ${realDots} are real and ${DOTS - realDots} are false alarms.`}
          >
            {Array.from({ length: DOTS }, (_, i) => {
              const col = i % 20;
              const row = Math.floor(i / 20);
              const isReal = i < realDots;
              return (
                <circle
                  key={i}
                  cx={10 + col * 20}
                  cy={10 + row * 21}
                  r={isReal ? 7 : 6}
                  fill={isReal ? "var(--clay)" : "none"}
                  stroke={isReal ? "none" : "var(--line-strong)"}
                  strokeWidth={1.6}
                />
              );
            })}
          </svg>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-full bg-clay" /> really have it
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-full border-[1.6px] border-line-strong" /> false alarms
            </span>
            <span>every 100 positive results</span>
          </p>
        </div>

        <p className="max-w-[56ch]">
          Test 1,000 people: about {tp.toLocaleString("en-US")} who have it test positive, and so do {fp.toLocaleString("en-US")} who don&rsquo;t.
        </p>

        <a
          href={decideHref("bayes")}
          className="mt-auto inline-flex h-12 items-center gap-2 self-start rounded-full bg-ink px-6 font-medium text-paper transition-colors hover:bg-ink/85"
        >
          Open the full tool <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  );
}
