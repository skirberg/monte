/**
 * Tennis as independent points: the server wins each point with probability p.
 * Classic results, checked in tests: hold(0.5) = 0.5, hold(0.6) ≈ 0.736.
 */

/** P(server holds a game). Win 4 points before 3 are lost, or win from deuce: p²/(1 − 2pq). */
export function hold(p: number) {
  const q = 1 - p;
  const deuce = (p * p) / (1 - 2 * p * q);
  return p ** 4 * (1 + 4 * q + 10 * q * q) + 20 * p ** 3 * q ** 3 * deuce;
}

/**
 * P(you win a tiebreak to 7, by 2). You serve point 1, then serves alternate every two points.
 * a = P(you win a point on your serve), b = P(you win a point on their serve).
 */
export function tiebreak(a: number, b: number) {
  const memo = new Map<string, number>();
  const youServe = (k: number) => k === 0 || Math.floor((k - 1) / 2) % 2 === 1;
  // From 6-6 on, every pair of points has one serve each: win both, lose both, or back to level.
  const level = (a * b) / (a * b + (1 - a) * (1 - b));
  const f = (i: number, j: number): number => {
    if (i >= 7 && i - j >= 2) return 1;
    if (j >= 7 && j - i >= 2) return 0;
    if (i === 6 && j === 6) return level;
    const key = `${i}-${j}`;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    const w = youServe(i + j) ? a : b;
    const v = w * f(i + 1, j) + (1 - w) * f(i, j + 1);
    memo.set(key, v);
    return v;
  };
  return f(0, 0);
}

/**
 * P(you win a set). You serve the first game, serves alternate, tiebreak at 6-6.
 * p = your serve points won, r = their serve points won.
 */
export function setWin(p: number, r: number) {
  const youHold = hold(p);
  const youBreak = 1 - hold(r);
  const tb = tiebreak(p, 1 - r);
  const memo = new Map<string, number>();
  const f = (i: number, j: number): number => {
    if (i >= 6 && i - j >= 2) return 1;
    if (j >= 6 && j - i >= 2) return 0;
    if (i === 7 || j === 7) return i > j ? 1 : 0;
    if (i === 6 && j === 6) return tb;
    const key = `${i}-${j}`;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    const w = (i + j) % 2 === 0 ? youHold : youBreak;
    const v = w * f(i + 1, j) + (1 - w) * f(i, j + 1);
    memo.set(key, v);
    return v;
  };
  return f(0, 0);
}

/** The serve-point rate that, in this model, produces a given hold rate (hold() is increasing, so bisect). */
export function impliedServePoints(holdRate: number) {
  let lo = 0.3;
  let hi = 0.95;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (hold(m) < holdRate) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/**
 * Real hold rates, 2025 ATP season, from the ATP Tour (Infosys stats), published November 2025:
 * https://www.atptour.com/en/news/sinner-serve-return-november-2025
 */
export const ATP_2025 = {
  source: "https://www.atptour.com/en/news/sinner-serve-return-november-2025",
  holds: [
    { name: "Jannik Sinner", short: "Sinner", hold: 0.92, note: "713 of 775 service games" },
    { name: "Taylor Fritz", short: "Fritz", hold: 0.8918 },
    { name: "Giovanni Mpetshi Perricard", short: "Mpetshi Perricard", hold: 0.8897 },
    { name: "Novak Djokovic", short: "Djokovic", hold: 0.8867 },
    { name: "Reilly Opelka", short: "Opelka", hold: 0.885 },
  ],
  /** Sinner won 247 of 757 return games (32.63%), so opponents held 67.37% against him. */
  sinnerReturn: 0.3263,
} as const;
