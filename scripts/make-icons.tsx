// Renders the clay-tile app icons to public/. Run from the project root: npx tsx scripts/make-icons.tsx
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import * as React from "react";

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

/** favicon.ico for browsers and crawlers that ask for /favicon.ico: the rounded app/icon.svg tile at 16, 32 and 48 px, stored as PNG entries. */
async function favicon(file: string) {
  const svg = readFileSync("app/icon.svg");
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((s) => sharp(svg, { density: 384 }).resize(s, s).png().toBuffer()));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(s, e);
    header.writeUInt8(s, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(pngs[i].length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  writeFileSync(file, Buffer.concat([header, ...pngs]));
  console.log("wrote", file);
}

async function main() {
  await favicon("public/favicon.ico");
  await png(180, 0.8, "public/apple-touch-icon.png");
  await png(192, 0.8, "public/icon-192.png");
  await png(512, 0.8, "public/icon-512.png");
  // Maskable: Android may crop to a circle, so the mark stays inside the central 80%.
  await png(512, 0.62, "public/icon-maskable-512.png");
}
main();
