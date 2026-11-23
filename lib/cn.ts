import { createCn } from "cn/config";

/**
 * Class merging with the site's own type sizes (app/globals.css, DESIGN.md "Type scale"). Without them a merge reads
 * `text-figure` as a colour, so `cn("text-figure", "text-clay-ink")` dropped the size: a score turned small exactly
 * when you won. Import cn from here, never from the "cn" package.
 */
export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: ["lead", "heading", "headline", "title", "display", "figure", "hero", "symbol"] }] } },
});
