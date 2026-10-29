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
- Hero: "Drop enough grains. The shape appears." Under it: "Statistics, one idea at a time."
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

App icon and favicon: the cups in paper on a clay tile with an ink grain (`app/icon.svg`; PNGs from `scripts/make-icons.tsx`; share card from `scripts/make-og.tsx`).

Tried and set aside: a lowercase m drawn as two cups; a die showing three climbing to a clay pip; a die's five pips joined into an M, with and without an outline; outlined dice hinting at an M (center pip dropped, faint etched M, outline dipping like M shoulders); a roulette wheel (reads as a gear).

The closing animation on the home page draws the three cups in turn, drops the grain under the middle cup and slides it under the last: a shell game in about two seconds.

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
