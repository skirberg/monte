// Writes app/tokens.css and lib/tokens.ts from tokens/monte.tokens.json, the one source for Monte's colours,
// corners and motion (DESIGN.md, "Tokens").   npm run tokens   writes them;   npm run tokens:check   fails when
// either file differs from what the JSON makes (CI runs it, and tests/tokens.test.ts does the same).
import { readFileSync, writeFileSync } from "node:fs";
import { OUT_CSS, OUT_TS, buildTokens } from "./lib/token-build";

const check = process.argv.includes("--check");
const { css, ts } = buildTokens();
let stale = 0;
for (const [file, want] of [[OUT_CSS, css], [OUT_TS, ts]] as const) {
  const have = (() => {
    try {
      return readFileSync(file, "utf8");
    } catch {
      return "";
    }
  })();
  if (have === want) continue;
  if (check) {
    stale++;
    console.log(`${file} differs from what tokens/monte.tokens.json makes: run npm run tokens and commit both files`);
  } else {
    writeFileSync(file, want);
    console.log(`wrote ${file}`);
  }
}
if (stale) process.exit(1);
console.log(check ? "tokens: app/tokens.css and lib/tokens.ts match the source" : "tokens: done");
