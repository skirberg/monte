// Shared by qa.mjs and shots.mjs: a static server for out/ (trailing-slash routes resolve to
// index.html) and headless Chrome driven over the DevTools protocol in real time.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".xml": "application/xml" };

export async function serve(dir = join(process.cwd(), "out")) {
  const server = createServer(async (req, res) => {
    const clean = normalize(decodeURIComponent((req.url ?? "/").split("?")[0])).replace(/^(\.\.[/\\])+/, "");
    let file = join(dir, clean.endsWith("/") ? `${clean}index.html` : clean);
    try {
      if (!(await stat(file)).isFile()) throw 0;
    } catch {
      res.writeHead(404, { "content-type": "text/html" });
      res.end(await readFile(join(dir, "404.html")).catch(() => "Not found"));
      return;
    }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

export async function launch() {
  const profile = await mkdtemp(join(tmpdir(), "monte-chrome-"));
  const chrome = spawn(process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--hide-scrollbars", "--mute-audio",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "about:blank",
  ], { stdio: "ignore" });
  let port;
  for (let i = 0; i < 60 && !port; i++) {
    port = await readFile(join(profile, "DevToolsActivePort"), "utf8").then((t) => t.split("\n")[0]).catch(() => null);
    if (!port) await sleep(250);
  }
  if (!port) throw new Error("Chrome did not start");
  const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let seq = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    for (const fn of listeners) fn(m);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
  await Promise.all([send("Page.enable"), send("Runtime.enable")]);
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  const page = {
    on: (fn) => listeners.add(fn),
    eval: async (expression) => {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      return r.result.value;
    },
    size: (width, height, { mobile = false, dpr = 1 } = {}) => send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile }),
    media: ({ scheme = "light", reduce = false } = {}) => send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme }, { name: "prefers-reduced-motion", value: reduce ? "reduce" : "no-preference" }] }),
    go: async (url, settle = 900) => {
      // A hash-only change (/study/#a to /study/#b) navigates within the document and never fires
      // loadEventFired, so accept either event, with a timeout as a backstop.
      let fn;
      const loaded = new Promise((r) => {
        fn = (m) => (m.method === "Page.loadEventFired" || m.method === "Page.navigatedWithinDocument") && r();
        listeners.add(fn);
      });
      await send("Page.navigate", { url });
      await Promise.race([loaded, sleep(15000)]);
      listeners.delete(fn);
      await sleep(settle);
    },
    png: async ({ full = false } = {}) => Buffer.from((await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full })).data, "base64"),
  };
  return { page, close: () => { ws.close(); chrome.kill(); } };
}

// Every route worth checking, including the study app's main hash sections.
export const ROUTES = [
  "/", "/study/", "/study/#learn/topics/data", "/study/#learn/topics/normal", "/study/#learn/formulas", "/study/#learn/frameworks",
  "/study/#practice/drill", "/study/#practice/math", "/study/#solve/normal", "/study/#tools", "/study/#sources",
  "/play/", "/play/correlation/", "/play/monty-hall/", "/play/fake-coin/", "/play/serve/", "/play/house-edge/", "/play/odds/",
  "/play/ab-test/", "/play/long-run/", "/play/options/", "/built/", "/missing-page/",
];
