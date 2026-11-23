/**
 * Opens every link on the Sources page (lib/study/data.json) and reports the ones that no longer answer.
 * Run weekly by .github/workflows/check-sources.yml, which opens or updates one issue when a link breaks.
 * It never changes a source's "Checked" date: that date means a person read the page, and a status code is not that.
 *
 *   npx tsx scripts/check-sources.ts [--report <file.md>]
 *
 * Broken: the page is gone (404, 410), the server fails (5xx) or the address does not resolve, twice in a row.
 * Blocked: the site refuses scripts (401, 403, 429). Listed for a person to open, but not a failure.
 * Exit code 1 when anything is broken.
 */
import { readFileSync, writeFileSync } from "node:fs";
import type { Source } from "@/lib/study/data";

const data = JSON.parse(readFileSync(new URL("../lib/study/data.json", import.meta.url), "utf8")) as { sources: { list: Source[] } };
const UA = "Mozilla/5.0 (compatible; monte-link-check/1.0; +https://monte.markets/sources/)";

type Result = { title: string; url: string; status: number | string; kind: "ok" | "blocked" | "broken" };

async function once(url: string): Promise<number | string> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const r = await fetch(url, { method, redirect: "follow", headers: { "user-agent": UA, accept: "text/html,*/*" }, signal: AbortSignal.timeout(20_000) });
      await r.body?.cancel();
      // some servers answer HEAD with 404 or 405 and GET with the page; only a GET answer counts as final
      if (method === "HEAD" && !r.ok) continue;
      return r.status;
    } catch (e) {
      if (method === "GET") {
        const cause = (e as Error).cause as { code?: unknown; message?: string } | undefined;
        return typeof cause?.code === "string" ? cause.code : (cause?.message ?? (e as Error).message);
      }
    }
  }
  return "no answer";
}

function kind(status: number | string): Result["kind"] {
  if (typeof status === "number" && status < 400) return "ok";
  if (status === 401 || status === 403 || status === 429) return "blocked";
  return "broken";
}

async function check([, title, , url]: Source): Promise<Result> {
  let status = await once(url);
  if (kind(status) === "broken") {
    await new Promise((r) => setTimeout(r, 5_000));
    status = await once(url);
  }
  return { title, url, status, kind: kind(status) };
}

const results: Result[] = [];
const queue = [...data.sources.list];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let s = queue.shift(); s; s = queue.shift()) results.push(await check(s));
  }),
);

const broken = results.filter((r) => r.kind === "broken");
const blocked = results.filter((r) => r.kind === "blocked");
const line = (r: Result) => `- [${r.title}](${r.url}): ${r.status}`;
const report = [
  `Checked ${results.length} source links on ${new Date().toISOString().slice(0, 10)}.`,
  "",
  broken.length ? `**Broken (${broken.length})**: fix or replace in lib/study/data.json, then set its checked date after reading the new page.\n\n${broken.map(line).join("\n")}` : "Nothing broken.",
  ...(blocked.length ? ["", `**Refused a script (${blocked.length})**: open these by hand.\n\n${blocked.map(line).join("\n")}`] : []),
].join("\n");

console.log(report);
const at = process.argv.indexOf("--report");
if (at > 0 && process.argv[at + 1]) writeFileSync(process.argv[at + 1], report + "\n");
process.exit(broken.length ? 1 : 0);
