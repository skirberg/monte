// The brand kit's source fingerprint: one sha256 over everything the icons, share cards and kit files are drawn from.
// make-brand writes it into public/brand/kit.json; tests/brand.test.ts recomputes it and fails when the two differ,
// and `make-brand --if-stale` (in prebuild) regenerates when they differ, so a stale icon or card cannot ship.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GameArt } from "@/components/play/game-art";
import { ToolMark } from "@/components/decide/tool-mark";
import { BOILERPLATE, COLORS, COLOR_RULE, FONT_LICENSE, FONT_LINKS, IDEA, KIT, NAME_RULES, TYPE, VOICE } from "@/lib/brand";
import { TOOLS } from "@/lib/decide/tools";
import { SECTION_CARDS, SITE_URL } from "@/lib/seo";
import { GAMES } from "@/lib/site-data";
import { tokens } from "./tokens";

/** The code that draws the files. The data they show is hashed below, as data, so unrelated edits to those files do not count. */
export const KIT_CODE = [
  "components/brand/logo-art.ts",
  "components/brand/logo.tsx",
  "lib/board.ts",
  "scripts/make-brand.tsx",
  "scripts/make-icons.tsx",
  "scripts/make-og.tsx",
  "scripts/lib/board-art.ts",
  "scripts/lib/color.ts",
  "scripts/lib/fonts.ts",
  "scripts/lib/kit.tsx",
  "scripts/lib/kit-source.ts",
  "scripts/lib/tokens.ts",
  "scripts/lib/zip.ts",
  "tokens/monte.tokens.json",
];

export function kitSource() {
  const hash = createHash("sha256");
  for (const f of KIT_CODE) hash.update(`${f}\n${readFileSync(f, "utf8").replace(/\r\n/g, "\n")}\n`);
  const data = {
    tokens: { light: tokens("light"), dark: tokens("dark") },
    brand: { IDEA, COLORS, COLOR_RULE, TYPE, VOICE, BOILERPLATE, NAME_RULES, KIT, FONT_LINKS, FONT_LICENSE, SITE_URL },
    cards: { games: GAMES.map((g) => [g.slug, g.name, g.line]), tools: TOOLS.map((t) => [t.id, t.question, t.line]), sections: SECTION_CARDS },
    marks: [
      ...GAMES.map((g) => renderToStaticMarkup(React.createElement(GameArt, { slug: g.slug }))),
      ...TOOLS.map((t) => renderToStaticMarkup(React.createElement(ToolMark, { id: t.id }))),
    ],
  };
  hash.update(JSON.stringify(data));
  return hash.digest("hex");
}
