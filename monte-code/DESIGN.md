# Monte: design source of truth

A study site for business statistics students, with games. It began as a class study app called Sigma Sandbox; its engine still powers /study.

## Concept

**Statistics is a sandbox: drop enough grains and the shape appears.**

Proof: every data point is a grain of sand. Pour enough of them through chance and they pile into a bell curve (a Galton board, the Central Limit Theorem). The tennis thread comes from the study engine: thirteen topics are thirteen matches in "the draw", won by scoring 80% on a fresh timed drill. Sand plus tennis means clay, the court surface made of crushed brick.

## Name

**Monte.** Short, one word, and it names what the site does three ways at once: Monte Carlo simulation (the long-run and options games, and every check behind the math), the Monty Hall doors game, and three-card monte, the street game that is all about odds. Chosen October 2, 2026 from a shortlist of Monte, Probably, Probs, Fluke and Oddly. Quick web check found no statistics or study product called Monte; no trademark search has been run.

## Voice

Register: a coach at practice. Short, plain, direct, a little dry.

- Uses: one idea, drag, drill, fresh numbers, win
- Never uses: unlock, supercharge, journey, seamless, AI-powered
- Jokes: one dry line per page at most, never in feedback on a wrong answer

Three lines in the voice:
- Hero: "Learn business statistics one idea at a time."
- Error: "Not quite. Here is the work."
- Confirmation: "Match won. 8 of 10, under the clock."

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

1. **The grains**: dots that stack into a distribution. Hero film, topic glyphs, loading states.
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
- Remotion composition `GaltonPile` (hero, 8 s loop, 30 fps)
- Everything respects prefers-reduced-motion (the film shows its final frame still)

## Modes

One site, two behaviors, chosen in the header (`lib/mode.ts`, stored per browser, Fun by default).

- **Fun**: Play appears in the menus and on the landing page; right answers in drills get a grain burst and a line call ("Ace.", "Point."); a won match gets "Game, set, match."; the hero film plays.
- **Focus**: Play is hidden from menus, no celebrations, the hero film rests on its last frame. The page is only the work.
- Never in either mode: a joke or flourish on a wrong answer. Reduced motion turns every flourish off.

## Play

Four games (`app/play/`), each with the game, a "What's going on" block with the real formula, a link to its topic and the next game. Every number on these pages is computed live or verified: Monty Hall rates come from simulation, the coin verdict from 20,000 simulated sequences (about 3% false alarms on real coins), the tennis model matches Monte Carlo and the classic hold(0.6) = 0.736.
