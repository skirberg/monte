// Renders the clay-tile app icons to public/. Run from the project root: npx tsx scripts/make-icons.tsx
// (npm run brand runs it too, with the share cards and the brand kit, which carries byte-identical copies).
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import * as React from "react";

import { markSvg } from "@/components/brand/logo";
import { hex, tokens } from "./lib/tokens";

/*
  One drawing for every icon: the mark from components/brand/logo.tsx (the bell curve), reversed: the curve in
  paper on a clay tile (DESIGN.md, "Mark"). The curve is wide and short, so on a paper tile it filled under half the
  tile's height and all but vanished on a home screen; a clay square holds its own next to other apps' icons, and
  reads on light and dark tab bars alike, so the tab icon (app/icon.svg) is the same tile.
  The curve's middle sits a little below the tile's middle: a shape that is heavy at the bottom looks high when
  centred by its box.
*/
const light = tokens("light");
const PAPER = hex(light.paper), CLAY = hex(light.clay);
const inner = (color: string) => markSvg(color).replace(/^<svg[^>]*>|<\/svg>$/g, "");
/** The curve at `s` of the tile's width, in paper, its middle a little below the tile's. */
const curve = (s: number) => `<g transform="translate(${256 - 256 * s} ${256 - 256 * s + 14}) scale(${s})">${inner(PAPER)}</g>`;
/** A full clay square (the platform rounds the corners) with the curve at `s`. */
const mark = (s: number) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${CLAY}"/>${curve(s)}</svg>`;
/** The rounded clay tile for the tab icon and favicon.ico, the curve filling most of it so it still reads at 16 px. */
export const tile = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="${CLAY}"/>${curve(0.98)}</svg>`;

/** A square clay icon at `size` px with the curve at `scale` of its width (0.92 for app icons, less for crops). */
export async function iconPng(size: number, scale: number) {
  const src = `data:image/svg+xml;base64,${Buffer.from(mark(scale)).toString("base64")}`;
  const res = new ImageResponse(
    React.createElement(
      "div",
      { style: { width: "100%", height: "100%", display: "flex", background: CLAY } },
      React.createElement("img", { src, width: size, height: size }),
    ),
    { width: size, height: size },
  );
  return Buffer.from(await res.arrayBuffer());
}

/** favicon.ico for browsers and crawlers that ask for /favicon.ico: the clay tile at 16, 32 and 48 px, stored as PNG entries. */
async function favicon() {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((s) => sharp(Buffer.from(tile()), { density: 384 }).resize(s, s).png().toBuffer()));
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
  return Buffer.concat([header, ...pngs]);
}

/** Every icon the site serves, as repo path to bytes. */
export async function icons() {
  return new Map<string, Buffer>([
    ["app/icon.svg", Buffer.from(tile())],
    ["public/favicon.ico", await favicon()],
    ["public/apple-touch-icon.png", await iconPng(180, 0.92)],
    ["public/icon-192.png", await iconPng(192, 0.92)],
    ["public/icon-512.png", await iconPng(512, 0.92)],
    // Maskable: Android may crop to a circle, so the mark stays inside the central 80%.
    ["public/icon-maskable-512.png", await iconPng(512, 0.72)],
  ]);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const [path, data] of await icons()) {
    writeFileSync(path, data);
    console.log("wrote", path);
  }
}
