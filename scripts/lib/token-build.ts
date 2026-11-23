// Builds app/tokens.css and lib/tokens.ts from tokens/monte.tokens.json (W3C Design Tokens Format Module 2025.10),
// and checks the source on the way: every reference resolves, every hex matches its OKLCH, every mode has the same
// tokens, and a semantic token points only at a primitive or at a token of its own mode. scripts/make-tokens.ts writes
// the files; tests/tokens.test.ts and `npm run tokens:check` fail when they drift from the source.
import { readFileSync } from "node:fs";
import { hex } from "./color";

export const SOURCE = "tokens/monte.tokens.json";
export const OUT_CSS = "app/tokens.css";
export const OUT_TS = "lib/tokens.ts";

type Json = { [k: string]: unknown };
type Token = { path: string; type: string; value: unknown; description?: string };
type ModeMeta = { selector: string; media?: string; colorScheme?: string };

const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const refOf = (v: unknown) => (typeof v === "string" && /^\{[^{}]+\}$/.test(v) ? v.slice(1, -1) : null);

/** Every token under a group, with its type inherited from the nearest group that sets one. */
function walk(node: Json, path: string[], type: string | undefined, out: Token[]) {
  const t = (node.$type as string | undefined) ?? type;
  if ("$value" in node) {
    if (!t) throw new Error(`${path.join(".")}: no $type`);
    out.push({ path: path.join("."), type: t, value: node.$value, description: node.$description as string | undefined });
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$") || !isObj(v)) continue;
    if (/[.{}]/.test(k)) throw new Error(`${[...path, k].join(".")}: a token name cannot hold . { or }`);
    walk(v, [...path, k], t, out);
  }
}

/** A mode group with its $extends applied: the parent's tokens, then the child's on top. Inherited references into the
 *  parent mode are pointed at the child, so an override (say, a stronger ink) carries through to what aliases it. */
function expandMode(modes: Json, name: string, seen: string[] = []): Json {
  if (seen.includes(name)) throw new Error(`mode.${name}: $extends goes round in a circle`);
  const own = modes[name];
  if (!isObj(own)) throw new Error(`mode.${name} is missing`);
  const parentRef = refOf(own.$extends);
  if (!parentRef) return own;
  const parent = parentRef.replace(/^mode\./, "");
  const base = expandMode(modes, parent, [...seen, name]);
  const repoint = (node: Json): Json =>
    Object.fromEntries(
      Object.entries(node).map(([k, v]) => {
        if (k === "$value" && typeof v === "string") return [k, v.replace(`{mode.${parent}.`, `{mode.${name}.`)];
        return [k, isObj(v) ? repoint(v) : v];
      }),
    );
  const merge = (a: Json, b: Json): Json => {
    const out: Json = { ...a };
    for (const [k, v] of Object.entries(b)) out[k] = isObj(v) && isObj(a[k]) && !("$value" in v) ? merge(a[k] as Json, v) : v;
    return out;
  };
  const { $extends: _drop, ...rest } = own;
  void _drop;
  return merge(repoint(base), rest);
}

const oklchCss = (v: unknown, where: string) => {
  if (!isObj(v) || v.colorSpace !== "oklch" || !Array.isArray(v.components) || v.components.length !== 3) throw new Error(`${where}: colours are OKLCH { colorSpace, components: [L, C, H] }`);
  return `oklch(${v.components.join(" ")})`;
};

export function buildTokens(source = readFileSync(SOURCE, "utf8")) {
  const doc = JSON.parse(source) as Json;
  const color = doc.color as Json, modes = doc.mode as Json;

  // Primitives: the colour ramps.
  const prims: Token[] = [];
  walk(color, ["color"], undefined, prims);
  const primCss = new Map<string, string>();
  for (const p of prims) {
    if (p.type !== "color") throw new Error(`${p.path}: only colours live under color`);
    const css = oklchCss(p.value, p.path);
    const want = (p.value as Json).hex;
    if (want !== undefined && want !== hex(css)) throw new Error(`${p.path}: hex says ${want}, but ${css} is ${hex(css)} in sRGB`);
    primCss.set(p.path, css);
  }
  const primVar = (path: string) => `--${path.replace(/^color\./, "").replace(/\./g, "-")}`;

  // Semantic tokens, per mode.
  const names = Object.keys(modes).filter((k) => !k.startsWith("$"));
  type Sem = { name: string; group: string; ref: string; description?: string };
  const sem: Record<string, Sem[]> = {};
  const meta: Record<string, ModeMeta> = {};
  for (const m of names) {
    const g = expandMode(modes, m);
    const ext = (modes[m] as Json).$extensions as Json | undefined;
    const mm = ext?.["markets.monte"] as ModeMeta | undefined;
    if (!mm?.selector) throw new Error(`mode.${m}: $extensions["markets.monte"].selector says where the mode applies`);
    meta[m] = mm;
    const ts: Token[] = [];
    walk(g, ["mode", m], undefined, ts);
    sem[m] = ts.map((t) => {
      const ref = refOf(t.value);
      if (!ref) throw new Error(`${t.path}: a mode token points at another token, like "{color.warm.975}"`);
      if (!ref.startsWith("color.") && !ref.startsWith(`mode.${m}.`)) throw new Error(`${t.path}: points at ${ref}, outside its own mode`);
      if (ref.startsWith("color.") && !primCss.has(ref)) throw new Error(`${t.path}: ${ref} does not exist`);
      const [, , group, name] = t.path.split(".");
      return { name, group, ref, description: t.description };
    });
    const seen = new Set<string>();
    for (const s of sem[m]) {
      if (seen.has(s.name)) throw new Error(`mode.${m}: two tokens named ${s.name}`);
      seen.add(s.name);
    }
  }
  const order = sem[names[0]].map((s) => s.name);
  for (const m of names) {
    const have = sem[m].map((s) => s.name).sort().join(",");
    if (have !== [...order].sort().join(",")) throw new Error(`mode.${m} must define the same tokens as mode.${names[0]}`);
  }

  // Resolve a semantic token to its OKLCH, following references within its mode.
  const resolve = (m: string, name: string, depth = 0): string => {
    const s = sem[m].find((x) => x.name === name)!;
    if (s.ref.startsWith("color.")) return primCss.get(s.ref)!;
    if (depth > 5) throw new Error(`mode.${m}.${name}: references go too deep`);
    return resolve(m, s.ref.split(".").at(-1)!, depth + 1);
  };
  const cssOf = (s: Sem) => (s.ref.startsWith("color.") ? `var(${primVar(s.ref)})` : `var(--${s.ref.split(".").at(-1)})`);

  // Corners and motion.
  const rest: Token[] = [];
  for (const k of ["radius", "motion"]) walk(doc[k] as Json, [k], undefined, rest);
  const dim = (v: unknown, w: string) => {
    if (!isObj(v) || typeof v.value !== "number" || !["px", "rem"].includes(v.unit as string)) throw new Error(`${w}: a dimension is { value, unit: px | rem }`);
    return `${v.value}${v.unit}`;
  };
  const ms = (v: unknown, w: string) => {
    if (!isObj(v) || typeof v.value !== "number" || !["ms", "s"].includes(v.unit as string)) throw new Error(`${w}: a duration is { value, unit: ms | s }`);
    return v.unit === "s" ? v.value * 1000 : v.value;
  };
  const radius = rest.filter((t) => t.type === "dimension").map((t) => [t.path.split(".").at(-1)!, dim(t.value, t.path)] as const);
  const duration = rest.filter((t) => t.type === "duration").map((t) => [t.path.split(".").at(-1)!, ms(t.value, t.path)] as const);
  const ease = rest.filter((t) => t.type === "cubicBezier").map((t) => {
    if (!Array.isArray(t.value) || t.value.length !== 4 || !t.value.every((n) => typeof n === "number")) throw new Error(`${t.path}: a cubic Bézier is [x1, y1, x2, y2]`);
    return [t.path.split(".").at(-1)!, t.value as number[]] as const;
  });

  // ---- app/tokens.css ----
  const head = `/* Generated by scripts/make-tokens.ts from ${SOURCE} (W3C Design Tokens Format 2025.10).
   Do not edit: change the JSON, then run npm run tokens. npm run tokens:check (CI) fails when this file drifts. */\n`;
  const block = (sel: string, lines: string[], indent = "") => `${indent}${sel} {\n${lines.map((l) => `${indent}  ${l}`).join("\n")}\n${indent}}\n`;
  let css = head + "\n/* Primitives: the brand's colours, named by OKLCH lightness x 1000. Components use the mode tokens below, never these. */\n";
  css += block(":root", prims.map((p) => `${primVar(p.path)}: ${primCss.get(p.path)};`));
  for (const m of names) {
    const parentRef = refOf((modes[m] as Json).$extends);
    const parent = parentRef?.replace(/^mode\./, "");
    const lines = sem[m]
      .filter((s) => {
        if (!parent) return true;
        const p = sem[parent].find((x) => x.name === s.name)!;
        return cssOf(p) !== cssOf({ ...s, ref: s.ref.replace(`mode.${m}.`, `mode.${parent}.`) });
      })
      .map((s) => `--${s.name}: ${cssOf(s)};`);
    if (meta[m].colorScheme) lines.push(`color-scheme: ${meta[m].colorScheme};`);
    const desc = ((modes[m] as Json).$description as string | undefined)?.split(/(?<=\.)\s/)[0] ?? m;
    css += `\n/* ${m}: ${desc} */\n`;
    css += meta[m].media ? `@media ${meta[m].media} {\n${block(meta[m].selector, lines, "  ")}}\n` : block(meta[m].selector, lines);
  }
  css += "\n/* Motion: how long things take and how they settle. */\n";
  css += block(":root", duration.map(([k, v]) => `--duration-${k}: ${v}ms;`));
  css += "\n/* Tailwind utilities from the tokens: bg-paper, text-ink-muted, rounded-card, ease-settle. */\n";
  css += block("@theme inline", order.map((n) => `--color-${n}: var(--${n});`));
  css += block("@theme", [...radius.map(([k, v]) => `--radius-${k}: ${v};`), ...ease.map(([k, v]) => `--ease-${k}: cubic-bezier(${v.join(", ")});`)]);

  // ---- lib/tokens.ts ----
  const q = JSON.stringify;
  let ts = `// Generated by scripts/make-tokens.ts from ${SOURCE}. Do not edit: change the JSON, then run npm run tokens.\n\n`;
  ts += `/** Where each mode applies: light is the day court, dark the night session, -hc the same with more contrast. */\n`;
  ts += `export const MODES = [${names.map((n) => q(n)).join(", ")}] as const;\nexport type Mode = (typeof MODES)[number];\n\n`;
  ts += `/** The semantic colours, by what they are for. */\nexport type ColorName = ${order.map((n) => q(n)).join(" | ")};\n\n`;
  ts += `/** Each semantic colour in each mode: OKLCH as CSS writes it, and the sRGB hex for places that need one (theme-color, share cards). */\n`;
  ts += `export const COLOR: Record<Mode, Record<ColorName, { oklch: string; hex: string }>> = {\n`;
  for (const m of names) {
    ts += `  ${q(m)}: {\n`;
    for (const n of order) {
      const v = resolve(m, n);
      ts += `    ${q(n)}: { oklch: ${q(v)}, hex: ${q(hex(v))} },\n`;
    }
    ts += `  },\n`;
  }
  ts += `};\n\n`;
  ts += `/** The three corners for surfaces. */\nexport const RADIUS = { ${radius.map(([k, v]) => `${k}: ${q(v)}`).join(", ")} } as const;\n\n`;
  ts += `/** Motion durations, in milliseconds. */\nexport const DURATION = { ${duration.map(([k, v]) => `${k}: ${v}`).join(", ")} } as const;\n\n`;
  ts += `/** Easings, as cubic Bézier control points. */\nexport const EASE = { ${ease.map(([k, v]) => `${k}: [${v.join(", ")}]`).join(", ")} } as const;\n`;

  return { css, ts, modes: names, colors: order, resolve };
}
