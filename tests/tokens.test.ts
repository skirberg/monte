import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { OUT_CSS, OUT_TS, SOURCE, buildTokens } from "@/scripts/lib/token-build";
import { MODES, PAIRS, contrast, need, tokens } from "@/scripts/lib/tokens";

// The token source (tokens/monte.tokens.json) is the one place a colour, a corner or a duration is set (DESIGN.md, "Tokens").
describe("design tokens", () => {
  const built = buildTokens();

  it("app/tokens.css and lib/tokens.ts are what the source makes (run npm run tokens and commit both)", () => {
    expect(readFileSync(OUT_CSS, "utf8")).toBe(built.css);
    expect(readFileSync(OUT_TS, "utf8")).toBe(built.ts);
  });

  it("has the four modes, each with every colour", () => {
    expect(built.modes).toEqual(["light", "dark", "light-hc", "dark-hc"]);
    for (const m of MODES) expect(Object.keys(tokens(m)).sort()).toEqual([...built.colors].sort());
  });

  it("refuses a broken source: a wrong hex, a missing reference, a mode reaching into another", () => {
    const src = JSON.parse(readFileSync(SOURCE, "utf8"));
    const bad = (edit: (j: typeof src) => void) => {
      const j = structuredClone(src);
      edit(j);
      return () => buildTokens(JSON.stringify(j));
    };
    expect(bad((j) => (j.color.clay["600"].$value.hex = "#000000"))).toThrow(/hex says/);
    expect(bad((j) => (j.mode.light.text.ink.$value = "{color.warm.123}"))).toThrow(/does not exist/);
    expect(bad((j) => (j.mode.light.text.ink.$value = "{mode.dark.text.ink}"))).toThrow(/outside its own mode/);
    expect(bad((j) => delete j.mode.dark.surface.sand)).toThrow(/same tokens/);
  });

  it("every pair passes WCAG in every mode, and the high-contrast modes never lower a pair", () => {
    for (const m of MODES) {
      const t = tokens(m);
      for (const [a, b, base, what] of PAIRS) expect(contrast(t[a], t[b]), `${m}: ${what}`).toBeGreaterThanOrEqual(need(m, base));
    }
    for (const [hc, base] of [["light-hc", "light"], ["dark-hc", "dark"]] as const) {
      const [h, t] = [tokens(hc), tokens(base)];
      for (const [a, b, , what] of PAIRS) expect(contrast(h[a], h[b]), `${hc}: ${what}`).toBeGreaterThanOrEqual(contrast(t[a], t[b]) - 1e-9);
    }
  });

  it("app/globals.css sets no colour of its own", () => {
    const css = readFileSync("app/globals.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/oklch\(|#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });
});
