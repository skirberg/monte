// Smoke test for the static export. Serves out/, drives headless Chrome over the DevTools protocol,
// and fails on what a passing build does not catch: a hero film that never starts, display type
// tracked so tight the glyphs collide, a closing mark that never finishes, page errors, sideways
// scrolling on phones, and share links that point at a different host.
//
//   npm run build && npm run smoke                     checks out/ on a local server
//   npm run smoke -- https://monte.markets          checks a deployed site instead
//   CHROME_PATH=/path/to/chrome                        uses another Chromium

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";

const OUT = join(process.cwd(), "out");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const GAMES = ["correlation", "monty-hall", "fake-coin", "serve", "house-edge", "odds", "ab-test", "long-run", "options"];
const ROUTES = ["/", "/study/", "/play/", ...GAMES.map((g) => `/play/${g}/`), "/built/"];
// Requests that only resolve on Vercel (analytics) or that browsers make on their own.
const IGNORE = [/\/_vercel\//, /favicon\.ico/];
// Tightest tracking a display heading may use before condensed glyphs start to touch.
const MIN_TRACKING_EM = -0.03;

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".xml": "application/xml" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures.push(label);
};

// ---------- static server for out/ (trailing-slash routes resolve to index.html) ----------
async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const file = join(OUT, clean.endsWith("/") ? `${clean}index.html` : clean);
  try {
    if ((await stat(file)).isFile()) return file;
  } catch {}
  return null;
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? "/");
  if (!file) {
    res.writeHead(404, { "content-type": "text/html" });
    res.end(await readFile(join(OUT, "404.html")).catch(() => "Not found"));
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(await readFile(file));
});
const REMOTE = process.argv[2]?.replace(/\/$/, "");
if (!REMOTE) await new Promise((r) => server.listen(0, "127.0.0.1", r));
const ORIGIN = REMOTE ?? `http://127.0.0.1:${server.address().port}`;

// ---------- headless Chrome over the DevTools protocol ----------
const profile = await mkdtemp(join(tmpdir(), "monte-smoke-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--hide-scrollbars",
  "--mute-audio",
  // Keep timers and animation frames running at full speed in a headless window.
  "--disable-background-timer-throttling",
  "--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows",
  "about:blank",
], { stdio: "ignore" });

let port;
for (let i = 0; i < 60 && !port; i++) {
  port = await readFile(join(profile, "DevToolsActivePort"), "utf8").then((t) => t.split("\n")[0]).catch(() => null);
  if (!port) await sleep(250);
}
if (!port) throw new Error(`Chrome did not start (looked for ${CHROME})`);
const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let seq = 0;
const pending = new Map();
const listeners = new Set();
let pageErrors = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") pageErrors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") pageErrors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error" && !IGNORE.some((r) => r.test(m.params.entry.url ?? ""))) pageErrors.push(`${m.params.entry.text} ${m.params.entry.url ?? ""}`);
  for (const fn of listeners) fn(m);
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
const waitFor = async (expression, timeout = 8000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await evaluate(expression).catch(() => false)) return true;
    await sleep(200);
  }
  return false;
};
const load = async (path) => {
  pageErrors = [];
  const loaded = new Promise((r) => {
    const fn = (m) => m.method === "Page.loadEventFired" && (listeners.delete(fn), r());
    listeners.add(fn);
  });
  await send("Page.navigate", { url: ORIGIN + path });
  await loaded;
  await waitFor("document.fonts.status === 'loaded'", 5000);
  await sleep(600); // let hydration and first effects settle
};
const viewport = (width, height, mobile) => send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
const media = (features) => send("Emulation.setEmulatedMedia", { features });
const filmCount = "Number((document.querySelector('figure')?.innerText.match(/n\\s+(\\d+)/) ?? [])[1] ?? -1)";

try {
  await Promise.all([send("Page.enable"), send("Runtime.enable"), send("Log.enable")]);
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });

  console.log(`\nMonte smoke test against ${ORIGIN}\n\nRoutes, desktop 1440 x 900`);
  await viewport(1440, 900, false);
  await media([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  for (const path of ROUTES) {
    await load(path);
    const tracking = await evaluate(`(() => { const h = document.querySelector('h1'); if (!h) return null; const s = getComputedStyle(h); return parseFloat(s.letterSpacing) / parseFloat(s.fontSize) || 0; })()`);
    const problems = [...pageErrors];
    if (tracking !== null && tracking < MIN_TRACKING_EM) problems.push(`h1 tracking ${tracking.toFixed(3)}em`);
    check(problems.length === 0, path, problems.slice(0, 2).join("; "));
  }

  console.log("\nHome page behavior");
  await load("/");
  check(await evaluate(`document.fonts.check('680 40px "Bricolage Grotesque"')`), "display font loaded");
  check(await waitFor(`${filmCount} > 0`, 10000), "hero film plays without a click", `grains counted: ${await evaluate(filmCount)}`);
  const share = await evaluate(`({ og: document.querySelector('meta[property="og:image"]')?.content, canonical: document.querySelector('link[rel=canonical]')?.href })`);
  const sameHost = Boolean(share.og && share.canonical) && new URL(share.og).host === new URL(share.canonical).host;
  const ogExists = REMOTE
    ? await fetch(share.og ?? "", { method: "HEAD" }).then((r) => r.ok).catch(() => false)
    : Boolean(await resolveFile(new URL(share.og ?? "http://x/missing").pathname));
  const onThisHost = !REMOTE || (share.canonical ?? "").startsWith(REMOTE);
  check(sameHost && ogExists && onThisHost, "share image and canonical URL agree", `${share.og}`);
  const icons = await evaluate(`[...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')].map((l) => l.href)`);
  const iconStatus = await Promise.all(["/favicon.ico", ...icons.map((h) => new URL(h).pathname)].map((p) => fetch(ORIGIN + p, { method: "HEAD" }).then((r) => `${p} ${r.status}`).catch(() => `${p} failed`)));
  const hasFavicon = icons.some((h) => /icon\.svg|favicon\.ico/.test(h));
  check(hasFavicon && iconStatus.every((s) => s.endsWith(" 200")), "favicon, app icons and manifest are linked and served", iconStatus.filter((s) => !s.endsWith(" 200")).join("; ") || (hasFavicon ? "" : "no favicon link"));
  await evaluate(`(() => { const h = [...document.querySelectorAll('main h2')].find((x) => /Ten minutes/.test(x.textContent)); h?.parentElement.querySelector('svg')?.scrollIntoView({ block: 'center' }); return true; })()`);
  const closingDone = await waitFor(`(() => { const h = [...document.querySelectorAll('main h2')].find((x) => /Ten minutes/.test(x.textContent)); const c = [...(h?.parentElement.querySelector('svg')?.querySelectorAll('circle') ?? [])]; const g = c[3]; return c.length === 4 && getComputedStyle(g).opacity === '1' && getComputedStyle(g).transform === 'none'; })()`, 8000);
  check(closingDone, "closing mark finishes (grain under the last cup)");

  console.log("\nStudy analytics (page views queued for Vercel)");
  const queued = "(window.vaq ?? []).filter((c) => c[0] === 'pageview').map((c) => c[1].path)";
  await load("/study/#practice/drill");
  check(await waitFor(`${queued}.includes('/study/practice/drill/')`, 4000), "a study section counts as its own page");
  await evaluate("location.hash = '#learn/topics/Typed Search'; true");
  await waitFor(`${queued}.includes('/study/learn/topics/')`, 3000);
  check(!(await evaluate(`${queued}.some((p) => /Typed|Search|\\s/.test(p))`)), "typed text never reaches analytics", JSON.stringify(await evaluate(queued)));
  await evaluate("document.getElementById('drill-result').hidden = false; true");
  check(await waitFor(`${queued}.includes('/study/practice/drill/finished/')`, 3000), "a finished drill is counted");

  console.log("\nReduced motion");
  await media([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await load("/");
  const still = await waitFor(`${filmCount} > 200`, 4000);
  const before = await evaluate(filmCount);
  await sleep(1500);
  check(still && (await evaluate(filmCount)) === before, "hero shows the finished pile and holds still", `grains: ${before}`);
  await media([{ name: "prefers-reduced-motion", value: "no-preference" }]);

  console.log("\nRoutes, phone 390 x 844");
  await viewport(390, 844, true);
  for (const path of ROUTES) {
    await load(path);
    const overflow = await evaluate("document.scrollingElement.scrollWidth - innerWidth");
    check(overflow <= 0 && pageErrors.length === 0, path, [overflow > 0 ? `${overflow}px sideways scroll` : "", ...pageErrors].filter(Boolean).slice(0, 2).join("; "));
  }
} finally {
  ws.close();
  chrome.kill();
  if (server.listening) server.close();
}

console.log(failures.length ? `\n${failures.length} check(s) failed.\n` : "\nAll checks passed.\n");
process.exit(failures.length ? 1 : 0);
