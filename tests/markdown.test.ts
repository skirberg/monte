import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import { SITE_URL, hasMarkdownTwin, markdownPath, pageAlternates } from "@/lib/seo";

// The Markdown twins in public/ are written by scripts/make-api.ts (npm run api) and committed. A new topic, lesson,
// decision, game or solver page fails here until its twin is generated and committed with it.

const paths = sitemap().map((e) => e.url.slice(SITE_URL.length));
const twinFile = (path: string) => join("public", markdownPath(path));

/** The kinds of page that must have a twin, by path. The other /learn/ pages are checked by name below. */
const KINDS: [kind: string, re: RegExp][] = [
  ["topic", /^\/learn\/(?!formulas\/|terms\/|frameworks\/|start\/)[^/]+\/$/],
  ["lesson", /^\/learn\/[^/]+\/[^/]+\/$/],
  ["decision", /^\/decide\/[^/]+\/$/],
  ["game", /^\/play\/[^/]+\/$/],
  ["solver", /^\/solve\/[^/]+\/$/],
];

describe("Markdown twins", () => {
  it("cover every topic, lesson, decision, game and solver in the sitemap, plus home, the formula sheet and the glossary", () => {
    const counts = Object.fromEntries(KINDS.map(([kind]) => [kind, 0]));
    const missing: string[] = [];
    for (const p of paths) {
      const kind = KINDS.find(([, re]) => re.test(p))?.[0];
      if (!kind && !["/", "/learn/formulas/", "/learn/terms/"].includes(p)) continue;
      if (kind) counts[kind]++;
      if (!existsSync(twinFile(p))) missing.push(`${p} (${twinFile(p)})`);
    }
    expect(missing, "run npm run api and commit the new files").toEqual([]);
    // The sitemap really lists each kind, so a renamed route cannot quietly match nothing.
    expect(counts).toEqual({ topic: 14, lesson: 70, decision: 9, game: 10, solver: 11 });
  });

  it("are linked from exactly the pages that have one", () => {
    const wrong = paths.filter((p) => hasMarkdownTwin(p) !== existsSync(twinFile(p)));
    expect(wrong).toEqual([]);
    expect(pageAlternates("/learn/normal/")).toEqual({ canonical: "/learn/normal/", types: { "text/markdown": "/learn/normal.md" } });
    expect(pageAlternates("/privacy/")).toEqual({ canonical: "/privacy/" });
  });

  it("all belong to a page in the sitemap", () => {
    const pages = new Set(paths.map(markdownPath));
    const orphans: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith(".md") && !pages.has(p.slice("public".length).split("\\").join("/"))) orphans.push(p);
      }
    };
    ["learn", "solve", "decide", "play"].forEach((d) => walk(join("public", d)));
    expect(orphans).toEqual([]);
  });

  it("live at the page's path without its trailing slash, plus .md", () => {
    expect(markdownPath("/")).toBe("/index.md");
    expect(markdownPath("/learn/normal/")).toBe("/learn/normal.md");
    expect(markdownPath("/learn/normal/68-95-997/")).toBe("/learn/normal/68-95-997.md");
    expect(markdownPath("/decide/warranty/")).toBe("/decide/warranty.md");
  });

  it("each open with an H1, a one-line summary, the canonical URL and the license, in plain Markdown", () => {
    for (const p of paths.filter(hasMarkdownTwin)) {
      const text = readFileSync(twinFile(p), "utf8");
      const [h1, summary, canonical, license] = text.split("\n\n");
      expect(h1, p).toMatch(/^# \S/);
      expect(summary, p).toMatch(/^> [^\n]+$/);
      expect(canonical, p).toBe(`Canonical URL: ${SITE_URL}${p}`);
      expect(license, p).toBe("License: CC BY 4.0, reuse with credit to monte.markets.");
      // No HTML tags, and no em dashes (DESIGN.md, "Voice").
      expect(text, p).not.toMatch(/<\/?[a-z][a-z0-9]*[\s>/]/i);
      expect(text, p).not.toContain("—");
    }
  });
});
