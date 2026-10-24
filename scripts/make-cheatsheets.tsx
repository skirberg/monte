// Renders the phone cheat sheets: public/cheatsheets/<topic-id>.png for each topic and
// public/cheatsheets/all-1.png, all-2.png ... for every formula on the sheet, at 1080 x 1920
// (phone wallpaper and story size). Run from the project root: npm run cheatsheets
//
// Safe as a prebuild step: it never fails the build. It skips the work when the content and this
// file have not changed since the last run (public/cheatsheets/manifest.json keeps the hash), and
// on any error it leaves the old images where they are. Pass --force to render anyway.
// Fonts come from Google Fonts at run time, as in make-og.tsx. Noto Sans and Noto Sans Math sit
// behind Geologica so subscripts and math signs always have a glyph.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { ImageResponse } from "next/og";
import * as React from "react";
import sharp from "sharp";
import { DATA, TOPICS, type StudyTopic } from "@/lib/study/data";

const W = 1080, H = 1920;
const OUT = "public/cheatsheets";
const SELF = "scripts/make-cheatsheets.tsx";

// Brand palette (app/globals.css, in sRGB; the same values as make-og.tsx).
const PAPER = "#faf6f1", SAND = "#f3ece1", INK = "#1b1511", MUTED = "#625952", CLAY = "#cd5811", CLAY_INK = "#a63d02", LINE = "#dbd3c9";
const h = React.createElement;
type Style = React.CSSProperties;

// Families. Body text falls back through Noto for the few signs Geologica lacks.
const BODY = "Geo, Noto, NotoMath";
const BODY_SEMI = "GeoSemi, NotoSemi, NotoMath";
const DISPLAY = "Bricolage, Geo, Noto";
const MONO = "Azeret, Geo, Noto";
const WORDMARK = "BricolageNarrow";

/** Plain text from the lesson strings: drop the few inline tags, keep a literal "<" or ">" in math. */
function plain(s: string) {
  return s
    .replace(/<sup>(.*?)<\/sup>/g, (_, x: string) => x.replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]))
    .replace(/<\/?(mark|b|i|em|strong|sup|sub|br)\s*\/?>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function font(family: string, weight: number, axes?: { opsz: number; wdth: number }) {
  const q = axes ? `opsz,wdth,wght@${axes.opsz},${axes.wdth},${weight}` : `wght@${weight}`;
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:${q}`)).text();
  // Google may answer with several static faces; take the one at this weight (and the narrow width, if asked).
  const face = css.split("@font-face").find((b) => b.includes(`font-weight: ${weight}`) && (!axes || b.includes("font-stretch: semi-condensed")));
  const url = face?.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`No TTF for ${family}`);
  return (await fetch(url)).arrayBuffer();
}
const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
// The mark exactly as components/brand/logo.tsx draws it: three ink cups (CUPS, CUP_R) and one clay grain under the last.
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${[6.5, 16, 25.5].map((x) => `<circle cx="${x}" cy="16" r="4.2" fill="none" stroke="${INK}" stroke-width="2.6"/>`).join("")}<circle cx="25.5" cy="16" r="1.9" fill="${CLAY}"/></svg>`;

// ---------- Text ----------

/**
 * Satori does not place combining marks, so x̄ and p̂ come out with the mark beside the letter.
 * Text that holds one is set word by word, and each marked letter gets its bar or hat drawn on top.
 */
const COMBINING = /[\u0300-\u036f]/;
/**
 * Signs Geologica does not carry. Satori picks one font per run of text, so "√n" would set the n in
 * the fallback too, at the wrong weight. Each of these goes in its own span instead.
 */
const FOREIGN = /[\u221a\u02b8\u207f\u207b\u2c7c]/;
const SPECIAL = /(.)([\u0304\u0302])|([\u221a\u02b8\u207f\u207b\u2c7c])/gu;

function Text({ text, size, lh, family, color, weight, style }: { text: string; size: number; lh: number; family: string; color: string; weight?: number; style?: Style }) {
  const base: Style = { fontFamily: family, fontSize: size, lineHeight: lh, color, ...(weight ? { fontWeight: weight } : {}) };
  if (!COMBINING.test(text) && !FOREIGN.test(text)) return h("div", { style: { display: "flex", ...base, ...style } }, text);
  const words = text.split(" ");
  return h("div", { style: { display: "flex", flexWrap: "wrap", ...base, ...style } },
    ...words.map((w, i) => h("div", { key: i, style: { display: "flex", marginRight: i < words.length - 1 ? size * 0.27 : 0 } }, ...pieces(w, size, lh, color))));
}
function pieces(word: string, size: number, lh: number, color: string) {
  const out: React.ReactNode[] = [];
  let last = 0, k = 0;
  for (const m of word.matchAll(SPECIAL)) {
    if (m.index > last) out.push(h("span", { key: k++ }, word.slice(last, m.index)));
    last = m.index + m[0].length;
    if (m[3]) { out.push(h("span", { key: k++ }, m[3])); continue; }
    // Line box is size * lh; the x-height of Geologica sits about 0.5 em above the baseline.
    const top = (size * lh) / 2 - size * (/\p{Lu}/u.test(m[1]) ? 0.52 : 0.36);
    const mark = m[2] === "\u0304"
      ? h("div", { style: { position: "absolute", left: size * 0.06, right: size * 0.06, top, height: Math.max(2, size * 0.065), background: color, borderRadius: 2 } })
      : h("div", { style: { position: "absolute", left: 0, right: 0, top: top - size * 0.3, display: "flex", justifyContent: "center", fontSize: size * 0.9 } }, "\u02c6");
    out.push(h("div", { key: k++, style: { display: "flex", position: "relative" } }, h("span", null, m[1]), mark));
  }
  if (last < word.length) out.push(h("span", { key: k++ }, word.slice(last)));
  return out;
}

/** Rough height of wrapped text, for fitting a page. em = average character width in ems. */
function est(text: string, size: number, lh: number, width: number, em = 0.45) {
  const perLine = Math.max(1, Math.floor(width / (size * em)));
  // Greedy word wrap, so long words push to the next line the way the renderer does.
  let lines = 1, cur = 0;
  for (const w of text.split(" ")) {
    const n = w.length;
    if (cur === 0) cur = n;
    else if (cur + 1 + n <= perLine) cur += 1 + n;
    else { lines++; cur = n; }
  }
  return lines * size * lh;
}

// ---------- Shared pieces ----------

const SIDE = 84, TOP = 104, BOTTOM = 88;
const INNER = W - SIDE * 2;
const LABEL_W = 268; // the left column every section shares, so the page reads as one grid

/**
 * The wordmark at the proportions of Wordmark in components/brand/logo.tsx: a 32 px mark, 20.8 px type
 * and an 8 px gap, tracked -0.04 em, set in Bricolage at the narrow width (wdth 88) and heavy weight.
 */
const WM = 34;
const MARK_PX = Math.round((WM * 32) / 20.8), MARK_GAP = Math.round((WM * 8) / 20.8);
const META: Style = { fontFamily: MONO, fontSize: 20, color: MUTED, letterSpacing: 2.5, textTransform: "uppercase" };

function Header({ right }: { right: string }) {
  return h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", height: MARK_PX } },
    h("div", { style: { display: "flex", alignItems: "center", gap: MARK_GAP } },
      h("img", { src: uri(MARK), width: MARK_PX, height: MARK_PX }),
      h("span", { style: { fontFamily: WORDMARK, fontSize: WM, lineHeight: 1, color: INK, letterSpacing: WM * -0.04 } }, "Monte")),
    h("span", { style: META }, right));
}

function Footer({ right }: { right: string }) {
  return h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `2px solid ${LINE}`, paddingTop: 26, marginTop: "auto" } },
    h("span", { style: { fontFamily: MONO, fontSize: 23, color: INK, letterSpacing: 1 } }, "monte.markets"),
    h("span", { style: META }, right));
}

/** The topic number, set the same way wherever a topic starts: two digits, mono, clay. */
const NUM: Style = { fontFamily: MONO, fontSize: 24, lineHeight: 1, letterSpacing: 1, color: CLAY_INK };
const num = (n: number) => h("span", { style: NUM }, String(n).padStart(2, "0"));
/** Under every topic name: a 3 px ink rule, on the topic sheets and on the formula pages alike. */
const RULE = 3;

/** Mono labels: about 0.6 em a character plus the tracking. */
const monoEm = (size: number) => (size * 0.6 + 0.5) / size;
/**
 * The left column. Fixed words ("Remember") are set in capitals; formula names keep their case,
 * because in statistics n is not N and λ is not Λ.
 */
const Label = (text: string, size: number, color = CLAY_INK, style?: Style, caps = false) =>
  h(Text, { text: caps ? text.toUpperCase() : text, size, lh: 1.3, family: MONO, color, style: { width: LABEL_W, flexShrink: 0, paddingRight: 30, letterSpacing: caps ? 2 : 0.5, ...style } });

const Page = (...children: React.ReactNode[]) =>
  h("div", { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAPER, padding: `${TOP}px ${SIDE}px ${BOTTOM}px` } }, ...children);

// ---------- One topic ----------

type Row = { name: string; formula: string; example: string };
const rowsFor = (t: StudyTopic): Row[] => (DATA.sheet[t.id] ?? []).map(([name, formula, example]) => ({ name, formula, example }));

function topicSizes(t: StudyTopic, s: number) {
  const title = t.name.length > 34 ? 76 : t.name.length > 22 ? 88 : 100;
  return { title, idea: 35 * s, formula: 35 * s, example: 26 * s, label: Math.max(19, 20 * s), hook: 31 * s, trap: 29 * s, cardPad: 40 * s, rowGap: 22 * s, gap: 58 * s };
}

/** Estimated height of everything between the header and the footer at scale s. */
const TITLE_TOP = 76;
function topicHeight(t: StudyTopic, s: number) {
  const z = topicSizes(t, s);
  // The hook and trap text starts where the formulas do, one card padding in from the label column.
  const right = INNER - LABEL_W - z.cardPad, cardRight = INNER - z.cardPad * 2 - LABEL_W;
  const rows = rowsFor(t);
  let card = z.cardPad * 2 + z.label * 1.3 + z.rowGap;
  for (const r of rows) card += Math.max(est(r.formula, z.formula, 1.22, cardRight, 0.47) + 6 + est(r.example, z.example, 1.3, cardRight), est(r.name, z.label, 1.3, LABEL_W - 30, monoEm(z.label))) + z.rowGap * 2 + 2;
  return TITLE_TOP + 24 + 26 + est(t.name, z.title, 0.98, INNER, 0.47) + 34 + RULE + 32 + est(plain(t.line), z.idea, 1.36, INNER) + z.gap + card + z.gap
    + est(t.hook, z.hook, 1.32, right, 0.47) + z.gap * 0.7 + est(plain(t.trap), z.trap, 1.36, right) + 30;
}

/** A first guess at the scale from the estimate; fit() then corrects it against the rendered page. */
function topicScale(t: StudyTopic) {
  const avail = H - TOP - BOTTOM - MARK_PX - 60;
  let s = TOPIC_MAX;
  while (s > 0.7 && topicHeight(t, s) > avail * 0.97) s -= 0.02;
  return s;
}
const TOPIC_MAX = 1.12;

function topicSheet(t: StudyTopic, s: number) {
  const z = topicSizes(t, s);
  const rows = rowsFor(t);
  const total = String(TOPICS.length).padStart(2, "0");

  const card = h("div", { style: { display: "flex", flexDirection: "column", background: SAND, borderRadius: 36, padding: `${z.cardPad}px ${z.cardPad}px ${z.cardPad - z.rowGap}px` } },
    h("div", { style: { display: "flex", fontFamily: MONO, fontSize: z.label, color: MUTED, letterSpacing: 2, textTransform: "uppercase", marginBottom: z.rowGap * 0.5 } }, "Formulas"),
    ...rows.map((r, i) =>
      h("div", { key: i, style: { display: "flex", paddingTop: z.rowGap, paddingBottom: z.rowGap, borderTop: i ? `2px solid ${LINE}` : "none" } },
        Label(r.name, z.label, CLAY_INK, { paddingTop: (z.formula * 1.22 - z.label * 1.3) / 2 }),
        h("div", { style: { display: "flex", flexDirection: "column", flex: 1, gap: 6 } },
          h(Text, { text: r.formula, size: z.formula, lh: 1.22, family: BODY_SEMI, color: INK }),
          h(Text, { text: r.example, size: z.example, lh: 1.3, family: BODY, color: MUTED })))));

  return Page(
    h(Header, { right: "Cheat sheet" }),
    h("div", { style: { display: "flex", flexDirection: "column", marginTop: TITLE_TOP } },
      h("div", { style: { display: "flex", alignItems: "baseline" } },
        num(t.n),
        h("span", { style: { ...NUM, color: MUTED, marginLeft: 12 } }, `of ${total}`)),
      h("div", { style: { display: "flex", fontFamily: DISPLAY, fontSize: z.title, lineHeight: 0.98, letterSpacing: z.title * -0.035, color: INK, marginTop: 26 } }, t.name),
      h("div", { style: { display: "flex", height: RULE, background: INK, marginTop: 34 } }),
      h(Text, { text: plain(t.line), size: z.idea, lh: 1.36, family: BODY, color: INK, style: { marginTop: 32 } }),
      h("div", { style: { display: "flex", flexDirection: "column", marginTop: z.gap } }, card),
      h("div", { style: { display: "flex", marginTop: z.gap } },
        Label("Remember", z.label, CLAY_INK, { width: LABEL_W + z.cardPad, paddingTop: (z.hook * 1.32 - z.label * 1.3) / 2 }, true),
        h(Text, { text: t.hook, size: z.hook, lh: 1.32, family: BODY_SEMI, color: INK, style: { flex: 1 } })),
      h("div", { style: { display: "flex", marginTop: z.gap * 0.7 } },
        Label("The trap", z.label, MUTED, { width: LABEL_W + z.cardPad, paddingTop: (z.trap * 1.36 - z.label * 1.3) / 2 }, true),
        h(Text, { text: plain(t.trap), size: z.trap, lh: 1.36, family: BODY, color: INK, style: { flex: 1 } }))),
    h(Footer, { right: "Statistics, one idea at a time" }));
}

// ---------- Every formula ----------

const ALL = { head: 34, label: 19, formula: 30, example: 23, rowGap: 13, groupGap: 56 };
const ALL_RIGHT = INNER - LABEL_W;
const ALL_MAX = 1.1; // short pages grow at most this much, so the pages still read as one set

function groupHeight(t: StudyTopic) {
  let hgt = ALL.head * 1.1 + 18;
  for (const r of rowsFor(t))
    hgt += Math.max(est(r.formula, ALL.formula, 1.22, ALL_RIGHT, 0.47) + 4 + est(r.example, ALL.example, 1.3, ALL_RIGHT), est(r.name, ALL.label, 1.3, LABEL_W - 30, monoEm(ALL.label))) + ALL.rowGap * 2 + 2;
  return hgt;
}

/**
 * Topics packed onto pages in order, never splitting a topic. First find the fewest pages that fit,
 * then shrink the page height as far as that count allows, so the pages come out evenly full.
 */
function allPages() {
  const titleCost = 210 - 90; // the first page carries the big title
  const full = H - TOP - BOTTOM - MARK_PX - 84 - 60 - 30; // header, its gap, the footer and some air
  const pack = (cap: number) => {
    const pages: StudyTopic[][] = [[]];
    let used = 0;
    for (const t of TOPICS) {
      const g = groupHeight(t);
      const room = pages.length === 1 ? cap - titleCost : cap;
      if (used && used + ALL.groupGap + g > room) { pages.push([t]); used = g; }
      else { used += (used ? ALL.groupGap : 0) + g; pages[pages.length - 1].push(t); }
    }
    return pages;
  };
  const count = pack(full).length;
  let cap = full;
  while (cap > 400 && pack(cap - 10).length === count) cap -= 10;
  return pack(cap);
}

function allSheet(topics: StudyTopic[], page: number, count: number, s = 1) {
  // Pages that come out short set their type a little larger instead of leaving a hole at the bottom.
  const A = { head: ALL.head * s, label: Math.max(19, ALL.label * s), formula: ALL.formula * s, example: ALL.example * s, rowGap: ALL.rowGap * s, groupGap: ALL.groupGap * s };
  const groups = topics.map((t, gi) =>
    h("div", { key: t.id, style: { display: "flex", flexDirection: "column", marginTop: gi ? A.groupGap : 0 } },
      h("div", { style: { display: "flex", alignItems: "baseline", gap: 16, paddingBottom: 18, borderBottom: `${RULE}px solid ${INK}` } },
        num(t.n),
        h("span", { style: { fontFamily: DISPLAY, fontSize: A.head, lineHeight: 1.1, color: INK, letterSpacing: -0.8 } }, t.short || t.name)),
      ...rowsFor(t).map((r, i) =>
        h("div", { key: i, style: { display: "flex", paddingTop: A.rowGap, paddingBottom: A.rowGap, borderTop: i ? `2px solid ${LINE}` : "none" } },
          Label(r.name, A.label, CLAY_INK, { paddingTop: (A.formula * 1.22 - A.label * 1.3) / 2 }),
          h("div", { style: { display: "flex", flexDirection: "column", flex: 1, gap: 4 } },
            h(Text, { text: r.formula, size: A.formula, lh: 1.22, family: BODY_SEMI, color: INK }),
            h(Text, { text: r.example, size: A.example, lh: 1.3, family: BODY, color: MUTED }))))));

  const title = page === 1
    ? h("div", { style: { display: "flex", flexDirection: "column", marginBottom: 64 } },
        h("div", { style: { display: "flex", fontFamily: DISPLAY, fontSize: 100, lineHeight: 0.98, letterSpacing: -3.5, color: INK } }, "Every formula"),
        h("div", { style: { display: "flex", fontFamily: BODY, fontSize: 32, lineHeight: 1.36, color: MUTED, marginTop: 22 } }, `${TOPICS.length} topics, each formula with a worked example.`))
    : null;

  return Page(
    h(Header, { right: "Cheat sheet" }),
    h("div", { style: { display: "flex", flexDirection: "column", marginTop: 84 } }, title, ...groups),
    h(Footer, { right: `Page ${page} of ${count}` }));
}

// ---------- Output ----------

type Fonts = NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"];
const raw = async (el: React.ReactElement, fonts: Fonts) => Buffer.from(await new ImageResponse(el, { width: W, height: H, fonts }).arrayBuffer());

/**
 * Paper left between the last line of content and the footer rule, read off the rendered pixels.
 * Negative when the content runs into the footer or pushes it off its place.
 */
async function slack(png: Buffer) {
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const paper = [0xfa, 0xf6, 0xf1];
  const ink = (x: number, y: number) => { const i = (y * info.width + x) * 3; return paper.some((c, k) => Math.abs(data[i + k] - c) > 5); };
  const RULE_Y = H - BOTTOM - FOOT_H; // where the footer rule sits when nothing pushes it
  for (let y = RULE_Y - 6; y > TOP; y--)
    for (let x = SIDE; x < W - SIDE; x += 2) if (ink(x, y)) return RULE_Y - 6 - y;
  return 0;
}
const FOOT_H = 26 + 2 + 28; // padding, rule and one line of 23 px mono: the rule sits at y = 1776

/**
 * Render at the estimated scale, then grow the type until the page is comfortably full
 * (about AIR px of paper above the footer), never past max and never into the footer.
 */
async function fit(build: (s: number) => React.ReactElement, s0: number, max: number, fonts: Fonts) {
  const AIR = 96, MIN_AIR = 60;
  let s = s0, png = await raw(build(s), fonts), gap = await slack(png);
  // An estimate that overshot: step down until it fits.
  while (gap < MIN_AIR && s > 0.6) { s -= 0.03; png = await raw(build(s), fonts); gap = await slack(png); }
  let cap = max;
  for (let i = 0; i < 6 && gap > AIR + 24 && cap - s > 0.008; i++) {
    const body = H - TOP - BOTTOM - MARK_PX - FOOT_H - 80;
    // A step that wraps one more line can overshoot; then that size becomes the ceiling and the next step is halfway.
    const next = Math.min(cap, s * (1 + (0.85 * (gap - AIR)) / Math.max(400, body - gap)), i ? (s + cap) / 2 : cap);
    const p2 = await raw(build(next), fonts), g2 = await slack(p2);
    if (g2 < MIN_AIR) { cap = next; continue; }
    s = next; png = p2; gap = g2;
  }
  return { png, s, gap };
}

async function render(rendered: Buffer, file: string) {
  // A small palette keeps flat paper and ink crisp and each sheet near 100 KB.
  const png = await sharp(rendered).png({ palette: true, colors: 64, effort: 10, compressionLevel: 9 }).toBuffer();
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, png);
  renameSync(tmp, file);
  return png.length;
}

function contentHash() {
  const input = JSON.stringify({ topics: TOPICS.map((t) => [t.id, t.n, t.name, t.short, t.line, t.hook, t.trap]), sheet: DATA.sheet, self: readFileSync(SELF, "utf8") });
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

async function main() {
  const force = process.argv.includes("--force");
  const hash = contentHash();
  const manifestPath = `${OUT}/manifest.json`;
  const old: { hash?: string; sheets?: { file: string }[] } = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
  if (!force) {
    if (old.hash === hash && old.sheets?.every((s: { file: string }) => existsSync(`${OUT}/${s.file}`))) {
      console.log("cheat sheets are up to date");
      return;
    }
  }

  const [narrow, display, geo, geoSemi, mono, noto, notoSemi, math] = await Promise.all([
    font("Bricolage+Grotesque", 700, { opsz: WM, wdth: 87.5 }), font("Bricolage+Grotesque", 700), font("Geologica", 400), font("Geologica", 600), font("Azeret+Mono", 500), font("Noto+Sans", 400), font("Noto+Sans", 600), font("Noto+Sans+Math", 400),
  ]);
  const fonts = [
    { name: WORDMARK, data: narrow, weight: 700 as const, style: "normal" as const },
    { name: "Bricolage", data: display, weight: 700 as const, style: "normal" as const },
    { name: "Geo", data: geo, weight: 400 as const, style: "normal" as const },
    { name: "GeoSemi", data: geoSemi, weight: 400 as const, style: "normal" as const },
    { name: "Azeret", data: mono, weight: 500 as const, style: "normal" as const },
    { name: "Noto", data: noto, weight: 400 as const, style: "normal" as const },
    { name: "NotoSemi", data: notoSemi, weight: 400 as const, style: "normal" as const },
    { name: "NotoMath", data: math, weight: 400 as const, style: "normal" as const },
  ];

  mkdirSync(OUT, { recursive: true });
  const sheets: { file: string; kind: "topic" | "all"; topic?: string; title: string; bytes: number }[] = [];
  for (const t of TOPICS) {
    const file = `${t.id}.png`;
    const { png, s, gap } = await fit((x) => topicSheet(t, x), topicScale(t), TOPIC_MAX, fonts);
    const bytes = await render(png, `${OUT}/${file}`);
    sheets.push({ file, kind: "topic", topic: t.id, title: t.name, bytes });
    console.log(`wrote ${OUT}/${file} ${(bytes / 1024).toFixed(0)} KB (scale ${s.toFixed(2)}, ${gap}px air)`);
  }
  const pages = allPages();
  for (const [i, p] of pages.entries()) {
    const file = `all-${i + 1}.png`;
    const { png, s, gap } = await fit((x) => allSheet(p, i + 1, pages.length, x), 1, ALL_MAX, fonts);
    const bytes = await render(png, `${OUT}/${file}`);
    sheets.push({ file, kind: "all", title: `Every formula, page ${i + 1} of ${pages.length}`, bytes });
    console.log(`wrote ${OUT}/${file} ${(bytes / 1024).toFixed(0)} KB (${p.map((t) => t.id).join(", ")}; scale ${s.toFixed(2)}, ${gap}px air)`);
  }
  // A run with more pages than this one leaves its extra all-N.png behind. Those are this script's
  // own output from the last manifest, so remove them rather than serve an outdated page.
  for (const f of old.sheets?.map((s) => s.file) ?? []) {
    if (/^all-\d+\.png$/.test(f) && !sheets.some((s) => s.file === f) && existsSync(`${OUT}/${f}`)) {
      unlinkSync(`${OUT}/${f}`);
      console.log(`removed stale ${OUT}/${f}`);
    }
  }
  writeFileSync(manifestPath, JSON.stringify({ hash, size: { width: W, height: H }, sheets: sheets.map((s) => ({ file: s.file, kind: s.kind, ...(s.topic ? { topic: s.topic } : {}), title: s.title })) }, null, 2) + "\n");
  console.log(`wrote ${manifestPath}`);
}

main().catch((e) => {
  // Never fail the build over a picture: keep the old files and say why.
  console.warn(`cheat sheets skipped: ${e instanceof Error ? e.message : e}`);
  process.exitCode = 0;
});
