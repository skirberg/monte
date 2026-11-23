// Renders the social share cards: public/og.png for the site and public/og/<game>.png for each game,
// drawn with that game's own art. Run from the project root: npx tsx scripts/make-og.tsx
// (npm run brand runs it too, with the icons and the brand kit). Fonts come from Google Fonts at run time
// (scripts/lib/fonts.ts).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { ImageResponse } from "next/og";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GameArt } from "@/components/play/game-art";
import { ToolMark } from "@/components/decide/tool-mark";
import { TOOLS } from "@/lib/decide/tools";
import { GAMES } from "@/lib/site-data";
import { LOCKUP_RATIO, lockupSvg, markSvg } from "@/components/brand/logo";
import { SECTION_CARDS } from "@/lib/seo";
import { monteFonts } from "./lib/fonts";
import { COLOR } from "@/lib/tokens";

// The day court's colours in sRGB, from the token source (tokens/monte.tokens.json).
const { paper: { hex: PAPER }, sand: { hex: SAND }, ink: { hex: INK }, "ink-muted": { hex: MUTED }, clay: { hex: CLAY } } = COLOR.light;
const h = React.createElement;

const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

function pileSvg() {
  // A Galton board: pegs on top, the pile below, the clay curve over it. Same device as the hero board.
  const W = 420, bw = 27, cx = W / 2, base = 452, N = 170;
  let out = "";
  for (let r = 0; r < 12; r++)
    for (let j = 0; j <= r; j++) out += `<circle cx="${(cx + (j - r / 2) * bw).toFixed(1)}" cy="${(28 + r * 14).toFixed(1)}" r="2.6" fill="${LINE_STRONG}"/>`;
  for (let k = 0; k <= 12; k++) {
    let c = 1;
    for (let i = 1; i <= k; i++) c = (c * (12 - k + i)) / i;
    const n = Math.round((c / 4096) * N);
    for (let d = 0; d < n; d++) {
      const col = d % 2, layer = Math.floor(d / 2);
      out += `<circle cx="${(cx + (k - 6) * bw + (col - 0.5) * 11.5 + (layer % 2 ? 1.5 : -1.5)).toFixed(1)}" cy="${(base - 7 - layer * 10.4).toFixed(1)}" r="5" fill="${CLAY}"/>`;
    }
  }
  const sd = Math.sqrt(3), scale = ((N / 2) * 10.4) / (sd * Math.sqrt(2 * Math.PI));
  let path = "";
  for (let i = 0; i <= 120; i++) {
    const k = -0.6 + (i / 120) * 13.2;
    path += `${i ? "L" : "M"}${(cx + (k - 6) * bw).toFixed(1)} ${(base - scale * Math.exp(-((k - 6) ** 2) / (2 * sd * sd)) - 6).toFixed(1)} `;
  }
  // As on the hero: the curve in clay, and the area under it filled with clay at 16%, so the pile reads as the logo's mountain.
  const area = `${path}L${(cx + 6.6 * bw).toFixed(1)} ${base} L${(cx - 6.6 * bw).toFixed(1)} ${base} Z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="480" viewBox="0 0 ${W} 480"><path d="${area}" fill="${CLAY}" fill-opacity="0.16"/>${out}<path d="${path}" fill="none" stroke="${CLAY}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><line x1="${cx - 6.5 * bw}" x2="${cx + 6.5 * bw}" y1="${base}" y2="${base}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></svg>`;
}
// The logo, from the one drawing in components/brand/logo.tsx.
const LOGO = lockupSvg(INK, CLAY);
const logo = (height: number) => h("img", { src: uri(LOGO), height, width: Math.round(height * LOCKUP_RATIO) });

/** Every share card, as repo path to PNG bytes. */
export async function shareCards() {
  const files = new Map<string, Buffer>();
  // The hero's face: Bricolage at its condensed width, as the site sets it; Geologica for the one line, as the site's body.
  const fonts = await monteFonts();
  const card = h("div", { style: { width: "100%", height: "100%", display: "flex", background: PAPER, padding: 64 } },
    h("div", { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 } },
      h("div", { style: { display: "flex" } }, logo(48)),
      h("div", { style: { display: "flex", flexDirection: "column", fontFamily: "Condensed", fontSize: 94, lineHeight: 0.94, letterSpacing: -2, color: INK } },
        h("span", null, "Drop enough grains."),
        h("span", null, "The shape appears.")),
      h("span", { style: { fontFamily: "Azeret", fontSize: 20, color: MUTED } }, "monte.markets")),
    h("div", { style: { display: "flex", flex: 1, alignItems: "center", justifyContent: "center", background: SAND, borderRadius: 36, marginLeft: 24 } },
      h("img", { src: uri(pileSvg()), width: 420, height: 480 })));
  const res = new ImageResponse(card, { width: 1200, height: 630, fonts: fonts.filter((f) => f.name !== "Geologica") });
  files.set("public/og.png", Buffer.from(await res.arrayBuffer()));

  // One card per game: its name, its one line, and its art on the sand panel.
  const TOKENS: Record<string, string> = Object.fromEntries(Object.entries(COLOR.light).map(([k, v]) => [`--${k}`, v.hex]));
  /** A card with a name, its one line and its mark on the sand panel (the games and the decisions). */
  const markCard = async (file: string, name: string, line: string, mark: React.ReactElement) => {
    const art = renderToStaticMarkup(mark)
      .replace(/var\((--[\w-]+)\)/g, (_, v) => TOKENS[v] ?? INK)
      .replace(/ class="[^"]*"/, "")
      .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="440" height="352"');
    const card = h("div", { style: { width: "100%", height: "100%", display: "flex", background: PAPER, padding: 64 } },
      h("div", { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 } },
        h("div", { style: { display: "flex" } }, logo(40)),
        h("div", { style: { display: "flex", flexDirection: "column", gap: 22 } },
          h("span", { style: { fontFamily: "Condensed", fontSize: name.length > 30 ? 72 : name.length > 18 ? 88 : 104, lineHeight: 0.94, letterSpacing: -2, color: INK } }, name),
          h("span", { style: { fontFamily: "Geologica", fontSize: 30, lineHeight: 1.3, color: MUTED } }, line)),
        h("span", { style: { fontFamily: "Azeret", fontSize: 20, color: MUTED } }, "monte.markets")),
      h("div", { style: { display: "flex", flex: 1, alignItems: "center", justifyContent: "center", background: SAND, borderRadius: 36, marginLeft: 32 } },
        h("img", { src: uri(art), width: 440, height: 352 })));
    const r = new ImageResponse(card, { width: 1200, height: 630, fonts });
    files.set(`public/og/${file}.png`, Buffer.from(await r.arrayBuffer()));
  };
  for (const g of GAMES) await markCard(g.slug, g.name, g.line, React.createElement(GameArt, { slug: g.slug }));
  // One card per decision, the same way: its question, its one line and its mark.
  for (const t of TOOLS) await markCard(`decide-${t.id}`, t.question, t.line, React.createElement(ToolMark, { id: t.id }));

  // One card per part of the site (SECTION_CARDS in lib/seo.ts picks it by the page's path): a headline in the
  // brand's condensed face, one line, and a drawing in the brand's devices (grains, the line, clay for the number).
  for (const sc of SECTION_CARDS) {
    const scard = h("div", { style: { width: "100%", height: "100%", display: "flex", background: PAPER, padding: 64 } },
      h("div", { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 } },
        h("div", { style: { display: "flex" } }, logo(40)),
        h("div", { style: { display: "flex", flexDirection: "column", gap: 22 } },
          h("div", { style: { display: "flex", flexDirection: "column", fontFamily: "Condensed", fontSize: 100, lineHeight: 0.94, letterSpacing: -2, color: INK } },
            ...sc.head.map((t) => h("span", { key: t }, t))),
          h("span", { style: { fontFamily: "Geologica", fontSize: 30, lineHeight: 1.3, color: MUTED } }, sc.line)),
        h("span", { style: { fontFamily: "Azeret", fontSize: 20, color: MUTED } }, `monte.markets${sc.prefixes[0]}`)),
      h("div", { style: { display: "flex", flex: 1, alignItems: "center", justifyContent: "center", background: SAND, borderRadius: 36, marginLeft: 32 } },
        h("img", { src: uri(SECTION_ART[sc.slug]()), width: 440, height: 352 })));
    const r = new ImageResponse(scard, { width: 1200, height: 630, fonts });
    files.set(`public/og/${sc.slug}.png`, Buffer.from(await r.arrayBuffer()));
  }
  return files;
}

const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="352" viewBox="0 0 440 352">${body}</svg>`;
const { line: { hex: LINE }, "line-strong": { hex: LINE_STRONG }, "clay-tint": { hex: TINT }, "sand-2": { hex: SAND2 } } = COLOR.light;

/** The drawing on each section's card. */
const SECTION_ART: Record<string, () => string> = {
  // Today's chart: three seasons shown, the fourth hidden behind sand, the line stopping at its edge.
  daily: () => {
    const x = (i: number) => 24 + i * 8.4, y = (i: number) => 176 - 92 * Math.sin((2 * Math.PI * (i + 2)) / 12) - i * 0.6;
    const known = Array.from({ length: 37 }, (_, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(i).toFixed(1)}`).join(" ");
    return svg(`<rect x="${x(36)}" y="40" width="${x(48) - x(36)}" height="272" rx="16" fill="${SAND2}"/><path d="${known}" fill="none" stroke="${CLAY}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(36)}" cy="${y(36)}" r="8" fill="${CLAY}" stroke="${PAPER}" stroke-width="3"/><path d="M${x(36) + 18} ${y(36)} H${x(36) + 60}" stroke="${MUTED}" stroke-width="3" stroke-dasharray="3 8" stroke-linecap="round"/><path d="M${x(36) + 52} ${y(36) - 8} L${x(36) + 60} ${y(36)} L${x(36) + 52} ${y(36) + 8}" fill="none" stroke="${MUTED}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);
  },
  // The Shuffle: three cups on the court line, the middle one lifted off the clay grain.
  shuffle: () => {
    // The cups-and-balls cup from components/play/shuffle-game.tsx, upside down: foot ring, two bands, rolled rim.
    const cup = (cx: number, lift: number, tilt: number) =>
      `<g transform="translate(0 ${-lift}) rotate(${tilt} ${cx} 288)"><rect x="${cx - 37}" y="134" width="74" height="18" rx="6" fill="${INK}"/><path d="M${cx - 31} 150 L${cx + 31} 150 L${cx + 48} 278 L${cx - 48} 278 Z" fill="${INK}"/><rect x="${cx - 56}" y="270" width="112" height="18" rx="7" fill="${INK}"/><path d="M${cx - 33} 172 H${cx + 33} M${cx - 43} 250 H${cx + 43}" stroke="${PAPER}" stroke-opacity="0.2" stroke-width="4"/><path d="M${cx - 20} 186 L${cx - 25} 236" stroke="${PAPER}" stroke-opacity="0.14" stroke-width="7" stroke-linecap="round"/></g>`;
    const shadow = (cx: number, lifted: boolean) => `<ellipse cx="${cx}" cy="290" rx="${lifted ? 40 : 58}" ry="${lifted ? 5 : 7}" fill="${INK}" fill-opacity="${lifted ? 0.07 : 0.14}"/>`;
    return svg(`<line x1="16" x2="424" y1="290" y2="290" stroke="${LINE_STRONG}" stroke-width="3" stroke-linecap="round"/>${shadow(84, false)}${shadow(220, true)}${shadow(356, false)}<circle cx="220" cy="270" r="14" fill="${CLAY}"/>${cup(84, 0, 0)}${cup(356, 0, 0)}${cup(220, 104, -7)}`);
  },
  // The path: stops on a line, the first ones mastered in clay, the next one lit.
  learn: () => {
    let out = `<line x1="220" y1="40" x2="220" y2="312" stroke="${LINE}" stroke-width="4"/><line x1="220" y1="40" x2="220" y2="176" stroke="${CLAY}" stroke-width="4"/>`;
    [40, 108, 176, 244, 312].forEach((cy, i) => {
      if (i < 2) out += `<circle cx="220" cy="${cy}" r="24" fill="${CLAY}"/><path d="M209 ${cy} l7 7 l13 -14" fill="none" stroke="${PAPER}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      else if (i === 2) out += `<circle cx="220" cy="${cy}" r="36" fill="${TINT}"/><circle cx="220" cy="${cy}" r="24" fill="${INK}"/>`;
      else out += `<circle cx="220" cy="${cy}" r="22" fill="${PAPER}" stroke="${LINE_STRONG}" stroke-width="3"/>`;
    });
    return svg(out);
  },
  // Answer tiles on their edge, the right one in clay; the progress dots above.
  practice: () => {
    let out = "";
    for (let k = 0; k < 8; k++) out += `<rect x="${60 + k * 42}" y="44" width="34" height="9" rx="4.5" fill="${k < 3 ? CLAY : k === 3 ? INK : LINE}"/>`;
    [0, 1, 2].forEach((k) => {
      const yy = 96 + k * 76, right = k === 1;
      out += `<rect x="60" y="${yy + 5}" width="320" height="56" rx="14" fill="${right ? CLAY : LINE_STRONG}"/><rect x="60" y="${yy}" width="320" height="56" rx="14" fill="${right ? TINT : PAPER}" stroke="${right ? CLAY : LINE_STRONG}" stroke-width="2.5"/><rect x="84" y="${yy + 22}" width="${[150, 190, 120][k]}" height="12" rx="6" fill="${right ? INK : LINE_STRONG}"/>`;
    });
    return svg(out);
  },
  // A probability tree: two branches, then four, the leaves sized by their chance.
  solve: () => {
    const leaves = [[360, 60, 0.42], [360, 140, 0.18], [360, 220, 0.28], [360, 300, 0.12]] as const;
    let out = `<path d="M60 180 L210 100 M60 180 L210 260" stroke="${LINE_STRONG}" stroke-width="4" stroke-linecap="round"/>`;
    out += leaves.map(([lx, ly], i) => `<path d="M210 ${i < 2 ? 100 : 260} L${lx} ${ly}" stroke="${LINE_STRONG}" stroke-width="4" stroke-linecap="round"/>`).join("");
    out += `<circle cx="60" cy="180" r="14" fill="${INK}"/><circle cx="210" cy="100" r="12" fill="${INK}"/><circle cx="210" cy="260" r="12" fill="${INK}"/>`;
    out += leaves.map(([lx, ly, p]) => `<circle cx="${lx}" cy="${ly}" r="${(10 + 40 * p).toFixed(1)}" fill="${CLAY}"/>`).join("");
    return svg(out);
  },
  // A thousand people as dots: the few who have it in clay, the false alarms in ink.
  decide: () => {
    let out = "";
    for (let r = 0; r < 20; r++)
      for (let c = 0; c < 30; c++) {
        const i = r * 30 + c;
        const fill = i < 6 ? CLAY : i < 60 ? INK : LINE_STRONG;
        out += `<circle cx="${42 + c * 12.4}" cy="${56 + r * 12.4}" r="${i < 60 ? 4.6 : 2.6}" fill="${fill}"/>`;
      }
    return svg(out);
  },
  // The mark, large.
  brand: () => markSvg(CLAY).replace("<svg", '<svg width="440" height="352"').replace('viewBox="0 0 512 512"', 'viewBox="-40 -20 592 473"'),
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const [path, data] of await shareCards()) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, data);
    console.log("wrote", path);
  }
}
