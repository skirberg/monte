import { DATA } from "@/lib/study/data";
import { pathForHash } from "@/lib/study/routes";

// Everything the landing page and the ⌘K menu show comes from the study app's own data,
// so the marketing copy can never drift from what the study app teaches.

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "");

/**
 * A topic has two names, both in lib/study/data.json and nowhere else: `name` is the title on the topic's own page
 * (its h1, page title, formula and glossary section headings); `short` is the label every link, list and menu uses
 * to point at it. Never type a topic name by hand: use `topicLabel(id)`.
 */
export type Topic = { id: string; n: number; name: string; short: string; line: string; hook: string; keywords: string };

export const TOPICS: Topic[] = DATA.topics.map((t) => ({
  id: t.id,
  n: t.n,
  name: t.name,
  short: t.short,
  line: stripTags(t.line),
  hook: stripTags(t.hook ?? ""),
  keywords: t.keywords ?? "",
}));

/** The label that points at a topic, from the data. */
export const topicLabel = (id: string) => DATA.topics.find((t) => t.id === id)?.short ?? id;

export const SOLVERS = [
  { id: "tree", name: "Tree and Bayes" },
  { id: "draws", name: "Draws" },
  { id: "events", name: "Two events" },
  { id: "trials", name: "Repeated trials" },
  { id: "poisson", name: "Poisson" },
  { id: "normal", name: "Normal" },
  { id: "samp", name: "Sampling" },
  { id: "ci", name: "Intervals" },
  { id: "test", name: "Tests" },
  { id: "bday", name: "Birthday" },
  { id: "data", name: "Describe data" },
] as const;

export const TOOLS = DATA.tools.map((t) => ({ id: t.id, name: t.name, blurb: t.blurb }));

/**
 * The one navigation vocabulary (DESIGN.md, "Navigation"): Learn · Practice · Solve · Decide · Play,
 * in this order, in the header, the phone bar's More sheet, the footer and the ⌘K menu.
 * Tools (the Excel, R, Python and SQL guides) and Sources live under Learn and keep their URLs.
 * Today is the study landing (/study/), reached from the phone bar, "Start studying" and ⌘K.
 */
export const SITE_NAV = [
  { key: "learn", label: "Learn", href: pathForHash("#learn") },
  { key: "practice", label: "Practice", href: pathForHash("#practice") },
  { key: "solve", label: "Solve", href: pathForHash("#solve") },
  { key: "decide", label: "Decide", href: "/decide/" },
  { key: "play", label: "Play", href: "/play/" },
] as const;
export type SiteNavKey = (typeof SITE_NAV)[number]["key"];

/** Which of the five a pathname belongs to. Study sections are read from the path, so Tools and Sources light up Learn. */
export function navKeyFor(pathname: string | null): SiteNavKey | null {
  if (!pathname) return null;
  if (pathname.startsWith("/decide")) return "decide";
  if (pathname.startsWith("/play")) return "play";
  const top = pathname.split("/")[1];
  const seg = top === "study" ? pathname.replace(/^\/study\/?/, "").split("/")[0] : top;
  if (seg === "learn" || seg === "tools" || seg === "sources") return "learn";
  if (seg === "practice") return "practice";
  if (seg === "solve") return "solve";
  return null;
}

/** The decisions on /decide/, each with its own page at /decide/<id>/. */
export const DECIDE_TOOLS = [
  { id: "choose", name: "Choose between options", keywords: "monte carlo jobs products compare" },
  { id: "warranty", name: "Should I buy the warranty?", keywords: "insurance expected value extended plan" },
  { id: "bet", name: "What are these odds really saying?", keywords: "bet betting line kelly bookmaker" },
  { id: "market", name: "What does 30¢ mean?", keywords: "prediction market cents fees" },
  { id: "option", name: "How likely is the stock to get there?", keywords: "option strike volatility" },
  { id: "bayes", name: "Is this test result real?", keywords: "bayes base rate false positive screening" },
  { id: "abtest", name: "Did my change really work?", keywords: "a/b test ab conversion significance" },
  { id: "goal", name: "Will I hit my goal?", keywords: "savings retirement monte carlo invest" },
  { id: "staffing", name: "How many people do I need?", keywords: "staffing poisson queue busy hour" },
] as const;
export const decideHref = (id?: string) => (id ? `/decide/${id}/` : "/decide/");

/** Link to a study page by its view name, spelled like the old hash routes (#learn/topics/normal). */
export const studyHref = (hash: string) => pathForHash(hash);

/** The playground. Each game teaches one idea and links to its topic in /study. */
export const GAMES = [
  {
    slug: "correlation",
    group: "chance",
    name: "Guess the correlation",
    line: "Ten scatter plots. Call r by eye. Within 0.10 keeps your streak alive.",
    topic: "two",
  },
  {
    slug: "monty-hall",
    group: "chance",
    name: "Three doors",
    line: "The Monty Hall problem fooled mathematicians. Play it, then run it 1,000 times.",
    topic: "prob",
  },
  {
    slug: "fake-coin",
    group: "chance",
    name: "Can you fake a coin?",
    line: "Type 50 flips that look random. The streaks will give you away.",
    topic: "count",
  },
  {
    slug: "serve",
    group: "chance",
    name: "Serve math",
    line: "Real 2025 ATP hold rates. See how a small edge on serve points wins sets.",
    topic: "count",
  },
  {
    slug: "house-edge",
    group: "money",
    name: "The house edge",
    line: "Spin roulette a thousand times and see why the house never loses.",
    topic: "rv",
  },
  {
    slug: "odds",
    group: "money",
    name: "Read the odds",
    line: "Turn betting lines and prediction market prices into probabilities, and find the bookmaker's cut.",
    topic: "prob",
  },
  {
    slug: "ab-test",
    group: "money",
    name: "Don't peek",
    line: "Run an A/B test where nothing changed. Watch fake winners appear.",
    topic: "ci",
  },
  {
    slug: "long-run",
    group: "money",
    name: "The long run",
    line: "98 years of real S&P 500 returns, played out 2,000 ways.",
    topic: "spread",
  },
  {
    slug: "options",
    group: "money",
    name: "Price an option",
    line: "Simulate stock paths and watch the price close in on Black-Scholes.",
    topic: "normal",
  },
  {
    slug: "election",
    group: "chance",
    name: "Election night",
    line: "Call the race from polls, then see why a 2-point lead is close to a coin flip.",
    topic: "ci",
  },
] as const;

/** The two dailies, the same for everyone each day: listed first on /play/ (they live at their own short links). */
export const DAILIES = [
  { slug: "shuffle", href: "/shuffle/", name: "The Shuffle", line: "One question a day under three cups. Follow the right answer, then see the work." },
  { slug: "daily", href: "/daily/", name: "Daily chart", line: "One real chart a day with its end hidden. Draw what happens next." },
] as const;

export const GAME_GROUPS = [
  { id: "chance", name: "Chance" },
  { id: "money", name: "Money" },
] as const;

export const playHref = (slug?: string) => (slug ? `/play/${slug}/` : "/play/");
