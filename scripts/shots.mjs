// Screenshots for design review: every route as a full-length page on desktop (1440) and phone
// (390, 3x), light and dark, with reduced motion so films sit on their finished frame. Writes
// screenshots/review/*.png (git-ignored).   npm run build && npm run shots   (add --only=play to filter)
import { mkdirSync, writeFileSync } from "node:fs";
import { launch, serve, ROUTES } from "./lib/browser.mjs";

const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const routes = ROUTES.filter((r) => !only || r.includes(only));
const name = (r) => (r === "/" ? "home" : r.replace(/^\/|\/$/g, "").replace(/[/#]+/g, "-") || "home");
mkdirSync("screenshots/review", { recursive: true });

const srv = await serve();
const { page, close } = await launch();
try {
  for (const [label, w, mobile, dpr] of [["desktop", 1440, false, 1], ["phone", 390, true, 2]]) {
    for (const scheme of ["light", "dark"]) {
      await page.size(w, 900, { mobile, dpr });
      await page.media({ scheme, reduce: true });
      for (const r of routes) {
        await page.go(srv.url + r, 1600);
        await page.eval("document.querySelectorAll('[style*=opacity]').forEach(e => { if (getComputedStyle(e).opacity === '0') e.style.opacity = '1'; }); true");
        const file = `screenshots/review/${label}-${scheme}-${name(r)}.png`;
        writeFileSync(file, await page.png({ full: true }));
        console.log("shot", file);
      }
    }
  }
} finally {
  close();
  srv.close();
}
