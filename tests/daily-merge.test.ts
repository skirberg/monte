import { describe, expect, it } from "vitest";
import { mergeDaily } from "@/lib/progress";

const r = (score: number) => ({ score, beat: true });

describe("restoring the daily chart from a backup code", () => {
  it("keeps newer results and the streak when an older backup is restored", () => {
    const here = { streak: 3, best: 3, last: "2026-11-21", days: { "2026-11-19": r(1), "2026-11-20": r(2), "2026-11-21": r(3) } };
    const backup = { streak: 1, best: 1, last: "2026-11-19", days: { "2026-11-19": r(1) } };
    const out = mergeDaily(here, backup);
    expect(out.last).toBe("2026-11-21");
    expect(out.streak).toBe(3);
    expect(out.best).toBe(3);
    expect(Object.keys(out.days as object)).toEqual(["2026-11-19", "2026-11-20", "2026-11-21"]);
  });

  it("takes the newer streak from the backup when it is the newer copy", () => {
    const here = { streak: 1, best: 4, last: "2026-11-10", days: { "2026-11-10": r(1) } };
    const backup = { streak: 2, best: 2, last: "2026-11-21", days: { "2026-11-20": r(5), "2026-11-21": r(6) } };
    const out = mergeDaily(here, backup);
    expect(out.last).toBe("2026-11-21");
    expect(out.streak).toBe(2);
    expect(out.best).toBe(4);
  });

  it("joins days played on two devices into one run", () => {
    const here = { streak: 1, best: 1, last: "2026-11-21", days: { "2026-11-21": r(3) } };
    const backup = { streak: 2, best: 2, last: "2026-11-20", days: { "2026-11-19": r(1), "2026-11-20": r(2) } };
    expect(mergeDaily(here, backup).streak).toBe(3);
  });

  it("keeps this browser's result for a day both copies played, since the first try counts", () => {
    const here = { streak: 1, best: 1, last: "2026-11-21", days: { "2026-11-21": r(10) } };
    const backup = { streak: 1, best: 1, last: "2026-11-21", days: { "2026-11-21": r(90) } };
    expect((mergeDaily(here, backup).days as Record<string, { score: number }>)["2026-11-21"].score).toBe(10);
  });

  it("keeps a long saved streak that is older than the two weeks of days kept", () => {
    const days = Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`2026-11-${String(8 + i).padStart(2, "0")}`, r(i)]));
    const here = { streak: 30, best: 30, last: "2026-11-21", days };
    const out = mergeDaily(here, { streak: 0, best: 0, last: null, days: {} });
    expect(out.streak).toBe(30);
    expect(Object.keys(out.days as object)).toHaveLength(14);
  });
});
