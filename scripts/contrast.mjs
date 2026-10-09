// WCAG contrast for every color pair the design actually uses, in light and dark.
// Reads the :root and .dark blocks of app/globals.css (oklch tokens) and fails on any pair below
// its threshold.   npm run contrast
import { readFileSync } from "node:fs";

const css = readFileSync("app/globals.css", "utf8");
const block = (sel) => {
  const m = css.match(new RegExp(`^${sel.replace(".", "\\.")}\\s*\\{([^}]*)\\}`, "m"));
  return Object.fromEntries([...(m?.[1] ?? "").matchAll(/--([\w-]+):\s*([^;]+);/g)].map((x) => [x[1], x[2].trim()]));
};

// oklch -> linear sRGB (Björn Ottosson's OKLab matrices), clipped to gamut.
function oklchToLinear(v) {
  const m = v.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) return null;
  const [L, C, H] = [+m[1], +m[2], (+m[3] * Math.PI) / 180];
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ].map((x) => Math.min(1, Math.max(0, x)));
}
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const PAIRS = [
  ["ink", "paper", 4.5, "body text"],
  ["ink", "sand", 4.5, "text on sand panels"],
  ["ink-muted", "paper", 4.5, "secondary text"],
  ["ink-muted", "sand", 4.5, "secondary text on sand"],
  ["ink-muted", "sand-2", 4.5, "secondary text on sand-2"],
  ["paper", "ink", 4.5, "primary button"],
  ["clay-ink", "paper", 4.5, "clay as small text and links"],
  ["clay-ink", "sand", 4.5, "clay text on sand"],
  ["clay", "paper", 3, "clay marks and large text"],
  ["clay", "sand", 3, "clay marks on sand"],
  ["ink", "clay-tint", 4.5, "text on the clay highlight"],
  ["danger", "paper", 4.5, "error text"],
  ["success", "paper", 4.5, "right-answer text"],
  ["line-strong", "paper", 3, "input and control borders"],
];

let fail = 0;
for (const [name, sel] of [["light", ":root"], ["dark", ".dark"]]) {
  const t = { ...block(":root"), ...(sel === ":root" ? {} : block(sel)) };
  console.log(`\n${name}`);
  for (const [a, b, need, what] of PAIRS) {
    const ca = oklchToLinear(t[a] ?? ""), cb = oklchToLinear(t[b] ?? "");
    if (!ca || !cb) { console.log(`  skip  ${a} on ${b}`); continue; }
    const r = ratio(ca, cb), ok = r >= need;
    if (!ok) fail++;
    console.log(`  ${ok ? "pass" : "FAIL"}  ${r.toFixed(2).padStart(5)} ≥ ${need}  ${what} (${a} on ${b})`);
  }
}
console.log(fail ? `\n${fail} pair(s) below WCAG AA.` : "\nEvery pair passes WCAG AA.");
process.exit(fail ? 1 : 0);
