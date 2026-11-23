// Monte's three faces as TTF, for Satori (the share cards and the brand kit's banners). They come from Google Fonts
// at run time (Satori needs TTF, so ask without a browser user agent). All three are SIL Open Font License.
import { createHash } from "node:crypto";

export type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: "normal" };
/** Each face fetched, with where it came from and its sha256 (the brand kit's kit.json lists them). */
export const FETCHED: { family: string; axes: string; url: string; sha256: string }[] = [];

export async function font(family: string, weight: number, width?: number) {
  const axes = width ? `wdth,wght@${width},${weight}` : `wght@${weight}`;
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:${axes}`)).text();
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`No TTF for ${family}`);
  const data = await (await fetch(url)).arrayBuffer();
  FETCHED.push({ family: family.replace(/\+/g, " "), axes, url, sha256: createHash("sha256").update(Buffer.from(data)).digest("hex") });
  return data;
}

let loaded: Promise<Font[]> | null = null;
/** The faces the cards and banners use: Bricolage (normal and condensed, as the site sets headlines), Geologica, Azeret Mono. Fetched once a run. */
export const monteFonts = () => (loaded ??= load());
async function load(): Promise<Font[]> {
  const [display, condensed, body, mono] = await Promise.all([
    font("Bricolage+Grotesque", 700),
    font("Bricolage+Grotesque", 700, 75),
    font("Geologica", 400),
    font("Azeret+Mono", 500),
  ]);
  return [
    { name: "Bricolage", data: display, weight: 700, style: "normal" },
    { name: "Condensed", data: condensed, weight: 700, style: "normal" },
    { name: "Geologica", data: body, weight: 400, style: "normal" },
    { name: "Azeret", data: mono, weight: 500, style: "normal" },
  ];
}
