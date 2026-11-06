# Monte: design source of truth

Statistics for everyone, one idea at a time: learn it, practice it, solve with it, decide with it, play with it. Monte is not for one class or one course. It began as a class study app called Sigma Sandbox; /study is that app, rebuilt as typed React pages. Public copy never frames the site around an exam, a class or a school: say "mock test", not "final" or "closed-book exam".

## Concept

**Statistics is a sandbox: drop enough grains and the shape appears.**

Proof: every data point is a grain of sand, and one grain tells you little; the pattern shows up in many. A Galton board is the honest version of the picture: each grain's landing spot is the sum of many left-or-right bounces, and sums like that pile into a bell shape. More data does not make every dataset bell-shaped (incomes and wait times stay skewed however many you collect); what the Central Limit Theorem says is that averages of many independent draws come out close to normal. The board is about sums and averages, and the brand should never say more than that. The tennis thread comes from the study app: fourteen topics are fourteen matches in "the draw", won by scoring 80% on a fresh timed drill. Sand plus tennis means clay, the court surface made of crushed brick.

The site's public pages (home, menus, footer) say **topics** and **mastered**, not matches and won: a newcomer should not need the tennis to follow along. Clay, the court baseline and the grains stay as the look.

## Name

**Monte.** Short, one word, and it names what the site does three ways at once: Monte Carlo simulation (the long-run and options games, and every check behind the math), the Monty Hall doors game, and three-card monte, the street con where the game is rigged (the cups in the mark come from its cousin, the shell game). The lesson in it is a statistics lesson too: when the game is rigged, better math doesn't win; the right call is not to play. Chosen October 2, 2026 from a shortlist of Monte, Probably, Probs, Fluke and Oddly. Quick web check found no statistics or study product called Monte; no trademark search has been run.

## Voice

Register: a coach at practice. Short, plain, direct, a little dry.

- Uses: one idea, drag, drill, fresh numbers, win
- Never uses: unlock, supercharge, journey, seamless, AI-powered
- Jokes: one dry line per page at most, never in feedback on a wrong answer

Three lines in the voice:
- Hero: "Drop enough grains. The shape appears." No tagline under it.
- Error: "Not quite. Here is the work."
- Confirmation (study app drills, which keep the tennis): "Match won. 8 of 10, under the clock." On public pages the same moment reads "Mastered."

## Copy rules

- Plain English. One idea per sentence. Say how long and where a button goes ("Start the first idea, 5 min").
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
| ⌘K menu | Groups named Learn, Practice, Solve, Decide, Play, then Go to (Today, the five, How it's built, mode and theme). |

**Tools** (the Excel, R, Python, Power Query and SQL guides) and **Sources** live under Learn: they keep their URLs (`/study/tools/…`, `/study/sources/`), and the header and phone bar mark Learn as current on them. Home page section kickers follow the same words (Learn, Solve, Decide, Play).

## Type (Google Fonts, SIL Open Font License, free for web, app and print)

| Role | Face | Why |
|---|---|---|
| Speaks (headlines) | Bricolage Grotesque, optical size + width axes | Has a point of view; condensed at display size, calm at small size |
| Reads (body) | Geologica | Covers Greek, so σ μ x̄ p̂ render in the same face as the sentence |
| Measures (numbers, timers, scores) | Azeret Mono, tabular | Plain zero (0 never reads as 8), scoreboard feel; Greek falls back to Geologica |

### Type scale (November 2026)

One scale, defined once in `app/globals.css` (`@theme`), and nothing else. `npm run type-check` (part of `npm run check`) fails on any raw size, weight, letter-spacing, line height or caps label. Modeled on IBM Carbon (a fixed set for reading and UI plus a fluid set for headings, three weights, no raw sizes in components) and Material 3 (named roles, no near-duplicate sizes).

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
- **Every page** uses the same page column, gutter and rhythm: home, study, Decide and its tools, Play and each game, the story, How it's built, the header, footer, error and 404 pages. `npm run type-check` fails on a hand-set page width, page margin or section spacing.
- **Inside components** (the cups, the test result tool, the solver panels) spacing still uses the Tailwind scale; their insides have not been put on the 12 columns.

### Home wireframe

```
DESKTOP (12 columns)                              PHONE (4 columns)
+------------------------+------------------------+   +------------------+
| Drop enough grains.    |  grain board           |   | Drop enough      |
| The shape appears.     |  (col 7-12)            |   | grains. The      |
| (col 1-6, centred)     |                        |   | shape appears.   |
| [Start the first idea] or try 5 questions       |   | [Start ...]      |
+------------------------+------------------------+   +------------------+
  section: Find the grain (cups)                      | grain board      |
  section: Fourteen topics (wide screens only)        +------------------+
  sand section: Is this test result real?             Find the grain
  section: The biggest poll ever taken ...  (col 1-8) Is this test ...
           Read 14 true stories  (col 9-12)           The biggest poll
  section: Games (wide, Fun mode only)
```

The hero headline is one sentence beside the board. Section headings are one size (text-headline), plain nouns or a real question, never a two-beat slogan. No closing band: the header carries the start button.

## Buttons (November 2026)

Two buttons, one size step, defined once in `app/globals.css` and nowhere else; `npm run type-check` fails on a pill built by hand.

| Class | Use |
|---|---|
| `btn btn-primary` | the one action that matters on a screen: ink pill, paper text |
| `btn btn-secondary` | every other button: paper pill, line-strong border |
| `btn-sm` | add for actions inside a tool or game (44px tall instead of 48px) |

Learned from Brilliant (brilliant.org, checked Nov 6 2026): in a learning app the buttons are tactile. Each pill stands on a 3px edge of its own darker color (`--ink-lip`, `--line-strong`); pressing pushes it down onto the edge, so a tap feels like setting down a grain. The main button stays ink, never clay: clay means the number. Disabled buttons lose the edge and drop to half opacity. Text links (`or try 5 questions`) stay links, not buttons.

## Lessons and feel (November 2026)

Learned from Brilliant (study: Studio, Monte, 6 Design, "Brilliant Study (Nov 6)").

- **Guess first.** Every topic opens with one question before the lesson explains anything (`lib/study/guess.ts`, `GuessFirst`). Each question is built on the topic's trap, and every choice answers back, so a wrong guess teaches too.
- **Answer the wrong answer.** Drill questions carry their usual mistakes (`traps` in `lib/study/drill.ts`): dividing by n instead of n − 1, both tails instead of one, the overlap counted twice, the variance for the SD. A miss that matches one says what it means, above the right answer.
- **The path.** Learn shows the fourteen topics as stops on a line: mastered stops filled in clay, the next one lit in ink with its idea and a Start button.
- **Placement.** A new visitor can answer four of the guess questions, easiest to hardest. The first miss is where they start; the first-ten-minutes steps and the path follow it.
- **Feel.** A right answer clicks (two short rising tones, a 12 ms tap on phones); a wrong one is a soft low knock (a double tap). Tones are made in the browser, no audio files (`lib/feel.ts`). Fun mode only, never in Focus, never with reduced motion.

## Color (OKLCH, light "day court" / dark "night session")

| Token | Light | Dark | Use |
|---|---|---|---|
| paper | oklch(0.975 0.008 75) | oklch(0.17 0.01 50) | page |
| sand | oklch(0.945 0.016 75) | oklch(0.215 0.012 50) | subtle surfaces |
| ink | oklch(0.2 0.012 50) | oklch(0.95 0.01 75) | text, primary buttons |
| ink-muted | oklch(0.47 0.016 55) | oklch(0.74 0.015 70) | secondary text |
| clay | oklch(0.6 0.165 45) | oklch(0.72 0.15 48) | the data: curves, bars, answers, won |
| clay-ink | oklch(0.5 0.15 42) | oklch(0.78 0.13 50) | clay used as small text |

Rule: **clay means the number, ink means the action.** Buttons are ink. Clay marks data, highlighted answers and the won state. Nearest brand colors: Roland-Garros clay orange (intentional homage, different category) and HubSpot orange (#FF7A59, lighter and pinker). No statistics or edtech leader owns clay (Khan and Duolingo are green, Coursera blue).

## Graphic devices

1. **The grains**: dots that stack into a distribution. Hero board, topic glyphs, loading states.
2. **The line**: one continuous curve drawn over the grains, plus the court baseline it sits on. Never decorative swooshes.

Never: gradients, glows, glass, drop shadows that do not mean elevation.

## Mark

Three cups of the shell game seen from above, with one clay grain (the ball, the data point) under the third. Monte Carlo, Monty Hall's three doors and three-card monte in one picture, built from the system's parts: ink rings and a clay grain. Picked October 2, 2026, after trying dice. In-page mark and wordmark: `components/brand/logo.tsx` (`CUPS` and `CUP_R` are shared with the animated build).

App icon and favicon: the cups in paper on a clay tile with an ink grain (`app/icon.svg`; PNGs from `scripts/make-icons.tsx`; share cards from `scripts/make-og.tsx`, set in the hero's condensed Bricolage with the one line in Geologica and no label above the title).

Tried and set aside: a lowercase m drawn as two cups; a die showing three climbing to a clay pip; a die's five pips joined into an M, with and without an outline; outlined dice hinting at an M (center pip dropped, faint etched M, outline dipping like M shoulders); a roulette wheel (reads as a gear).


## Motion

- 150 ms UI feedback, 240 ms enter, ease `cubic-bezier(.2,.8,.2,1)` ("settle")
- Grains fall with gravity and settle; the line draws once
- Hero board `HeroBoard` (SVG board plus one canvas for the grains): a 360-grain pour in under 5 s on load, then tap to drop, hold to pour, Drop 100 and Clear; the curve scales with the grains landed. The board holds 2,000 grains: Drop 100 drops only the room left, and a full board says "Board full, clear to pour again." instead of clearing itself
- Press feedback: buttons and pill links scale to 0.97 while pressed, 120 ms ease-out (`app/globals.css`); no tap highlight, no double-tap zoom delay, no long-press text selection on buttons, and sheets and dialogs keep their scroll to themselves
- Everything respects prefers-reduced-motion (the film shows its final frame still)

## Modes

One site, two behaviors (`lib/mode.ts`, stored per browser, Fun by default). The switch is a compact icon button in the header on wide screens (sparkles for Fun, a target for Focus; its label says what a press does), two labelled choices in the phone More sheet, and an item in ⌘K. It is not a segmented control in prime header space.

- **Fun**: Play appears in the menus and on the landing page; right answers in drills get a grain burst and a line call ("Ace.", "Point."); a won match gets "Game, set, match."; the hero board pours on load.
- **Focus**: Play is hidden from menus, no celebrations, the hero board shows the finished pile. The page is only the work.
- Never in either mode: a joke or flourish on a wrong answer. Reduced motion turns every flourish off.

## Play

Ten games (`app/play/`, listed in `GAMES` in `lib/site-data.ts`), each with the game, a "What's going on" block with the real formula, a link to its topic and the next game. Every number on these pages is computed live or verified: Monty Hall rates come from simulation, the coin verdict from 20,000 simulated sequences (about 3% false alarms on real coins), the tennis model matches Monte Carlo and the classic hold(0.6) = 0.736.
