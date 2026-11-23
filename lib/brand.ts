/**
 * Monte's brand in one place (DESIGN.md has the reasons): the idea, the name, the colours, the type and the voice.
 * The public brand page (/brand/), the brand files (scripts/make-brand.tsx) and the voice test (tests/brand.test.ts)
 * all read from here, so the brand is written once. Its colours come from the token source (tokens/monte.tokens.json).
 */
import { COLOR, type ColorName } from "@/lib/tokens";
import { REPO_PUBLIC } from "@/lib/seo";

export const IDEA = {
  line: "Drop enough grains. The shape appears.",
  promise: "Statistics, one idea at a time.",
  story:
    "Every data point is a grain of sand. One grain tells you little; drop enough and a shape appears. Monte teaches statistics the same way: you do something first, then the idea shows up.",
};

/** Why the name works, four ways at once. */
export const NAME = [
  { k: "Monte Carlo", v: "Run it thousands of times; it settles." },
  { k: "Monty Hall", v: "The most argued-about puzzle." },
  { k: "Three-card monte", v: "A rigged game: don't play." },
  { k: "Monte, Italian for mountain", v: "The bell every pile settles into." },
];

/** How to write the name. */
export const NAME_RULES = ["Monte, with a capital M, in a sentence.", "monte, lowercase, only inside the logo.", "monte.markets is the address, not the name."];

/** Ready-to-paste descriptions for directories, press and profiles. */
export const BOILERPLATE = {
  tagline: "Statistics, one idea at a time. Free.",
  short: "Monte is a free site for learning statistics by doing: lessons that start with a question, drills with fresh numbers, solvers that show every step, and one real chart a day.",
  long: "Monte is a free statistics site for everyone, no sign-up. Fourteen topics run from data and sampling to multiple regression, in 70 short lessons that each open with a question. Drills deal fresh numbers every time, solvers show every step, calculators answer real decisions in plain English, and ten games each hide one idea. Every day there is one real chart, the same for everyone, with its end hidden: draw what happens next, then see what did.",
};

export type Swatch = { token: ColorName; name: string; light: string; dark: string; use: string };

/** The brand's five colours, light and dark, from the token source (tokens/monte.tokens.json through lib/tokens.ts). */
const swatch = (token: ColorName, name: string, use: string): Swatch => ({ token, name, light: COLOR.light[token].oklch, dark: COLOR.dark[token].oklch, use });
export const COLORS: Swatch[] = [
  swatch("clay", "Clay", "The number: curves, bars, answers, the mark."),
  swatch("clay-ink", "Clay ink", "Clay as small text, and a right answer."),
  swatch("ink", "Ink", "Words and the action: every main button."),
  swatch("paper", "Paper", "The page."),
  swatch("sand", "Sand", "Quiet surfaces and stages."),
];

/** The one colour rule. */
export const COLOR_RULE = "Clay means the number. Ink means the action.";

export const TYPE = [
  { role: "Speaks", face: "Bricolage Grotesque", use: "Headlines, condensed at display size.", sample: "The shape appears." },
  { role: "Reads", face: "Geologica", use: "Every sentence. Covers Greek, so σ, μ and x̄ sit in the same face.", sample: "One idea per sentence, σ and μ included." },
  { role: "Measures", face: "Azeret Mono", use: "Numbers, timers and scores, with tabular figures.", sample: "95 vs 92 · 0:36" },
];

/** The voice. A coach at practice: short, plain, direct, a little dry. */
export const VOICE = {
  register: "A coach at practice. Short, plain, direct, a little dry.",
  /** Each principle with a line Monte really uses (`do`, and where it is) and the line it would never write. */
  principles: [
    {
      k: "Do it, then say it.",
      v: "A question or a tap comes first; the rule comes after you have felt it.",
      do: "Heights of adult women: most are near the average, fewer are very short or very tall. What shape is that?",
      where: "the first lesson on the normal curve",
      dont: "In this lesson you will learn about the normal distribution.",
    },
    {
      k: "One idea per sentence.",
      v: "Plain words. Say how long and where a button goes.",
      do: "Start the first idea, 4 min",
      where: "the button on the home page",
      dont: "Click here to begin your learning journey!",
    },
    {
      k: "Show the work.",
      // "Code you can read" only while the code can be read (REPO_PUBLIC in lib/seo.ts).
      v: REPO_PUBLIC ? "Every number is real or worked by code you can read, and the steps are shown." : "Every number is real or worked by code, and the steps are shown.",
      do: "Type in the numbers from any problem and get every answer with the work.",
      where: "the Solve link on Today",
      dont: "Our powerful calculator does the hard part for you.",
    },
    {
      k: "Dry, never cute.",
      v: "One dry line a page at most, and never a joke on a wrong answer.",
      do: "Not quite. Here is the work.",
      where: "the end of a lesson with a miss, and a missed cup in the Shuffle",
      dont: "Oops! So close, you've got this!",
    },
    {
      k: "For everyone.",
      v: "No exam, class or school framing. Statistics is for deciding things.",
      do: "Is this test result real?",
      where: "a decision on Decide",
      dont: "Ace your stats final with our Bayes calculator.",
    },
  ],
  /** Words that sound like Monte. */
  use: ["drop", "draw", "the shape", "fresh numbers", "the work", "mastered", "rusty", "real data", "one idea"],
  /** Words Monte never uses. tests/brand.test.ts fails if one shows up in the site's copy. */
  never: [
    "unlock", "supercharge", "journey", "seamless", "revolutionary", "game-changer", "utilize", "obviously", "simply", "AI-powered",
    // Filler and stock phrases (DESIGN.md, "Words").
    "not just", "whether you're", "welcome to", "ready to", "learn more", "click here", "worth noting", "delve", "in summary", "feel free",
  ],
};

/**
 * The brand kit (DESIGN.md, "Brand kit"): scripts/make-brand.tsx writes every file into public/brand/ from the one
 * drawing in components/brand/logo.tsx and the tokens in tokens/monte.tokens.json, lists them with their sha256 in
 * public/brand/kit.json and packs them in public/brand/kit.zip. The /brand/ page offers them; tests/brand.test.ts
 * fails when one no longer matches its source.
 */
export const KIT = {
  logo: [
    { id: "color", name: "Colour", use: "On paper and light backgrounds." },
    { id: "reversed", name: "Reversed", use: "On ink and dark backgrounds." },
    { id: "black", name: "Black", use: "One colour, for print and stamps." },
    { id: "white", name: "White", use: "One colour, on clay or a photo." },
  ],
  logoWidths: [512, 1024, 2048],
  mark: [
    { id: "color", name: "Colour", use: "The curve alone, in clay." },
    { id: "black", name: "Black", use: "One colour." },
    { id: "white", name: "White", use: "One colour, on clay." },
    { id: "tile", name: "Tile", use: "Paper on clay: the app icon." },
  ],
  markSizes: [64, 128, 256, 512, 1024],
  /** Social images. `dark` means a night version sits beside it (`-dark`). */
  social: [
    { file: "avatar-400", w: 400, h: 400, use: "X, LinkedIn, GitHub" },
    { file: "avatar-800", w: 800, h: 800, use: "YouTube" },
    { file: "og-1200x630", w: 1200, h: 630, use: "Link previews (the site's own card)" },
    { file: "x-header-1500x500", w: 1500, h: 500, use: "X header", dark: true },
    { file: "linkedin-cover-1512x256", w: 1512, h: 256, use: "LinkedIn page cover", dark: true },
    { file: "linkedin-banner-1584x396", w: 1584, h: 396, use: "LinkedIn profile background", dark: true },
    { file: "youtube-banner-2560x1440", w: 2560, h: 1440, use: "YouTube channel art", dark: true },
    { file: "github-social-1280x640", w: 1280, h: 640, use: "GitHub social preview", dark: true },
    { file: "instagram-1080x1080", w: 1080, h: 1080, use: "Square post" },
    { file: "instagram-1080x1350", w: 1080, h: 1350, use: "Portrait post" },
    { file: "story-1080x1920", w: 1080, h: 1920, use: "Story" },
  ],
  /** Clear space and smallest size (DESIGN.md, "Mark"). */
  clearSpace: "One x-height of the word on every side.",
  minSize: { lockupPx: 18, markPx: 16, lockupMm: 6 },
} as const;

/** Where to get the three faces, and their licence. */
export const FONT_LINKS: Record<string, string> = {
  "Bricolage Grotesque": "https://fonts.google.com/specimen/Bricolage+Grotesque",
  Geologica: "https://fonts.google.com/specimen/Geologica",
  "Azeret Mono": "https://fonts.google.com/specimen/Azeret+Mono",
};
export const FONT_LICENSE = { name: "SIL Open Font License 1.1", url: "https://openfontlicense.org" };

/** OKLCH (as written in the CSS) to a #rrggbb hex, for people who need one. */
export function oklchToHex(css: string) {
  const m = css.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) throw new Error(`not oklch: ${css}`);
  const [L, C, H] = [Number(m[1]), Number(m[2]), (Number(m[3]) * Math.PI) / 180];
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s];
  const enc = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  return `#${lin.map((x) => Math.round(Math.min(1, Math.max(0, enc(x))) * 255).toString(16).padStart(2, "0")).join("")}`;
}
