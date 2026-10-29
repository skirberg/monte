"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "cn";
import { DATA, type TopicId } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { norm } from "@/lib/study/search";
import { useLearnQuery } from "@/components/study/learn-bar";
import { PageHead, blockTitle, btn, lead } from "@/components/study/ui";
import { sym } from "@/lib/study/symbols";

// "Which formula?": a few plain questions that end at the formula and its topic.
const CH: Record<string, { q: string; opts: [label: string, next: string][] }> = {
  start: { q: "What is the question about?", opts: [["Describing a list of numbers", "desc"], ["The chance of something happening", "prob"], ["Guessing about a big group from a sample", "inf"], ["How one thing relates to another", "rel"]] },
  desc: { q: "Which part?", opts: [["Where the middle is", "r_center"], ["How spread out it is", "r_spread"], ["A random variable with a probability table", "r_rv"]] },
  prob: {
    q: "What shape is it?",
    opts: [
      ["A few events, maybe overlapping, like cards or a two-way table", "r_rules"],
      ["A fixed number of independent tries, each a success or failure with the same chance; count the successes", "r_binom"],
      ["A count of events in a stretch of time or space, happening independently at a steady rate, with no set maximum", "r_pois"],
      ["One measurement that is roughly normal (bell-shaped), with its mean and SD", "r_norm"],
    ],
  },
  inf: {
    q: "What do you have?",
    opts: [
      ["A claim about μ or p to check with a sample", "r_test"],
      ["A known μ and σ, and a question about the average of a sample", "r_clt"],
      ["A sample mean, and you want a range for the true mean", "ci_mean"],
      ["A sample proportion, and you want a range for the true p", "r_cip"],
      ["A margin of error, and you want to know how many to sample", "r_n"],
    ],
  },
  ci_mean: { q: "Do you know the population σ?", opts: [["Yes, σ is given", "r_ciz"], ["No, only s from the sample", "r_cit"]] },
  rel: { q: "How many predictors?", opts: [["One x predicting y", "r_reg"], ["Several x's", "r_mreg"], ["Two random variables: do they move together?", "r_cov"]] },
};
const RES: Record<string, [title: string, body: string, topic: TopicId]> = {
  r_center: ["Mean, median, mode", "x̄ = Σx/n. Median: sort, take the middle. Mode: most frequent. With outliers, use the median.", "center"],
  r_spread: ["Variance and SD", "s² = Σ(x − x̄)²/(n − 1), s = √s². Empirical rule for hill-shaped data: 68, 95, 99.7.", "spread"],
  r_rv: ["Expected value and variance of a random variable", "μ = Σ y·P(y). σ² = Σ y²P(y) − μ². Constants: E(a + bY) = a + bμ, Var = b²σ².", "rv"],
  r_rules: ["The three moves", "Or: add, subtract the overlap. And: multiply, updating counts without replacement. Given: shrink to the given, count inside. Independent if P(A given B) = P(A).", "prob"],
  r_binom: ["Binomial", "P(y) = nCy pʸ(1 − p)ⁿ⁻ʸ. Mean np, variance np(1 − p). At least one = 1 − P(0). Holds only if the tries are independent with the same p; drawing without replacement from a small group breaks it.", "count"],
  r_pois: ["Poisson", "Rescale λ = rate × window. P(y) = e^−λ λʸ/y!. Mean = variance = λ. Holds only if events happen independently at a steady rate.", "poisson"],
  r_norm: ["Normal and z", "z = (y − μ)/σ. Less than: Φ(z). More than: 1 − Φ(z). Reverse: y = μ + zσ. Only for values that are roughly normal; for skewed values like incomes or wait times, this answer can be far off.", "normal"],
  r_clt: ["Sampling distribution of the mean", "x̄ has mean μ and SE = σ/√n. z = (x̄ − μ)/(σ/√n). Totals: mean nμ, SD σ√n. x̄ is close to normal when the values are normal, or when n is large enough (larger for skewed values). Needs independent draws.", "clt"],
  r_ciz: ["CI for μ, σ known", "x̄ ± z·σ/√n. z = 1.645, 1.96, 2.576.", "ci"],
  r_cit: ["CI for μ, σ unknown", "x̄ ± t(n − 1)·s/√n. Look up t in the 0.025 or 0.005 column. Needs a random sample; with a small n, the values should be roughly normal.", "ci"],
  r_cip: ["CI for a proportion", "p̂ ± z√[p̂(1 − p̂)/n]. Check np̂ ≥ 10 and n(1 − p̂) ≥ 10.", "ci"],
  r_test: ["Hypothesis test", "Statistic = (estimate − H₀ value) / SE. p-value below α: reject H₀. For p, the SE uses p₀.", "test"],
  r_n: ["Sample size", "For μ: n = (zσ/E)². For p: n = z²p(1 − p)/E², with p = 0.5 if unknown. E is half the interval length. Round up.", "ci"],
  r_reg: ["Simple regression", "b₁ = [nΣxy − ΣxΣy]/[nΣx² − (Σx)²], b₀ = ȳ − b₁x̄. R² = SSR/SST. t = b₁/SE, df = n − 2.", "reg"],
  r_mreg: ["Multiple regression", "F = MSR/MSE for the whole model. t = bⱼ/SE for each x. VIF above 10 means two x's overlap. k categories need k − 1 dummies.", "mreg"],
  r_cov: ["Covariance and correlation", "Cov = ΣΣxyP(x,y) − μxμy. ρ = Cov/(σxσy). Var(bX + cY) = b²V(X) + c²V(Y) + 2bc·Cov.", "two"],
};

const READING = [
  ["at least one", "1 − P(none)", "Probability, binomial", "Works when none is easy to find, such as independent tries."],
  ["claim, significant, evidence that, test at 5%", "Hypothesis test: (estimate − H₀) / SE, then the p-value", "Hypothesis tests", "Which parameter, one sample or two, one side or two."],
  ["given, of those, among", "Conditional: shrink the world", "Probability", "Which group is the given? It goes on the bottom."],
  ["average of n, sample mean, total of n", "Standard error σ/√n, or σ√n for a total", "CLT", "Is it really about an average, not one value? Independent draws, and normal values or a large enough n."],
  ["per minute, per hour, arrivals, occurrences", "Often Poisson; rescale λ to the window", "Poisson", "A count with no set maximum, events independent at a steady rate. The time until the next arrival is not a Poisson count."],
  ["n trials, each a success or failure, how many", "Often binomial", "Binomial", "The same chance each try, and independent tries."],
  ["within ± E, margin, how many to sample", "Sample size, round up", "Confidence intervals", "With no guess for p, use 0.5."],
  ["length of the interval", "E is half the length", "Confidence intervals", ""],
  ["s instead of σ, small n", "t, not z", "Confidence intervals", "The values roughly normal, or n large enough."],
  ["holding the others fixed", "A multiple regression coefficient", "Multiple regression", "Still an association, not a cause, unless the data came from an experiment."],
];
const SCIENCE = [
  ["Plain sentence, then example, then formula", "Concrete before abstract", "Cognitive load research (Sweller)"],
  ["A picture next to every idea", "Dual coding", "Paivio; Mayer's multimedia principles"],
  ["Solved problems with the answer highlighted", "Worked examples", "Sweller's worked-example effect"],
  ["One story, three questions; many stories, one question", "Examples that show the structure, not the story", "Quilici and Mayer (1996)"],
  ["A worked example first, then cases whose prompts drop away", "From studying examples to solving alone", "Renkl and Atkinson (2003)"],
  ["Quiz mode and drills", "Retrieval practice", "Roediger and Karpicke; rated high utility in Dunlosky et al. (2013)"],
  ["Missed questions come back later", "Spaced practice", "Cepeda et al.; rated high utility in Dunlosky et al. (2013)"],
  ["Drills mix topics", "Interleaving", "Rohrer and Taylor; rated moderate utility in Dunlosky et al. (2013)"],
];

function Chooser() {
  const [path, setPath] = React.useState<{ label: string; node: string }[]>([]);
  const node = path.at(-1)?.node ?? "start";
  const step = CH[node], res = RES[node];
  const trail = path.length > 0 && <p className="text-sm text-ink-muted">{path.map((p) => p.label).join(", then ")}</p>;
  const reset = (
    <button type="button" className={btn.ghost} onClick={() => setPath([])}>
      Start over
    </button>
  );
  return (
    <div className="grid gap-4 rounded-[18px] border border-line bg-paper p-5 md:p-6" aria-live="polite">
      {trail}
      {step ? (
        <>
          <p className="font-display text-xl font-[650] tracking-[-0.02em]">{step.q}</p>
          <div className="grid gap-2">
            {step.opts.map(([label, next]) => (
              <button
                key={next}
                type="button"
                onClick={() => setPath([...path, { label, node: next }])}
                className="min-h-12 rounded-xl border border-line-strong px-4 py-2.5 text-left transition-colors hover:border-ink hover:bg-sand"
              >
                {sym(label)}
              </button>
            ))}
          </div>
          {path.length > 0 && <div>{reset}</div>}
        </>
      ) : (
        <div className="grid gap-3 rounded-[14px] bg-sand p-5">
          <p className="font-display text-xl font-[650] tracking-[-0.02em]">{res[0]}</p>
          <p className="tabular-nums">{sym(res[1])}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={study.topic(res[2])} className={btn.primary}>
              Open the topic
            </Link>
            {reset}
          </div>
        </div>
      )}
    </div>
  );
}

/** Rows that disappear when they do not match the search. */
function useHit() {
  const q = norm(useLearnQuery().trim());
  return (...text: string[]) => !q || norm(text.join(" ")).includes(q);
}
const listRow = "grid gap-1 py-3.5";
const threeCol = "grid gap-1 py-3 md:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)] md:items-baseline md:gap-x-4";

export function Frameworks() {
  const hit = useHit();
  const fw = DATA.fw;
  const moves = [
    ["Or", `Add them, then subtract the overlap. ${fw.orEx}`],
    ["And", "Multiply. Update the second count if there is no replacement."],
    ["Given", "Shrink the list to what you were told, then count inside it. The given goes on the bottom."],
  ];
  const fourS = [
    ["Sketch", "Draw it: a bell with the cutoff, a tree, a two-way table. Ten seconds, and you can see which side of the cutoff you want."],
    ["Set up", "Write the formula with symbols before numbers. Name μ, σ, n, p. Decide sample or population."],
    ["Solve", "Plug in. Say the ballpark out loud first, then use the calculator."],
    ["Sanity check", "Is it between 0 and 1? Is the SD smaller than the range? Is the average less noisy than one value? Put units on the answer."],
  ];
  const loop = [
    ["Learn", "One line and an example."],
    ["Lab", "Drag the control until the number makes sense."],
    ["Quiz", "Answer before you reveal."],
    ["Drill", "Fresh numbers, on a clock."],
    ["Due today", "The misses come back."],
  ];
  const numbered = (rows: string[][]) => (
    <ol className="divide-y divide-line border-y border-line">
      {rows.map(([b, s], i) =>
        hit(b, s) ? (
          <li key={b} className={cn(listRow, "grid-cols-[2rem_1fr]")}>
            <span className="font-mono text-sm text-clay-ink">{i + 1}</span>
            <span className="grid gap-0.5">
              <b>{b}</b>
              <span className="text-ink-muted">{s}</span>
            </span>
          </li>
        ) : null,
      )}
    </ol>
  );

  return (
    <div className="grid max-w-[760px] gap-8 pb-8">
      <PageHead title="Frameworks">
        <p className={cn(lead, "text-ink-muted")}>{fw.intro}</p>
      </PageHead>
      <section aria-labelledby="fw1" className="grid gap-3">
        <h2 id="fw1" className={blockTitle}>1. Which formula? Answer the questions</h2>
        <Chooser />
        <p className="text-sm text-ink-muted">
          Stuck between one value and an average?{" "}
          <Link href={study.start} className="text-clay-ink underline underline-offset-4">
            Practice telling them apart
          </Link>
          .
        </p>
      </section>
      <section aria-labelledby="fw2" className="grid gap-3">
        <h2 id="fw2" className={blockTitle}>2. The three moves in every probability question</h2>
        <ul className="divide-y divide-line border-y border-line">
          {moves.map(([b, s]) =>
            hit(b, s) ? (
              <li key={b} className={listRow}>
                <b>{b}</b>
                <span className="text-sm text-ink-muted">{sym(s)}</span>
              </li>
            ) : null,
          )}
        </ul>
      </section>
      <section aria-labelledby="fw3" className="grid gap-3">
        <h2 id="fw3" className={blockTitle}>3. Four S for any word problem</h2>
        {numbered(fourS)}
      </section>
      <section aria-labelledby="fw4" className="grid gap-3">
        <h2 id="fw4" className={blockTitle}>4. The study loop</h2>
        {numbered(loop)}
        <p className="text-sm text-ink-muted">{fw.loop}</p>
      </section>
      <section aria-labelledby="fw5" className="grid gap-3">
        <h2 id="fw5" className={blockTitle}>5. Words that are clues, not answers</h2>
        <p className="text-ink-muted">These words usually point somewhere, but the same words can sit on top of a different problem. The check says when the move holds.</p>
        <div className="divide-y divide-line border-y border-line">
          {READING.map(([words, move, go, check]) =>
            hit(words, move, go, check) ? (
              <div key={words} className={threeCol}>
                <span className="text-sm font-semibold">If it says: {words}</span>
                <span className="grid gap-0.5">
                  <span className="font-semibold">{sym(move)}</span>
                  <span className="text-sm text-ink-muted">{go}</span>
                </span>
                <span className="text-sm">{check ? `Check: ${check}` : ""}</span>
              </div>
            ) : null,
          )}
        </div>
      </section>
      <section aria-labelledby="fw6" className="grid gap-3">
        <h2 id="fw6" className={blockTitle}>6. Why the page is built this way</h2>
        <div className="divide-y divide-line border-y border-line">
          {SCIENCE.map(([what, idea, src]) =>
            hit(what, idea, src) ? (
              <div key={what} className={threeCol}>
                <span className="text-sm font-semibold">{what}</span>
                <span>{idea}</span>
                <span className="text-sm text-ink-muted">{src}</span>
              </div>
            ) : null,
          )}
        </div>
      </section>
    </div>
  );
}
