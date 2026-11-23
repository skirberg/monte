import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/site-data";
import { TOOLS, TOPICS } from "@/lib/study/data";
import { SOLVER_IDS, study } from "@/lib/study/routes";
import { LESSONS } from "@/lib/study/lessons";
import { SITE_URL } from "@/lib/seo";
import { TOOL_IDS, toolHref } from "@/lib/decide/tools";
import openData from "@/public/api/v1/index.json";

export const dynamic = "force-static";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const topics = TOPICS.flatMap((t) => [study.topic(t.id), ...(LESSONS[t.id] ?? []).map((l) => study.lesson(t.id, l.slug))]);
  const learn = [study.learn, ...topics, study.formulas, study.terms, study.frameworks, study.start];
  const practice = [study.drill, study.math, study.cards, ...SOLVER_IDS.map((id) => study.solve(id)), ...TOOLS.map((t) => study.tools(t.id)), study.sources];
  // The pages built only from the study content (topics, lessons, the sheet, the glossary, sources) carry the day that
  // content last changed: scripts/make-api.ts moves "updated" when the content's hash changes. Every other page is left
  // without a date, since one would be a guess.
  const dated = new Set([study.learn, ...topics, study.formulas, study.terms, study.sources]);
  return ["/", "/study/", ...learn, ...practice, "/play/", "/story/", "/about/", "/decide/", ...TOOL_IDS.map(toolHref), "/built/", "/daily/", "/shuffle/", "/privacy/", "/terms/", "/brand/", ...GAMES.map((g) => `/play/${g.slug}/`)].map((p) => ({
    url: `${BASE}${p}`,
    ...(dated.has(p) ? { lastModified: openData.updated } : {}),
  }));
}
