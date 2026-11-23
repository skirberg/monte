// Accessibility and layout QA for the static export: every route at 375, 768, 1024 and 1440 px in
// light and dark, then a layout pass at the common device widths (360 Android, 390 iPhone, 430 large
// iPhone, 834 iPad, 1280 laptop, 1920 desktop), then every built page, not only the routes, at 320 px,
// the smallest phone in use. Fails on axe violations (WCAG 2.1 AA plus best practice), sideways
// scrolling, anything drawn past the screen's edge, tap targets under 24 px, and at 320 px also a
// fixed layer past the screen's edge or a text field under 16 px (iOS Safari zooms into one when it
// gets focus).   npm run build && npm run qa
import { readFileSync, readdirSync } from "node:fs";
import { launch, serve, ROUTES } from "./lib/browser";

const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const WIDTHS = [375, 768, 1024, 1440];
const DEVICES = [360, 390, 430, 834, 1280, 1920];
const SMALLEST = 320;
// Every page the build wrote (out/**/index.html), so a page missing from ROUTES is still held to the smallest phone.
const PAGES = readdirSync("out", { recursive: true, encoding: "utf8" })
  .filter((f) => (f === "index.html" || f.endsWith("/index.html")) && !f.startsWith("_next/"))
  .map((f) => "/" + f.slice(0, -"index.html".length))
  .sort();
const problems = new Map<string, Set<string>>();
const note = (key: string, where: string) => (problems.get(key) ?? problems.set(key, new Set()).get(key)!).add(where);

// Layout checks shared by every pass: sideways scroll, small tap targets, and elements past either edge
// (skipping fixed layers and anything inside a box that scrolls or clips sideways on purpose). The screen's
// width is the layout viewport, documentElement.clientWidth, not innerWidth: on a phone innerWidth grows to
// fit a page that is too wide (a 360 px page on a 320 px phone reports 360), which hid the overflow it should catch.
const LAYOUT = `(() => {
  const de = document.scrollingElement, vw = de.clientWidth;
  const small = [...document.querySelectorAll("a[href], button, input, select, [role=button], [role=tab], [role=radio]")]
    .filter((el) => { const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return b.width > 1 && b.height > 1 && s.visibility !== "hidden" && s.clipPath !== "inset(50%)" && !el.matches(".sr-only, .sr-only *") && (b.width < 24 || b.height < 24) && !el.closest("p, li, dd, td"); })
    .slice(0, 3).map((el) => (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 30));
  const inside = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (s.overflowX !== "visible" || s.position === "fixed") return true; } return false; };
  const off = [...document.querySelectorAll("body *")]
    .filter((el) => { const b = el.getBoundingClientRect(); if (b.width < 2 || b.height < 2 || (b.right <= vw + 1 && b.left >= -1)) return false; const s = getComputedStyle(el); return s.position !== "fixed" && s.visibility !== "hidden" && !el.closest(".sr-only, [aria-hidden=true], [inert]") && !inside(el); })
    .slice(0, 3).map((el) => el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\\s+/).slice(0, 3).join(".") : ""));
  return { overflow: de.scrollWidth - vw, small, off };
})()`;
type Layout = { overflow: number; small: string[]; off: string[] };
// The smallest phone only: what sticks out when the page is too wide (so a failure names what to fix), fixed layers
// (header, bottom nav, toasts) past either edge, and text fields under 16 px.
const PHONE = `(() => {
  const vw = document.documentElement.clientWidth;
  const name = (el) => el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\\s+/).slice(0, 3).join(".") : "");
  const shown = (el) => { const b = el.getBoundingClientRect(); return b.width > 1 && b.height > 1 && getComputedStyle(el).visibility !== "hidden"; };
  const all = [...document.querySelectorAll("body *")];
  const past = (el) => el.getBoundingClientRect().right > vw + 1;
  const wide = all.filter((el) => shown(el) && past(el) && ![...el.children].some(past)).slice(0, 3).map(name);
  const fixed = all.filter((el) => getComputedStyle(el).position === "fixed" && shown(el) && (past(el) || el.getBoundingClientRect().left < -1)).slice(0, 3).map(name);
  const fields = [...document.querySelectorAll("input, select, textarea")]
    .filter((el) => !/^(checkbox|radio|range|button|submit|reset|color|file|hidden|image)$/.test(el.type) && shown(el) && parseFloat(getComputedStyle(el).fontSize) < 16)
    .slice(0, 3).map((el) => (el.getAttribute("aria-label") || el.name || name(el)) + " " + getComputedStyle(el).fontSize);
  return { wide, fixed, fields };
})()`;
type Phone = { wide: string[]; fixed: string[]; fields: string[] };
const layoutNotes = (r: Layout, where: string) => {
  if (r.overflow > 0) note("sideways scroll", `${where}: ${r.overflow}px`);
  if (r.small.length) note("tap target under 24px", `${where}: ${r.small.join(", ")}`);
  if (r.off.length) note("past the screen's edge", `${where}: ${r.off.join(", ")}`);
};

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
        const r = await page.eval<Layout & { v: string[] }>(`(async () => {
          const a = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] } });
          return { v: a.violations.map((v) => v.id + " (" + v.impact + "): " + v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")), ...${LAYOUT} };
        })()`);
        checks++;
        const where = `${path} ${width}px ${scheme}`;
        for (const v of r.v) note(`axe ${v.split(":")[0]}`, `${where}: ${v.split(": ").slice(1).join(": ")}`);
        layoutNotes(r, where);
      }
    }
  }
  // Device widths: layout only, light theme (colour does not move layout).
  await page.media({ scheme: "light", reduce: true });
  for (const width of DEVICES) {
    await page.size(width, 900, { mobile: width < 768 });
    for (const path of ROUTES) {
      await page.go(srv.url + path, 900);
      layoutNotes(await page.eval<Layout>(LAYOUT), `${path} ${width}px`);
      checks++;
    }
  }
  // Every built page at the smallest phone width.
  await page.size(SMALLEST, 900, { mobile: true });
  for (const path of PAGES) {
    await page.go(srv.url + path, 900);
    const where = `${path} ${SMALLEST}px`;
    const r = await page.eval<Layout>(LAYOUT);
    const p = await page.eval<Phone>(PHONE);
    layoutNotes({ ...r, overflow: 0 }, where);
    if (r.overflow > 0) note("sideways scroll", `${where}: ${r.overflow}px, ${p.wide.join(", ")}`);
    if (p.fixed.length) note("fixed layer past the screen's edge", `${where}: ${p.fixed.join(", ")}`);
    if (p.fields.length) note("text field under 16px (iOS zooms in)", `${where}: ${p.fields.join(", ")}`);
    checks++;
  }
} finally {
  close();
  srv.close();
}

console.log(`${ROUTES.length} routes: ${WIDTHS.length} widths x 2 themes with axe, plus ${DEVICES.length} device widths; all ${PAGES.length} built pages at ${SMALLEST} px. ${checks} checks.`);
if (!problems.size) {
  console.log("All clear: no axe violations, no sideways scroll, nothing past the edge, no tiny tap targets, no text field under 16 px.");
  process.exit(0);
}
for (const [k, s] of problems) {
  console.log(`\n${k}: ${s.size} place(s)`);
  [...s].slice(0, 4).forEach((x) => console.log("  " + x));
}
process.exit(1);
