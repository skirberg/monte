import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { BOILERPLATE, COLORS, KIT, VOICE, oklchToHex } from "@/lib/brand";
import { GAMES } from "@/lib/site-data";
import { TOOLS } from "@/lib/decide/tools";
import { SECTION_CARDS } from "@/lib/seo";
import { lockupSvg, markSvg } from "@/components/brand/logo";
import { practiceRound, shuffleRound, type ShuffleRound } from "@/lib/play/shuffle";
import manifest from "@/app/manifest";
import { kitSource } from "@/scripts/lib/kit-source";
import { hex, tokens } from "@/scripts/lib/tokens";

type Entry = { path: string; url: string; width?: number; height?: number; bytes: number; sha256: string };
const kit = JSON.parse(readFileSync("public/brand/kit.json", "utf8")) as { source: string; version: string; files: Entry[]; served: Entry[] };
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
const kitFile = (p: string) => kit.files.find((f) => f.path === p);
const servedUrls = new Set(kit.served.map((f) => f.url));
const RERUN = "run npm run brand and commit what it writes";

describe("brand", () => {
  it("colours are the token source's, light and dark", () => {
    const [light, dark] = [tokens("light"), tokens("dark")];
    for (const c of COLORS) {
      expect(c.light, c.token).toBe(light[c.token as keyof typeof light]);
      expect(c.dark, c.token).toBe(dark[c.token as keyof typeof dark]);
    }
  });

  it("turns OKLCH into the right hex", () => {
    expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff");
    expect(oklchToHex("oklch(0 0 0)")).toBe("#000000");
    // The clay the share cards use.
    expect(oklchToHex("oklch(0.6 0.165 45)")).toBe("#cd5811");
  });

  it("has a mark file and a share card for every game and decision", () => {
    for (const g of GAMES) {
      expect(existsSync(`public/brand/marks/${g.slug}.svg`), g.slug).toBe(true);
      expect(existsSync(`public/og/${g.slug}.png`), g.slug).toBe(true);
    }
    for (const t of TOOLS) {
      expect(existsSync(`public/brand/marks/decide-${t.id}.svg`), t.id).toBe(true);
      expect(existsSync(`public/og/decide-${t.id}.png`), t.id).toBe(true);
    }
  });

  it("descriptions fit where they go, with no dashes", () => {
    expect(BOILERPLATE.tagline.length).toBeLessThanOrEqual(60);
    expect(BOILERPLATE.short.length).toBeLessThanOrEqual(200);
    expect(BOILERPLATE.long.length).toBeLessThanOrEqual(500);
    for (const t of Object.values(BOILERPLATE)) expect(t).not.toMatch(/[—]|\bAI\b/);
  });

  it("each voice principle quotes a line the site really uses", () => {
    const files: string[] = [];
    const walk = (d: string) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : /\.tsx?$/.test(f) && files.push(join(d, f))));
    ["app", "components", "lib"].forEach(walk);
    const code = files.filter((f) => !f.endsWith(join("lib", "brand.ts"))).map((f) => readFileSync(f, "utf8").replace(/<[^>]+>/g, "")).join("\n");
    for (const p of VOICE.principles) expect(code, p.k).toContain(p.do);
  });

  it("the site's copy never uses a word the voice rules out", () => {
    const files: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(tsx?|json)$/.test(f) && !p.endsWith(join("lib", "brand.ts")) && !p.includes(join("play", "data"))) files.push(p);
      }
    };
    ["app", "components", "lib"].forEach(walk);
    const hits: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      for (const w of VOICE.never) if (new RegExp(`\\b${w.replace("-", "[- ]")}\\b`, "i").test(text)) hits.push(`${f}: ${w}`);
    }
    expect(hits).toEqual([]);
  });
});

// The Shuffle writes its copy from numbers each day, so no file scan can see it: deal two years of rounds and
// every practice family, and hold every line to the voice (DESIGN.md, "Voice" and "Words").
describe("the Shuffle's voice", () => {
  const days = Array.from({ length: 730 }, (_, i) => new Date(Date.UTC(2026, 10, 19 + i)).toISOString().slice(0, 10));
  const rounds = [...days.map(shuffleRound), ...Array.from({ length: 40 }, (_, i) => practiceRound(i))];
  const lines = (r: ShuffleRound) => [r.setup, r.q, r.grain, ...r.work, ...r.cups.flatMap((c) => [c.label, c.tag, c.note])];

  it("never uses a word the voice rules out, an em dash, an exclamation or the word AI", () => {
    const hits = new Set<string>();
    for (const r of rounds)
      for (const t of lines(r)) {
        for (const w of VOICE.never) if (new RegExp(`\\b${w.replace("-", "[- ]")}\\b`, "i").test(t)) hits.add(`${w}: ${t}`);
        if (/[—!]|\bAI\b/.test(t)) hits.add(t);
      }
    expect([...hits]).toEqual([]);
  });

  it("keeps a sentence to 25 words and a cup's tag to three", () => {
    for (const r of rounds) {
      for (const t of [r.q, r.grain, ...r.cups.map((c) => c.note)])
        for (const sentence of t.split(/(?<=[.?:])\s+/)) expect(sentence.split(/\s+/).length, sentence).toBeLessThanOrEqual(25);
      for (const c of r.cups) expect(c.tag.split(" ").length, c.tag).toBeLessThanOrEqual(3);
    }
  });

  it("answers a miss the way a lesson does, and never with a joke", () => {
    const game = readFileSync("components/play/shuffle-game.tsx", "utf8");
    expect(game).toContain("Not quite. Here is the work.");
    expect(game).toContain("<span className=\"font-semibold\">Not quite.</span>");
    expect(game).not.toMatch(/oops|so close|better luck|you've got this|nice try/i);
  });
});

// The brand kit (DESIGN.md, "Brand kit"). Nothing here can drift: change the logo, a colour, the board or a card's
// words, and these fail until the generator has run again.
describe("brand kit", () => {
  it("kit.json was written from the current source", () => {
    expect(kit.source, `the brand's source changed since kit.json was written: ${RERUN}`).toBe(kitSource());
  });

  it("every file kit.json lists is on disk with its size and sha256", () => {
    for (const f of kit.files) {
      const p = join("public/brand", f.path);
      expect(existsSync(p), p).toBe(true);
      expect(statSync(p).size, p).toBe(f.bytes);
      expect(sha(p), `${p} changed by hand: ${RERUN}`).toBe(f.sha256);
    }
    for (const f of kit.served) {
      expect(existsSync(f.path), f.path).toBe(true);
      expect(sha(f.path), `${f.path} differs from what the generator drew: ${RERUN}`).toBe(f.sha256);
    }
  });

  it("the kit's app icons and link card are the very files the site serves", () => {
    const pairs: [string, string][] = [
      ["app/favicon.svg", "app/icon.svg"],
      ["app/favicon.ico", "public/favicon.ico"],
      ["app/apple-touch-icon.png", "public/apple-touch-icon.png"],
      ["app/icon-192.png", "public/icon-192.png"],
      ["app/icon-512.png", "public/icon-512.png"],
      ["app/icon-maskable-512.png", "public/icon-maskable-512.png"],
      ["social/og-1200x630.png", "public/og.png"],
    ];
    for (const [k, served] of pairs) expect(sha(join("public/brand", k)), k).toBe(sha(served));
  });

  it("every icon the pages and manifest name is a file the generator drew", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    const linked = [...layout.matchAll(/(?:url: |apple: )"(\/[^"]+\.(?:svg|ico|png))"/g)].map((m) => m[1]);
    expect(linked).toEqual(expect.arrayContaining(["/icon.svg", "/favicon.ico", "/apple-touch-icon.png", "/og.png"]));
    const icons = manifest().icons!.map((i) => i.src);
    for (const u of [...linked, ...icons]) expect(servedUrls.has(u), u).toBe(true);
  });

  it("every share card a page can name is a file the generator drew", () => {
    const cards = ["/og.png", ...SECTION_CARDS.map((s) => `/og/${s.slug}.png`), ...GAMES.map((g) => `/og/${g.slug}.png`), ...TOOLS.map((t) => `/og/decide-${t.id}.png`)];
    for (const u of cards) expect(servedUrls.has(u), u).toBe(true);
  });

  it("the vector logo and mark are the one drawing in the theme's colours", () => {
    const [l, d] = [tokens("light"), tokens("dark")];
    const read = (p: string) => readFileSync(join("public/brand", p), "utf8");
    expect(read("logo/monte-logo-color.svg")).toBe(lockupSvg(hex(l.ink), hex(l.clay)));
    expect(read("logo/monte-logo-reversed.svg")).toBe(lockupSvg(hex(d.ink), hex(d.clay)));
    expect(read("logo/monte-logo-black.svg")).toBe(lockupSvg("#000000", "#000000"));
    expect(read("logo/monte-logo-white.svg")).toBe(lockupSvg("#ffffff", "#ffffff"));
    expect(read("mark/monte-mark-color.svg")).toBe(markSvg(hex(l.clay)));
    expect(read("mark/monte-mark-tile.svg")).toBe(readFileSync("app/icon.svg", "utf8"));
  });

  it("has every file the kit spec asks for, at its size", () => {
    const size = (p: string) => [kitFile(p)?.width, kitFile(p)?.height];
    for (const v of KIT.logo) {
      expect(kitFile(`logo/monte-logo-${v.id}.svg`), v.id).toBeTruthy();
      for (const w of KIT.logoWidths) expect(size(`logo/monte-logo-${v.id}-${w}.png`)[0], `${v.id} ${w}`).toBe(w);
    }
    for (const v of KIT.mark) for (const s of KIT.markSizes) expect(size(`mark/monte-mark-${v.id}-${s}.png`), `${v.id} ${s}`).toEqual([s, s]);
    for (const s of KIT.social) {
      expect(size(`social/${s.file}.png`), s.file).toEqual([s.w, s.h]);
      if ("dark" in s && s.dark) expect(size(`social/${s.file}-dark.png`), `${s.file} dark`).toEqual([s.w, s.h]);
    }
    expect(kitFile("social/github-social-1280x640.png")!.bytes).toBeLessThan(1_000_000);
    for (const p of ["app/favicon.svg", "app/favicon.ico", "app/apple-touch-icon.png", "app/icon-192.png", "app/icon-512.png", "app/icon-maskable-512.png", "app/icon-1024.png", "email/signature-logo@2x.png", "colors/tokens.json", "colors/tokens.css", "colors/colors.md", "README.txt", "kit.zip"])
      expect(kitFile(p), p).toBeTruthy();
    expect(size("app/icon-1024.png")).toEqual([1024, 1024]);
    expect(size("email/signature-logo@2x.png")[0]).toBe(400);
  });

  it("kit.zip holds every kit file", () => {
    const z = readFileSync("public/brand/kit.zip");
    const names: string[] = [];
    // Walk the central directory from its end record.
    const end = z.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    let at = z.readUInt32LE(end + 16);
    for (let i = 0; i < z.readUInt16LE(end + 10); i++) {
      const n = z.readUInt16LE(at + 28), x = z.readUInt16LE(at + 30), c = z.readUInt16LE(at + 32);
      names.push(z.subarray(at + 46, at + 46 + n).toString("utf8"));
      at += 46 + n + x + c;
    }
    expect(names.sort()).toEqual(kit.files.map((f) => f.path).filter((p) => p !== "kit.zip").sort());
  });

  it("the kit carries no personal or school details", () => {
    for (const f of kit.files.filter((f) => /\.(txt|md|json|css|svg)$/.test(f.path))) {
      expect(readFileSync(join("public/brand", f.path), "utf8"), f.path).not.toMatch(/[\w.+-]+@[\w-]+\.(com|org|edu|net|io|me|co)\b|\bNYU\b|\bStern\b|professor|\bclass\b(?!=)|homework/i);
    }
  });
});
