# Monte: design source of truth

Updated November 22, 2026 (search words lead; the system under the look; no claim the code is open while it is private). Sections carry the date they were decided; the newest decision wins.

Statistics for everyone, one idea at a time: learn it, practice it, solve with it, decide with it, play with it. Monte is not for one class or one course. It began as a study app called Sigma Sandbox; /study is that app, rebuilt as typed React pages. Public copy never frames the site around an exam, a class or a school: say "mock test", not "final" or "closed-book exam".

## Concept

**Statistics is a sandbox: drop enough grains and the shape appears.**

Proof: every data point is a grain of sand, and one grain tells you little; the pattern shows up in many. A Galton board is the honest version of the picture: each grain's landing spot is the sum of many left-or-right bounces, and sums like that pile into a bell shape. More data does not make every dataset bell-shaped (incomes and wait times stay skewed however many you collect); what the Central Limit Theorem says is that averages of many independent draws come out close to normal. The board is about sums and averages, and the brand should never say more than that. The tennis thread comes from the study app: fourteen topics are fourteen matches in "the draw", won by scoring 80% on a fresh timed drill. Sand plus tennis means clay, the court surface made of crushed brick.

The site's public pages (home, menus, footer) say **topics** and **mastered**, not matches and won: a newcomer should not need the tennis to follow along. Clay, the court baseline and the grains stay as the look.

## Name

**Monte.** Short, one word, and it names what the site does three ways at once: Monte Carlo simulation (the long-run and options games, and every check behind the math), the Monty Hall doors game, and three-card monte, the street con where the game is rigged. The mark adds a fourth: monte is Italian for mountain, and the clay bell curve in the mark is the mountain every pile of grains settles into (see Mark). The lesson in it is a statistics lesson too: when the game is rigged, better math doesn't win; the right call is not to play. Chosen October 2, 2026 from a shortlist of Monte, Probably, Probs, Fluke and Oddly. Quick web check found no statistics or study product called Monte; no trademark search has been run.

## Voice

Register: a coach at practice. Short, plain, direct, a little dry.

- Uses: one idea, drag, drill, fresh numbers, win
- Never uses: unlock, supercharge, journey, seamless, AI-powered, or stock phrases like "not just" and "learn more" (see "Words")
- Jokes: one dry line per page at most, never in feedback on a wrong answer

Five principles (written out with examples on the public brand page, /brand/): do it, then say it; one idea per sentence; show the work; dry, never cute; for everyone. The words Monte never uses live in `VOICE.never` in `lib/brand.ts`, and `tests/brand.test.ts` fails if one shows up anywhere in the site's copy.

Three lines in the voice:
- Hero: "Drop enough grains. The shape appears." No tagline under it.
- Error: "Not quite. Here is the work."
- Confirmation (study app drills, which keep the tennis): "Match won. 8 of 10, under the clock." On public pages the same moment reads "Mastered."

## Copy rules

- Plain English. One idea per sentence. Say how long and where a button goes ("Start the first idea, 4 min").
- Dashes (owner's rule, October 2026): **en dashes are fine where they are the right typography**: number ranges (5–10), scores (3–1), and an empty value in a tile or table (–). **Avoid em dashes**; use a period, a colon or a comma instead.
- Never mention AI, in copy, metadata or alt text.
- For everyone: no exam, class or school framing in public copy (see the first paragraph).

## Navigation

One vocabulary, in this order, everywhere: **Learn · Practice · Solve · Decide · Play.** The constants live in `lib/site-data.ts` (`SITE_NAV`, `navKeyFor`, `DECIDE_TOOLS`).

| Place | What it shows |
|---|---|
| Site header (every page) | The five, with the current one underlined from the pathname. Decide is current on `/decide/` and every `/decide/<tool>/`. Play is hidden in Focus. |
| Phone tab bar | Today, Learn, Practice, Solve, More. Today is the study landing (`/study/`) and appears only here and in ⌘K. |
| Phone More sheet | Learn extras (Why statistics, Formula sheet, the Excel, R, Python and SQL guides, Free sources), Decide (all decisions, Is this test result real?), Play (Fun only), the Fun or Focus switch, How it's built. |
| Footer | Five columns with the same headings. The Play column hides whole in Focus. How it's built sits by the wordmark; the only credit is the GitHub icon. |
| ⌘K menu | Before typing: Start here (Today, Start 10 questions, Which formula do I need?, Formula sheet) and Browse (the five, each with a count). Typing searches everything in groups named Learn, Practice, Solve, Decide, Play, then Go to (Today, the five, How it's built, mode and theme). On a phone it opens full screen with the field at the top, a Cancel button and 16 px text, so iOS Safari does not zoom. |

**Tools** (the Excel, R, Python, Power Query and SQL guides) and **Sources** live under Learn: they keep their URLs (`/study/tools/…`, `/study/sources/`), and the header and phone bar mark Learn as current on them. Home page section kickers follow the same words (Learn, Solve, Decide, Play).

## Type (Google Fonts, SIL Open Font License, free for web, app and print)

| Role | Face | Why |
|---|---|---|
| Speaks (headlines) | Bricolage Grotesque, optical size + width axes | Has a point of view; condensed at display size, calm at small size |
| Reads (body) | Geologica | Covers Greek, so σ μ x̄ p̂ render in the same face as the sentence |
| Measures (numbers, timers, scores) | Azeret Mono, tabular | Plain zero (0 never reads as 8), scoreboard feel; Greek falls back to Geologica |

### Type scale (November 2026)

One scale, defined once in `app/globals.css` (`@theme`), and nothing else. `npm run scale-check` (part of `npm run check`) fails on any raw size, weight, letter-spacing, line height or caps label. Modeled on IBM Carbon (a fixed set for reading and UI plus a fluid set for headings, three weights, no raw sizes in components) and Material 3 (named roles, no near-duplicate sizes).

| Step | Size | Use |
|---|---|---|
| `text-xs` | 12 px | Captions, chart notes, stat-tile labels |
| `text-sm` | 14 px | Labels, secondary UI, most controls |
| `text-base` | 16 px | Body |
| `text-lg` | 18 px | Lead body, important answers |
| `text-xl` / `text-2xl` | 20 / 24 px | Card and block titles |
| `text-3xl` / `text-4xl` | 30 / 36 px | Stat-tile figures, small display |
| `text-lead` | 18 to 22 px, fluid | Section intros |
| `text-heading` | 22 to 36 px, fluid | Section headings |
| `text-headline` | 32 to 56 px, fluid | Section headlines |
| `text-title` | 36 to 70 px, fluid | Page titles (Decide, Play games, Study, story sections) |
| `text-display` | 44 to 88 px, fluid | Landing headlines (Home, Decide, Play, Story, How it's built) |
| `text-figure` | 40 to 88 px, fluid | The big number on a result |
| `text-hero` | 64 to 160 px, fluid | The one giant number on a page |
| `text-symbol` | 0.92 em | x̄, p̂ and inline code beside running text |

Fluid steps grow smoothly from a 390 px phone to a 1440 px desktop and carry their own line height, so no heading sets one. Every fluid step uses rem bounds with a rem term in the middle and a maximum at most 2.5 times its minimum, so browser zoom and the reader's font-size setting still enlarge text to 200% (WCAG 1.4.4; Chrome's text-scaling guidance and MDN on clamp). Never size text in vw alone, and never block pinch zoom.

- **Weights:** three. `font-normal` (400) to read, `font-medium` (500) for UI, `font-semibold` (650) for headings and figures.
- **Letter-spacing:** display type carries -0.02em through `font-display`; big mono figures use `tracking-tight` (-0.025em). Nothing else.
- **Labels:** one style, `label` in `components/study/ui.tsx`: sentence case, the sans face, 14 px medium, muted. Never small caps or letter-spaced.
- **Exception:** text inside SVG charts uses `fontSize` in the chart's own drawing units, which scale with the chart.

## Layout (November 2026)

Until Nov 5 Monte had no layout system: 155 different spacing classes, every section padded by hand, nine page widths. The type scale had no partner. This is the partner, defined once in `app/globals.css` (second `@theme`) and `components/layout/section.tsx`.

| Token | Value | Use |
|---|---|---|
| `max-w-page` | 75rem (1200 px) | the one page column |
| `max-w-content` | 61.25rem (980 px) | a wide working area inside the page, such as a solver |
| `px-gutter`, `gap-x-gutter` | 16 px phone to 24 px desktop | side margin and the gap between grid columns |
| `mb-block`, `pt-block` | 32 to 56 px | heading to its content; the first section under the header |
| `pt-section`, `py-section` | 64 to 112 px | between sections |

- **Grid:** `grid` from `components/layout/section.tsx`: 4 columns on phones, 12 from 768 px. Content takes whole columns (`col-span-*`), never a hand-set width.
- **Sections:** every home band is a `<Section>`. Paper sections pad only their top, so neighbours never stack double space; a sand section sits on its own ground and pads both sides; the last one pads its bottom. Inside a block, stack with the Tailwind scale (`mt-2`, `mt-6`), nothing in between.
- **Every page** uses the same page column, gutter and rhythm: home, study, Decide and its tools, Play and each game, the story, How it's built, the header, footer, error and 404 pages. `npm run scale-check` fails on a hand-set page width, page margin or section spacing.
- **Inside components** (the cups, the test result tool, the solver panels) spacing still uses the Tailwind scale; their insides have not been put on the 12 columns.

### Fits a 320 px phone (November 22, 2026)

Every page fits a 320 px screen, the smallest phone in use, with no sideways scroll. Two pages did not: the /brand/ logo, sized by height, ran 344 px wide, and the MCP server's address on How it's built could not wrap. A page that is too wide on a phone also widens its fixed layers, so the bottom nav and the toast spilled with it.

- **Drawings and the logo shrink to their box.** `Wordmark` carries `max-w-full`: sized by height, it never grows wider than where it sits.
- **Long addresses and tokens wrap.** An address breaks after its dots (`mcp.monte.` then `markets`), with `[overflow-wrap:anywhere]` behind it, never by hiding overflow on the page.
- **Fixed layers sit inside the screen.** They fit by themselves once the page does. Nothing is clipped to get there.
- **Text fields are 16 px or more on a phone,** or iOS Safari zooms in when one gets focus.
- **Tap targets are 24 px or more,** checkboxes too, even inside a label row.

`npm run qa` holds every built page to this at 320 px. It measures against the layout viewport (`documentElement.clientWidth`): on a phone `innerWidth` grows to fit a page that is too wide, so the old check passed both pages.

### Measure (November 22, 2026)

A line of reading runs about 70 characters: `max-w-measure` (50ch). A line set short on purpose, a lead beside a picture or an error page, is `max-w-measure-short` (44ch, about 61). In Geologica 1ch is about 1.4 average letters, so the old 62ch ran to 87 characters, and some blocks had no measure at all: a topic's quiz, How it's built's math, the Long run's data note and privacy ran to 85 to 92 on a 1440 screen. Eight hand-set reading widths (40 to 62ch) are now these two, and `npm run scale-check` fails on a hand-set one. Headlines keep their own short measures (16ch, 22ch). Bringhurst's rule: 45 to 75 characters, 66 the ideal.

### Home wireframe (November 20, 2026)

```
DESKTOP (12 columns)                              PHONE (4 columns), one screen
+------------------------+------------------------+   +------------------+
| Drop enough grains.    |  grain board           |   | Drop enough      |
| The shape appears.     |  (col 7-12)            |   | grains. The      |
| [Start the first idea] or try 5 questions       |   | shape appears.   |
| [cups] The Shuffle  [chart] Daily chart         |   +------------------+
|        No. 2               No. 2                |   | grain board      |
+------------------------+------------------------+   +------------------+
  section: Find the grain (the Shuffle)               | Shuffle | Chart  |
  section: Fourteen topics (wide screens only)        [Start ...]
  sand section: What happens next? (the daily chart)  ---- tab bar ----
  section: The biggest poll ever taken ...  (col 1-8) Find the grain
           Read 14 true stories  (col 9-12)           What happens next?
  section: Games (wide, Fun mode only)                The biggest poll
```

The hero headline is one sentence beside the board. Section headings are one size (text-headline), plain nouns or a real question, never a two-beat slogan. No closing band: the header carries the start button.

**Today's two dailies on the first screen (Nov 20 2026).** The board stays the opener; right under it, a row of two (`components/landing/today-row.tsx`): the Shuffle and the daily chart, each its glyph, its name and today's number, then how you did once played ("No. 2 · first lift", "No. 2 · 88 vs 92", clay when you won). Each jumps to its game further down. On a 390 × 844 phone the row ends at 693 px, above the tab bar at 787 (the smoke test checks it); before, the daily chart sat at 1,434 px, two screens down behind the tab bar. On phones the start button moves under the row; on wide screens it stays under the headline and the row sits below it. Learned from the NYT Games app, whose home is a column of today's puzzles with your progress on each (redesign of March 2024).

## Less text (November 12, 2026)

Owner's rule: less text, phone first. Pages show the thing to do (a lesson, a lab, a tool, a question) and fold the reading.

- No intro paragraph under a page title when the title says it. Section subtitles and fold teasers only when they carry a number (`3 of 14 mastered`).
- Reference reading (method notes, research, colophon, how-to-practice) sits in folds, closed.
- Say a thing once: no list that repeats what the next card shows.
- On phones, Decide hides the arithmetic under stat figures and the long verdict (the sticky result bar says it); How this works keeps the math.

## Words (November 19, 2026)

Why: people read about a fifth of a page's words, and read half only on pages under about 110 words; cutting text alone made pages 58% more usable in Nielsen Norman Group's tests. The rules below come from NN/g, GOV.UK's content design guide, Apple's writing guidelines, Krug ("get rid of half the words, then half of what's left") and Mayer's multimedia research.

- A page intro is one sentence of 20 words or fewer, or nothing when the title says it.
- Sentences run 25 words or fewer; a fold may go longer only for a formula. Paragraphs hold one idea.
- The first two words of a heading, link or button carry its meaning. Buttons are a verb and an object; links name where they go. Never "Learn more" or "Click here".
- No small label over a title (an eyebrow) unless it is navigation. No subtitle that restates its heading. No arrow inside a card or row that is already a link: the whole thing is the link.
- Lists, not card grids, for things that are only words (Decide). Cards earn their box with a picture (Play).
- One main action per screen. A disclaimer appears once, at the end, in small type.
- Instructions only for what a control cannot show (the hero board's "Hold to pour"). Never describe the page ("Below you'll find").
- Stock phrases are out, and `tests/brand.test.ts` fails on them: "not just", "whether you're", "welcome to", "ready to", "learn more", "click here", "worth noting", "delve", "in summary", "feel free" (`VOICE.never` in `lib/brand.ts`).
- Vary sentence length. A run of same-length sentences reads as machine-written too.

## Search words lead (November 22, 2026)

Why: in eight weeks search sent about 45 visitors, nearly all searching the name; topic, game and decision pages got 0 to 2 each. They were indexed. Their titles were the voice's questions and names ("Did my change really work?", "Three doors", and "Solve" as the h1 of all eleven solvers), which nobody types. On page one for a tool search, the winner is a page whose title starts with the search: "Monty Hall Problem Simulator" (montyhall.io, a single page, first), "A/B-Test Calculator" (abtestguide.com), "Extended Warranty Calculator: Is It Worth It?" (small calculator sites). Volumes, difficulty and who ranks were checked on November 22 with Google's suggestions, Google Ads volumes and live Google results.

- A decision's h1 and title start with the name people search, then the question it answers: "A/B test calculator: did my change really work?", "Is the extended warranty worth it?" (the search is the question). The first two words carry the meaning (Words). The share card keeps the question, and a game keeps its name on its card and on /play/ ("Three doors").
- A game's h1 changes only when its name does not say what people search: "Monty Hall problem simulator", "Roulette simulator: the house edge", "S&P 500 simulator: the long run", "Monte Carlo option pricing". Guess the correlation already says it.
- A solver's h1 is its own name ("Birthday problem calculator"), with its one line under it; the card below the tabs drops its repeated title. Titles say "with steps" where the solver shows them, since that is what people add when they want the work.
- Hubs link with the same words: /decide/ lists the headings, the footer says "Normal distribution" and "Confidence intervals", the formula sheet is the "Statistics formula sheet".
- Never claim what a tool does not do: "Monte Carlo savings calculator", not retirement (it has no withdrawals); "staffing calculator", not Erlang C (it uses Poisson).
- Where it lives: `heading`, `title` and `description` in `lib/decide/tools.ts`; `GAME_SEARCH` and `SOLVER_SEARCH` in `lib/seo.ts`, beside `TOPIC_SEARCH`.
- Structured data says only what is true: decisions and solvers are free web applications (`WebApplication`) with breadcrumbs. No FAQPage or HowTo: no page shows a FAQ, Google shows FAQ results only for government and health sites, and it dropped HowTo results in 2023.

## The code, while it is private (November 22, 2026)

The repository is private, so a link to it is a 404 for every visitor, and "open source" is a claim nobody can check. One switch, `REPO_PUBLIC` in `lib/seo.ts` beside `REPO_URL`, decides both. While it is false:

- About and How it's built drop **Read the code**, the Code credit and the change log link, which lives in the repository.
- Words that say the code is open become words that say what is true. How it's built opens on "Free, with no sign-up. Every number on the site is real, or worked out by code." About's fourth promise is "Open lessons and data, CC BY", linking to Terms. The maker's line is "Built on GitHub and hosted on Vercel." Terms, the voice line on /brand/, llms.txt and the API's licence line stop naming the code's licence.
- **Report a mistake**, "Found a mistake?" and the Questions on Privacy and Terms go to the maker's page (`ASK_URL`), worded as "Tell Sami" and "Ask Sami Kirberg, who makes Monte".

Set it to true and each page renders as before, byte for byte; then run `npm run api` and `npm run brand` and commit what they write. `tests/repo.test.ts` draws the four pages both ways, and `npm run smoke` reads every file of the built site for the repository's address. `public/.well-known/security.txt` keeps pointing at the repository: it is for the repository, not for visitors.

## Show, don't tell (November 20, 2026)

Owner, Nov 20: "too much text." A pass over every screen a visitor sees, counted at 390 and 1440 (words with a letter, a closed fold not counted; numbers are data, not words), then reworked where the words were heaviest. The rule: **say it with the picture first, one short line where words are needed, the detail one tap away, never deleted.** Studied live first, at both sizes: Seeing Theory, Setosa, Apple, Stripe, Linear, Our World in Data and GitHub, plus the Shuffle's own references (Wordle, Brilliant).

- **The Shuffle's reveal draws the work** (`components/play/shuffle-work.tsx`, data in `fig` on each round, shapes in `lib/play/shuffle-fig.ts`). One picture per kind of round: two curves and the tail for an average or a crate, skewed shapes against the normal for "Can't tell", three ranges on a line, a thousand dots and the flagged bar for a positive test, nested rows that keep (1 − p) for "at least one", a mosaic with the given group outlined, a line for every pair in a birthday room, the opened doors' grains moving to the closed one, the pockets and a win/loss bar for the house edge. The grain's answer sits on the picture in clay; curves are named on the curve, never in a legend (Our World in Data). The steps and what each wrong cup did are under **Every step**, closed. The lifts show as the share row draws them, a ring per miss and the grain in clay. Learned from Seeing Theory and Setosa (the picture is the explanation), Apple's "24 hours" (the number big, the conditions in a footnote) and Wordle's grid. `tests/shuffle-work.test.ts` draws two years of rounds and holds each picture to the numbers in its work.
- **A lesson's miss ends on the fix, not a repeat.** The score with a grain per question (clay right, a ring missed), the coach's line, then each miss as your pick struck through, the answer in clay and why it holds, with a jump back to the question (it is right above, where you answered). Before, the end printed every missed question, your pick and the answer again: 124 words on a phone's first screen, now 73.
- **About and Brand draw the name** (`components/brand/name-row.tsx`): a pile of grains, three doors, three cups over a grain, the bell, each with one line, instead of four boxes of sentences. About opens on one line ("You do something first. Then the idea shows up."); its promises are four lines that link to the page that shows each; its history keeps date, grain and title on the court line, with what changed one tap away (Linear's changelog). Brand drops the story paragraph from its first screen (it moved to Describe Monte, ready to copy), shortens the section lines, shows each voice principle as a pair (a clay check, a cross on the struck line) and lists its words as words, not chips.
- **Today's first ten minutes is a route**: three stops on one line with their minutes in mono, the next one lit, instead of 1, 2, 3 in circles inside boxes inside a box. **How it's built** loses its 01 to 04 and keeps a short line and a count per stage.
- **Measured and left alone:** the daily chart's result (38 words, already the picture and two scores), the home below the board (the Shuffle's question is the bulk, and it is the puzzle), the Shuffle's question itself (its setup is the story the round is about).

| Screen | 390 first screen | 1440 first screen |
|---|---|---|
| A lesson ended with a miss | 124 → 73 | 147 → 104 (both with the 14-topic sidebar, about 45) |
| About | 73 → 29 | 136 → 56 |
| Brand | 93 → 62 | 139 → 62 |
| The Shuffle's reveal | 84 → 59 | 109 → 84 (the question and its setup, 34, stay) |

## Numbers (November 22, 2026)

A grid of figures (a decision's results, a game's numbers) lines its figures up across a row. Each cell is a subgrid over the grid's rows (label, figure, the arithmetic), so a label that wraps to two lines moves its whole row, not only its own figure. Before, on a phone, "Typical move by expiry" put its figure 20 px below its neighbour's; now the gap is 0 in all four grids that had it (`Stats` in `components/decide/fields.tsx`, the Long run, Guess the correlation and Options). The results grid is also a size container: a cell's padding and the arithmetic under its figure follow the room the grid has (32rem and up), not the screen. Subgrid has been Baseline widely available since March 2026, container queries since August 2025. Figures that change keep tabular numbers.

## Buttons (November 2026)

Two buttons, one size step, defined once in `app/globals.css` and nowhere else; `npm run scale-check` fails on a pill built by hand.

Every tap target is at least 44 px (Nov 20 2026). A chip (`chip` in `components/study/ui.tsx`: filters, presets) draws its 40 px pill on `::before` inside a 44 px button, so it looks as before; the desktop breadcrumb on a decision page keeps its 20 px line of text inside a 44 px link pulled back by negative margin.

| Class | Use |
|---|---|
| `btn btn-primary` | the one action that matters on a screen: ink pill, paper text |
| `btn btn-secondary` | every other button: paper pill, line-strong border |
| `btn-sm` | add for actions inside a tool or game (44px tall instead of 48px) |

Learned from Brilliant (brilliant.org, checked Nov 6 2026): in a learning app the buttons are tactile. Each pill stands on a 3px edge of its own darker color (`--ink-lip`, `--line-strong`); pressing pushes it down onto the edge, so a tap feels like setting down a grain. The main button stays ink, never clay: clay means the number. Disabled buttons lose the edge and drop to half opacity. Text links (`or try 5 questions`) stay links, not buttons.

## Shape (November 19, 2026)

Three corners for surfaces, as tokens (`radius` in `tokens/monte.tokens.json`), and nothing in between:

| Token | Size | For |
|---|---|---|
| `rounded-inner` | 14px | a tile or an answer inside a card |
| `rounded-card` | 24px | every card, panel and sheet |
| `rounded-stage` | 28px | the stage under a chart, a board or a game |

Controls (buttons, chips, segmented rows) are pills (`rounded-full`). Before this there were nine hand-set corners (18, 20, 22, 24, 28, 32px and more), so a study card and a game card on the same screen looked like two sites. `npm run scale-check` fails on a hand-set corner over 6px.

**If you can press it, it stands on an edge.** Buttons and answer choices sit on the same 3px edge and sink when pressed (`.choice` in `app/globals.css`, used by lessons and Find your level). Once answered, the result colours the whole tile, edge included: clay for right, red for wrong, and the tiles you did not pick settle and fade back. Static cards stay flat: a sand fill for the one that leads, a hairline border for the rest. Learned from Brilliant and Duolingo, whose answer tiles press like buttons, and Apple's concentric corners (a tile's corner is smaller than its card's).

A row of segmented tabs that runs off a phone screen fades out at the edge with more to see, and opens scrolled to the current tab (`components/study/fade-row.tsx`).

## Lessons and feel (November 2026)

Learned from Brilliant (study: Studio, Monte, 6 Design, "Brilliant Study (Nov 6)").

- **Lessons.** Each topic is split into five small lessons, one idea each, 70 in all (`lib/study/lessons-a.ts`, `-b`, `-c`; player in `components/study/lesson-player.tsx`; pages at /study/learn/topics/<topic>/<lesson>/). Every lesson is four steps: a question before any explanation, the rule in a sentence or two, a second question to use it, the one thing to keep. Every choice answers back. Steps stack as you go and a bar on top fills per step. The last lesson of a topic hands you to its drill. `tests/lessons.test.ts` checks five per topic, a question first, exactly one right answer each, no dashes.
- **An honest finish (Nov 13 2026).** Anyone can reach the end of a lesson, but the end says how many were right ("1 of 2 right."). Only a clean run is done: it saves the lesson, earns its XP once and, in Fun mode, drops one clay grain per right answer into a row beside the score. A run with a miss gets no check, no clay and no grains: "Not quite. Here is the work.", a ring per missed question beside the score, each miss as the pick struck through and the answer with why it holds (the question is right above; a link jumps back to it, Nov 20 2026), the topic's trap in a fold, and Try the lesson again first, with the next lesson still one tap away.
- **Nothing over the text.** Lesson feedback stays in the page's flow: no callout or burst over the steps, and a milestone toast (level, daily goal, badge) lands in a slot under the score (`data-milestone-slot`, read by `ProgressBridge` in `components/progress.tsx`) without confetti.
- **Topic page, phone first (Nov 12 2026).** Like Brilliant's course page: the title, the five lessons, the lab and Check yourself. Everything else (the idea in one page, the trap, formulas, videos) is one tap away in folds with no teaser line. The topic's guess question was dropped from the page because every lesson already opens with a question; the guesses still drive placement (`lib/study/guess.ts`).
- **Answer the wrong answer.** Drill questions carry their usual mistakes (`traps` in `lib/study/drill.ts`): dividing by n instead of n − 1, both tails instead of one, the overlap counted twice, the variance for the SD. A miss that matches one says what it means, above the right answer.
- **The path.** Learn shows the fourteen topics as stops on a line: mastered stops filled in clay (a clay ring and a star when Expert), rusty ones hollow, skipped ones dashed, and the next one lit in ink with Start and Test out.
- **Find your level (Nov 19 2026).** A new visitor can take a short search along the path instead of starting at topic one (`lib/study/placement.ts`). It asks about the middle topic first and halves the stretch each time, so fourteen topics take at most four. Each topic it asks about takes two right answers, its guess question and a question from its lessons, so one lucky tap cannot skip a topic: at most eight questions. Dots show how far along it is. You start at the first topic the search says you don't know; the ones before it show on the path as dashed rings, Skipped, still there to read or test out of.
- **Test out.** The next stop on the path and every topic page offer Test out: the topic's eight-question drill. Seven of eight masters the topic and fills its stop.
- **Expert (Nov 19 2026).** A mastered topic offers Go Expert: ten questions on that topic in six minutes, always timed (36 seconds a question, on one clock). Nine of ten, with all ten answered, makes it Expert: a clay ring around its stop on the path, a star on the topic page, 30 XP once and the Expert badge. A miss says what it takes and offers Expert again. No grade and no rank, just the ring.
- **Keep it fresh (Nov 19 2026).** Mastery is earned once and never taken away, but a mastered topic with no right drill answer for 14 days reads as rusty (`isRusty` in `lib/study/progress.ts`): its stop on the path turns hollow and says Rusty, and Today shows a Keep it fresh card naming them with Refresh, five mixed questions over the mastered topics, the longest left alone first (`/practice/drill/?go=review`). Any right answer on a topic makes it fresh again. Learned from Khan Academy's mastery that needs refreshing, and the spacing effect: a short review after a gap holds learning better than more practice at once.
- **Flashcards that remember (Nov 19 2026).** Each card keeps a small memory (`lib/study/memory.ts`): when it is due, how long it lasts and how hard it is. Got it and Again update it with FSRS (`ts-fsrs`, MIT, the open scheduler built into Anki), set to bring a card back when you would still recall it 9 times in 10, in whole days, with no random spread, so the same answers always give the same dates. Due today deals the cards that are due, most overdue first; any other deck deals due cards first, then new ones in the usual order, then the rest by date. Today names the count ("4 cards due") in its Practice box, or in a box of its own for someone who has only used the cards. With nothing due, the page says so and offers the terms. The boxes (0 to 4) still count mastery and XP; the memory only decides when a card comes back. Learned from Anki and the spacing research: a review just before forgetting holds a card longest for the fewest reviews.
- **The daily chart (Nov 19 2026).** What happens next? opens on one chart a day, the same for everyone, like a daily word game (`lib/play/daily.ts`). It hides a past year of one of the four series, rotating series day by day and drawing stretches from a shuffle bag, so none repeats until all have been used; the pick depends only on the date, so new data never changes a day's chart. It is scored once: a return visit opens on your line and the result. Share sends the number, the real line and yours as bar characters and both scores (copied on a computer). Under it: how many days in a row, the time to the next chart, and yesterday's chart with its answer. More charts plays the four newest stretches as practice.
- **Feel.** A right answer clicks (two short rising tones, a 12 ms tap on phones); a wrong one is a soft low knock (a double tap). Tones are made in the browser, no audio files (`lib/feel.ts`). Fun mode only, never in Focus, never with reduced motion.

## Color (OKLCH, light "day court" / dark "night session")

| Token | Light | Dark | Use |
|---|---|---|---|
| paper | oklch(0.975 0.008 75) | oklch(0.17 0.01 50) | page |
| sand | oklch(0.945 0.016 75) | oklch(0.215 0.012 50) | subtle surfaces |
| ink | oklch(0.2 0.012 50) | oklch(0.95 0.01 75) | text, primary buttons |
| ink-muted | oklch(0.47 0.016 55) | oklch(0.78 0.015 70) | secondary text |
| clay | oklch(0.6 0.165 45) | oklch(0.72 0.15 48) | the data: curves, bars, answers, won |
| clay-ink | oklch(0.5 0.15 42) | oklch(0.78 0.13 50) | clay used as small text |

The values are set in `tokens/monte.tokens.json` and nowhere else (see Tokens), with a high-contrast version of each mode.

Rule: **clay means the number, ink means the action.** Buttons are ink. Clay marks data, highlighted answers and the won state. Links are ink with a quiet underline (`decoration-line-strong`, ink on hover), never clay. A right answer is clay (the `--success` token points at `--clay-ink`); there is no green. Bars that stick (header, tab bar, result bar) are solid paper, never translucent. Nearest brand colors: Roland-Garros clay orange (intentional homage, different category) and HubSpot orange (#FF7A59, lighter and pinker). No statistics or edtech leader owns clay (Khan and Duolingo are green, Coursera blue).

## Tokens (November 22, 2026)

Until now the colours lived in two blocks of `app/globals.css` and were typed again by hand in `lib/brand.ts`, the theme colour, the web manifest, the share cards and the cheat sheets. Three of the share cards' greys and the clay highlight had drifted from the site. Now there is one source, `tokens/monte.tokens.json`, in the W3C Design Tokens format (DTCG, Format Module 2025.10).

- **Two layers.** `color` holds the primitives: the brand's own warm greys, clays and reds, each named by its OKLCH lightness times 1000 (`warm.975` is paper, `clay.600` the brand clay), so a name says how light it is. `mode` holds what each one is for, grouped as surface, text, action, border, data and state. A mode token's name is its CSS custom property (`--paper`, `--ink-muted`), so no component changed, and components use mode tokens only. Learned from GitHub Primer (base tokens under functional ones) and Stripe's accessible colour system (levels in a perceptual space, so contrast is predictable).
- **Four modes.** Light (the day court), dark (the night session) and a high-contrast version of each, used when the device asks for more contrast (`prefers-contrast: more`): secondary text, lines, clay and errors step darker by day and lighter by night, and every text pair reaches WCAG AAA (7:1). A high-contrast mode `$extends` its base and lists only what changes. Learned from Linear's theme system, where contrast is one of three inputs, so high-contrast themes come with every theme.
- **Generated, then checked.** `npm run tokens` (`scripts/make-tokens.ts`) writes `app/tokens.css` (the primitives, each mode's custom properties, the Tailwind utilities, the corners and the motion) and `lib/tokens.ts` (typed, with each colour's sRGB hex for the places that need one). It refuses a hex that does not match its OKLCH, a reference to nothing, a token reaching into another mode and a mode missing a token. `npm run tokens:check` (in CI) and `tests/tokens.test.ts` fail when either file drifts, and the test fails on any colour written in `app/globals.css`.
- **Contrast, two ways.** `npm run contrast` checks every pair the design uses in all four modes. WCAG 2 is the rule and fails the check. APCA, the candidate method for WCAG 3, is printed beside it as a second look. It found night mode's secondary text at Lc 56 and its error red at Lc 47, under the Lc 60 APCA asks of text people read, though both passed WCAG at 6.6:1 or better (WCAG overstates contrast on dark grounds). Night's secondary text went from L 0.74 to 0.78 and its red from oklch(0.7 0.17 22) to oklch(0.78 0.13 22): Lc 63 and 61. Night's control borders stay at Lc 21 (WCAG 3.2:1): a line, not text.
- **Public.** The file ships in the brand kit as `colors/monte.tokens.json` and is listed in llms.txt, so another tool or an agent builds on the same values.
- **Not taken.** Display P3: clay already sits at 96% of the chroma sRGB allows, and the board draws its grains on a canvas in sRGB, so a P3 clay would make the curve and the grains under it two different oranges. `light-dark()`: Baseline widely available only since November 13, 2026, and the modes are generated blocks switched by a class, which needs no second mechanism.

## Brand kit (November 19, 2026; the full kit November 20, 2026)

The brand is written once, in `lib/brand.ts`: the idea, the name and how to write it, the colours, the type, the voice and ready-to-paste descriptions. Three things read it:

- **/brand/**, the public brand page: the logo for light and dark backgrounds to download, colour swatches with hex and OKLCH, the three faces, the voice with "instead of this, Monte says", and the descriptions with Copy buttons. Learned from brand pages like Stripe's and Linear's: a writer or a directory should never have to screenshot the logo.
- **`scripts/make-brand.tsx`** writes `public/brand/` (logo SVG and PNG, light and dark, the mark, an app icon) from the one drawing in `components/brand/logo.tsx`.
- **`tests/brand.test.ts`** keeps the colours in step with the token source, the descriptions within their limits, and the never-words out of the copy.

**The full kit (November 20, 2026).** /brand/ now hands over what a writer, a partner or a platform asks for in one download (`public/brand/kit.zip`) and one manifest (`public/brand/kit.json`: every file with its pixel size, bytes and sha256), in the folders every one of the maker's products uses: `logo/` (colour, reversed, black, white; SVG plus transparent PNG at 512, 1024 and 2048 wide), `mark/` (colour, black, white and the tile; SVG plus PNG at 64 to 1024), `app/` (the very icons the site serves, byte for byte, plus a 1024), `social/` (avatars, the link card, banners for X, LinkedIn, YouTube, GitHub, Instagram and stories, the wide ones in night too), `email/`, `colors/` (the tokens as JSON and CSS, and a table with RGB, OKLCH, a CMYK approximation and each pair's contrast) and a README. SVG is the vector master; there is no PDF.

- **Nothing is redrawn.** Every logo and mark file is `lockupSvg` or `markSvg` from `components/brand/logo.tsx` in the tokens' colours. The one-colour versions are pure black and pure white, because print and stamps need exactly that.
- **The banners are the board, not a picture of it.** `lib/board.ts` holds the home page board's geometry and physics; the hero runs it live and `scripts/lib/board-art.ts` stops the same seed mid-pour: 360 grains landed (mean 6.99, sd 1.72, the numbers the hero reads after its load pour) and the rest streaming through the pegs. Each banner is laid out for its platform's crop: X cuts 60 px top and bottom and puts the photo lower left, LinkedIn puts its logo lower left, YouTube shows only the centred 1546 × 423 on a phone, a story keeps its top 250 and bottom 340 clear. Short covers show the pile and the last row of pegs. Avatars are the app tile with the curve at 66% of its width, so a circle crop never cuts its tails.
- **The page draws its rules.** Clear space is drawn as a measured x on each side, the smallest sizes sit at real size (the logo 18 px, the icon 16 px), and five don'ts are drawn with the real lockup: stretched, recoloured, on a busy ground, outlined, in another face. Colour values copy when pressed. Each voice principle quotes a line the site really uses, with where it is, beside the line Monte would never write; `tests/brand.test.ts` fails if a quoted line leaves the code.
- **It keeps itself current.** One command (`npm run brand`) draws the app icons, the share cards, the brand files and the kit, and stamps kit.json with a fingerprint of everything they are drawn from (`scripts/lib/kit-source.ts`: the drawing code, the tokens, the brand's words, the cards' words and every game's and decision's mark). `prebuild` runs it with `--if-stale`, so a deploy never ships an icon or card older than its source. `tests/brand.test.ts` fails when the fingerprint, a hash, an app icon copy, a manifest icon or a share card disagrees with kit.json; CI also runs `npm run brand:check`, which redraws everything and compares bytes; and `.github/workflows/brand-live.yml` checks the live site against its own kit.json after every deploy and on Mondays.

- **/about/** and **/built/** (Nov 19 2026) credit the maker, Sami Kirberg, with a link to the code on GitHub; the site's metadata names him as author. About tells Monte's own story on the same court line as the stories on /story/ (one grain per step, the newest in clay), with dates taken from `CHANGELOG.md`. How it's built draws how a change reaches you (write, check, build, ship) as grains on one line, and ends on a credits list.

Share cards follow the brand on every page: `scripts/make-og.tsx` draws one card per part of the site (daily, learn, practice, solve, decide, brand), each the logo, a condensed headline, one line and a drawing in the brand's devices on a sand stage, and `sectionImage` in `lib/seo.ts` picks it by the page's path. Games keep their own cards.

## Graphic devices

1. **The grains**: dots that stack into a distribution. Hero board, topic glyphs, loading states.
2. **The line**: one continuous curve drawn over the grains, plus the court baseline it sits on. Never decorative swooshes.

Never: gradients, glows, glass, drop shadows that do not mean elevation.

## Mark

**A bell curve in clay, beside "monte"** (November 13, 2026). Monte means mountain (Monte Carlo is Mount Charles), and the bell is the mountain every pile of random grains settles into: the shape the home page board draws, and the answer a Monte Carlo simulation converges to. One shape, no ornament; clay because it is the number.

- **Lockup** (`Wordmark`): "monte" outlined from Bricolage Grotesque 96pt ExtraBold (opsz 96, wdth 100, wght 800), kerned, tracked -2%. The curve stands on the word's baseline (its flat tails are the ground the letters stand on), is as tall as the t plus 2% overshoot, and sits one stem from the m. Artwork, not live text, so it is identical everywhere. 18 px tall in the header and footer.
- **One source**: `scripts/make-logo.py` writes the geometry to `components/brand/logo-art.ts`; `components/brand/logo.tsx` turns it into `Mark`, `Wordmark`, `markSvg()` and `lockupSvg()`. The header, footer, tab icon, app icons, favicon, share cards and cheat sheets all build from it.
- **Icons** (tab icon `app/icon.svg`, favicon.ico, app icons): the mark reversed, the curve in paper on a clay tile, about 83% of the tile's width and a little below its middle. Written by `scripts/make-icons.tsx`. Changed November 19, 2026: the curve is wide and short, so in clay on a paper tile it filled under half the tile's height and all but vanished on a home screen beside other apps' icons; a clay square holds its own, and reads on light and dark tab bars alike.
- **The hero draws it**: once the board's curve appears, the line turns clay and the area under it fills with clay at 16%, so the settled pile is the logo's mountain made of grains.
- **Loader** (`components/brand/loader.tsx`): the curve rising from the ground like a pile and settling back, over its outline in the clay tint. Used by `app/loading.tsx` (page changes) and as the drill page's fallback before its script runs. With reduced motion it stands still on the full curve.
- **Clear space**: one x-height of the word on every side. Never outline the curve, add a dot or sun above it, or set the word in another face.

Replaced: three shell-game cups with the clay grain (November 12, 2026), and before that three rings seen from above (October 2026). Studied in Figma ("Monte · logo study", pages 4 to 7) and set aside: a grain in the n, a clay period, the m as two bells, a grain's path, a histogram under the curve, a bell character, and a grain field where a circle appears (kept as an idea for motion).

## Marks for games and decisions (November 19, 2026)

Each game and each decision has its own small drawing, made of the brand's two devices: grains and one line, clay for the number that matters, ink for the rest (`components/play/game-art.tsx`, `components/decide/tool-mark.tsx`). A drawing is a picture of the idea, never a decoration: two piles of futures for Choose, a seesaw for the warranty, a crowd with one sick person and five false alarms for the test result.

They move once, on purpose: when you point at, focus or press a card, and once when its page opens. The moves are CSS in `app/globals.css` (`.ga`): a line draws, dots pop in turn, a door swings, coins flip, bars grow, staggered by `--i`. Reduced motion keeps every drawing still. `scripts/make-brand.tsx` writes each one as an SVG to `public/brand/marks/` (shown on /brand/), and `scripts/make-og.tsx` puts each decision's drawing on its share card. `tests/brand.test.ts` checks every game and decision has both.

## Motion

- Durations and the easing are tokens (`motion` in `tokens/monte.tokens.json`, as `--duration-*` and `ease-settle`): press 90 ms (a button sinking onto its edge), tap 120 ms, ui 150 ms (colour fades), enter 240 ms, move 400 ms (a view transition), ease `cubic-bezier(.2,.8,.2,1)` ("settle")
- Grains fall with gravity and settle; the line draws once
- Hero board `HeroBoard` (SVG board plus one canvas for the grains): a 360-grain pour in under 5 s on load, then tap to drop, hold to pour, Drop 100 and Clear; the curve scales with the grains landed. The board holds 2,000 grains: Drop 100 drops only the room left, and a full board says "Board full, clear to pour again." instead of clearing itself
- Press feedback: buttons and pill links scale to 0.97 while pressed, `--duration-tap` (120 ms) ease-out (`app/globals.css`); no tap highlight, no double-tap zoom delay, no long-press text selection on buttons, and sheets and dialogs keep their scroll to themselves
- **View transitions (November 22, 2026).** A mark that is on both pages travels between them: a game's drawing from its card on Play or the home page into the game's header, a decision's from the list into its page, 400 ms on settle. Play's cards are plain links, so that is a cross-document view transition (`@view-transition`, and the same `view-transition-name` on both drawings); the decisions are in-app links, so React's `<ViewTransition>` pairs them. `lib/view-transition-script.ts`, inline in the head, names only the card being opened (or the one you come back to), so the other drawings stay on the page that leaves; and since every page is streamed behind `app/loading.tsx` and React shows it one frame after the HTML is parsed, it shows the page at once when a transition is about to picture it, or the picture would be the loader. Other full page loads crossfade in 240 ms. It explains where you went, so it is the one place it is used: no slides, no scroll-driven animation. Learned from the Next.js view transitions guide (a shared element says "same thing, going deeper"). Browsers without view transitions change the page as before.
- Forced colours (Windows contrast themes): buttons and answers get a real outline, since the edge they stand on is a shadow the mode removes.
- Everything respects prefers-reduced-motion (the film shows its final frame still, and view transitions are off)

## Modes

One site, two behaviors (`lib/mode.ts`, stored per browser, Fun by default). The switch is a compact icon button in the header on wide screens (sparkles for Fun, a target for Focus; its label says what a press does), two labelled choices in the phone More sheet, and an item in ⌘K. It is not a segmented control in prime header space.

- **Fun**: Play appears in the menus and on the landing page; right answers in drills get a grain burst and a line call ("Ace.", "Point."); a won match gets "Game, set, match."; a lesson finished with every answer right drops its grains in place beside the score; the hero board pours on load.
- **Focus**: Play is hidden from menus, no celebrations, the hero board shows the finished pile. The page is only the work.
- Never in either mode: a joke or flourish on a wrong answer. Reduced motion turns every flourish off.

## The Shuffle (November 20, 2026)

Three-card monte with a statistics question, one round a day, the same for everyone: the brand's story played rather than told. The mark follows a problem's story; the Shuffle asks you to follow its idea.

- **The deal.** The question is the headline. Three cups stand lifted over three answers on the table: one is right (the grain), the other two are the answers the story leads people to. Shuffle brings the cups down over them and throws.
- **Computed, never typed.** Ten kinds of round (`lib/play/shuffle.ts`), each from code that already teaches it: the juice line, coffee, serve, elevator and confidence cases in `lib/study/start.ts`, and the tree, trials, events and birthday solvers in `lib/study/solvers.ts`. The traps are the classic slips the drills already name: σ for one value used for an average, the other tail, the question turned around (P(positive | sick) for P(sick | positive)), chances added, the chance of none, the crate's n divided in, z where t belongs, one skewed value treated as normal, two doors read as even, even money read as an even game. Learned from Connections, whose red herrings are designed into the board.
- **The throw.** Each swap moves both cups at once; one passes in front (lower and 6% larger) and the other behind (higher and 6% smaller), so the eye can tell which went where. The throw speeds up like a dealer's hands, 0.56 s a swap down to 0.36 s. Five swaps on Monday, up to nine on Saturday, like the week of a newspaper crossword. Learned from a canvas shell game (vinish.dev's Tricky Cups: ease-in-out, a sine dip for the front cup, the cups drawn in order of depth) and PlayMemorize's Cups (a fair, seeded throw that a save code replays). The cups are SVG moved by Motion, which the site already ships.
- **The lift.** A cup lifts on a spring with a small tilt, and its shadow shrinks: the one shadow on the site, because it means height. A wrong cup answers at once with what its number did ("Not quite. That uses σ, the spread of one bottle."), and you lift again; after two misses the last cup lifts itself. Learned from Brilliant, whose wrong answers explain themselves in place and can be tried again.
- **The reveal.** All three cups lift, each with a three-word tag (the grain, one bottle, other tail). The coach's line ("Found the grain, first lift." or "Not quite. Here is the work.") beside the lifts as rings and a clay grain, then the work drawn as a picture with the grain's answer on it, the idea in one sentence, and Every step (the work line by line, last line in clay, and what each wrong cup was) one tap below; then a link to its topic or game (Nov 20 2026, "Show, don't tell").
- **Once a day.** Scored once, saved under `monte-shuffle` in the daily chart's shape (`DayStore` in `lib/play/daily.ts`), so the backup code and its merge carry it. A return visit opens on the result. The number is the daily chart's, so a day's chart and Shuffle share it. Days in a row and "Next shuffle in 5h 12m" sit under the result, as under the chart. Another round deals an unscored practice round.
- **Share.** "Monte Shuffle 2", a circle per lift with the grain last (⚪⚪🟠), "Found the grain on the third lift", the run of days and the link: no answer, no question. The share sheet on a phone, the clipboard elsewhere. Learned from Wordle's grid, which a player invented as a spoiler-free way to share, and Strands' circles.
- **Reduced motion.** The cups come down and swap instantly, one swap a beat, with the two that traded places outlined; the lift and the reveal still work. A screen reader hears the swaps listed after the throw.
- **Where it lives.** The home page's Find the grain section, its own page `/shuffle/` (the link Share sends, with its own share card), first on /play/ under Every day with the daily chart, and the footer.

## Play

Ten games (`app/play/`, listed in `GAMES` in `lib/site-data.ts`), each with the game, a "What's going on" block with the real formula, a link to its topic and the next game. Every number on these pages is computed live or verified: Monty Hall rates come from simulation, the coin verdict from 20,000 simulated sequences (about 3% false alarms on real coins), the tennis model matches Monte Carlo and the classic hold(0.6) = 0.736.
