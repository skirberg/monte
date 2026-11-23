// The brand, from one source to every file: the app icons (scripts/make-icons.tsx), the share cards
// (scripts/make-og.tsx), the brand files on /brand/, every game's and decision's mark, and the brand kit in
// public/brand/ (logo, mark, app, social, email, colors, README.txt, kit.zip and kit.json). All of it is drawn from
// the one logo drawing (components/brand/logo.tsx), the colour tokens (tokens/monte.tokens.json), the words in lib/brand.ts
// and the home page's board (lib/board.ts). DESIGN.md, "Brand kit", has the reasons.
//
//   npm run brand                 regenerate everything
//   npm run brand -- --if-stale   only when the source changed since kit.json was written (prebuild runs this)
//   npm run brand -- --check      regenerate in memory and fail on any file that differs from what is committed
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { lockupSvg, markSvg, LOCKUP_RATIO } from "@/components/brand/logo";
import { GameArt } from "@/components/play/game-art";
import { ToolMark } from "@/components/decide/tool-mark";
import { GAMES } from "@/lib/site-data";
import { TOOLS } from "@/lib/decide/tools";
import { SITE_URL } from "@/lib/seo";
import { icons, iconPng, tile } from "./make-icons";
import { shareCards } from "./make-og";
import { FETCHED, monteFonts } from "./lib/fonts";
import { colorFiles, emailFiles, logoFiles, markFiles, palette, readme, socialFiles } from "./lib/kit";
import { kitSource } from "./lib/kit-source";
import { zip } from "./lib/zip";

const DIR = "public/brand";
const KIT_DIRS = ["logo", "mark", "app", "social", "email", "colors"];
const KIT_JSON = `${DIR}/kit.json`;
const mode = process.argv.includes("--check") ? "check" : process.argv.includes("--if-stale") ? "if-stale" : "write";

type Entry = { path: string; url: string; width?: number; height?: number; bytes: number; sha256: string };
type Kit = { name: string; url: string; version: string; date: string; commit: string; source: string; fonts: typeof FETCHED; files: Entry[]; served: Entry[] };

const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
/** Pixel size, read from the file itself: PNG header, the largest ICO entry, or an SVG's viewBox. */
function dims(path: string, b: Buffer): { width?: number; height?: number } {
  if (path.endsWith(".png")) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (path.endsWith(".ico")) {
    const n = b.readUInt16LE(4);
    const sizes = Array.from({ length: n }, (_, i) => b.readUInt8(6 + 16 * i) || 256);
    return { width: Math.max(...sizes), height: Math.max(...sizes) };
  }
  const vb = path.endsWith(".svg") ? b.toString("utf8").match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/) : null;
  return vb ? { width: Math.round(+vb[1]), height: Math.round(+vb[2]) } : {};
}
const entry = (path: string, url: string, b: Buffer): Entry => ({ path, url, ...dims(path, b), bytes: b.length, sha256: sha(b) });
const readKit = (): Kit | null => (existsSync(KIT_JSON) ? (JSON.parse(readFileSync(KIT_JSON, "utf8")) as Kit) : null);

/** The URL a repo file is served at. */
const urlOf = (path: string) => (path === "app/icon.svg" ? "/icon.svg" : path.replace(/^public/, ""));

/** True when kit.json was written from this source and every file it lists is on disk unchanged. */
function current(source: string) {
  const kit = readKit();
  if (!kit || kit.source !== source) return false;
  const listed: [string, string][] = [...kit.files.map((f) => [join(DIR, f.path), f.sha256] as [string, string]), ...kit.served.map((f) => [f.path, f.sha256] as [string, string])];
  return listed.length > 0 && listed.every(([p, h]) => existsSync(p) && sha(readFileSync(p)) === h);
}

/** The brand files /brand/ has always offered (kept at their addresses, which other sites and the README link to). */
async function legacy(appIcon1024: Buffer) {
  const [l, d] = [palette("light"), palette("dark")];
  const files = new Map<string, Buffer>();
  const light = lockupSvg(l.ink, l.clay);
  const dark = lockupSvg(d.ink, d.clay);
  const mark = markSvg(l.clay);
  files.set(`${DIR}/monte-logo.svg`, Buffer.from(light));
  files.set(`${DIR}/monte-logo-dark.svg`, Buffer.from(dark));
  files.set(`${DIR}/monte-mark.svg`, Buffer.from(mark));
  const W = 2048;
  files.set(`${DIR}/monte-logo.png`, await sharp(Buffer.from(light), { density: 600 }).resize(W, Math.round(W / LOCKUP_RATIO)).png().toBuffer());
  files.set(`${DIR}/monte-logo-dark.png`, await sharp(Buffer.from(dark), { density: 600 }).resize(W, Math.round(W / LOCKUP_RATIO)).png().toBuffer());
  files.set(`${DIR}/monte-mark.png`, await sharp(Buffer.from(mark), { density: 600 }).resize(1024, 1024).png().toBuffer());
  // The app icon, the same tile as the site's: the vector, and a true 1024 render (not the 512 scaled up).
  files.set(`${DIR}/monte-icon.svg`, Buffer.from(tile()));
  files.set(`${DIR}/monte-icon.png`, appIcon1024);

  // The marks, with the light theme's colours written in and the motion classes left out (a file sits still).
  const TOKENS: Record<string, string> = {
    "--clay": l.clay, "--ink": l.ink, "--paper": l.paper, "--sand": l.sand,
    "--sand-2": "#ebe2d5", "--line": "#dbd3c9", "--line-strong": "#9a8f85", "--ink-muted": "#6b625a",
  };
  const standalone = (el: React.ReactElement) =>
    renderToStaticMarkup(el)
      .replace(/ class="[^"]*"/g, "")
      .replace(/ style="--i:[^"]*"/g, "")
      .replace(/ style="rotate:(-?[\d.]+)deg"/g, ' transform="rotate($1 50 48)"')
      .replace(/var\((--[\w-]+)\)/g, (_, v: string) => TOKENS[v] ?? l.ink)
      .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="320"')
      .replace(' aria-hidden="true"', "")
      .replaceAll("<text ", '<text font-family="ui-monospace, monospace" ');
  for (const g of GAMES) files.set(`${DIR}/marks/${g.slug}.svg`, Buffer.from(standalone(React.createElement(GameArt, { slug: g.slug }))));
  for (const t of TOOLS) files.set(`${DIR}/marks/decide-${t.id}.svg`, Buffer.from(standalone(React.createElement(ToolMark, { id: t.id }))));
  return files;
}

async function generate(source: string) {
  const old = readKit();
  // Same source as last time: keep its date and commit, so regenerating changes no bytes.
  const same = old?.source === source;
  const date = same ? old!.date : new Date().toISOString().slice(0, 10);
  let commit = same ? old!.commit : process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "";
  if (!commit) try { commit = execFileSync("git", ["rev-parse", "HEAD"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { commit = "unknown"; }
  commit = commit.slice(0, 7);
  const version = `${date}.${commit}`;

  const fonts = await monteFonts();
  const site = new Map<string, Buffer>([...(await icons()), ...(await shareCards())]);
  const icon1024 = await iconPng(1024, 0.92);
  for (const [p, b] of await legacy(icon1024)) site.set(p, b);

  // The kit, in the shared layout. app/ holds byte-for-byte copies of what the site serves.
  const kit = new Map<string, Buffer>();
  const add = (m: Map<string, Buffer>) => m.forEach((b, p) => kit.set(p, b));
  add(await logoFiles());
  add(await markFiles(tile()));
  add(new Map([
    ["app/favicon.svg", site.get("app/icon.svg")!],
    ["app/favicon.ico", site.get("public/favicon.ico")!],
    ["app/apple-touch-icon.png", site.get("public/apple-touch-icon.png")!],
    ["app/icon-192.png", site.get("public/icon-192.png")!],
    ["app/icon-512.png", site.get("public/icon-512.png")!],
    ["app/icon-maskable-512.png", site.get("public/icon-maskable-512.png")!],
    ["app/icon-1024.png", icon1024],
  ]));
  add(await socialFiles(fonts, site.get("public/og.png")!, iconPng));
  add(await emailFiles());
  add(colorFiles());
  kit.set("README.txt", readme(version));
  const zipped = zip([...kit].sort(([a], [b]) => a.localeCompare(b)), new Date(`${date}T12:00:00Z`));
  kit.set("kit.zip", zipped);

  const manifest: Kit = {
    name: "Monte",
    url: `${SITE_URL}/brand/`,
    version,
    date,
    commit,
    source,
    fonts: FETCHED.map((f) => ({ ...f })).sort((a, b) => (a.family + a.axes).localeCompare(b.family + b.axes)),
    files: [...kit].sort(([a], [b]) => a.localeCompare(b)).map(([p, b]) => entry(p, `/brand/${p}`, b)),
    served: [...site].sort(([a], [b]) => a.localeCompare(b)).map(([p, b]) => entry(p, urlOf(p), b)),
  };
  const out = new Map<string, Buffer>(site);
  for (const [p, b] of kit) out.set(join(DIR, p), b);
  out.set(KIT_JSON, Buffer.from(JSON.stringify(manifest, null, 1) + "\n"));
  return out;
}

const source = kitSource();
if (mode === "if-stale" && current(source)) {
  console.log("brand kit is current (kit.json matches its source)");
  process.exit(0);
}
const files = await generate(source);
if (mode === "check") {
  const bad = [...files].filter(([p, b]) => !existsSync(p) || !readFileSync(p).equals(b)).map(([p]) => p);
  if (bad.length) {
    console.error(`${bad.length} brand file(s) differ from what their source draws. Run npm run brand and commit:\n  ${bad.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`all ${files.size} brand files match their source`);
} else {
  // Drop kit files the generator no longer makes, then write.
  const keep = new Set(files.keys());
  const walk = (d: string): string[] => (existsSync(d) ? readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)])) : []);
  for (const f of KIT_DIRS.flatMap((d) => walk(join(DIR, d)))) if (!keep.has(f)) rmSync(f);
  for (const [p, b] of files) {
    mkdirSync(dirname(p), { recursive: true });
    if (!existsSync(p) || !readFileSync(p).equals(b)) writeFileSync(p, b);
  }
  console.log(`brand: ${files.size} files (${[...files.keys()].filter((p) => p.startsWith(DIR + "/") && KIT_DIRS.some((d) => p.startsWith(`${DIR}/${d}/`))).length} in the kit), kit.json ${JSON.parse(files.get(KIT_JSON)!.toString()).version}`);
}
