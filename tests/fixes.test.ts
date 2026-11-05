import { beforeEach, describe, expect, it, vi } from "vitest";
import { match } from "@/lib/command-match";
import { setScore, mastersTopic } from "@/lib/study/progress";
import { mergeProgress, mergeStudy, importProgress, getProgress } from "@/lib/progress";
import { pageMeta, pageShare } from "@/lib/seo";
import { polymarketWinner } from "../scripts/market-result.mjs";
import { TOPICS } from "@/lib/site-data";

describe("⌘K search", () => {
  const spread = TOPICS.find((t) => t.id === "spread")!;
  const test = TOPICS.find((t) => t.id === "test")!;
  const item = (t: typeof spread) => [`learn topic ${t.n} ${t.name}`, [t.keywords, t.line]] as const;
  it.each([
    ["SD", spread],
    ["z-score", spread],
    ["p-value", test],
    ["standard deviation", spread],
  ])("finds %s through the topic's keywords", (q, t) => {
    const [value, kw] = item(t);
    expect(match(value, q, [...kw])).toBeGreaterThan(0);
  });
  it("ranks a title match above a keyword-only match", () => {
    expect(match("learn topic 3 spread", "spread", [])).toBe(1);
    expect(match("learn topic 3 spread", "sd", ["sd variance"])).toBe(0.5);
  });
  it("still needs every word", () => {
    expect(match("learn topic 3 spread", "sd poisson", ["sd variance"])).toBe(0);
  });
});

describe("set scores", () => {
  it("a practice set ended early counts only answered questions", () => {
    expect(setScore(3, 3, 10, false)).toBe(1);
    expect(setScore(2, 4, 10, false)).toBe(0.5);
    expect(setScore(0, 0, 10, false)).toBe(0);
  });
  it("a mock test counts every question", () => {
    expect(setScore(3, 3, 20, true)).toBe(0.15);
  });
  it("ending a topic set early never masters it", () => {
    expect(mastersTopic("topic", 3, setScore(3, 3, 8, false))).toBe(false);
    expect(mastersTopic("topic", 8, setScore(7, 8, 8, false))).toBe(true);
  });
});

describe("restoring onto a browser that has progress", () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = new Map();
    vi.stubGlobal("window", new EventTarget());
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      get length() {
        return store.size;
      },
      key: (i: number) => [...store.keys()][i] ?? null,
    });
  });
  it("keeps the best of both instead of overwriting", () => {
    store.set("monte-progress", JSON.stringify({ xp: 500, badges: ["first-drill"], days: { "2026-10-01": 40 }, chips: 900, streak: 2, lastDay: "2026-10-01" }));
    store.set("sigma", JSON.stringify({ drill: { spread: { asked: 20, correct: 15, best: 0.9 } }, due: ["prob"], mock: 0.6, math: {}, read: { data: 1 } }));
    const code = JSON.stringify({
      app: "monte",
      v: 2,
      data: {
        "monte-progress": JSON.stringify({ xp: 120, badges: ["goal-hit"], days: { "2026-10-01": 10, "2026-10-05": 60 }, chips: 1200, streak: 1, lastDay: "2026-10-05" }),
        sigma: JSON.stringify({ drill: { spread: { asked: 8, correct: 8, best: 1 }, prob: { asked: 5, correct: 4, best: 0.8 } }, due: [], mock: 0.4, math: {}, read: { center: 1 } }),
      },
    });
    expect(importProgress(code)).toBe(true);
    const p = getProgress();
    expect(p.xp).toBe(500);
    expect(p.chips).toBe(1200);
    expect(p.badges.sort()).toEqual(["first-drill", "goal-hit"]);
    expect(p.days).toEqual({ "2026-10-01": 40, "2026-10-05": 60 });
    expect(p.lastDay).toBe("2026-10-05");
    const s = JSON.parse(store.get("sigma")!);
    expect(s.drill.spread).toEqual({ asked: 20, correct: 15, best: 1 });
    expect(s.drill.prob.asked).toBe(5);
    expect(s.due).toEqual(["prob"]);
    expect(s.mock).toBe(0.6);
    expect(s.read).toEqual({ data: 1, center: 1 });
  });
  it("merges are pure and keep unknown fields", () => {
    expect(mergeProgress({ xp: 1, extra: "a" }, { xp: 2 }).extra).toBe("a");
    expect(mergeStudy({ daily: { d1: { c: 3 } } }, { daily: { d1: { c: 5 }, d2: { c: 1 } } }).daily).toEqual({ d1: { c: 3 }, d2: { c: 1 } });
  });
});

describe("share tags", () => {
  it("every page gets its own share title", () => {
    const m = pageMeta("/study/learn/terms/", "Terms", "Every key word.");
    expect(m.openGraph.title).toBe("Terms · Monte");
    expect(m.openGraph.url).toBe("/study/learn/terms/");
    expect(m.twitter.title).toBe("Terms · Monte");
    expect(m.alternates.canonical).toBe("/study/learn/terms/");
    expect(pageShare("/x/", "X", "d").openGraph.images[0].url).toBe("/og.png");
  });
});

describe("election results", () => {
  const m = (party: string, closed: boolean, yes: string) => ({ groupItemTitle: party, closed, outcomePrices: JSON.stringify([yes, String(1 - Number(yes))]) });
  it("is null while markets trade, even at 99 cents", () => {
    expect(polymarketWinner([m("Democratic Party", false, "0.99"), m("Republican Party", false, "0.01")])).toBeNull();
  });
  it("reads the winner once the market settles", () => {
    expect(polymarketWinner([m("Democratic Party", true, "0"), m("Republican Party", true, "1")])).toBe("rep");
    expect(polymarketWinner([m("Democratic Party", true, "1"), m("Republican Party", true, "0")])).toBe("dem");
  });
  it("ignores other outcomes and bad data", () => {
    expect(polymarketWinner([m("Other", true, "1")])).toBeNull();
    expect(polymarketWinner(undefined)).toBeNull();
  });
});
