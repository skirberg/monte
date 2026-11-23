// Monte's colour tokens for the scripts: the semantic colours of each mode from lib/tokens.ts (written from
// tokens/monte.tokens.json by scripts/make-tokens.ts), with the conversions the brand kit and the contrast check need.
import { COLOR, MODES, type ColorName, type Mode } from "@/lib/tokens";

export { apca, cmyk, contrast, hex, oklchToLinear, rgb, type RGB } from "./color";
export { MODES, type Mode };
export type Theme = "light" | "dark";

/** Every semantic colour in a mode, as OKLCH the way CSS writes it. */
export function tokens(mode: Mode): Record<ColorName, string> {
  return Object.fromEntries(Object.entries(COLOR[mode]).map(([k, v]) => [k, v.oklch])) as Record<ColorName, string>;
}

/**
 * The colour pairs the design actually uses, the WCAG 2 ratio each needs (the rule) and the APCA lightness contrast it
 * should reach (a second look: Bronze Simple Mode, Lc 75 body text, 60 other content text, 45 large text and marks,
 * 30 control borders). npm run contrast checks them all in every mode; the high-contrast modes need WCAG AAA (7:1)
 * for text and 4.5:1 for everything else.
 */
export const PAIRS: [fg: ColorName, bg: ColorName, need: number, what: string, lc: number][] = [
  ["ink", "paper", 4.5, "body text", 75],
  ["ink", "sand", 4.5, "text on sand panels", 75],
  ["ink-muted", "paper", 4.5, "secondary text", 60],
  ["ink-muted", "sand", 4.5, "secondary text on sand", 60],
  ["ink-muted", "sand-2", 4.5, "secondary text on sand-2", 60],
  ["paper", "btn", 4.5, "primary button", 60],
  ["clay-ink", "paper", 4.5, "clay as small text and links", 60],
  ["clay-ink", "sand", 4.5, "clay text on sand", 60],
  ["clay", "paper", 3, "clay marks and large text", 45],
  ["clay", "sand", 3, "clay marks on sand", 45],
  ["ink", "clay-tint", 4.5, "text on the clay highlight", 75],
  ["danger", "paper", 4.5, "error text", 60],
  ["success", "paper", 4.5, "right-answer text", 60],
  ["line-strong", "paper", 3, "input and control borders", 30],
];

/** What a pair needs in a mode: high-contrast modes raise text to AAA and everything else to 4.5:1. */
export const need = (mode: Mode, base: number) => (mode.endsWith("-hc") ? (base >= 4.5 ? 7 : 4.5) : base);
