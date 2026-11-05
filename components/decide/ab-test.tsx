"use client";

import * as React from "react";
import { abSampleSize, abTest, abTooSmall, readNumber } from "@/lib/decide/math";
import { useMediaQuery } from "@/lib/hooks";
import { HowItWorks, NumField, Presets, ResultBar, Stat, Stats, chance, useToolXp } from "@/components/decide/fields";

type Words = { who: string; did: string };
type Preset = { label: string; note: string; nA: string; xA: string; nB: string; xB: string; words: Words };

/** Made-up counts that land on three different answers: a clear win, a tiny lift, and too few people. */
const PRESETS: Preset[] = [
  {
    label: "A website button",
    note: "The old sign-up button (A) against one with clearer words (B). Visitors were split at random for two weeks.",
    nA: "4,800",
    xA: "192",
    nB: "4,750",
    xB: "238",
    words: { who: "Visitors", did: "Signed up" },
  },
  {
    label: "An email subject line",
    note: "Two subject lines, each sent to 10,000 people picked at random from the same list.",
    nA: "10,000",
    xA: "2,150",
    nB: "10,000",
    xB: "2,210",
    words: { who: "Emails sent", did: "Opened" },
  },
  {
    label: "A store promotion",
    note: "At the till, shoppers got either a plain receipt (A) or a receipt with a 10% off coupon (B), at random. Who came back within a month?",
    nA: "1,200",
    xA: "300",
    nB: "1,150",
    xB: "320",
    words: { who: "Shoppers", did: "Came back" },
  },
];

const k = (n: number) => n.toLocaleString("en-US");
/** A difference in percentage points, with the site's minus sign. */
const pts = (v: number, d = 2) => {
  const r = Number((Math.abs(v) * 100).toFixed(d));
  return `${r === 0 ? "" : v < 0 ? "−" : "+"}${r.toFixed(d)} pts`;
};
/** A rate with two decimals, always: 4.00% next to 5.01%. */
const rate = (v: number) => `${(v * 100).toFixed(2)}%`;
const signedPct = (v: number) => (Number.isFinite(v) ? `${v < 0 ? "−" : "+"}${Math.abs(v * 100).toFixed(1)}%` : "?");

export function AbTest() {
  const [preset, setPreset] = React.useState(0);
  const [words, setWords] = React.useState<Words>(PRESETS[0].words);
  const [nA, setNA] = React.useState(PRESETS[0].nA);
  const [xA, setXA] = React.useState(PRESETS[0].xA);
  const [nB, setNB] = React.useState(PRESETS[0].nB);
  const [xB, setXB] = React.useState(PRESETS[0].xB);
  const xp = useToolXp("abtest");

  const choose = (i: number) => {
    const p = PRESETS[i];
    setPreset(i);
    setWords(p.words);
    setNA(p.nA);
    setXA(p.xA);
    setNB(p.nB);
    setXB(p.xB);
    xp();
  };
  const edit = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPreset(-1);
    xp();
  };

  const a = readNumber(nA);
  const ca = readNumber(xA);
  const b = readNumber(nB);
  const cb = readNumber(xB);
  const whole = (v: number) => Number.isInteger(v) && v >= 0;
  const badA = !(whole(a) && a >= 1 && whole(ca) && ca <= a);
  const badB = !(whole(b) && b >= 1 && whole(cb) && cb <= b);
  const none = !badA && !badB && ca + cb === 0;
  const all = !badA && !badB && ca === a && cb === b;
  const small = !badA && !badB && !none && !all && abTooSmall(a, ca, b, cb);
  const ok = !badA && !badB && !none && !all && !small;
  const t = ok ? abTest(a, ca, b, cb) : null;
  const need = t ? abSampleSize(t.pA, t.pB) : NaN;
  const sig = t ? t.p < 0.05 : false;
  const did = words.did.toLowerCase();

  let read = "Type the counts for both versions.";
  if (badA || badB) read = "Fix the counts in red.";
  else if (none || all) read = none ? "Nobody converted in either version, so there is nothing to compare yet." : "Everyone converted in both versions, so there is nothing to compare.";
  else if (small) read = "Too few to call yet. With counts this small, luck alone can fake a big gap. This test needs about 5 of each outcome expected in each version. Keep collecting.";
  else if (t) {
    if (sig) {
      read = `${t.diff > 0 ? "B wins" : "B is worse"}. Luck alone would make a gap this big only ${chance(t.p, 1)} of the time. The real difference is probably ${pts(t.lo)} to ${pts(t.hi)}.`;
    } else {
      read = `Too close to call. If the change did nothing, a gap this big would still show up ${chance(t.p, 0)} of the time. The real difference could be anywhere from ${pts(t.lo)} to ${pts(t.hi)}.`;
      if (Number.isFinite(need)) read += ` To tell a ${Number.isFinite(t.lift) ? `${(Math.abs(t.lift) * 100).toFixed(1)}% ` : ""}${t.diff < 0 ? "drop" : "lift"} from luck, plan on about ${k(need)} per version.`;
    }
  }

  const bar: [string, string] = !t
    ? ["", read]
    : sig
      ? [Number.isFinite(t.lift) ? signedPct(t.lift) : pts(t.diff), `for B, and luck is an unlikely reason: ${t.diff > 0 ? "B wins" : "B is worse"}.`]
      : [Number.isFinite(t.lift) ? signedPct(t.lift) : pts(t.diff), `for B, but too close to call. Luck makes a gap like this ${chance(t.p, 0)} of the time.`];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-5">
          <ResultBar lead={bar[0]} rest={bar[1]} />
          <div className="space-y-2">
            <Presets label="Example tests" items={PRESETS.map((x) => x.label)} value={preset} onChange={choose} />
            <p className="text-sm text-ink-muted">{preset >= 0 ? `${PRESETS[preset].note} ` : ""}Made-up counts. Type your own.</p>
          </div>
          <fieldset className="min-w-0 space-y-3 rounded-2xl border border-line p-4">
            <legend className="px-1 font-medium">A, the old version</legend>
            <div className="grid grid-cols-2 gap-3">
              <NumField id="ab-na" label={words.who} value={nA} onChange={edit(setNA)} inputMode="numeric" invalid={badA} describedBy="ab-hint" />
              <NumField id="ab-xa" label={words.did} value={xA} onChange={edit(setXA)} inputMode="numeric" invalid={badA} describedBy="ab-hint" />
            </div>
          </fieldset>
          <fieldset className="min-w-0 space-y-3 rounded-2xl border border-line p-4">
            <legend className="px-1 font-medium">B, the change</legend>
            <div className="grid grid-cols-2 gap-3">
              <NumField id="ab-nb" label={words.who} value={nB} onChange={edit(setNB)} inputMode="numeric" invalid={badB} describedBy="ab-hint" />
              <NumField id="ab-xb" label={words.did} value={xB} onChange={edit(setXB)} inputMode="numeric" invalid={badB} describedBy="ab-hint" />
            </div>
          </fieldset>
          <p id="ab-hint" className="text-sm text-ink-muted">
            {badA || badB ? `Use whole numbers, with at least 1 in ${words.who.toLowerCase()} and no more ${did} than that.` : "The test only means something if people were split between A and B at random."}
          </p>
        </div>

        <div className="space-y-6 lg:col-span-7">
          {t && (
            <>
              <Stats className="grid-cols-2">
                <Stat k={`A: ${did}`} v={rate(t.pA)} sub={`${k(ca)} of ${k(a)}`} />
                <Stat k={`B: ${did}`} v={rate(t.pB)} sub={`${k(cb)} of ${k(b)}`} />
                <Stat k="Lift" v={signedPct(t.lift)} tone={sig ? "clay" : undefined} sub={`B − A = ${pts(t.diff)}`} />
                <Stat k="p-value" v={chance(t.p, 1)} tone={sig ? "clay" : undefined} sub={`z = ${t.z.toFixed(2).replace("-", "−")} · ${sig ? "under 5%: statistically significant" : "over 5%: could be luck"}`} />
              </Stats>
              <div className="rounded-[28px] bg-sand p-4 sm:p-5">
                <DiffChart diff={t.diff} lo={t.lo} hi={t.hi} sig={sig} />
              </div>
              <Stats className="grid-cols-1 sm:grid-cols-2">
                <Stat k="95% range for B − A" v={`${pts(t.lo, 1)} to ${pts(t.hi, 1)}`} sub="where the real difference probably is" />
                <Stat
                  k="Needed per version"
                  v={Number.isFinite(need) ? k(need) : "No gap"}
                  sub={Number.isFinite(need) ? `to catch a lift this size 8 times in 10${need <= Math.min(a, b) ? " · you have that" : ""}` : "A and B are the same so far"}
                />
              </Stats>
            </>
          )}
          <p className="text-ink-muted">
            {read}
          </p>
        </div>
      </div>

      <HowItWorks
        id="ab"
        steps={[
          {
            title: "Split people at random.",
            body: (
              <p>
                Show the old version to some people and the new one to others, decided by a coin flip for each person. Random splitting is what makes the two groups alike in
                everything except the change. If A ran on Monday and B on Saturday, you would be testing the day, not the button.
              </p>
            ),
          },
          {
            title: "Compare the rates.",
            body: (
              <p>
                Each version&rsquo;s rate is how many acted out of how many saw it. The <b>lift</b> is how much bigger B&rsquo;s rate is, as a share of A&rsquo;s. Going from 4% to
                5% is a 1 point gap, and a 25% lift.
              </p>
            ),
            math: <>rate = conversions ÷ visitors · lift = (B − A) ÷ A</>,
          },
          {
            title: "Ask: could luck alone do this?",
            body: (
              <p>
                Even two identical versions never get identical rates: people are random. The <b>z test</b> measures the gap in units of the wobble you would expect by chance. A
                z near 0 is ordinary wobble. Past about 2, it is rare for luck alone.
              </p>
            ),
            math: <>pooled rate p = (conversions A + B) ÷ (visitors A + B) · z = (B − A) ÷ √(p(1 − p)(1/visitors A + 1/visitors B))</>,
          },
          {
            title: "Read the p-value.",
            body: (
              <p>
                The <b>p-value</b> answers one question: if the change did nothing, how often would a gap at least this big show up? Under 5% is called{" "}
                <b>statistically significant</b>. It is not the chance that B is better, and it says nothing about whether the lift is big enough to matter.
              </p>
            ),
            math: <>p = 2 × Φ(−|z|), where Φ is the bell curve&rsquo;s area to the left · z = 2.38 gives p = 1.7%</>,
          },
          {
            title: "Give a range, not one number.",
            body: <p>The gap you saw is one draw. The 95% range is where the real gap probably sits. If the range crosses zero, B could be no better, or even worse.</p>,
            math: <>B − A ± 1.96 × √(A(1 − A) ÷ visitors A + B(1 − B) ÷ visitors B)</>,
          },
          {
            title: "Count how many you need.",
            body: (
              <p>
                Small lifts need many people. To catch a given lift 8 times in 10 (80% <b>power</b>) at the 5% level, use the count below. Going from 10% to 12% takes about 3,841
                people per version. Half the lift takes about four times as many.
              </p>
            ),
            math: <>n per version = (1.96 × √(2p̄(1 − p̄)) + 0.84 × √(A(1 − A) + B(1 − B)))² ÷ (B − A)², with p̄ = (A + B) ÷ 2</>,
          },
        ]}
        after={
          <>
            <p className="font-display text-xl font-[650] !text-ink">Don&rsquo;t peek and stop</p>
            <p>
              Decide how many people you need before you start, and stop there. Checking every day and stopping the moment B looks ahead turns luck into a &ldquo;win&rdquo; far
              more often than 5% of the time.
            </p>
            <p>
              And a real lift can still be too small to be worth the cost of the change. The range tells you how big it could be; whether that is worth it is your call.
            </p>
          </>
        }
      />
    </div>
  );
}

/** The gap B − A with its 95% range, around a zero line. */
function DiffChart({ diff, lo, hi, sig }: { diff: number; lo: number; hi: number; sig: boolean }) {
  const narrow = useMediaQuery("(max-width: 639px)");
  const W = narrow ? 360 : 560;
  const H = 120;
  const L = 12;
  const R = 12;
  const ext = Math.max(Math.abs(lo), Math.abs(hi), 1e-4) * 1.3;
  const X = (v: number) => L + ((v + ext) / (2 * ext)) * (W - L - R);
  const y = 66;
  const color = sig ? "var(--clay)" : "var(--ink-muted)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`B minus A is ${pts(diff)}, with a 95% range from ${pts(lo)} to ${pts(hi)}. ${lo > 0 || hi < 0 ? "The range does not cross zero." : "The range crosses zero."}`}>
      <text x={L} y={16} fontSize="12" fill="var(--ink-muted)">
        ← A better
      </text>
      <text x={W - R} y={16} textAnchor="end" fontSize="12" fill="var(--ink-muted)">
        B better →
      </text>
      <line x1={L} x2={W - R} y1={y} y2={y} stroke="var(--line-strong)" />
      <line x1={X(0)} x2={X(0)} y1={26} y2={y + 22} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={X(0)} y={H - 10} textAnchor="middle" fontSize="12" fill="var(--ink)">
        no difference
      </text>
      <line x1={X(lo)} x2={X(hi)} y1={y} y2={y} stroke={color} strokeWidth={8} strokeLinecap="round" strokeOpacity={0.55} />
      <circle cx={X(diff)} cy={y} r={7} fill="var(--paper)" stroke={color} strokeWidth={3} />
      <text x={X(diff)} y={y - 16} textAnchor="middle" className="font-mono" fontSize="12" fill="var(--ink)" stroke="var(--sand)" strokeWidth={4} paintOrder="stroke">
        {pts(diff)}
      </text>
    </svg>
  );
}
