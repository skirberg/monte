import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { REPO_PUBLIC, REPO_URL } from "@/lib/seo";

// The repository stays private while REPO_PUBLIC (lib/seo.ts) is false: no page may link to it or say the code is open,
// and a mistake is reported to the maker. Each page that speaks of the code is drawn both ways, so the switch hides every
// link while it is false and brings each back once it is true. `npm run smoke` checks every file of the built site too.

vi.mock("@/components/site-header", () => ({ SiteHeader: () => null }));
vi.mock("@/components/site-footer", () => ({ SiteFooter: () => null }));

/** A line that says the code is open to read or reuse. */
const OPEN_CODE = /read the code|open source|code you can read|in the open|code is MIT|MIT code|MIT licence|change log/i;

const files = (dir: string, ext: RegExp): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p, ext) : ext.test(f) ? [p] : [];
  });

/** The four pages that speak of the code, and the voice line on /brand/, drawn as if REPO_PUBLIC were `pub`. */
async function draw(pub: boolean) {
  vi.resetModules();
  vi.doMock("@/lib/seo", async (original) => {
    const seo = await original<typeof import("@/lib/seo")>();
    return { ...seo, REPO_PUBLIC: pub, REPORT_URL: pub ? `${seo.REPO_URL}/issues` : seo.ASK_URL };
  });
  const pages = {
    about: await import("@/app/about/page"),
    built: await import("@/app/built/page"),
    terms: await import("@/app/terms/page"),
    privacy: await import("@/app/privacy/page"),
  };
  const { VOICE } = await import("@/lib/brand");
  const { ASK_URL } = await import("@/lib/seo");
  vi.doUnmock("@/lib/seo");
  const html = Object.fromEntries(
    Object.entries(pages).map(([k, m]) => [k, renderToStaticMarkup(React.createElement(m.default)) + JSON.stringify("metadata" in m ? m.metadata : {})]),
  ) as Record<keyof typeof pages, string>;
  return { html, voice: VOICE.principles.map((p) => p.v).join("\n"), ASK_URL };
}

describe("the repository link", () => {
  it("is named in lib/seo.ts and nowhere else in the code", () => {
    const code = ["app", "components", "lib", "scripts", "mcp/src"].flatMap((d) => files(d, /\.(tsx?|json)$/));
    const named = code.filter((f) => f !== join("lib", "seo.ts") && readFileSync(f, "utf8").includes(REPO_URL.replace("https://", "")));
    expect(named, "link it with REPO_URL from lib/seo.ts, behind REPO_PUBLIC").toEqual([]);
  });

  it("while private: no page links the repository or says the code is open, and a mistake goes to the maker", async () => {
    const { html, voice, ASK_URL } = await draw(false);
    for (const [page, h] of Object.entries(html)) {
      expect(h, page).not.toContain(REPO_URL);
      expect(h.match(OPEN_CODE)?.[0], page).toBeUndefined();
    }
    expect(voice).not.toMatch(OPEN_CODE);
    for (const page of ["about", "built", "terms", "privacy"] as const) expect(html[page], page).toContain(`href="${ASK_URL}"`);
  });

  it("once public: every link and line comes back", async () => {
    const { html, voice } = await draw(true);
    expect(html.about).toContain(`href="${REPO_URL}"`);
    expect(html.about).toContain("Read the code");
    expect(html.about).toContain("Open: MIT code, CC BY lessons");
    expect(html.about).toContain(`${REPO_URL}/blob/main/CHANGELOG.md`);
    expect(html.built).toContain("Read the code");
    expect(html.built).toContain("Free and open source.");
    expect(html.built).toContain("under the MIT licence");
    expect(html.built).toContain("Open an issue on GitHub");
    for (const page of ["about", "built", "terms", "privacy"] as const) expect(html[page], page).toContain(`href="${REPO_URL}/issues"`);
    expect(html.terms).toContain("The code is MIT.");
    expect(voice).toContain("code you can read");
  });

  it("the open data and the Markdown twins follow the switch (npm run api)", () => {
    for (const f of ["public/llms.txt", "public/llms-full.txt", ...files("public/api/v1", /\.json$/)]) {
      expect(readFileSync(f, "utf8").includes("Code: MIT."), `${f}: run npm run api`).toBe(REPO_PUBLIC);
    }
    if (REPO_PUBLIC) return;
    // security.txt points security reports at the repository on purpose: it is for the repository, not for visitors.
    const served = files("public", /\.(txt|md|json|xml|html|webmanifest)$/).filter((f) => f !== join("public", ".well-known", "security.txt"));
    expect(served.filter((f) => readFileSync(f, "utf8").includes(REPO_URL))).toEqual([]);
  });
});
