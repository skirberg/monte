import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/site-data";
import { TOPICS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const learn = [study.learn, ...TOPICS.map((t) => study.topic(t.id)), study.formulas, study.terms, study.frameworks];
  return ["/", "/study/", ...learn, "/play/", "/story/", "/built/", ...GAMES.map((g) => `/play/${g.slug}/`)].map((p) => ({ url: `${BASE}${p}` }));
}
