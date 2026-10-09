// Accessibility and layout QA for the static export: every route at 375, 768, 1024 and 1440 px in
// light and dark. Fails on axe violations (WCAG 2.1 AA plus best practice), sideways scrolling and
// tap targets under 24 px.   npm run build && npm run qa
import { readFileSync } from "node:fs";
import { launch, serve, ROUTES } from "./lib/browser.mjs";

const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const WIDTHS = [375, 768, 1024, 1440];
const problems = new Map();
const note = (key, where) => (problems.get(key) ?? problems.set(key, new Set()).get(key)).add(where);

const srv = await serve();
const { page, close } = await launch();
let checks = 0;
try {
  for (const scheme of ["light", "dark"]) {
    for (const width of WIDTHS) {
      await page.size(width, 900, { mobile: width < 768 });
      await page.media({ scheme, reduce: true });
      for (const path of ROUTES) {
        await page.go(srv.url + path, 1400);
        await page.eval(AXE + ";true");
        const r = await page.eval(`(async () => {
          const a = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] } });
          const de = document.scrollingElement;
          const small = [...document.querySelectorAll("a[href], button, input, select, [role=button], [role=tab], [role=radio]")]
            .filter((el) => { const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return b.width > 1 && b.height > 1 && s.visibility !== "hidden" && s.clipPath !== "inset(50%)" && !el.matches(".sr-only, .sr-only *") && (b.width < 24 || b.height < 24) && !el.closest("p, li, dd, td"); })
            .slice(0, 3).map((el) => (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 30));
          return { v: a.violations.map((v) => v.id + " (" + v.impact + "): " + v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")), overflow: de.scrollWidth - innerWidth, small };
        })()`);
        checks++;
        const where = `${path} ${width}px ${scheme}`;
        for (const v of r.v) note(`axe ${v.split(":")[0]}`, `${where}: ${v.split(": ").slice(1).join(": ")}`);
        if (r.overflow > 0) note("sideways scroll", `${where}: ${r.overflow}px`);
        if (r.small.length) note("tap target under 24px", `${where}: ${r.small.join(", ")}`);
      }
    }
  }
} finally {
  close();
  srv.close();
}

console.log(`${ROUTES.length} routes x ${WIDTHS.length} widths x 2 themes = ${checks} checks.`);
if (!problems.size) {
  console.log("All clear: no axe violations, no sideways scroll, no tiny tap targets.");
  process.exit(0);
}
for (const [k, s] of problems) {
  console.log(`\n${k}: ${s.size} place(s)`);
  [...s].slice(0, 4).forEach((x) => console.log("  " + x));
}
process.exit(1);
