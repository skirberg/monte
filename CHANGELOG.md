# Changelog

What changed on [monte.markets](https://monte.markets), newest first. Only changes a visitor would notice, plus the tooling a contributor needs to know about.

## 2026-11-22: every page fits a 320 px phone

**Fixed**
- [Brand](https://monte.markets/brand/) and [How it's built](https://monte.markets/built/) no longer scroll sideways on a 320 px phone. The brand page's logo shrinks to fit the screen, and the MCP server's address wraps after its dots. The bottom nav and the toast, which a too-wide page had pushed past the edge, fit again.
- The two checkboxes in the lessons' labs (probability's even rolls, regression's own point) are 24 px, a full tap target.

**Tooling**
- `npm run qa` loads every built page at 320 px, not only its list of routes, and fails on sideways scroll, anything or any fixed layer past the screen's edge, a tap target under 24 px and a text field under 16 px (iOS Safari zooms into those).
- Every qa pass measures against the screen's layout width (`documentElement.clientWidth`). On a phone `innerWidth` grows to fit a page that is too wide, which is why qa had passed both pages.

## 2026-11-22: no dead links to the code

**Fixed**
- [About](https://monte.markets/about/), [How it's built](https://monte.markets/built/), [Terms](https://monte.markets/terms/) and [Privacy](https://monte.markets/privacy/) no longer link to the code's repository, which is private, so nobody lands on a GitHub 404.
- Report a mistake, "Found a mistake?" and the Questions on Privacy and Terms open an email to Sami. His site sits behind a gate, so a visitor could not reach him there.
- No page says the code is open source while it is private. The lessons and the open data are still CC BY 4.0.

**Tooling**
- `REPO_PUBLIC` in `lib/seo.ts`, beside `REPO_URL`, turns every link to the repository and every line about its licence back on. Set it to true once the repository is public, then run `npm run api` and `npm run brand` and commit what they write.
- `tests/repo.test.ts` draws About, How it's built, Terms and Privacy both ways, fails on the repository's address anywhere in the code but `lib/seo.ts`, and checks llms.txt and the API's licence line against the switch. `npm run smoke` fails on the address in any file of the built site while it is private.

## 2026-11-22: the system under the look

**Added**
- A high-contrast version of day and night. If your device asks for more contrast, secondary text, lines, clay and errors go darker in the day and lighter at night: every text pair reaches 7:1.
- In Windows contrast themes, buttons and answers keep a real outline.
- Opening a game from [Play](https://monte.markets/play/) or the home page carries its drawing from the card into the game's header, and opening a [decision](https://monte.markets/decide/) does the same with its mark. Reduced motion turns it off, and browsers without view transitions change the page as before.
- [`monte.tokens.json`](https://monte.markets/brand/colors/monte.tokens.json), the source the site's colours, corners and motion are built from, in the W3C Design Tokens format. It is in the brand kit and listed in llms.txt.

**Changed**
- Reading text is set to about 70 characters a line. Some lines ran to 102 on a wide screen (topic quizzes, privacy, how it's built, the Long run's data note).
- In a decision's results and a game's numbers, the figures in a row line up even when one label takes two lines. Before, one sat 20 px lower.
- Night mode's secondary text is a little lighter, and its error red lighter and softer, so both read at a glance.
- Share cards use the site's exact colours: three of their greys and the clay highlight had drifted.

**Tooling**
- `tokens/monte.tokens.json` is the one place a colour, a corner or a duration is set: brand colours as primitives, then what each is for in four modes (light, dark and their high-contrast versions). `npm run tokens` writes `app/tokens.css` and `lib/tokens.ts`; `npm run tokens:check` (CI) and `tests/tokens.test.ts` fail when they drift. The theme colour, the web manifest, the share cards and the cheat sheets read it instead of typing hex.
- `npm run contrast` checks every pair in all four modes and prints APCA beside WCAG as a second look.
- `npm run scale-check` fails on a hand-set reading width: use `max-w-measure` or `max-w-measure-short`.

## 2026-11-22: found by what people search

**Changed**
- Decision pages lead with the name people search, then the question: [A/B test calculator](https://monte.markets/decide/abtest/), [Is the extended warranty worth it?](https://monte.markets/decide/warranty/), [Implied probability calculator](https://monte.markets/decide/bet/) (with no-vig odds and a Kelly stake), [Bayes' theorem calculator](https://monte.markets/decide/bayes/), [Monte Carlo calculator](https://monte.markets/decide/choose/), [Monte Carlo savings calculator](https://monte.markets/decide/goal/), [Option probability calculator](https://monte.markets/decide/option/), [Prediction market calculator](https://monte.markets/decide/market/) and [Staffing calculator](https://monte.markets/decide/staffing/). Decide lists them the same way.
- Games say what they are in search: [Monty Hall problem simulator](https://monte.markets/play/monty-hall/), [Roulette simulator](https://monte.markets/play/house-edge/), [S&P 500 simulator](https://monte.markets/play/long-run/), [Monte Carlo option pricing](https://monte.markets/play/options/), and every game's title and summary.
- Each solver has its own heading instead of "Solve": [Birthday problem calculator](https://monte.markets/solve/bday/), [Normal distribution calculator](https://monte.markets/solve/normal/), [Hypothesis test calculator](https://monte.markets/solve/test/) and eight more.
- Play, Drill, Flashcards, the [Statistics formula sheet](https://monte.markets/learn/formulas/) and Terms have titles people search for.

**Tooling**
- `tests/decide-math.test.ts` holds each decision's heading and title to its searched name and to the length a search result shows.

## 2026-11-20: show, don't tell

**Changed**
- The Shuffle's reveal draws the work instead of writing it out: two curves and the tail for an average, a thousand dots for a positive test, a line for every pair in a birthday room, the opened doors' grains moving to the closed one, the roulette pockets and what a spin is worth, and more, one picture for each kind of round, with the answer on it in clay. The steps and what each wrong cup did are one tap below, under Every step. How many lifts it took shows as rings and a clay grain.
- A lesson that ends with a miss shows each fix (your pick struck through, the answer and why) with a link back to its question, instead of printing every question again, and a grain per question beside the score.
- [About](https://monte.markets/about/) and [Brand](https://monte.markets/brand/) draw where the name comes from (a pile of grains, three doors, three cups, the bell). About opens on one line, its promises are four lines that link to where each shows, and its history opens on a tap. Brand's voice principles are a pair, the line Monte says and the one it never would; its word lists are plain words. The brand story moved to Describe Monte, ready to copy.
- Today's first ten minutes is three stops on a line with their minutes. How it's built drops its 01 to 04 numbers and shortens each stage.

**Tooling**
- `tests/shuffle-work.test.ts` draws two years of Shuffle rounds and holds each picture to the numbers in its work. `npm run smoke` checks the drawn reveal, that its steps open on a tap, a lesson's miss ending, and /brand/.

## 2026-11-20: the Shuffle

**Added**
- [The Shuffle](https://monte.markets/shuffle/): three-card monte with a statistics question, one round a day, the same for everyone. Three answers under three cups, one right and two that the question's story leads you to. The cups are thrown; follow the right one, lift a cup, and see the work. A wrong cup says what its number did, and you lift again. Share how many lifts it took without spoilers, keep a run of days, or play practice rounds. Every answer is computed by the lessons' and solvers' own code. It has its own share card, and it is on the home page, first on [Play](https://monte.markets/play/) and in the footer.
- The home page's first phone screen now shows today's Shuffle and today's chart right under the board, with how you did once played.
- Play opens with Every day: the Shuffle and the daily chart.

**Changed**
- Find the grain on the home page is the Shuffle. The old three cups that named an idea are gone; the same cases now hide under the cups as answers.

**Fixed**
- The desktop Decide breadcrumb on decision pages was a 20 px tap target, and the filter and preset chips (Sources, Solve, drills) were 40 px. Both are 44 px now and look the same.
- On phones, the board's hint said "Click to drop a grain" until the page's script ran. It says Tap from the first paint.
- The daily data refresh runs twice a day, twelve hours apart. GitHub had been starting the one daily run 6 to 10 hours late, and one late or dropped run could leave the site stale.

**Tooling**
- `tests/shuffle.test.ts`: two years of rounds (one grain, distinct answers, the right number against its formula, the traps), the family rotation, the throw, the share line and the run of days. `tests/brand.test.ts` holds every round's copy to the voice. `npm run smoke` plays the Shuffle through, checks the Today row sits above the tab bar on a phone, and reads the board's hint with scripts off.

## 2026-11-20: the brand kit

**Added**
- [The brand kit](https://monte.markets/brand/) in one download: the logo in colour, reversed, black and white; the mark and the app icon at every size; avatars and banners for X, LinkedIn, YouTube, GitHub, Instagram and stories, drawn from the home page's own board, in day and night; an email signature; the colours with RGB, OKLCH, a CMYK approximation and their contrast; and a README. [`kit.json`](https://monte.markets/brand/kit.json) lists every file with its size and sha256.
- The brand page draws its rules: clear space, the smallest sizes, five things never to do with the logo, colour values that copy when pressed, the fonts' licence, and each voice principle with a line the site really uses.

**Fixed**
- The app icon offered on the brand page was the 512 icon scaled up to 1024. It is now drawn at 1024.

**Tooling**
- `npm run brand` draws every app icon, share card and brand file from one source and stamps `public/brand/kit.json` with its fingerprint. The build redraws them when their source changed, `npm run brand:check` (in CI) fails on any file that differs from what its source draws, and `tests/brand.test.ts` checks kit.json's hashes and that the kit's app icons are the files the site serves.
- `npm run brand:live` and `.github/workflows/brand-live.yml` check the live site against its own kit.json after every deploy and on Mondays; `npm run smoke` runs the same check on the local build.
- The hero board's geometry and physics moved to `lib/board.ts`; the hero draws exactly as before. The colour tokens and contrast math moved to `scripts/lib/tokens.ts`, shared by `npm run contrast` and the kit.

## 2026-11-19: security and an open repository

**Added**
- A strict Content Security Policy on every page: scripts, styles, images, audio and connections only from Monte itself (plus Vercel's analytics script), no plugins, no framing except the maker's site. Checked against every route in a browser with no violations.
- [`/.well-known/security.txt`](https://monte.markets/.well-known/security.txt), the standard place to find how to report a security problem.

**Tooling**
- CodeQL code scanning, dependency review on pull requests and OpenSSF Scorecard, each starting on its own once the repository is public.
- Least-privilege workflow tokens: the IndexNow job gets none, and jobs that never push don't keep the checkout's credentials.
- `SECURITY.md` rewritten (scope, what to include, what happens next, safe research), plus `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CODEOWNERS`, issue forms (something is wrong, something is broken, an idea) and a pull request template.
- README badges: CI, Scorecard, both licences, the MCP server and the site.

## 2026-11-19: every page in Markdown, CI

**Added**
- Every topic, lesson, solver, decision and game, the home page, the formula sheet and the glossary as plain Markdown at the page's path plus `.md` ([`/learn/normal.md`](https://monte.markets/learn/normal.md)). Lessons keep their questions with the right answer marked, solvers show their answers and work for the starting numbers, decisions keep their step-by-step working. Each page links its copy with `<link rel="alternate" type="text/markdown">`.
- [`/llms.txt`](https://monte.markets/llms.txt) lists all of them, and [`/llms-full.txt`](https://monte.markets/llms-full.txt) now also holds the quiz answers, full lessons, the formula sheet, the decisions, the games and the solvers.
- The sitemap dates the topic, lesson, formula sheet, glossary and sources pages by the day their content last changed.

**Fixed**
- The daily chart moves on to the new day's chart at midnight, and when you come back to a tab left open overnight. It used to keep yesterday's chart until a reload.
- Restoring a backup code keeps daily-chart results played since the backup and the streak they make. It used to replace them with the backup's.

**Tooling**
- `.github/workflows/ci.yml` runs the tests, TypeScript, ESLint, the scale check, the build, contrast, smoke and the MCP server's test on every pull request and push to main.
- `.github/dependabot.yml`: weekly dependency updates, minor and patch grouped into one pull request for the site and one for the MCP server, plus GitHub Actions.
- `tests/markdown.test.ts` fails when a page in the sitemap has no Markdown copy; run `npm run api` and commit the files.

## 2026-11-19: the daily chart, Keep it fresh, a brand kit, less text

**Added**
- [About](https://monte.markets/about/): where Monte began, what it promises, how it got here, why the name, and who makes it.
- Flashcards that remember: each card comes back just before you would forget it. Due today deals those first, and Today shows how many are waiting. The schedule is FSRS, the open scheduler built into Anki.
- A moving drawing for every game and decision. Each plays a small move when you point at it or open its page, and stays still with reduced motion. Every decision has its own share card, and every drawing is on [the brand kit](https://monte.markets/brand/) as an SVG.
- [The daily chart](https://monte.markets/daily/): one real chart a day, the same for everyone, with its end hidden. Draw what happens next, see what did, share your score, keep a run of days going.
- Keep it fresh: a topic you mastered goes rusty after two weeks untouched. Today lists the rusty ones and Refresh deals a mixed review.
- [The brand kit](https://monte.markets/brand/): logo files, colours, type, the voice and ready-to-paste descriptions.
- [Privacy](https://monte.markets/privacy/) and [Terms](https://monte.markets/terms/) pages.
- Share cards for each part of the site (Learn, Practice, Solve, Decide, Play, the daily chart).
- The MCP server is live at `https://mcp.monte.markets/mcp`. Its tools all say they only read, and `server.json` lists it on the official MCP Registry.
- Licences: the code is MIT and the lessons, glossary and open data are CC BY 4.0.

**Changed**
- [How it's built](https://monte.markets/built/) is redesigned: a drawn path from an idea to your screen, the counts as one band, the stack as a spec sheet, the checks beside what runs on its own, and credits, with a link to the code on GitHub. The site names its maker, Sami Kirberg, in its metadata too.
- App icons and the favicon: the bell curve in paper on a clay tile, readable at every size.
- Answer choices, tabs and cards share one set of shapes and corners.
- The election page shows the final record only: the last forecasts, the results and how each forecast did.
- Less text: Decide is a plain list of questions, the Play cards lost their labels and arrows, long sentences are split, and a test keeps stock phrases out (DESIGN.md, "Words").

**Removed**
- The daily market fetch for the election page: both chambers settled on Nov 3, so the saved snapshot is the record.

**Tooling**
- Everything is TypeScript: the build, QA and data scripts and the MCP server's build and test moved from `.mjs` to `.ts`. TypeScript 6, with unused code now a type error.
- `npm run typecheck` checks the site and the MCP server; `npm run scale-check` is the design scale check (it was `type-check`).
- Every Monday a workflow opens every link on the Sources page and opens an issue when one is broken (`npm run check-sources` runs it by hand). It never changes a "Checked" date: that date means a person read the page.

## 2026-11-19: Find your level, Test out, Expert

**Added**
- Find your level: a few questions place you on the path, so you skip what you know.
- Test out of a topic, and an Expert set (10 questions in 6 minutes, 9 right) for a star.
- What happens next? on the home page: draw the rest of a real chart, then see how a plain rule did.

**Removed**
- Kalshi's prices from the election page: its data terms do not allow showing them on a public site.

## 2026-11-13: the bell curve logo, a full review

**Changed**
- The logo is a clay bell curve beside "monte". The hero board, the loader and the share card draw it.
- A full-site review: bug fixes and much less text on every page. Lessons end honestly, with nothing drawn over the text.

## 2026-11-12: Listen, the MCP server, How it's built

**Added**
- Listen: real narration for each topic.
- [The MCP server](mcp/README.md): Monte's solvers, glossary and three decisions for chat apps.
- [How it's built](https://monte.markets/built/): what Monte is made of, in counts, logos and specimens.

**Changed**
- Phones: less text, topic pages open on the lessons, search in the header.

## 2026-11-11: found by search

**Added**
- Every page is sent to search engines on each deploy (IndexNow), and `llms-full.txt` gives assistants the whole course in one file.

**Changed**
- Topic titles say what people type into search. Polish across the story, phone layouts, the options chart and names.

## 2026-11-05: ready to share

**Fixed**
- Search, the drill link, share titles, the first-visit path, error handling and the election results.
