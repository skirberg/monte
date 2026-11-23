// Checks a running Monte against its brand kit: every file kit.json lists (the kit itself, the app icons, the
// favicon, every share card) must come back 200 with the sha256 kit.json records, and every icon the manifest and
// the pages name, and every og:image and twitter:image, must be one of those files.
//
//   node scripts/check-kit.ts https://monte.markets      the live site (the brand-live workflow runs this after a deploy)
//   npm run smoke                                         runs the same check against the local build
//
// Only Node's own modules, so it runs on Node 24's type stripping with no install.
import { createHash } from "node:crypto";

type Entry = { path: string; url: string; bytes: number; sha256: string };
type Kit = { version: string; files: Entry[]; served: Entry[] };

const PAGES = ["/", "/daily/", "/shuffle/", "/learn/normal/", "/learn/normal/the-bell/", "/practice/drill/", "/solve/normal/", "/decide/bayes/", "/play/", "/play/monty-hall/", "/brand/"];

export async function checkKit(origin: string): Promise<{ checked: number; problems: string[]; version?: string }> {
  const problems: string[] = [];
  const get = async (path: string) => {
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetch(origin + path, { headers: { "cache-control": "no-cache" } });
        return { status: r.status, body: Buffer.from(await r.arrayBuffer()), type: r.headers.get("content-type") ?? "" };
      } catch {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
    return { status: 0, body: Buffer.alloc(0), type: "" };
  };
  const kitRes = await get("/brand/kit.json");
  if (kitRes.status !== 200) return { checked: 0, problems: [`/brand/kit.json: HTTP ${kitRes.status}`] };
  const kit = JSON.parse(kitRes.body.toString("utf8")) as Kit;
  const all = [...kit.files, ...kit.served];
  const known = new Map(all.map((f) => [f.url, f]));

  // Every listed file, served and unchanged (a few at a time).
  let checked = 0;
  for (let i = 0; i < all.length; i += 8) {
    await Promise.all(
      all.slice(i, i + 8).map(async (f) => {
        const r = await get(f.url);
        checked++;
        if (r.status !== 200) problems.push(`${f.url}: HTTP ${r.status}`);
        else if (createHash("sha256").update(r.body).digest("hex") !== f.sha256) problems.push(`${f.url}: differs from kit.json`);
      }),
    );
  }

  // Every icon the manifest names.
  const man = await get("/manifest.webmanifest");
  if (man.status !== 200) problems.push(`/manifest.webmanifest: HTTP ${man.status}`);
  else for (const icon of (JSON.parse(man.body.toString("utf8")) as { icons: { src: string }[] }).icons) if (!known.has(icon.src)) problems.push(`manifest icon ${icon.src} is not in kit.json`);

  // Every icon and share image the pages name.
  for (const p of PAGES) {
    const r = await get(p);
    if (r.status !== 200) {
      problems.push(`${p}: HTTP ${r.status}`);
      continue;
    }
    const html = r.body.toString("utf8");
    const named = [
      ...[...html.matchAll(/<meta (?:property="og:image"|name="twitter:image") content="([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/<link rel="(?:icon|apple-touch-icon|shortcut icon)" href="([^"]+)"/g)].map((m) => m[1]),
    ];
    if (!named.length) problems.push(`${p}: names no icon or share image`);
    for (const u of named) {
      const path = new URL(u, origin).pathname;
      if (!known.has(path)) problems.push(`${p} names ${path}, which is not in kit.json`);
    }
  }
  return { checked, problems, version: kit.version };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const origin = (process.argv[2] ?? "https://monte.markets").replace(/\/$/, "");
  const { checked, problems, version } = await checkKit(origin);
  console.log(`${origin}: kit ${version ?? "?"}, ${checked} files fetched`);
  for (const p of problems) console.log(`  FAIL  ${p}`);
  console.log(problems.length ? `${problems.length} problem(s).` : "Every icon, share card and kit file matches kit.json.");
  process.exit(problems.length ? 1 : 0);
}
