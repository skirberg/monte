import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/site-data";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/study/", "/play/", "/story/", "/built/", ...GAMES.map((g) => `/play/${g.slug}/`)].map((p) => ({ url: `${BASE}${p}` }));
}
