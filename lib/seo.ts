// One place for the public URL. Change it here if the site moves to its own domain.
export const SITE_URL = "https://monte.markets";
export const SITE_NAME = "Monte";
export const abs = (path: string) => `${SITE_URL}${path}`;

/**
 * The code's home. The repository is private for now, so while REPO_PUBLIC is false no page links to it or says the
 * code is open, and a visitor reports a mistake to the maker instead of in GitHub issues. Once it is public, set this
 * to true and every page reads as it did before; then run `npm run api` and `npm run brand` and commit what they write
 * (the licence line in llms.txt and the API, and the brand kit's source hash). tests/repo.test.ts and the smoke check
 * fail on a link to the repository while it is private.
 */
export const REPO_PUBLIC: boolean = true;
export const REPO_URL = "https://github.com/skirberg/monte";
/** The maker's public address, the one samikirberg.com publishes. Every page there sits behind a gate, so the site itself is not a way to reach him. */
export const ASK_URL = "mailto:hello@samikirberg.com";
/** Where a visitor reports a mistake or asks a question: the repository's issues once it is public, the maker until then. */
export const REPORT_URL = REPO_PUBLIC ? `${REPO_URL}/issues` : ASK_URL;
/** GitHub opens in a new tab; an email address opens the visitor's mail app, so it needs no tab. */
export const REPORT_TARGET: "_blank" | undefined = REPO_PUBLIC ? "_blank" : undefined;

type ShareImage = { url: string; width: number; height: number; alt: string };
const DEFAULT_IMAGE: ShareImage = { url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME}: drop enough grains and the shape appears.` };

/**
 * Share tags for any page, so a link pasted into a chat shows the page's own title and line.
 * Spread it into the page's metadata: `{ title, description, ...pageShare(path, title, description) }`.
 */
export function pageShare(path: string, title: string, description: string, image: ShareImage = DEFAULT_IMAGE) {
  return {
    openGraph: { title: `${title} · ${SITE_NAME}`, description, type: "website" as const, siteName: SITE_NAME, url: path, images: [image] },
    twitter: { card: "summary_large_image" as const, title: `${title} · ${SITE_NAME}`, description, images: [image.url] },
  };
}

/** Share tags for a game page: its own title, line and card (public/og/<slug>.png from scripts/make-og.tsx). */
export function gameShare(slug: string, title: string, description: string) {
  return pageShare(`/play/${slug}/`, title, description, { url: `/og/${slug}.png`, width: 1200, height: 630, alt: `${title}, a game on ${SITE_NAME}` });
}

/**
 * What people type into a search box for each topic, where the topic's own name does not already say it.
 * Only the browser tab and the search result read this; the page heading keeps the topic's name.
 */
const TOPIC_SEARCH: Record<string, string> = {
  data: "population, sample and bias",
  center: "mean, median and mode",
  spread: "standard deviation and range",
  prob: "and, or and conditional probability",
  count: "combinations and binomial probability",
  poisson: "the Poisson distribution",
  normal: "the normal distribution and z-scores",
  clt: "standard error and the central limit theorem",
  ci: "margin of error and confidence intervals",
  test: "p-values and significance",
  reg: "the line of best fit and R squared",
  mreg: "coefficients, dummies and adjusted R squared",
};

/**
 * Games and solvers, the way people search for them (DESIGN.md, "Search words lead"; the volumes and who ranks are in
 * the research behind it, November 22 2026). `title` is the browser tab and the search result's title link,
 * `description` the search snippet, `heading` the page's h1 when the game's own name does not say it.
 */
export const GAME_SEARCH: Record<string, { title: string; description: string; heading?: string }> = {
  correlation: {
    title: "Guess the correlation: a scatter plot game",
    description: "Guess the correlation coefficient r from ten scatter plots, by eye. Within 0.10 keeps your streak alive.",
  },
  "monty-hall": {
    title: "Monty Hall problem simulator: play it, then run 1,000 games",
    description: "The Monty Hall problem, played. Pick a door, stay or switch, then simulate 1,000 games each way and see why switching wins about 2 in 3.",
    heading: "Monty Hall problem simulator",
  },
  "fake-coin": {
    title: "Can you fake a coin? A randomness test in 50 flips",
    description: "Type 50 coin flips that look random, then see how they compare with 20,000 real ones. Real coins run longer streaks than people expect.",
  },
  serve: {
    title: "Serve math: tennis win probability from serve points",
    description: "Tennis probability from real 2025 ATP hold rates: how a small edge on serve points compounds into games and sets.",
  },
  "house-edge": {
    title: "Roulette simulator: the house edge over 1,000 spins",
    description: "A roulette simulator: spin European or American roulette 1,000 times, then simulate 1,000 players. Expected value and the law of large numbers.",
    heading: "Roulette simulator: the house edge",
  },
  odds: {
    title: "Read the odds: betting odds and market prices as chances",
    description: "Convert betting lines and prediction market prices into probabilities and find the bookmaker's cut.",
  },
  "ab-test": {
    title: "Don't peek: an A/B test peeking simulator",
    description: "Why checking an A/B test every day finds winners that are not there. Run a test where nothing changed and watch fake winners appear.",
  },
  "long-run": {
    title: "S&P 500 simulator: 98 years of real returns, 2,000 futures",
    description: "An S&P 500 simulator on 98 years of real S&P 500, small cap, Treasury and T-bill returns. Volatility drag and a Monte Carlo of 2,000 futures.",
    heading: "S&P 500 simulator: the long run",
  },
  options: {
    title: "Monte Carlo option pricing: simulate it, meet Black-Scholes",
    description: "Monte Carlo option pricing for a call or a put: simulate stock paths and watch the price close in on the Black-Scholes formula.",
    heading: "Monte Carlo option pricing",
  },
  election: {
    title: "Election night: poll margin of error, simulated",
    description: "Why a poll of 1,000 people has a margin of error near 3 points, and why the average of many polls beats any one. Confidence intervals by simulation.",
  },
};

/** A game's h1: the searched name when its own name does not say it. The Markdown twin uses it too. */
export const gameHeading = (slug: string, name: string) => GAME_SEARCH[slug]?.heading ?? name;

/** A game page's title, description, canonical link, Markdown twin and its own share card. */
export function gameMeta(slug: string) {
  const g = GAME_SEARCH[slug];
  if (!g) throw new Error(`No search title for game ${slug}`);
  return { alternates: pageAlternates(`/play/${slug}/`), title: g.title, description: g.description, ...gameShare(slug, g.title, g.description) };
}

export const SOLVER_SEARCH: Record<string, { heading: string; title: string; description: string }> = {
  tree: {
    heading: "Probability tree diagram calculator",
    title: "Probability tree diagram calculator, with Bayes' rule",
    description: "A probability tree diagram calculator: give each branch and the outcome's chance on it, and get the total, the reversed chance by Bayes' rule and every step.",
  },
  draws: {
    heading: "Draws with and without replacement",
    title: "Probability calculator: draws with and without replacement",
    description: "Two draws from a box, with or without putting the first back: every and, or, at least one and conditional chance, with the work shown.",
  },
  events: {
    heading: "Conditional probability calculator",
    title: "Conditional probability calculator: and, or, given",
    description: "A conditional probability calculator: give P(A), P(B) and P(A and B) for A or B, A given B, neither, exactly one, and whether they are independent.",
  },
  trials: {
    heading: "Binomial probability calculator",
    title: "Binomial probability calculator with steps",
    description: "A binomial probability calculator with steps: the same chance each try, then none, at least one, exactly k, at most k, the mean np and the SD.",
  },
  poisson: {
    heading: "Poisson distribution calculator",
    title: "Poisson distribution calculator with steps",
    description: "A Poisson distribution calculator with steps: scale the rate to the window, then exactly k, k or fewer, at least k and none, with the mean and variance.",
  },
  normal: {
    heading: "Normal distribution calculator",
    title: "Normal distribution and z-score calculator with steps",
    description: "A normal distribution calculator with z-scores: from the mean and SD, any value's chance, a top or bottom cutoff, and the chance for an average.",
  },
  samp: {
    heading: "Sampling distribution calculator",
    title: "Sampling distribution calculator, sample by sample",
    description: "A sampling distribution calculator: every sample of size n from a small population, the mean of the sample means, the standard error and an exact chance.",
  },
  ci: {
    heading: "Confidence interval and sample size calculator",
    title: "Confidence interval and sample size calculator",
    description: "A confidence interval calculator for a mean or a proportion: the critical value, standard error and margin of error, then the sample size for a target.",
  },
  test: {
    heading: "Hypothesis test calculator",
    title: "Hypothesis test and p-value calculator with steps",
    description: "A hypothesis test calculator for a z, t or proportion test: the hypotheses, the test statistic, the p-value and the decision, step by step.",
  },
  bday: {
    heading: "Birthday problem calculator",
    title: "Birthday paradox calculator: odds two people share a birthday",
    description: "A birthday paradox calculator: the chance at least two people in a room share a birthday, the number of pairs, and how many people a 50% chance takes.",
  },
  data: {
    heading: "Descriptive statistics calculator",
    title: "Standard deviation and descriptive statistics calculator",
    description: "Paste a list of numbers for the mean, median, mode, range, variance and standard deviation, sample or population, each worked step by step.",
  },
};

/** The trail above a page, for search results: Monte, then each step down to the page. */
export function breadcrumbList(trail: [name: string, path: string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [[SITE_NAME, "/"], ...trail].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}

/** A topic's title for search results: its name, then the words people search for. */
export const topicSearchTitle = (id: string, name: string) => (TOPIC_SEARCH[id] ? `${name}: ${TOPIC_SEARCH[id]}` : name);
/** The search words alone, for structured data ("teaches"). */
export const topicSearchTerms = (id: string, name: string) => TOPIC_SEARCH[id] ?? name;

/** Whole sentences from the start of a text, as many as fit in a search result's description (about 160 characters). */
export function snippet(text: string, max = 160) {
  const plainText = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  let out = "";
  // A sentence ends at . ! or ? followed by a space or the end, so "99.7%" or "0.05" stays inside its sentence.
  for (const part of plainText.match(/(?:[^.!?]|[.!?](?=\S))+[.!?]+(?:\s+|$)/g) ?? [plainText]) {
    if (out && (out + part).trim().length > max) break;
    out += part;
  }
  out = out.trim();
  return out.length > max ? `${out.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : out;
}

/**
 * A share card for each part of the site (public/og/<slug>.png, drawn by scripts/make-og.tsx), picked by the
 * page's path, so a shared lesson or solver shows its own part of Monte instead of the home page card.
 */
export const SECTION_CARDS: { slug: string; prefixes: string[]; head: string[]; line: string }[] = [
  { slug: "daily", prefixes: ["/daily/"], head: ["What happens", "next?"], line: "One real chart a day. Draw the rest." },
  { slug: "shuffle", prefixes: ["/shuffle/"], head: ["Find the", "grain."], line: "Three cups, one question a day. Follow the right answer." },
  { slug: "learn", prefixes: ["/learn/", "/study/", "/tools/", "/sources/"], head: ["One idea", "at a time."], line: "Fourteen topics in 70 short lessons." },
  { slug: "practice", prefixes: ["/practice/"], head: ["Fresh numbers,", "every time."], line: "Drills, mock tests and flashcards." },
  { slug: "solve", prefixes: ["/solve/"], head: ["Every step,", "shown."], line: "Eleven solvers for real problems." },
  { slug: "decide", prefixes: ["/decide/"], head: ["Is this result", "real?"], line: "Statistics for real decisions." },
  { slug: "brand", prefixes: ["/brand/"], head: ["The Monte", "brand."], line: "The logo, colours, type and voice." },
];

/** The share card for a path: its section's card, or the home page card. */
export function sectionImage(path: string): ShareImage {
  const sc = SECTION_CARDS.find((c) => c.prefixes.some((p) => path.startsWith(p)));
  return sc ? { url: `/og/${sc.slug}.png`, width: 1200, height: 630, alt: `${sc.head.join(" ")} ${sc.line}` } : DEFAULT_IMAGE;
}

/**
 * Each content page has a Markdown twin: the same words as plain Markdown at the page's path without its trailing slash,
 * plus .md (/learn/normal/ is /learn/normal.md; the home page is /index.md). scripts/lib/markdown.ts writes them into
 * public/, and tests/markdown.test.ts checks that every page this rule names has one, and only those.
 */
export const markdownPath = (path: string) => (path === "/" ? "/index.md" : `${path.replace(/\/$/, "")}.md`);

/** Pages under /learn/ that are not a topic, a lesson, the formula sheet or the glossary. */
const NO_TWIN = new Set(["/learn/frameworks/", "/learn/start/"]);

/** The pages with a Markdown twin: the home page, every topic and lesson, the formula sheet, the glossary, and every solver, decision and game. */
export const hasMarkdownTwin = (path: string) => path === "/" || ((/^\/learn\/[^/]+\/([^/]+\/)?$/.test(path) || /^\/(solve|decide|play)\/[^/]+\/$/.test(path)) && !NO_TWIN.has(path));

/** A page's canonical link and, when it has one, its Markdown twin: <link rel="alternate" type="text/markdown">. */
export const pageAlternates = (path: string) => ({ canonical: path, ...(hasMarkdownTwin(path) ? { types: { "text/markdown": markdownPath(path) } } : {}) });

/** A page's title, description, canonical link, Markdown twin and share tags in one call. */
export function pageMeta(path: string, title: string, description: string) {
  return { title, description, alternates: pageAlternates(path), ...pageShare(path, title, description, sectionImage(path)) };
}
