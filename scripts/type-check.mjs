// Type scale guard. Every size, weight, letter-spacing and line height must come from the scale in app/globals.css
// (DESIGN.md, "Type scale"). Fails with file:line for anything else, so one-off values cannot creep back in.
//   npm run type-check
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(f) && !p.endsWith("globals.css")) files.push(p);
  }
};
for (const d of ["app", "components", "lib"]) walk(join(root, d));
// Image generators (share cards, cheat sheets): only the caps rule applies, since they style text inline.
const IMAGE_SCRIPTS = readdirSync(join(root, "scripts")).filter((f) => /^make-.*\.tsx$/.test(f)).map((f) => join(root, "scripts", f));

// Utility prefix (variants like md: or [&_b]:) followed by the forbidden core.
const V = String.raw`(?:^|[\s"'\x60{(])(?:[\w\[\]&>*@:.\-]*:)?`;
const RULES = [
  [new RegExp(V + String.raw`text-\[[^\]]*(?:\d(?:px|rem|em|vw|vh|%)|clamp)[^\]]*\]`, "g"), "raw font size: use a step of the scale (text-xs … text-4xl, text-lead, text-heading, text-headline, text-title, text-display, text-figure, text-hero, text-symbol)"],
  [new RegExp(V + String.raw`text-[5-9]xl(?![\w-])`, "g"), "off-scale size: use text-headline or text-display"],
  [new RegExp(V + String.raw`font-(?:\[\d+\]|thin|extralight|light|bold|extrabold|black)(?![\w-])`, "g"), "off-scale weight: use font-normal, font-medium or font-semibold"],
  [new RegExp(V + String.raw`tracking-(?:\[[^\]]+\]|tighter|wide|wider)(?![\w-])`, "g"), "raw letter-spacing: display type carries it in font-display; figures use tracking-tight"],
  [new RegExp(V + String.raw`leading-\[[^\]]+\]`, "g"), "raw line height: fluid steps carry their own; otherwise leading-none, -tight, -snug, -normal or -relaxed"],
  [new RegExp(V + String.raw`uppercase(?![\w-])`, "g"), "caps label: labels are sentence case (use the label style in components/study/ui.tsx)"],
];
// shadcn keyboard-shortcut hints keep their wide spacing.
const ALLOW = [[/components\/ui\//, /tracking-widest/]];

let bad = 0;
for (const f of files) {
  const rel = relative(root, f);
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // comments
    for (const [re, why] of RULES) {
      for (const m of line.matchAll(re)) {
        if (ALLOW.some(([p, r]) => p.test(rel) && r.test(m[0]))) continue;
        bad++;
        console.log(`${rel}:${i + 1}  ${m[0].trim()}  ${why}`);
      }
    }
  });
}
for (const f of IMAGE_SCRIPTS) {
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    if (/textTransform:\s*["']uppercase["']|\.toUpperCase\(\)/.test(line) && !/^\s*(\/\/|\*)/.test(line)) {
      bad++;
      console.log(`${relative(root, f)}:${i + 1}  caps label in a generated image: labels are sentence case`);
    }
  });
}
if (bad) {
  console.log(`\ntype-check: ${bad} value(s) off the type scale`);
  process.exit(1);
}
console.log(`type-check: ${files.length} files, all type on the scale`);
