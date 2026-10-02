// Renders the social share card to public/og.png. Run from the project root: npx tsx scripts/make-og.tsx
// Fonts come from Google Fonts at run time (Satori needs TTF, so ask without a browser user agent).
import { writeFileSync } from "node:fs";
import { ImageResponse } from "next/og";
import * as React from "react";

const PAPER = "#faf6f1", SAND = "#f3ece1", INK = "#1b1511", MUTED = "#625952", CLAY = "#cd5811";
const h = React.createElement;

async function font(family: string, weight: number) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`)).text();
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`No TTF for ${family}`);
  return (await fetch(url)).arrayBuffer();
}
const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

function pileSvg() {
  // A Galton board: pegs on top, the pile below, the line over it. Same device as the hero film.
  const W = 420, bw = 27, cx = W / 2, base = 452, N = 170;
  let out = "";
  for (let r = 0; r < 12; r++)
    for (let j = 0; j <= r; j++) out += `<circle cx="${(cx + (j - r / 2) * bw).toFixed(1)}" cy="${(28 + r * 14).toFixed(1)}" r="2.6" fill="#90847a"/>`;
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="480" viewBox="0 0 ${W} 480">${out}<path d="${path}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><line x1="${cx - 6.5 * bw}" x2="${cx + 6.5 * bw}" y1="${base}" y2="${base}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></svg>`;
}
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${[6.5, 16, 25.5].map((x) => `<circle cx="${x}" cy="16" r="4.2" fill="none" stroke="${INK}" stroke-width="2.6"/>`).join("")}<circle cx="25.5" cy="16" r="1.9" fill="${CLAY}"/></svg>`;

async function main() {
  const [display, mono] = await Promise.all([font("Bricolage+Grotesque", 700), font("Azeret+Mono", 500)]);
  const card = h("div", { style: { width: "100%", height: "100%", display: "flex", background: PAPER, padding: 64 } },
    h("div", { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 14 } },
        h("img", { src: uri(MARK), width: 72, height: 72 }),
        h("span", { style: { fontFamily: "Bricolage", fontSize: 46, color: INK, letterSpacing: -2 } }, "Monte")),
      h("div", { style: { display: "flex", flexDirection: "column", fontFamily: "Bricolage", fontSize: 88, lineHeight: 0.95, letterSpacing: -4, color: INK } },
        h("span", null, "Drop enough grains."),
        h("span", { style: { color: MUTED } }, "The shape appears.")),
      h("span", { style: { fontFamily: "Azeret", fontSize: 20, color: MUTED, letterSpacing: 2, textTransform: "uppercase" } }, "Statistics, one idea at a time")),
    h("div", { style: { display: "flex", flex: 1, alignItems: "center", justifyContent: "center", background: SAND, borderRadius: 36, marginLeft: 24 } },
      h("img", { src: uri(pileSvg()), width: 420, height: 480 })));
  const res = new ImageResponse(card, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Bricolage", data: display, weight: 700, style: "normal" },
      { name: "Azeret", data: mono, weight: 500, style: "normal" },
    ],
  });
  writeFileSync("public/og.png", Buffer.from(await res.arrayBuffer()));
  console.log("wrote public/og.png");
}
main();
