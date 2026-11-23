// Colour math with no inputs but the colour itself: OKLCH to sRGB, WCAG 2 contrast and APCA lightness contrast.
// Shared by the token generator (scripts/make-tokens.ts), the contrast check and the brand kit's colour table.

export type RGB = [number, number, number];

/** OKLCH (as CSS writes it) to linear sRGB (Björn Ottosson's OKLab matrices), clipped to gamut. */
export function oklchToLinear(v: string): RGB | null {
  const m = v.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) return null;
  const [L, C, H] = [+m[1], +m[2], (+m[3] * Math.PI) / 180];
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ].map((x) => Math.min(1, Math.max(0, x))) as RGB;
}

/** 8-bit sRGB, the same rounding as oklchToHex in lib/brand.ts. */
export function rgb(v: string): RGB {
  const lin = oklchToLinear(v);
  if (!lin) throw new Error(`not oklch: ${v}`);
  const enc = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  return lin.map((x) => Math.round(enc(x) * 255)) as RGB;
}
export const hex = (v: string) => `#${rgb(v).map((x) => x.toString(16).padStart(2, "0")).join("")}`;

/** A naive CMYK from sRGB, for a printer to start from. Not a press profile: proof it before printing. */
export function cmyk(v: string): [number, number, number, number] {
  const [r, g, b] = rgb(v).map((x) => x / 255);
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) return [0, 0, 0, 100];
  return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map((x) => Math.round(x * 100)) as [number, number, number, number];
}

const lum = ([r, g, b]: RGB) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
/** WCAG 2 contrast ratio of two OKLCH colours. */
export function contrast(a: string, b: string) {
  const ca = oklchToLinear(a), cb = oklchToLinear(b);
  if (!ca || !cb) return NaN;
  const [x, y] = [lum(ca), lum(cb)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * APCA lightness contrast (Lc) of text on a background, the candidate method for WCAG 3: APCA-W3 0.0.98G-4g, the
 * published constants (git.apcacontrast.com). Positive for dark text on light, negative for light on dark; compare
 * the absolute value with the Bronze Simple Mode levels (Lc 90 preferred for body text, 75 the body minimum, 60 for
 * other content text, 45 for large text, 30 for spot text, 15 for non-text). A second look beside WCAG 2, not the rule.
 */
export function apca(text: string, background: string) {
  const Y = (v: string) => {
    const [r, g, b] = rgb(v).map((x) => (x / 255) ** 2.4);
    const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
    return y > 0.022 ? y : y + (0.022 - y) ** 1.414;
  };
  const [t, bg] = [Y(text), Y(background)];
  if (Math.abs(bg - t) < 0.0005) return 0;
  if (bg > t) {
    const s = (bg ** 0.56 - t ** 0.57) * 1.14;
    return s < 0.1 ? 0 : (s - 0.027) * 100;
  }
  const s = (bg ** 0.65 - t ** 0.62) * 1.14;
  return s > -0.1 ? 0 : (s + 0.027) * 100;
}
