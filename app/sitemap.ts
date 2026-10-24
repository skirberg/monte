import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/site-data";
import { TOOLS, TOPICS } from "@/lib/study/data";
import { SOLVER_IDS, study } from "@/lib/study/routes";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const learn = [study.learn, ...TOPICS.map((t) => study.topic(t.id)), study.formulas, study.terms, study.frameworks];
  const practice = [study.drill, study.math, study.cards, ...SOLVER_IDS.map((id) => study.solve(id)), ...TOOLS.map((t) => study.tools(t.id)), study.sources];
  return ["/", "/study/", ...learn, ...practice, "/play/", "/story/", "/decide/", "/built/", ...GAMES.map((g) => `/play/${g.slug}/`)].map((p) => ({ url: `${BASE}${p}` }));
}
