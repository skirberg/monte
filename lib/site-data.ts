import DATA from "@/lib/engine/data.json";

// Everything the landing page and the ⌘K menu show comes from the engine's own data,
// so the marketing copy can never drift from what the study app teaches.

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "");

export type Topic = { id: string; n: number; name: string; line: string; hook: string };

export const TOPICS: Topic[] = DATA.topics.map((t) => ({
  id: t.id,
  n: t.n,
  name: t.name,
  line: stripTags(t.line),
  hook: stripTags(t.hook ?? ""),
}));

export const COPY = DATA.copy;

export const SOLVERS = [
  { id: "tree", name: "Tree and Bayes" },
  { id: "draws", name: "Draws" },
  { id: "events", name: "Two events" },
  { id: "trials", name: "Repeated trials" },
  { id: "poisson", name: "Poisson" },
  { id: "normal", name: "Normal" },
  { id: "ci", name: "Intervals" },
  { id: "bday", name: "Birthday" },
  { id: "data", name: "Describe data" },
] as const;

export const TOOLS = DATA.tools.map((t) => ({ id: t.id, name: t.name, blurb: t.blurb }));

export const STUDY_NAV = [
  { page: "home", label: "Today", hash: "#home" },
  { page: "learn", label: "Learn", hash: "#learn" },
  { page: "practice", label: "Practice", hash: "#practice" },
  { page: "solve", label: "Solve", hash: "#solve" },
  { page: "tools", label: "Tools", hash: "#tools" },
  { page: "sources", label: "Sources", hash: "#sources" },
] as const;

export const STUDY_PATH = "/study/";
export const studyHref = (hash: string) => `${STUDY_PATH}${hash}`;

/** Normal CDF, same approximation the engine uses (Abramowitz and Stegun 7.1.26). */
export function Phi(z: number) {
  const s = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 0.5 * (1 + s * y);
}

export const BELL_LAB = DATA.labs.bell as {
  title: string; sub: string; m: number; s: number; min: number; max: number; step: number; init: number; unit: string;
};

/** The playground. Each game teaches one idea and links to its topic in /study. */
export const GAMES = [
  {
    slug: "correlation",
    group: "chance",
    name: "Guess the correlation",
    line: "Ten scatter plots. Call r by eye. Within 0.10 keeps your streak alive.",
    topic: "two",
    topicName: "Two variables",
  },
  {
    slug: "monty-hall",
    group: "chance",
    name: "Three doors",
    line: "The game show puzzle that fooled mathematicians. Play it, then run it 1,000 times.",
    topic: "prob",
    topicName: "Probability rules",
  },
  {
    slug: "fake-coin",
    group: "chance",
    name: "Can you fake a coin?",
    line: "Type 50 flips that look random. The streaks will give you away.",
    topic: "count",
    topicName: "Counting and the binomial",
  },
  {
    slug: "serve",
    group: "chance",
    name: "Serve math",
    line: "Real 2025 ATP hold rates. See how a small edge on serve points wins sets.",
    topic: "count",
    topicName: "Counting and the binomial",
  },
  {
    slug: "house-edge",
    group: "money",
    name: "The house edge",
    line: "Spin a roulette wheel a thousand times, then watch a thousand players do it. The house never loses.",
    topic: "rv",
    topicName: "Random variables and expected value",
  },
  {
    slug: "odds",
    group: "money",
    name: "Read the odds",
    line: "Turn betting lines and prediction market prices into probabilities, and find the bookmaker's cut.",
    topic: "prob",
    topicName: "Probability rules",
  },
  {
    slug: "ab-test",
    group: "money",
    name: "Don't peek",
    line: "Run an A/B test where nothing changed. Check it every day and watch fake winners appear.",
    topic: "ci",
    topicName: "Confidence intervals",
  },
  {
    slug: "long-run",
    group: "money",
    name: "The long run",
    line: "98 years of real S&P 500 returns. Simulate 2,000 thirty-year futures and see why the average lies.",
    topic: "spread",
    topicName: "How spread out is it",
  },
  {
    slug: "options",
    group: "money",
    name: "Price an option",
    line: "Simulate thousands of stock paths and watch the Monte Carlo price close in on Black-Scholes.",
    topic: "normal",
    topicName: "The normal curve and z",
  },
] as const;

export const GAME_GROUPS = [
  { id: "chance", name: "Chance", line: "Correlation, randomness and a tennis racket." },
  { id: "money", name: "Money", line: "Casinos, betting lines, A/B tests, markets and options. For learning, not advice." },
] as const;

export type Game = (typeof GAMES)[number];
export const playHref = (slug?: string) => (slug ? `/play/${slug}/` : "/play/");
