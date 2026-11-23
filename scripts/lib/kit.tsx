// The brand kit's files (DESIGN.md, "Brand kit"; the layout follows the shared kit spec): logo, mark, app icons,
// social images, an email signature, the colours and a README, each returned as path to bytes for
// scripts/make-brand.tsx to write, check, zip and list in kit.json. Everything is drawn from the one logo drawing
// (components/brand/logo.tsx), the colour tokens (tokens/monte.tokens.json) and the home page's board (lib/board.ts).
import { readFileSync } from "node:fs";
import { ImageResponse } from "next/og";
import * as React from "react";
import sharp from "sharp";
import { LOCKUP_RATIO, lockupSvg, markSvg } from "@/components/brand/logo";
import { BOILERPLATE, COLORS, COLOR_RULE, FONT_LICENSE, FONT_LINKS, IDEA, KIT, NAME_RULES, TYPE, VOICE } from "@/lib/brand";
import { SITE_URL } from "@/lib/seo";
import { boardFrame, boardSvg, CROPS, type Crop } from "./board-art";
import type { Font } from "./fonts";
import { PAIRS, cmyk, contrast, hex, rgb, tokens, type Theme } from "./tokens";
import { SOURCE } from "./token-build";
import type { ColorName } from "@/lib/tokens";

const h = React.createElement;
const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
/** Render an SVG string to a PNG at exactly w x h, transparent where the SVG is. */
const svgPng = (svg: string, w: number, hgt: number) =>
  sharp(Buffer.from(svg.replace("<svg ", `<svg width="${w}" height="${hgt}" `))).png({ compressionLevel: 9 }).toBuffer();

type Palette = { paper: string; sand: string; ink: string; muted: string; clay: string; line: string; lineStrong: string };
export function palette(theme: Theme): Palette {
  const t = tokens(theme);
  return { paper: hex(t.paper), sand: hex(t.sand), ink: hex(t.ink), muted: hex(t["ink-muted"]), clay: hex(t.clay), line: hex(t.line), lineStrong: hex(t["line-strong"]) };
}

/** The four lockups: colour, reversed, black and white. */
export function logoSvgs() {
  const [l, d] = [palette("light"), palette("dark")];
  return {
    color: lockupSvg(l.ink, l.clay),
    reversed: lockupSvg(d.ink, d.clay),
    black: lockupSvg("#000000", "#000000"),
    white: lockupSvg("#ffffff", "#ffffff"),
  } as Record<(typeof KIT.logo)[number]["id"], string>;
}

/** The mark: the curve in clay, black or white, and the tile (paper on clay, the same tile as the tab icon). */
export function markSvgs(tile: string) {
  const l = palette("light");
  return { color: markSvg(l.clay), black: markSvg("#000000"), white: markSvg("#ffffff"), tile } as Record<(typeof KIT.mark)[number]["id"], string>;
}

export async function logoFiles() {
  const files = new Map<string, Buffer>();
  for (const [id, svg] of Object.entries(logoSvgs())) {
    files.set(`logo/monte-logo-${id}.svg`, Buffer.from(svg));
    for (const w of KIT.logoWidths) files.set(`logo/monte-logo-${id}-${w}.png`, await svgPng(svg, w, Math.round(w / LOCKUP_RATIO)));
  }
  return files;
}

export async function markFiles(tile: string) {
  const files = new Map<string, Buffer>();
  for (const [id, svg] of Object.entries(markSvgs(tile))) {
    files.set(`mark/monte-mark-${id}.svg`, Buffer.from(svg));
    for (const s of KIT.markSizes) files.set(`mark/monte-mark-${id}-${s}.png`, await svgPng(svg, s, s));
  }
  return files;
}

/** Signature logo: the lockup 400 px wide for a 200 px display, on white and on nothing. */
export async function emailFiles() {
  const svg = logoSvgs().color;
  const W = 400, H = Math.round(W / LOCKUP_RATIO);
  const clear = await svgPng(svg, W, H);
  const white = await sharp(clear).flatten({ background: "#ffffff" }).png({ compressionLevel: 9 }).toBuffer();
  return new Map([
    ["email/signature-logo@2x.png", white],
    ["email/signature-logo@2x-transparent.png", clear],
  ]);
}

// --- Social images ---------------------------------------------------------------------------------------------

type Box = { x: number; y: number; w: number; h: number };
type Layout = {
  stage: Box;
  crop: Crop;
  logo?: { x: number; y: number; h: number };
  head?: { x: number; y: number; size: number };
  url?: { x: number; y: number; size: number };
  readout?: number;
};

/** The headline as the site sets it: Bricolage at its condensed width, one sentence a line. */
const HEAD = IDEA.line.split(/(?<=\.)\s+/);

function banner(w: number, theme: Theme, L: Layout) {
  const c = palette(theme);
  const [, , cw, ch] = CROPS[L.crop];
  const pad = Math.round(Math.min(L.stage.w, L.stage.h) * 0.05);
  const bw = Math.floor(Math.min(L.stage.w - 2 * pad, ((L.stage.h - 2 * pad) * cw) / ch));
  const bh = Math.round((bw * ch) / cw);
  const kids: React.ReactNode[] = [];
  kids.push(
    h("div", { key: "stage", style: { position: "absolute", left: L.stage.x, top: L.stage.y, width: L.stage.w, height: L.stage.h, display: "flex", alignItems: "center", justifyContent: "center", background: c.sand, borderRadius: Math.round(Math.min(L.stage.w, L.stage.h) * 0.07) } },
      h("img", { src: uri(boardSvg({ clay: c.clay, ink: c.ink, line: c.line, lineStrong: c.lineStrong }, L.crop, bw)), width: bw, height: bh })),
  );
  if (L.readout) {
    // The board's own readout, as on the home page: n, then the mean and sd settling on 7 and 1.73.
    const f = boardFrame();
    const top = L.stage.y + Math.round((L.stage.h - bh) / 2) + Math.round(bh * 0.01);
    const sty = { position: "absolute" as const, top, fontFamily: "Azeret", fontSize: L.readout, color: c.muted, display: "flex", gap: Math.round(L.readout * 0.5) };
    const num = (v: string) => h("span", { style: { color: c.ink } }, v);
    const left = L.stage.x + Math.round((L.stage.w - bw) / 2) + Math.round(bw * 0.03);
    kids.push(h("div", { key: "n", style: { ...sty, left } }, h("span", null, "n"), num(String(f.n))));
    kids.push(h("div", { key: "ms", style: { ...sty, right: w - (L.stage.x + Math.round((L.stage.w + bw) / 2) - Math.round(bw * 0.03)) } }, h("span", null, "mean"), num(f.mean.toFixed(2)), h("span", null, "sd"), num(f.sd.toFixed(2))));
  }
  if (L.logo) kids.push(h("img", { key: "logo", src: uri(lockupSvg(c.ink, c.clay)), height: L.logo.h, width: Math.round(L.logo.h * LOCKUP_RATIO), style: { position: "absolute", left: L.logo.x, top: L.logo.y } }));
  if (L.head) {
    const s = L.head.size;
    kids.push(h("div", { key: "head", style: { position: "absolute", left: L.head.x, top: L.head.y, display: "flex", flexDirection: "column", fontFamily: "Condensed", fontSize: s, lineHeight: 0.94, letterSpacing: -s / 47, color: c.ink } }, ...HEAD.map((t) => h("span", { key: t }, t))));
  }
  if (L.url) kids.push(h("span", { key: "url", style: { position: "absolute", left: L.url.x, top: L.url.y, fontFamily: "Azeret", fontSize: L.url.size, color: c.muted } }, SITE_URL.replace("https://", "")));
  return h("div", { style: { width: "100%", height: "100%", display: "flex", position: "relative", background: c.paper } }, ...kids);
}

/**
 * Where everything sits on each banner. Each keeps its platform's crop in mind: X cuts up to 60 px top and bottom and
 * puts the profile photo over the lower left; LinkedIn puts the logo or photo over the lower left too; YouTube shows
 * only the centred 1546 x 423 on phones; stories keep the top 250 and bottom 340 px clear.
 */
const LAYOUTS: Record<string, Layout> = {
  "x-header-1500x500": { stage: { x: 1010, y: 60, w: 420, h: 380 }, crop: "full", logo: { x: 430, y: 128, h: 44 }, head: { x: 430, y: 200, size: 76 }, url: { x: 432, y: 372, size: 22 } },
  "linkedin-cover-1512x256": { stage: { x: 1040, y: 24, w: 440, h: 208 }, crop: "pile", logo: { x: 470, y: 56, h: 32 }, head: { x: 470, y: 108, size: 50 } },
  "linkedin-banner-1584x396": { stage: { x: 1120, y: 36, w: 424, h: 324 }, crop: "full", logo: { x: 520, y: 96, h: 40 }, head: { x: 520, y: 162, size: 72 } },
  "youtube-banner-2560x1440": { stage: { x: 1478, y: 508, w: 470, h: 423 }, crop: "full", logo: { x: 611, y: 552, h: 60 }, head: { x: 611, y: 646, size: 104 }, url: { x: 614, y: 858, size: 28 } },
  "github-social-1280x640": { stage: { x: 744, y: 64, w: 472, h: 512 }, crop: "full", logo: { x: 64, y: 64, h: 48 }, head: { x: 64, y: 226, size: 86 }, url: { x: 64, y: 548, size: 22 }, readout: 15 },
  "instagram-1080x1080": { stage: { x: 64, y: 160, w: 952, h: 640 }, crop: "full", logo: { x: 64, y: 64, h: 52 }, head: { x: 64, y: 848, size: 96 }, readout: 20 },
  "instagram-1080x1350": { stage: { x: 64, y: 160, w: 952, h: 900 }, crop: "full", logo: { x: 64, y: 64, h: 52 }, head: { x: 64, y: 1104, size: 100 }, readout: 22 },
  "story-1080x1920": { stage: { x: 64, y: 360, w: 952, h: 940 }, crop: "full", logo: { x: 64, y: 270, h: 56 }, head: { x: 64, y: 1344, size: 108 }, readout: 22 },
};

async function render(el: React.ReactElement, w: number, hgt: number, fonts: Font[]) {
  const r = new ImageResponse(el, { width: w, height: hgt, fonts });
  return Buffer.from(await r.arrayBuffer());
}

/** Avatars and banners. `og` is the site's own share card (public/og.png), copied byte for byte; `avatar` draws the icon tile. */
export async function socialFiles(fonts: Font[], og: Buffer, avatar: (size: number, scale: number) => Promise<Buffer>) {
  const files = new Map<string, Buffer>();
  for (const s of KIT.social) {
    const path = `social/${s.file}.png`;
    if (s.file.startsWith("avatar")) {
      // The app tile with the curve small enough to survive a circle crop.
      files.set(path, await avatar(s.w, 0.66));
      continue;
    }
    if (s.file.startsWith("og")) {
      files.set(path, og);
      continue;
    }
    const L = LAYOUTS[s.file];
    files.set(path, await render(banner(s.w, "light", L), s.w, s.h, fonts));
    if ("dark" in s && s.dark) files.set(`social/${s.file}-dark.png`, await render(banner(s.w, "dark", L), s.w, s.h, fonts));
  }
  return files;
}

// --- Colours ---------------------------------------------------------------------------------------------------

const ROLE: Partial<Record<ColorName, string>> = {
  "sand-2": "A step deeper than sand: pressed and hovered surfaces.",
  "ink-muted": "Secondary text.",
  line: "Hairlines and borders.",
  "line-strong": "Control borders, the pegs on the board.",
  "clay-tint": "The clay highlight behind a chosen answer.",
  danger: "A wrong answer. Never a joke.",
};
const SUPPORT = Object.keys(ROLE) as ColorName[];

export function colorFiles() {
  const [lt, dk] = [tokens("light"), tokens("dark")];
  const entry = (v: string) => ({ oklch: v, hex: hex(v), rgb: rgb(v), cmykApprox: cmyk(v) });
  const all = [
    ...COLORS.map((c) => ({ token: c.token, name: c.name, role: c.use, brand: true })),
    ...SUPPORT.map((t) => ({ token: t, name: t.replace("-", " ").replace(/^./, (x) => x.toUpperCase()), role: ROLE[t], brand: false })),
  ];
  const json = {
    rule: COLOR_RULE,
    note: "OKLCH is the source (tokens/monte.tokens.json, also in this folder as monte.tokens.json in the W3C Design Tokens format). HEX and RGB are sRGB. CMYK is a naive approximation with no print profile: proof it before printing.",
    colors: all.map((c) => ({ ...c, light: entry(lt[c.token]), dark: entry(dk[c.token]) })),
    contrast: PAIRS.map(([fg, bg, need, what]) => ({ fg, bg, need, what, light: +contrast(lt[fg], lt[bg]).toFixed(2), dark: +contrast(dk[fg], dk[bg]).toFixed(2) })),
  };
  const css =
    `/* Monte colour tokens (${SITE_URL}/brand/). Light is the day court, dark the night session. */\n:root {\n` +
    all.map((c) => `  --${c.token}: ${hex(lt[c.token])}; /* ${lt[c.token]} */`).join("\n") +
    `\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n` +
    all.map((c) => `    --${c.token}: ${hex(dk[c.token])}; /* ${dk[c.token]} */`).join("\n") +
    `\n  }\n}\n`;
  const row = (v: string) => `${hex(v)} · ${rgb(v).join(", ")} · ${v} · ${cmyk(v).join("/")}`;
  const md =
    `# Monte colours\n\n${COLOR_RULE}\n\nOKLCH is the source. HEX and RGB are sRGB. CMYK (C/M/Y/K) is a naive approximation with no print profile: proof it before printing.\n\n` +
    `| Name | Role | Light: HEX · RGB · OKLCH · CMYK approx. | Dark: HEX · RGB · OKLCH · CMYK approx. |\n|---|---|---|---|\n` +
    all.map((c) => `| ${c.name} | ${c.role} | ${row(lt[c.token])} | ${row(dk[c.token])} |`).join("\n") +
    `\n\n## Contrast (WCAG 2)\n\n| Pair | Use | Needs | Light | Dark |\n|---|---|---|---|---|\n` +
    json.contrast.map((p) => `| ${p.fg} on ${p.bg} | ${p.what} | ${p.need} | ${p.light.toFixed(2)} | ${p.dark.toFixed(2)} |`).join("\n") +
    "\n";
  return new Map([
    ["colors/tokens.json", Buffer.from(JSON.stringify(json, null, 2) + "\n")],
    ["colors/tokens.css", Buffer.from(css)],
    ["colors/colors.md", Buffer.from(md)],
    // The source itself, in the W3C Design Tokens format: every colour, mode, corner and duration the site uses.
    ["colors/monte.tokens.json", readFileSync(SOURCE)],
  ]);
}

// --- README ----------------------------------------------------------------------------------------------------

export function readme(version: string) {
  const fonts = TYPE.map((t) => `  ${t.face}: ${t.role}. ${t.use}\n    ${FONT_LINKS[t.face]}`).join("\n");
  return Buffer.from(
    `MONTE BRAND KIT
${SITE_URL}/brand/   version ${version}

${BOILERPLATE.short}

WHAT IS IN EACH FOLDER
  logo/    The lockup, the clay curve beside "monte". colour (on light), reversed (on dark), black and white
           (one colour). SVG is the vector master; PNGs are transparent, 512, 1024 and 2048 px wide.
  mark/    The curve alone: colour, black, white, and tile (paper on clay, the app icon).
           SVG plus transparent PNGs at 64 to 1024 px.
  app/     The icons the site serves, byte for byte: favicon.svg and .ico, the Apple touch icon, the
           192, 512, maskable 512 and 1024 px icons.
  social/  Avatars, the link preview card and banners for X, LinkedIn, YouTube, GitHub, Instagram and
           stories, each sized for its platform and its crop. Wide banners also come in -dark.
  email/   The lockup 400 px wide for a 200 px signature, on white and transparent.
  colors/  The tokens as JSON and CSS, and colors.md: HEX, RGB, OKLCH, a CMYK approximation, and the
           contrast of every pair the site uses. monte.tokens.json is the source the site is built from
           (W3C Design Tokens format): the colours by mode, high contrast included, the corners and the motion.

USING THE LOGO
  Clear space: ${KIT.clearSpace}
  Smallest size: the lockup ${KIT.minSize.lockupPx} px tall on screen (${KIT.minSize.lockupMm} mm in print); the mark ${KIT.minSize.markPx} px.
  ${NAME_RULES.join("\n  ")}
  Never outline, stretch or recolour the curve, add a dot or sun above it, or set the word in another face.
  ${COLOR_RULE}

TYPE (all free, ${FONT_LICENSE.name}, ${FONT_LICENSE.url})
${fonts}

VOICE
  ${VOICE.register}
${VOICE.principles.map((p) => `  ${p.k} Monte says: "${p.do}" Never: "${p.dont}"`).join("\n")}

Free to use when you link to or write about Monte. The kit is generated from the site's own code, so it
always matches the site. ${SITE_URL}/brand/kit.json lists every file with its size and sha256.
`,
  );
}
