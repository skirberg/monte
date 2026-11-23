import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("keeps a custom type size next to a text colour", () => {
    expect(cn("text-figure font-medium", "text-clay-ink")).toBe("text-figure font-medium text-clay-ink");
    expect(cn("font-display text-headline", "text-ink")).toContain("text-headline");
  });

  it("still lets a later size or colour win", () => {
    expect(cn("text-figure", "text-lead")).toBe("text-lead");
    expect(cn("text-sm", "text-figure")).toBe("text-figure");
    expect(cn("text-ink", "text-clay-ink")).toBe("text-clay-ink");
  });

  it("is the only cn the site imports", () => {
    const files: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.tsx?$/.test(f)) files.push(p);
      }
    };
    ["app", "components", "lib"].forEach(walk);
    const direct = files.filter((f) => /from ["']cn["']/.test(readFileSync(f, "utf8")));
    expect(direct).toEqual([]);
  });
});
