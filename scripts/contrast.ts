// Contrast for every colour pair the design actually uses, in every mode: light, dark and their high-contrast
// versions (prefers-contrast: more). Reads the tokens from tokens/monte.tokens.json (through lib/tokens.ts). WCAG 2
// is the rule and fails the check; APCA (the candidate for WCAG 3) is a second look, printed beside it, and flags a
// pair below its Lc level without failing.   npm run contrast
import { MODES, PAIRS, apca, contrast, need, tokens } from "./lib/tokens";

let fail = 0, low = 0;
for (const mode of MODES) {
  const t = tokens(mode);
  console.log(`\n${mode}`);
  for (const [a, b, base, what, lc] of PAIRS) {
    const r = contrast(t[a], t[b]);
    const want = need(mode, base);
    const ok = r >= want;
    const l = Math.abs(apca(t[a], t[b]));
    if (!ok) fail++;
    if (l < lc) low++;
    console.log(`  ${ok ? "pass" : "FAIL"}  ${r.toFixed(2).padStart(5)} ≥ ${String(want).padEnd(3)}  Lc ${l.toFixed(0).padStart(3)} ${l >= lc ? "≥" : "<"} ${lc}${l >= lc ? " " : "!"}  ${what} (${a} on ${b})`);
  }
}
console.log(fail ? `\n${fail} pair(s) below WCAG.` : "\nEvery pair passes WCAG 2 (AA, and AAA for text in the high-contrast modes).");
console.log(low ? `APCA: ${low} pair(s) below their Lc level (marked !). A second look, not a failure.` : "APCA: every pair reaches its Lc level.");
process.exit(fail ? 1 : 0);
