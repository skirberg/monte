import { describe, expect, it } from "vitest";
import { TOPICS } from "@/lib/study/data";
import { DECK, dealOrder } from "@/lib/study/cards";
import { hasAnyProgress, mastersTopic, rateCard, type StudyProgress } from "@/lib/study/progress";
import { study } from "@/lib/study/routes";

const fresh = (): StudyProgress => ({ drill: {}, due: [], streak: { last: null, count: 0 }, mock: 0, hw: {}, math: {} });

describe("flashcard XP", () => {
  it("pays only when a card moves up a box, once per card per day", () => {
    const p = fresh();
    expect(rateCard(p, "t:Mean", true, "2026-01-10")).toBe(3);
    expect(p.cards).toEqual({ "t:Mean": 1 });
    // Same card again the same day: it still moves up, but pays nothing.
    expect(rateCard(p, "t:Mean", true, "2026-01-10")).toBe(0);
    expect(p.cards!["t:Mean"]).toBe(2);
    // Another card pays on its own.
    expect(rateCard(p, "t:Median", true, "2026-01-10")).toBe(3);
    // Next day, the first card pays again.
    expect(rateCard(p, "t:Mean", true, "2026-01-11")).toBe(3);
  });
  it("Again sends the card to box 0 and pays nothing", () => {
    const p = fresh();
    p.cards = { "t:Mean": 3 };
    expect(rateCard(p, "t:Mean", false, "2026-01-10")).toBe(0);
    expect(p.cards["t:Mean"]).toBe(0);
    expect(p.cardXp).toBeUndefined();
  });
  it("a card already at the top box does not move and pays nothing", () => {
    const p = fresh();
    p.cards = { "t:Mean": 4 };
    expect(rateCard(p, "t:Mean", true, "2026-01-10")).toBe(0);
    expect(p.cards["t:Mean"]).toBe(4);
  });
  it("Again then Got it on the same day cannot farm XP", () => {
    const p = fresh();
    let xp = 0;
    for (let i = 0; i < 10; i++) {
      xp += rateCard(p, "t:Mean", false, "2026-01-10");
      xp += rateCard(p, "t:Mean", true, "2026-01-10");
    }
    expect(xp).toBe(3);
  });
});

describe("Topic mastered badge", () => {
  it("needs a single-topic drill of 8 or more at 80% or better", () => {
    expect(mastersTopic("topic", 8, 0.8)).toBe(true);
    expect(mastersTopic("topic", 8, 0.75)).toBe(false);
    expect(mastersTopic("topic", 5, 1)).toBe(false);
    expect(mastersTopic("ten", 10, 1)).toBe(false);
    expect(mastersTopic("mock", 20, 0.9)).toBe(false);
    expect(mastersTopic("daily", 5, 1)).toBe(false);
  });
});

describe("hasAnyProgress (the first-ten-minutes path)", () => {
  it("is false for a new visitor and true after anything", () => {
    expect(hasAnyProgress(fresh())).toBe(false);
    // The old study streak alone is not progress.
    expect(hasAnyProgress({ ...fresh(), streak: { last: "2026-01-01", count: 3 } })).toBe(false);
    expect(hasAnyProgress({ ...fresh(), drill: { data: { asked: 1, correct: 1, best: 0 } } })).toBe(true);
    expect(hasAnyProgress({ ...fresh(), due: ["prob"] })).toBe(true);
    expect(hasAnyProgress({ ...fresh(), mock: 0.4 })).toBe(true);
    expect(hasAnyProgress({ ...fresh(), cards: { "t:Mean": 0 } })).toBe(true);
    expect(hasAnyProgress({ ...fresh(), read: { data: 1 } })).toBe(true);
    expect(hasAnyProgress({ ...fresh(), math: { pct: 4 } })).toBe(true);
    expect(hasAnyProgress({ ...fresh(), daily: { "2026-01-01": { c: 3, g: "" } } })).toBe(true);
  });
});

describe("first flashcard deal", () => {
  const terms = DECK.filter((c) => c.kind === "terms");
  const never = () => {
    throw new Error("no shuffle on a first visit");
  };
  it("with no progress starts at topic 1, in deck order", () => {
    const order = dealOrder(terms, undefined, null, never);
    expect(order[0].topic).toBe(TOPICS[0].id);
    expect(order[0]).toBe(terms.find((c) => c.topic === TOPICS[0].id));
    expect(order).toHaveLength(terms.length);
  });
  it("starts at the topic read last, then the topics after it", () => {
    const order = dealOrder(terms, {}, "normal", never);
    const topics = [...new Set(order.map((c) => c.topic))];
    const i = TOPICS.findIndex((t) => t.id === "normal");
    expect(topics[0]).toBe("normal");
    expect(topics[1]).toBe(TOPICS.slice(i + 1).find((t) => terms.some((c) => c.topic === t.id))?.id);
  });
  it("an unknown last topic falls back to topic 1", () => {
    expect(dealOrder(terms, undefined, "nope", never)[0].topic).toBe(TOPICS[0].id);
  });
  it("once cards have boxes, lower boxes come first", () => {
    const [a, b, c] = terms;
    const order = dealOrder([a, b, c], { [a.key]: 3, [b.key]: 0 }, null, () => 0.5);
    expect(order.map((x) => x.key)).toEqual([b.key, c.key, a.key]);
  });
});

describe("first-ten-minutes drill link", () => {
  it("asks for 5 untimed questions on one topic", () => {
    expect(study.drillTopic("data", 5, true)).toBe("/study/practice/drill/?topic=data&n=5&timer=off");
    expect(study.drillTopic("data")).toBe("/study/practice/drill/?topic=data");
  });
});
