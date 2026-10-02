// Renders the clay-tile app icons to public/. Run from the project root: npx tsx scripts/make-icons.tsx
import { writeFileSync } from "node:fs";
import { ImageResponse } from "next/og";
import * as React from "react";

// The five pips of a die joined into an M; the center pip is ink on the clay tile. Centered at (16, 16).
// Three cups, the grain under the last. The mark is centered at (16, 16) on its 32 grid.
const FACE = `<circle cx="6.5" cy="16" r="4.2" fill="none" stroke="#faf6f1" stroke-width="2.9"/><circle cx="16" cy="16" r="4.2" fill="none" stroke="#faf6f1" stroke-width="2.9"/><circle cx="25.5" cy="16" r="4.2" fill="none" stroke="#faf6f1" stroke-width="2.9"/><circle cx="25.5" cy="16" r="1.9" fill="#1b1511"/>`;
const mark = (s: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g transform="translate(${16 - 16 * s} ${16 - 16 * s}) scale(${s})">${FACE}</g></svg>`;

async function png(size: number, scale: number, file: string) {
  const src = `data:image/svg+xml;base64,${Buffer.from(mark(scale)).toString("base64")}`;
  const res = new ImageResponse(
    React.createElement(
      "div",
      { style: { width: "100%", height: "100%", display: "flex", background: "#cd5811" } },
      React.createElement("img", { src, width: size, height: size }),
    ),
    { width: size, height: size },
  );
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log("wrote", file);
}

async function main() {
  await png(180, 0.8, "public/apple-touch-icon.png");
  await png(192, 0.8, "public/icon-192.png");
  await png(512, 0.8, "public/icon-512.png");
  // Maskable: Android may crop to a circle, so the mark stays inside the central 80%.
  await png(512, 0.62, "public/icon-maskable-512.png");
}
main();
