import { DATA, TOPIC_IDS, type TopicId } from "./data";
import { Phi, PhiInv, Z, binom, choose, fmt, localDay, mean, median, parseAnswer, pick, pois, r2, r3, ri, sd, sum, tcrit, type Conf } from "./math";

/** A drill question with fresh numbers. Numeric answers are checked to 2% or 0.01; text answers by word. */
export type Question = {
  q: string;
  a: number | string | string[];
  why: string;
  /** A word answer (yes, no, stratified, Type I). */
  text?: boolean;
  /** Whole-number answers (sample sizes, counts) must match after rounding. */
  exact?: boolean;
  mod: TopicId;
};
type Gen = () => Omit<Question, "mod">;

const K = DATA.K;
const sorted = (a: number[]) => a.slice().sort((x, y) => x - y);

// One generator per topic. The numbers vary every time; the wording and the checks do not.
const G: Record<TopicId, Gen> = {
  data: () => {
    const q = pick(K.dataQs);
    return { q: q[0], a: q[1], why: q[2], text: true };
  },
  center: () => {
    const n = pick([5, 6, 7, 8]);
    const a = Array.from({ length: n }, () => ri(2, 30));
    const kind = pick(["mean", "median"] as const);
    return {
      q: `Find the ${kind} of ${a.join(", ")}`,
      a: kind === "mean" ? mean(a) : median(a),
      why: kind === "mean" ? `Sum ${sum(a)} ÷ ${n}` : `Sorted: ${sorted(a).join(", ")}${n % 2 ? ", the middle value" : ", the average of the two middle values"}`,
    };
  },
  spread: () => {
    const t = pick(["range", "var", "sd", "emp", "emp2", "z"] as const);
    if (t === "range") {
      const a = Array.from({ length: 6 }, () => ri(-40, 120));
      const hi = Math.max(...a), lo = Math.min(...a);
      return { q: `Range of ${a.join(", ")}`, a: hi - lo, why: `${hi} minus ${lo}` };
    }
    if (t === "var" || t === "sd") {
      const base = ri(5, 40);
      const b = Array.from({ length: 4 }, () => base + ri(-6, 6));
      const s2 = sd(b) ** 2;
      return {
        q: `${t === "var" ? "Sample variance" : "Sample standard deviation"} of ${b.join(", ")}`,
        a: t === "var" ? s2 : Math.sqrt(s2),
        why: `Mean ${fmt(mean(b))}, add the squared gaps, divide by n − 1 = 3${t === "sd" ? ", then take the square root" : ""}`,
      };
    }
    if (t === "emp") {
      const m = pick([100, 150, 200, 500]), s = pick([10, 20, 25, 50]), k = pick([1, 2, 3] as const);
      const p = { 1: "68", 2: "95", 3: "99.7" }[k], side = pick(["lower", "upper"]);
      return {
        q: `Hill-shaped data, mean ${m}, SD ${s}. What is the ${side} end of the band that holds ${p}% of the data?`,
        a: side === "lower" ? m - k * s : m + k * s,
        why: `${p}% is ± ${k} SD`,
      };
    }
    if (t === "emp2") {
      const m = pick([100, 150, 200]), s = pick([10, 20]), c = pick([1, 2] as const);
      return {
        q: `Mean ${m}, SD ${s}, bell shaped. What percent of values are above ${m + c * s}? Type the percent, like 16.`,
        a: { 1: 16, 2: 2.5 }[c],
        why: c === 1 ? "32% sit outside 1 SD, half on top" : "5% sit outside 2 SD, half on top",
      };
    }
    const m = pick([100, 150, 200]), s = pick([10, 20, 25]), x = m + pick([-3, -2, -1.5, -1, 1, 1.5, 2, 3]) * s;
    return { q: `Mean ${m}, SD ${s}. How many SDs from the mean is ${x}? The sign matters.`, a: (x - m) / s, why: `(${x} − ${m}) / ${s}` };
  },
  prob: () => {
    const t = pick(["or", "given", "and", "tree", "comp", "indep"] as const), TR = K.tree;
    if (t === "or") {
      const pa = pick([0.3, 0.4, 0.5]), pb = pick([0.2, 0.3, 0.4]), pab = pick([0.1, 0.15]);
      return { q: `P(A) = ${pa}, P(B) = ${pb}, P(A and B) = ${pab}. P(A or B)?`, a: pa + pb - pab, why: `${pa} + ${pb} − ${pab}` };
    }
    if (t === "given") {
      const A = ri(40, 80), both = ri(10, A - 10);
      return {
        q: `Of 100 customers, ${A} have a credit card and ${both} have a credit card and a loan. P(loan | credit card)? Answer as a decimal.`,
        a: both / A,
        why: `${both} ÷ ${A}; the given is the denominator`,
      };
    }
    if (t === "and") {
      const h = pick([13, 26, 4] as const), lbl = { 13: "hearts", 26: "red cards", 4: "aces" }[h];
      return { q: `Draw two cards from a pack of 52 without replacement. P(both are ${lbl})?`, a: (h / 52) * ((h - 1) / 51), why: `${h}/52 × ${h - 1}/51` };
    }
    if (t === "tree") {
      const pt = pick([0.6, 0.7, 0.75, 0.8]), pm = pick([0.8, 0.9]), pl = pick([0.5, 0.6]), w = pick(["both", "overall", "rev"]);
      const b2 = pt * pm, all = pt * pm + (1 - pt) * pl;
      if (w === "both") return { q: `P(${TR.a}) = ${pt}. P(${TR.b} | ${TR.a}) = ${pm}. P(${TR.a} and ${TR.b})?`, a: b2, why: `${pt} × ${pm}` };
      const pre = `P(${TR.a}) = ${pt}, P(${TR.bShort} | ${TR.a}) = ${pm}, P(${TR.bShort} | ${TR.na}) = ${pl}.`;
      if (w === "overall") return { q: `${pre} P(${TR.b})?`, a: all, why: `${pt} × ${pm} + ${(1 - pt).toFixed(2)} × ${pl}` };
      return { q: `${pre} Given ${TR.given}, P(${TR.a})?`, a: b2 / all, why: `${fmt(b2)} ÷ ${fmt(all)}` };
    }
    if (t === "comp") {
      const p = pick([0.1, 0.2, 0.3]), n = pick([3, 4, 5]);
      return { q: `${Math.round(p * 100)}% ${K.comp.what}. Pick ${n} at random. P(at least one ${K.comp.one})?`, a: 1 - (1 - p) ** n, why: `1 − ${(1 - p).toFixed(1)}^${n}` };
    }
    const pA = pick([0.3, 0.4, 0.5]), pB = pick([0.2, 0.4, 0.6]), ind = pick([true, false]);
    const pAB = ind ? pA * pB : r2(pA * pB + pick([0.05, 0.1]));
    return {
      q: `P(A) = ${pA}, P(B) = ${pB}, P(A and B) = ${fmt(pAB)}. Independent? Type yes or no.`,
      a: ind ? "yes" : "no",
      why: `Independent only if P(A and B) = P(A)P(B) = ${fmt(pA * pB)}`,
      text: true,
    };
  },
  rv: () => {
    const xs = [ri(-20, 0), ri(5, 15), ri(20, 30), ri(35, 50)];
    const ps = pick([[0.1, 0.4, 0.3, 0.2], [0.2, 0.3, 0.3, 0.2], [0.15, 0.35, 0.35, 0.15], [0.25, 0.25, 0.25, 0.25]]);
    let mu = 0, v = 0;
    for (let i = 0; i < 4; i++) mu += xs[i] * ps[i];
    for (let i = 0; i < 4; i++) v += (xs[i] - mu) ** 2 * ps[i];
    const t = pick(["mean", "sd", "shift", "cost"] as const), tbl = xs.map((x, j) => `${x} (${ps[j]})`).join(", ");
    if (t === "cost") {
      const pc = pick([[0.45, 0.25, 0.15, 0.1, 0.05], [0.4, 0.3, 0.15, 0.1, 0.05], [0.6, 0.2, 0.1, 0.05, 0.05]]), cost = pick([40, 75, 120]);
      const ec = pc.reduce((s, p, j) => s + j * p, 0);
      return {
        q: `Service visits per customer in a year (probability): ${pc.map((p, j) => `${j} (${p})`).join(", ")}. Each visit costs $${cost}. Expected cost per customer?`,
        a: ec * cost,
        why: `E(visits) = ${fmt(ec)}, then × ${cost}, since E(cY) = c · E(Y)`,
      };
    }
    if (t === "mean") return { q: `Return Y takes values (probability): ${tbl}. E(Y)?`, a: mu, why: "Σ y P(y)" };
    if (t === "sd") return { q: `Return Y takes values (probability): ${tbl}. SD(Y)?`, a: Math.sqrt(v), why: `μ = ${fmt(mu)}, variance ${fmt(v)}, then the square root` };
    const c = pick([5, 10, 20]);
    return { q: `E(Y) = ${fmt(mu)} and SD(Y) = ${fmt(Math.sqrt(v))}. SD of (Y + ${c})?`, a: Math.sqrt(v), why: "Adding a constant shifts the mean, not the spread" };
  },
  two: () => {
    const t = pick(["rho", "pm", "pv"] as const), s1 = pick([8, 10, 12]), s2 = pick([12, 15, 20]), cov = pick([20, 40, 60, -30]);
    if (t === "rho") return { q: `σx = ${s1}, σy = ${s2}, Cov = ${cov}. Correlation?`, a: cov / (s1 * s2), why: `${cov} / (${s1} × ${s2})` };
    const w = pick([0.3, 0.4, 0.5, 0.6]), e1 = pick([6, 8, 10]), e2 = pick([12, 14, 16]), w2 = (1 - w).toFixed(1);
    if (t === "pm") return { q: `E(X) = ${e1}%, E(Y) = ${e2}%. Expected return of ${w}X + ${w2}Y?`, a: w * e1 + (1 - w) * e2, why: `${w} × ${e1} + ${w2} × ${e2}` };
    const vv = w * w * s1 * s1 + (1 - w) ** 2 * s2 * s2 + 2 * w * (1 - w) * cov;
    return { q: `σx = ${s1}, σy = ${s2}, Cov = ${cov}. SD of ${w}X + ${w2}Y?`, a: Math.sqrt(vv), why: `b²V(X) + c²V(Y) + 2bc · Cov = ${fmt(vv)}, then the square root` };
  },
  count: () => {
    const t = pick(["exact", "atmost", "atleast", "mean", "comb", "hyper"] as const), n = pick([4, 5, 6, 8, 10]), p = pick([0.1, 0.2, 0.25, 0.3, 0.5]);
    if (t === "hyper") {
      const N = pick([10, 12, 15, 20]), Kd = pick([2, 3, 4, 5]), m = pick([3, 4, 5]), k = ri(0, Math.min(2, Kd));
      return {
        q: `A box of ${N} parts has ${Kd} defective. Pick ${m} without replacement. P(exactly ${k} defective)?`,
        a: (choose(Kd, k) * choose(N - Kd, m - k)) / choose(N, m),
        why: `Hypergeometric: C(${Kd}, ${k}) × C(${N - Kd}, ${m - k}) / C(${N}, ${m})`,
      };
    }
    if (t === "comb") {
      const nn = pick([5, 6, 7, 8]), k = pick([2, 3]);
      return { q: `How many ways to choose ${k} from ${nn}, order not mattering?`, a: choose(nn, k), why: `${nn}C${k}` };
    }
    if (t === "mean") return { q: `Binomial with n = ${n}, p = ${p}. Expected number of successes?`, a: n * p, why: "np" };
    const k = ri(0, Math.min(3, n));
    if (t === "exact") return { q: `n = ${n}, p = ${p}. P(exactly ${k} successes)?`, a: binom(k, n, p), why: `${n}C${k} × ${p}^${k} × ${1 - p}^${n - k}` };
    if (t === "atmost") {
      let s = 0;
      for (let i = 0; i <= k; i++) s += binom(i, n, p);
      return { q: `n = ${n}, p = ${p}. P(at most ${k})?`, a: s, why: `Add P(0) through P(${k})` };
    }
    return { q: `n = ${n}, p = ${p}. P(at least 1)?`, a: 1 - (1 - p) ** n, why: `1 − ${1 - p}^${n}` };
  },
  poisson: () => {
    const rate = pick([1, 2, 3, 4, 6]), win = pick([1, 2, 3]), unit = pick(["minute", "minute", "hour"]), lam = rate * win;
    const t = pick(["exact", "atmost", "zero", "atleast", "given"] as const), k = ri(0, 4);
    const pre = `Arrivals average ${rate} per ${unit}. Over ${win} ${unit}${win > 1 ? "s" : ""}, `;
    if (t === "given") {
      const lg = pick([0.5, 1, 1.5, 2, 3]), kg = pick([1, 1, 2]);
      return {
        q: `Calls average ${lg} per minute. Given at least one call in a minute, P(exactly ${kg})?`,
        a: pois(kg, lg) / (1 - pois(0, lg)),
        why: `λ = ${lg}: P(${kg}) / (1 − P(0)). Knowing at least one happened rules out zero.`,
      };
    }
    if (t === "zero") return { q: `${pre}P(no arrivals)?`, a: pois(0, lam), why: `λ = ${lam}, e^−${lam}` };
    if (t === "exact") return { q: `${pre}P(exactly ${k})?`, a: pois(k, lam), why: `λ = ${lam}: e^−λ λ^${k} / ${k}!` };
    if (t === "atmost") {
      let s = 0;
      for (let i = 0; i <= k; i++) s += pois(i, lam);
      return { q: `${pre}P(at most ${k})?`, a: s, why: `λ = ${lam}, add P(0) through P(${k})` };
    }
    return { q: `${pre}P(at least 2)?`, a: 1 - pois(0, lam) - pois(1, lam), why: `λ = ${lam}: 1 − P(0) − P(1)` };
  },
  normal: () => {
    const mu = pick(K.normalMu), s = pick(K.normalSd), t = pick(["less", "more", "between", "inv", "z", "unif"] as const);
    const x = mu + pick([-2, -1.5, -1, -0.5, 0.25, 0.5, 1, 1.5, 2]) * s, N = `Y ~ N(${mu}, ${s}).`;
    if (t === "unif") {
      const ua = pick([0, 10, 20]), uw = pick([10, 20, 30, 60]), uc = ua + uw * pick([0.25, 0.5, 0.6, 0.75, 0.9]);
      if (pick(["p", "sd"]) === "sd") return { q: `A wait is uniform from ${ua} to ${ua + uw} minutes. Its SD?`, a: uw / Math.sqrt(12), why: `(b − a) / √12 = ${uw} / √12` };
      return { q: `A wait is uniform from ${ua} to ${ua + uw} minutes. P(wait more than ${uc})?`, a: (ua + uw - uc) / uw, why: `Flat, so a rectangle: (${ua + uw} − ${uc}) / ${uw}` };
    }
    if (t === "z") return { q: `${N} z score for y = ${x}?`, a: (x - mu) / s, why: `(${x} − ${mu}) / ${s}` };
    if (t === "less") return { q: `${N} P(Y < ${x})?`, a: Phi((x - mu) / s), why: `z = ${fmt((x - mu) / s)}, the area to the left` };
    if (t === "more") return { q: `${N} P(Y > ${x})?`, a: 1 - Phi((x - mu) / s), why: `z = ${fmt((x - mu) / s)}, 1 minus the area to the left` };
    if (t === "between") {
      const x2 = x + pick([1, 1.5, 2]) * s;
      return { q: `${N} P(${x} < Y < ${x2})?`, a: Phi((x2 - mu) / s) - Phi((x - mu) / s), why: `Φ(${fmt((x2 - mu) / s)}) − Φ(${fmt((x - mu) / s)})` };
    }
    const pp = pick([0.9, 0.95, 0.99, 0.1, 0.05]), pc = Math.round((1 - pp) * 100);
    const lab = pp > 0.5 ? `Only ${pc}% of values exceed what number?` : `What value is exceeded by ${pc}% of values?`;
    return { q: `${N} ${lab}`, a: mu + PhiInv(pp) * s, why: `z = ${fmt(PhiInv(pp))}, y = μ + zσ` };
  },
  clt: () => {
    const mu = pick(K.cltMu), s = pick(K.cltSd), n = pick([25, 36, 49, 64, 100]), se = s / Math.sqrt(n);
    const t = pick(["se", "prob", "probp", "sum", "every", "bias"] as const);
    if (t === "every") {
      const pv = pick([[2, 4, 6, 8], [1, 2, 3, 6], [10, 20, 30, 40], [0, 2, 4, 10]]), pm = mean(pv);
      const psd = Math.sqrt(pv.reduce((a, x) => a + (x - pm) ** 2, 0) / 4), en = pick([2, 3]), w = pick(["count", "avg", "se"]);
      const pre = `A population is just the four values ${pv.join(", ")}. List every sample of n = ${en}, drawn with replacement. `;
      if (w === "count") return { q: `${pre}How many samples are there?`, a: 4 ** en, why: `4 choices for each of ${en} draws: 4^${en}`, exact: true };
      if (w === "avg") return { q: `${pre}What do all the sample means average?`, a: pm, why: `x̄ is unbiased: the average of every x̄ is μ = ${fmt(pm)}` };
      return { q: `${pre}SD of all the sample means?`, a: psd / Math.sqrt(en), why: `σ = ${fmt(r3(psd))} (divide by N = 4 for a population), then σ / √${en}` };
    }
    if (t === "bias") {
      const pv = pick([16, 25, 36, 100]), bn = pick([2, 4, 5, 10]);
      return {
        q: `σ² = ${pv}. For samples of n = ${bn} you average the squared deviations, dividing by n instead of n − 1. Across all samples, what does that statistic average?`,
        a: (pv * (bn - 1)) / bn,
        why: `Dividing by n runs low: (n − 1)/n × σ² = ${bn - 1}/${bn} × ${pv}. Dividing by n − 1 fixes it, which is why s² does.`,
      };
    }
    if (t === "se") return { q: `Population σ = ${s}, sample n = ${n}. Standard error of x̄?`, a: se, why: `${s} / √${n}` };
    if (t === "prob") {
      const x = mu + pick([-2, -1, 1, 2]) * se, side = pick(["<", ">"]);
      return {
        q: `μ = ${mu}, σ = ${s}, n = ${n}. P(x̄ ${side} ${fmt(x)})?`,
        a: side === "<" ? Phi((x - mu) / se) : 1 - Phi((x - mu) / se),
        why: `SE = ${fmt(se)}, z = ${fmt((x - mu) / se)}`,
      };
    }
    if (t === "probp") {
      const p = pick([0.3, 0.4, 0.5, 0.6]), nn = pick([100, 200, 400]), sep = Math.sqrt((p * (1 - p)) / nn), ph = r2(p + pick([0.03, 0.05]));
      return { q: `True p = ${p}, n = ${nn}. P(p̂ > ${ph})?`, a: 1 - Phi((ph - p) / sep), why: `SE = ${fmt(sep)}, z = ${fmt((ph - p) / sep)}` };
    }
    const nn = pick([25, 50]);
    return { q: `Each of ${nn} ${K.cltItem} has mean ${mu} and SD ${s}. SD of the total of all ${nn}?`, a: s * Math.sqrt(nn), why: "σ√n" };
  },
  ci: () => {
    // Draw order matches the original engine, so Monte Daily deals the same questions it always did.
    const t = pick(["z", "t", "p", "nmu", "np", "np2"] as const);
    const conf = () => pick([90, 95, 99] as Conf[]), lowUp = () => pick(["lower", "upper"]);
    if (t === "z") {
      const xb = pick(K.ciZ.xb), s = pick(K.ciZ.s), n = pick([16, 25, 36, 64]), c = conf(), side = lowUp(), m = (Z[c] * s) / Math.sqrt(n);
      return { q: `x̄ = ${xb}, σ = ${s} (known), n = ${n}. The ${side} limit of a ${c}% CI for μ?`, a: side === "lower" ? xb - m : xb + m, why: `z = ${Z[c]}, margin ${fmt(m)}` };
    }
    if (t === "t") {
      const xb = pick(K.ciT.xb), s = pick(K.ciT.s), n = pick([16, 20, 25]), c = conf(), tc = tcrit(n - 1, c), m = (tc * s) / Math.sqrt(n), side = lowUp();
      return { q: `x̄ = ${xb}, s = ${s} (sample), n = ${n}. The ${side} limit of a ${c}% CI? Use t.`, a: side === "lower" ? xb - m : xb + m, why: `t with ${n - 1} df = ${tc}, margin ${fmt(m)}` };
    }
    if (t === "p") {
      const nn = pick(K.ciP.nn), y = ri(Math.round(nn * 0.3), Math.round(nn * 0.7)), c = conf(), ph = y / nn, m = Z[c] * Math.sqrt((ph * (1 - ph)) / nn), side = lowUp();
      return { q: `${y} of ${nn} ${K.ciP.verb}. The ${side} limit of a ${c}% CI for p?`, a: side === "lower" ? ph - m : ph + m, why: `p̂ = ${fmt(ph)}, margin ${fmt(m)}` };
    }
    if (t === "nmu") {
      const sig = pick(K.ciN.sig), E = pick(K.ciN.E), c = conf();
      return { q: `σ is about ${sig}. Sample size to estimate μ within ± ${E} at ${c}%? Round up.`, a: Math.ceil(((Z[c] * sig) / E) ** 2), why: `(${Z[c]} × ${sig} / ${E})²`, exact: true };
    }
    if (t === "np") {
      const E = pick([0.02, 0.03, 0.05]), c = pick([90, 95] as Conf[]);
      return { q: `Sample size for a ${c}% CI on a proportion with margin ± ${E}, no prior estimate?`, a: Math.ceil((Z[c] / E) ** 2 * 0.25), why: "z² × 0.25 / E², worst case p = 0.5", exact: true };
    }
    const E = pick([0.02, 0.05]), pr = pick(K.ciNp2), c = pick([90, 95] as Conf[]);
    return { q: `Prior estimate p ≈ ${pr}. Sample size for a ${c}% CI with margin ± ${E}?`, a: Math.ceil((Z[c] / E) ** 2 * pr * (1 - pr)), why: "z² p(1 − p) / E²", exact: true };
  },
  test: () => {
    const t = pick(["z", "p", "dec", "prop", "t", "err"] as const);
    if (t === "z") {
      const mu = pick([50, 100, 250, 500]), s = pick([4, 6, 10, 12]), n = pick([16, 25, 36, 64]), se = s / Math.sqrt(n);
      const xb = r2(mu + pick([-2.5, -2, -1.5, 1, 1.8, 2.2]) * se);
      return { q: `H₀: μ = ${mu}. σ = ${s}, n = ${n}, x̄ = ${xb}. Test statistic z?`, a: (xb - mu) / se, why: `(x̄ − μ₀) / (σ / √n) = (${xb} − ${mu}) / ${fmt(se)}` };
    }
    if (t === "p") {
      const z = pick([1.5, 1.8, 2, 2.2, 2.5, 2.8, -1.6, -2.1, -2.4]), two = pick([true, false]), az = Math.abs(z);
      return {
        q: `Test statistic z = ${z}. ${two ? "Two-sided" : "One-sided, in the direction of z"} p-value?`,
        a: two ? 2 * (1 - Phi(az)) : 1 - Phi(az),
        why: two ? `2 × P(Z > ${az})` : `P(Z > ${az})`,
      };
    }
    if (t === "dec") {
      const pv = pick([0.003, 0.012, 0.034, 0.048, 0.06, 0.09, 0.2]), al = pick([0.01, 0.05, 0.1]), rj = pv < al;
      return { q: `p-value = ${pv}, α = ${al}. Reject H₀? Type yes or no.`, a: rj ? "yes" : "no", why: rj ? "p < α, so reject H₀" : "p ≥ α, so fail to reject H₀", text: true };
    }
    if (t === "prop") {
      const p0 = pick([0.3, 0.4, 0.5, 0.6]), nn = pick([100, 200, 400]), ph = r2(p0 + pick([-0.06, -0.04, 0.05, 0.07])), se = Math.sqrt((p0 * (1 - p0)) / nn);
      return { q: `H₀: p = ${p0}. A sample of ${nn} gives p̂ = ${ph}. Test statistic z?`, a: (ph - p0) / se, why: `The SE uses p₀: √(${p0} × ${r2(1 - p0)} / ${nn}) = ${fmt(se)}` };
    }
    if (t === "t") {
      const mu = pick([20, 72, 500]), s = pick([3, 8, 12]), n = pick([9, 16, 25]), xb = r2(mu + (pick([-2.4, -1.9, 1.5, 2.1]) * s) / Math.sqrt(n));
      return { q: `H₀: μ = ${mu}. A sample of ${n} has x̄ = ${xb} and s = ${s}. t statistic?`, a: (xb - mu) / (s / Math.sqrt(n)), why: `(x̄ − μ₀) / (s / √n), with ${n - 1} df` };
    }
    const e = pick([
      ["A test rejects H₀, but H₀ was true.", "I"],
      ["A test keeps H₀, but H₀ was false.", "II"],
      ["A fraud check flags an honest transaction.", "I"],
      ["A screening test misses a real problem.", "II"],
    ]);
    return {
      q: `${e[0]} Type I or Type II error? Type I or II.`,
      a: e[1] === "I" ? ["i", "typei", "one", "typeone", "1", "type1"] : ["ii", "typeii", "two", "typetwo", "2", "type2"],
      why: e[1] === "I" ? "Type I: a false alarm, rejecting a true H₀" : "Type II: a missed signal, keeping a false H₀",
      text: true,
    };
  },
  reg: () => {
    const t = pick(["slope", "pred", "r2", "t", "r"] as const);
    if (t === "slope" || t === "pred") {
      const b0 = pick(K.regB0), b1 = pick(K.regB1);
      if (t === "slope") return { q: `Fitted line: y = ${b0} + ${b1}x. If x rises by 3, predicted y changes by?`, a: 3 * b1, why: "3 × slope" };
      const x = pick([4, 7, 10]);
      return { q: `Fitted line: y = ${b0} + ${b1}x. Predict y at x = ${x}.`, a: b0 + b1 * x, why: `${b0} + ${b1} × ${x}` };
    }
    if (t === "r2") {
      const ssr = pick(K.regSsr), sse = pick(K.regSse);
      return { q: `SSR = ${ssr}, SSE = ${sse}. R²?`, a: ssr / (ssr + sse), why: `SSR / SST, with SST = ${fmt(ssr + sse)}` };
    }
    if (t === "t") {
      const b = pick(K.regTb), se = pick(K.regTse);
      return { q: `Slope b₁ = ${b}, SE = ${se}. t statistic?`, a: b / se, why: "b₁ / SE" };
    }
    const r2v = pick([0.64, 0.81, 0.49]), sgn = pick([1, -1]);
    return { q: `R² = ${r2v} and the slope is ${sgn > 0 ? "positive" : "negative"}. Correlation r?`, a: sgn * Math.sqrt(r2v), why: "±√R², with the sign of the slope" };
  },
  mreg: () => {
    const t = pick(["vif", "f", "dum", "adj"] as const);
    if (t === "vif") {
      const rj = pick(K.mregVif);
      return { q: `Regressing x₁ on the other x's gives R² = ${rj}. VIF for x₁?`, a: 1 / (1 - rj), why: `1 / (1 − ${rj})` };
    }
    if (t === "f") {
      const msr = pick(K.mregMsr), mse = pick(K.mregMse);
      return { q: `MSR = ${msr}, MSE = ${mse}. F statistic?`, a: msr / mse, why: "MSR / MSE" };
    }
    if (t === "dum") {
      const k = pick([2, 3, 4, 5]);
      return { q: `A qualitative variable has ${k} categories. How many dummy variables?`, a: k - 1, why: "k − 1", exact: true };
    }
    const sse = pick(K.mregSse), sst = pick(K.mregSst), n = pick(K.mregN), k = pick([2, 3]);
    return {
      q: `SSE = ${sse}, SST = ${sst}, n = ${n}, k = ${k}. Adjusted R²?`,
      a: 1 - sse / (n - k - 1) / (sst / (n - 1)),
      why: "1 − [SSE / (n − k − 1)] / [SST / (n − 1)]",
    };
  },
};

export const generate = (id: TopicId): Question => ({ ...G[id](), mod: id });

/** The answer as shown after checking. */
export const shownAnswer = (q: Question) => (q.text ? (Array.isArray(q.a) ? q.a[0] : String(q.a)) : fmt(q.a as number));

/** True when what the student typed matches the answer. A percent counts for a probability (42% for 0.42). */
export function isCorrect(q: Question, raw: string) {
  if (q.text) {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (Array.isArray(q.a) ? q.a : [String(q.a)]).map(clean).includes(clean(raw));
  }
  const a = q.a as number;
  let v = parseAnswer(raw);
  if (raw.includes("%") && !q.exact && Math.abs(a) <= 1) v /= 100;
  if (Number.isNaN(v)) return false;
  if (q.exact) return Math.round(v) === Math.round(a);
  return Math.abs(v - a) <= Math.max(Math.abs(a) * 0.02, 0.01);
}

// ---------- Monte Daily: the same five questions for everyone on a given local date
function seeded(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Today's date in this browser's time zone, YYYY-MM-DD. */
export const dayKey = () => localDay(Date.now());
/** The generators read Math.random, so the seeded draw swaps it in for the five calls and restores it. */
export function dailyQuestions(key = dayKey()): Question[] {
  const rnd = seeded(+key.replace(/-/g, "")), orig = Math.random, ids = TOPIC_IDS.slice();
  Math.random = rnd;
  try {
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids.slice(0, 5).map(generate);
  } finally {
    Math.random = orig;
  }
}
