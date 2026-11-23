// Smoke test for the static export. Serves out/, drives headless Chrome over the DevTools protocol,
// and fails on what a passing build does not catch: a hero film that never starts, display type
// tracked so tight the glyphs collide, page errors, sideways scrolling on phones, share links
// that point at a different host, and a link to the repository while it is private.
//
//   npm run build && npm run smoke                     checks out/ on a local server
//   npm run smoke -- https://monte.markets             checks a deployed site instead
//   CHROME_PATH=/path/to/chrome                        uses another Chromium

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { launch, serve, sleep, type CdpMessage } from "./lib/browser";
import { afterThrow, shuffleRound } from "@/lib/play/shuffle";
import { localDay } from "@/lib/progress";
import { REPO_PUBLIC, REPO_URL } from "@/lib/seo";
import { checkKit } from "./check-kit";

const GAMES = ["correlation", "monty-hall", "fake-coin", "serve", "house-edge", "odds", "ab-test", "long-run", "options", "election"];
const ROUTES = ["/", "/shuffle/", "/daily/", "/study/", "/learn/", "/learn/normal/", "/learn/clt/one-versus-average/", "/learn/formulas/", "/practice/drill/", "/practice/math/", "/practice/cards/", "/solve/tree/", "/tools/excel/", "/sources/", "/play/", ...GAMES.map((g) => `/play/${g}/`), "/story/", "/about/", "/built/", "/brand/"];
// Requests that only resolve on Vercel (analytics) or that browsers make on their own.
const IGNORE = [/\/_vercel\//, /favicon\.ico/];
// Tightest tracking a display heading may use before condensed glyphs start to touch.
const MIN_TRACKING_EM = -0.03;

const failures: string[] = [];
const check = (ok: boolean, label: string, detail = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures.push(label);
};

const REMOTE = process.argv[2]?.replace(/\/$/, "");
const srv = REMOTE ? null : await serve();
const ORIGIN = REMOTE ?? srv!.url;
const { page, close } = await launch();

// Page errors: thrown exceptions, console.error and failed requests, collected per page load.
type Params = {
  exceptionDetails: { text: string; exception?: { description?: string } };
  type: string;
  args: { value?: unknown; description?: string }[];
  entry: { level: string; text: string; url?: string };
};
let pageErrors: string[] = [];
page.on((m: CdpMessage) => {
  const p = m.params as Params | undefined;
  if (!p) return;
  if (m.method === "Runtime.exceptionThrown") pageErrors.push(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && p.type === "error") pageErrors.push(p.args.map((a) => a.value ?? a.description).join(" "));
  if (m.method === "Log.entryAdded" && p.entry.level === "error" && !IGNORE.some((r) => r.test(p.entry.url ?? ""))) pageErrors.push(`${p.entry.text} ${p.entry.url ?? ""}`);
});
const evaluate = page.eval;
const waitFor = async (expression: string, timeout = 8000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await evaluate(expression).catch(() => false)) return true;
    await sleep(200);
  }
  return false;
};
const load = async (path: string) => {
  pageErrors = [];
  await page.go(ORIGIN + path, 0);
  await waitFor("document.fonts.status === 'loaded'", 5000);
  await sleep(600); // let hydration and first effects settle
};
const reduceMotion = (reduce: boolean) => page.media({ scheme: "light", reduce });
const filmCount = "Number((document.querySelector('figure')?.innerText.match(/n\\s+(\\d+)/) ?? [])[1] ?? -1)";

try {
  await page.send("Log.enable");

  console.log(`\nMonte smoke test against ${ORIGIN}\n\nRoutes, desktop 1440 x 900`);
  await page.size(1440, 900);
  await reduceMotion(false);
  for (const path of ROUTES) {
    await load(path);
    const tracking = await evaluate<number | null>(`(() => { const h = document.querySelector('h1'); if (!h) return null; const s = getComputedStyle(h); return parseFloat(s.letterSpacing) / parseFloat(s.fontSize) || 0; })()`);
    const problems = [...pageErrors];
    if (tracking !== null && tracking < MIN_TRACKING_EM) problems.push(`h1 tracking ${tracking.toFixed(3)}em`);
    check(problems.length === 0, path, problems.slice(0, 2).join("; "));
  }

  console.log("\nHome page behavior");
  await load("/");
  check(await evaluate<boolean>(`document.fonts.check('680 40px "Bricolage Grotesque"')`), "display font loaded");
  check(await waitFor(`${filmCount} > 0`, 10000), "hero film plays without a click", `grains counted: ${await evaluate(filmCount)}`);
  const share = await evaluate<{ og?: string; canonical?: string }>(`({ og: document.querySelector('meta[property="og:image"]')?.content, canonical: document.querySelector('link[rel=canonical]')?.href })`);
  const sameHost = !!share.og && !!share.canonical && new URL(share.og).host === new URL(share.canonical).host;
  const ogExists = await fetch(ORIGIN + new URL(share.og ?? "http://x/missing").pathname, { method: "HEAD" }).then((r) => r.ok).catch(() => false);
  const onThisHost = !REMOTE || (share.canonical ?? "").startsWith(REMOTE);
  check(sameHost && ogExists && onThisHost, "share image and canonical URL agree", `${share.og}`);
  const icons = await evaluate<string[]>(`[...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')].map((l) => l.href)`);
  const iconStatus = await Promise.all(["/favicon.ico", ...icons.map((h) => new URL(h).pathname)].map((p) => fetch(ORIGIN + p, { method: "HEAD" }).then((r) => `${p} ${r.status}`).catch(() => `${p} failed`)));
  const hasFavicon = icons.some((h) => /icon\.svg|favicon\.ico/.test(h));
  check(hasFavicon && iconStatus.every((s) => s.endsWith(" 200")), "favicon, app icons and manifest are linked and served", iconStatus.filter((s) => !s.endsWith(" 200")).join("; ") || (hasFavicon ? "" : "no favicon link"));

  console.log("\nAnalytics (page views and custom events queued for Vercel)");
  const queued = "(window.vaq ?? []).filter((c) => c[0] === 'pageview').map((c) => c[1].path)";
  const events = "(window.vaq ?? []).filter((c) => c[0] === 'event').map((c) => c[1].name + ' ' + JSON.stringify(c[1].data ?? {}))";
  await load("/practice/drill/");
  check(await waitFor(`${queued}.includes('/practice/drill/')`, 4000), "a study section counts as its own page");
  await load("/learn/normal/");
  check(await waitFor(`${queued}.includes('/learn/normal/')`, 4000), "a topic page counts as its own page");
  console.log("\nOld study links");
  await load("/study/#learn/topics/normal");
  check(await waitFor("location.pathname === '/learn/normal/'", 6000), "an old #hash link lands on its page", await evaluate("location.href"));
  await load("/study/#learn/topics/Typed Search");
  const landed = await waitFor("location.pathname === '/learn/'", 6000);
  await sleep(600);
  check(landed && !(await evaluate(`${queued}.some((p) => /Typed|Search|\\s/.test(p))`)), "an unknown topic falls back to Learn, and typed text never reaches analytics", JSON.stringify(await evaluate(queued)));
  await load("/study/#practice/drill/mock");
  check(await waitFor("location.pathname === '/practice/drill/' && !location.search && !!document.querySelector('[role=timer]')", 6000), "an old mock exam link opens the drill page with the mock running");
  await load("/practice/drill/");
  await waitFor("!!document.querySelector('button[data-start=\"ten\"]')", 3000);
  await evaluate("document.querySelector('button[data-start=\"ten\"]').click(); true");
  check(await waitFor(`${events}.some((e) => e.startsWith('Drill started') && e.includes('ten'))`, 3000), "event: drill started, with its mode");
  // Answer the first question right (read back from the shown answer), then end the set.
  await waitFor("!!document.getElementById('d-in')", 3000);
  await evaluate(`(async () => {
    const set = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true })); };
    set(document.getElementById("d-in"), "1");
    [...document.querySelectorAll("button")].find((b) => b.textContent === "Check").click();
    await new Promise((r) => setTimeout(r, 300));
    [...document.querySelectorAll("button")].find((b) => b.textContent === "End this drill").click();
    return true;
  })()`);
  check(await waitFor(`${events}.some((e) => e.startsWith('Drill finished') && e.includes('ten') && /\\d+-\\d+/.test(e))`, 3000), "event: drill finished, with a score band", JSON.stringify(await evaluate(events)));
  check(await waitFor("!!document.getElementById('r-score')", 2000), "a finished drill shows the score");
  await load("/solve/normal/");
  await evaluate("document.querySelector('[data-act=\"new\"]').click(); true");
  await waitFor("!document.querySelector('[data-act=\"show\"]')?.hidden", 2000);
  await evaluate("document.querySelector('[data-act=\"show\"]').click(); true");
  check(await waitFor(`${events}.some((e) => e.startsWith('Solver used') && e.includes('normal') && e.includes('new problem')) && ${events}.some((e) => e.includes('show answers'))`, 3000), "event: solver used, new problem and show answers", JSON.stringify(await evaluate(events)));
  await load("/play/monty-hall/");
  await evaluate("document.querySelector('main button')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); true");
  check(await waitFor(`${events}.some((e) => e.startsWith('Game played') && e.includes('monty-hall'))`, 3000), "event: game played, with its name");

  console.log("\nThe Shuffle, played through (today's round from lib/play/shuffle.ts)");
  {
    const SIDE = ["left", "middle", "right"];
    const round = shuffleRound(localDay());
    const grain = round.cups.findIndex((c) => c.right);
    const end = afterThrow(round.swaps);
    const wrong = [0, 1, 2].find((id) => id !== grain)!;
    const click = (label: string) => evaluate<boolean>(`(() => { const b = [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === ${JSON.stringify(label)} || b.textContent === ${JSON.stringify(label)}); if (!b || b.disabled) return false; b.click(); return true; })()`);
    const text = (t: string) => `document.body.innerText.includes(${JSON.stringify(t)})`;
    await load("/shuffle/");
    await evaluate("localStorage.removeItem('monte-shuffle'); true");
    await load("/shuffle/");
    check(await waitFor(`${text(`No. ${round.n}`)} && ${round.cups.map((c) => text(c.label.split("–")[0])).join(" && ")}`, 4000), `deals No. ${round.n} with its three answers on the table`, round.cups.map((c) => c.label).join(" | "));
    check(await click("Shuffle"), "the Shuffle button throws the cups");
    check(await waitFor(text("Lift a cup."), 15000), `the throw ends after ${round.swaps.length} swaps and asks for a lift`);
    check(await click(`Lift the ${SIDE[end[wrong]]} cup`) && (await waitFor(text("Not quite."), 3000)), "a wrong cup says what its number did, in the coach's words");
    check(await click(`Lift the ${SIDE[end[grain]]} cup`) && (await waitFor(text("Not quite. Here is the work."), 4000)), "the grain's cup ends the round and shows the work");
    // The work is drawn (DESIGN.md, "The Shuffle", design pass): a picture carrying the grain's answer, the steps one tap away.
    const drawn = await evaluate<string>(`document.querySelector('figure svg[role="img"]')?.getAttribute("aria-label") ?? ""`);
    check(drawn.includes(round.cups[grain].label.split("–")[0]), "the reveal draws the work, the grain's answer on the picture", drawn.slice(0, 90));
    const folded = await evaluate<boolean>(`(() => { const d = [...document.querySelectorAll("details")].find((x) => x.querySelector("summary")?.textContent?.startsWith("Every step")); return !!d && !d.open && !document.body.innerText.includes(${JSON.stringify(round.work[0].slice(0, 12))}); })()`);
    await evaluate(`[...document.querySelectorAll("summary")].find((x) => x.textContent?.startsWith("Every step"))?.click(); true`);
    check(folded && (await waitFor(text(round.work[0].slice(0, 12)), 2000)), "every step of the work is one tap under the picture");
    check(await waitFor(`${events}.some((e) => e.startsWith('Shuffle finished') && e.includes('"lifts":2'))`, 3000), "event: Shuffle finished, with the lifts");
    const saved = await evaluate<string>("localStorage.getItem('monte-shuffle') ?? ''");
    await load("/shuffle/");
    check((await waitFor(text("Found the grain on the second lift."), 4000)) && !(await evaluate<boolean>(`[...document.querySelectorAll("button")].some((b) => b.textContent === "Shuffle")`)), "coming back the same day opens on the result, scored once", saved.slice(0, 80));
    await load("/");
    check(await waitFor(`(document.querySelector('nav[aria-label="Today"]')?.innerText ?? "").includes("lift 2")`, 4000), "the home page's Today row says how today's Shuffle went");
  }

  console.log("\nA lesson finished with a miss");
  {
    // Pick the last choice each time (both are wrong in this lesson); the end shows the work without repeating the questions.
    await load("/learn/clt/one-versus-average/");
    for (let i = 0; i < 8; i++) {
      await evaluate(`(() => { const g = [...document.querySelectorAll('[aria-label="Your answer"]')].at(-1); const b = g && [...g.querySelectorAll("button")].filter((x) => !x.disabled).at(-1); b?.click(); return true; })()`);
      await sleep(150);
      const more = await evaluate<boolean>(`(() => { const b = [...document.querySelectorAll("main button")].filter((x) => /^(Continue|Finish)/.test(x.textContent ?? "")).at(-1); b?.click(); return !!b; })()`);
      await sleep(200);
      if (!more) break;
    }
    const end = await evaluate<{ text: string; jumps: boolean; asks: string[] }>(`(() => { const sec = document.querySelector('section[aria-label="Lesson finished with a miss"]'); const links = [...(sec?.querySelectorAll('a[aria-label="See the question"]') ?? [])]; return { text: sec?.innerText ?? "", jumps: links.length > 0 && links.every((a) => !!document.getElementById(a.getAttribute("href").slice(1))), asks: [...document.querySelectorAll('[aria-label="Your answer"]')].map((g) => g.parentElement.querySelector("p")?.textContent ?? "") }; })()`);
    check(end.text.includes("Not quite.") && end.text.includes("right."), "a miss ends on the score and the coach's line", end.text.slice(0, 60));
    check(end.jumps && end.asks.length > 0 && end.asks.every((q) => !end.text.includes(q.slice(0, 30))), "the end shows each fix and links back to its question, without repeating it");
  }

  console.log("\nMarkdown twins");
  for (const [path, twin] of [["/learn/normal/", "/learn/normal.md"], ["/", "/index.md"], ["/decide/warranty/", "/decide/warranty.md"]]) {
    await load(path);
    const href = await evaluate<string | null>(`document.querySelector('link[rel="alternate"][type="text/markdown"]')?.getAttribute('href') ?? null`);
    const body = await evaluate<string>(`fetch(${JSON.stringify(twin)}).then((r) => (r.ok && (r.headers.get('content-type') ?? '').startsWith('text/markdown') ? r.text() : ''))`);
    check(!!href?.endsWith(twin) && body.startsWith("# ") && body.includes("Canonical URL:"), `${path} names ${twin}, served as Markdown`, `link ${href}; ${body.length} chars`);
  }

  if (!REPO_PUBLIC) {
    // Every page, RSC payload, twin, llms.txt and API file in out/ (or the pages that once linked it, on a deployed site).
    // security.txt points security reports at the repository on purpose: it is for the repository, not for visitors.
    console.log("\nThe repository is private (REPO_PUBLIC in lib/seo.ts)");
    const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
    const texts = REMOTE
      ? await Promise.all(["/about/", "/built/", "/terms/", "/privacy/", "/llms.txt", "/llms-full.txt", "/index.md"].map(async (p) => [p, await (await fetch(ORIGIN + p)).text()]))
      : walk("out")
          .filter((f) => /\.(html|txt|md|json|xml|webmanifest)$/.test(f) && f !== join("out", ".well-known", "security.txt"))
          .map((f) => [f, readFileSync(f, "utf8")]);
    const linked = texts.filter(([, body]) => body.includes(REPO_URL)).map(([f]) => f);
    check(linked.length === 0, `no page, twin or llms.txt links the private repository (${texts.length} files)`, linked.slice(0, 3).join("; "));
  }

  console.log("\nBrand kit (every icon, share card and kit file against kit.json)");
  const kit = await checkKit(ORIGIN);
  check(kit.problems.length === 0, `kit ${kit.version ?? "?"}: ${kit.checked} files served and unchanged, every named icon and card listed`, kit.problems.slice(0, 3).join("; "));

  console.log("\nReduced motion");
  await reduceMotion(true);
  await load("/");
  const still = await waitFor(`${filmCount} > 200`, 4000);
  const before = await evaluate(filmCount);
  await sleep(1500);
  check(still && (await evaluate(filmCount)) === before, "hero shows the finished pile and holds still", `grains: ${before}`);
  {
    // Reduced motion: the cups swap instantly, a beat apart, and the reveal still works.
    const round = shuffleRound(localDay());
    const at = afterThrow(round.swaps)[round.cups.findIndex((c) => c.right)];
    await load("/shuffle/");
    await evaluate("localStorage.removeItem('monte-shuffle'); true");
    await load("/shuffle/");
    await evaluate(`[...document.querySelectorAll("button")].find((b) => b.textContent === "Shuffle").click(); true`);
    const lifted = (await waitFor(`document.body.innerText.includes("Lift a cup.")`, 15000)) && (await evaluate<boolean>(`(() => { const b = document.querySelector('button[aria-label="Lift the ${["left", "middle", "right"][at]} cup"]'); b?.click(); return !!b; })()`));
    check(lifted && (await waitFor(`document.body.innerText.includes("Found the grain, first lift.")`, 3000)), "the Shuffle with reduced motion: instant swaps, the reveal still works");
  }
  await reduceMotion(false);

  console.log("\nRoutes, phone 390 x 844");
  await page.size(390, 844, { mobile: true });
  await page.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await page.send("Emulation.setEmitTouchEventsForMouse", { enabled: true, configuration: "mobile" });
  {
    // The board's hint says Tap on a phone from the first paint: the static HTML, before any script runs.
    await page.send("Emulation.setScriptExecutionDisabled", { value: true });
    await load("/");
    // What shows: the hint's text without the parts its CSS hides (innerText is not laid out with scripts off).
    const hint = await evaluate<string>(`[...document.querySelectorAll("figure p")].map((p) => [...p.childNodes].filter((n) => n.nodeType === 3 || getComputedStyle(n).display !== "none").map((n) => n.textContent).join("")).find((t) => /drop a grain/.test(t)) ?? ""`);
    await page.send("Emulation.setScriptExecutionDisabled", { value: false });
    check(hint.startsWith("Tap to drop a grain"), "the board's hint says Tap on a phone before any script runs", hint);
    await load("/");
    const box = await evaluate<{ bottom: number; tab: number }>(`(() => { const t = document.querySelector('nav[aria-label="Today"]').getBoundingClientRect(); const bar = [...document.querySelectorAll("nav")].find((n) => getComputedStyle(n).position === "fixed" && n.getBoundingClientRect().top > innerHeight / 2); return { bottom: Math.round(t.bottom), tab: Math.round(bar ? bar.getBoundingClientRect().top : innerHeight) }; })()`);
    check(box.bottom <= box.tab, "today's Shuffle and chart sit on the first phone screen, above the tab bar", `bottom ${box.bottom}, tab bar ${box.tab}`);
  }
  for (const path of ROUTES) {
    await load(path);
    const overflow = await evaluate<number>("document.scrollingElement.scrollWidth - innerWidth");
    check(overflow <= 0 && pageErrors.length === 0, path, [overflow > 0 ? `${overflow}px sideways scroll` : "", ...pageErrors].filter(Boolean).slice(0, 2).join("; "));
  }
} finally {
  close();
  srv?.close();
}

console.log(failures.length ? `\n${failures.length} check(s) failed.\n` : "\nAll checks passed.\n");
process.exit(failures.length ? 1 : 0);
