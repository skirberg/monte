# Monte: notes for coding agents

Monte (https://monte.markets) is a free statistics learning site: lessons, drills, solvers, decision calculators, games and a daily chart. It is a static Next.js 16 export with no server at runtime; a visitor's progress lives in their browser. `mcp/` is a separate remote MCP server (its own Vercel project) that imports code from `lib/`.

Updated November 22, 2026.

## Read first

- `DESIGN.md`: the source of truth for the look, the voice, copy, layout, type, colour and shape. Read it before any visual or copy change, and record a design decision there, dated, in the same change.
- `README.md`: routes, how it is built, analytics events, backlog. `CHANGELOG.md`: what shipped, by date.
- `lib/brand.ts`: the brand's words, colours and voice (the public `/brand/` page reads it).
- `mcp/README.md` before touching the MCP server.

## Where things live

| Folder | What is in it |
|---|---|
| `app/` | Routes (App Router). Each page is a static file in `out/` after the build |
| `components/` | React components by area (`study/`, `play/`, `decide/`, `landing/`, `brand/`), shadcn primitives in `ui/` |
| `lib/` | Pure logic and data: `study/` (content, math, drills, solvers, progress), `decide/`, `play/` (games, the daily chart), `brand.ts`, `seo.ts` |
| `scripts/` | Data fetchers, image and file generators, and the QA, smoke and scale checks |
| `tests/` | Vitest unit tests |
| `mcp/` | The MCP server, its own package with its own `node_modules` |
| `public/` | Static files, many of them generated (table below) |

## Commands

The scripts are in `package.json`. The ones that gate a change:

```bash
npm test                 # vitest
npm run typecheck        # tsc for the site and the MCP server (cd mcp && npm install first)
npm run lint             # eslint
npm run tokens:check     # app/tokens.css and lib/tokens.ts match tokens/monte.tokens.json
npm run scale-check      # type sizes, corners and page widths come from the scale
npm run brand:check      # every icon, share card and brand kit file matches what its source draws
npm run build            # static site in out/ (prebuild fetches data and writes generated files)
npm run check            # all of the above, then contrast, qa and smoke on the built site
cd mcp && npm test       # the MCP server: builds it and calls every tool
```

`qa`, `smoke` and `shots` drive Chromium against `out/`; set `CHROME_PATH` if Chrome is not in its usual place. CI (`.github/workflows/ci.yml`) runs all of the above but `qa` on every pull request and push to main. CodeQL, dependency review and OpenSSF Scorecard (`codeql.yml`, `dependency-review.yml`, `scorecard.yml`) run once the repository is public.

## Conventions the code does not show

**TypeScript everywhere.** The package is ESM (`"type": "module"`). Scripts are `.ts` or `.tsx` and run with `tsx` (`npx tsx scripts/<name>.ts`); the MCP server's scripts run on Node's own TypeScript support (`node build.ts`). Unused locals and parameters are type errors, so delete dead code rather than leaving it. The two Python scripts (`make-audio.py`, `make-logo.py`) stay Python because the speech model and the font shaping they use have no TypeScript equivalent; their outputs are committed.

**Copy.** Write in Monte's voice (`DESIGN.md`, "Voice"): plain words, one idea per sentence. Join clauses with a period, colon or comma; keep en dashes for ranges, scores and an empty value, and leave em dashes out. Describe Monte by what it does, with no mention of AI in copy, metadata or alt text. Write for everyone: "mock test", never exam, class or school framing. `tests/brand.test.ts` fails if a word from `VOICE.never` in `lib/brand.ts` appears in the copy.

**Look.** Clay means the number, ink means the action: buttons are ink, data and right answers are clay. Colours, corners and durations are set only in `tokens/monte.tokens.json` (W3C Design Tokens format): edit it, run `npm run tokens`, and commit the JSON with `app/tokens.css` and `lib/tokens.ts`; code that needs a hex imports `COLOR` from `@/lib/tokens`. A colour token change also needs `npm run brand`. Reading text takes `max-w-measure` (or `max-w-measure-short`), never a hand-set `ch` width. Sizes, corners (`rounded-inner`, `rounded-card`, `rounded-stage`) and page widths come from the scale in `app/globals.css`; `npm run scale-check` fails on a hand-set value. Buttons use `.btn`, answer choices `.choice`. Import `cn` from `@/lib/cn` (it knows the site's own type sizes); `tests/cn.test.ts` enforces it.

**Progress.** Add every new localStorage key to `KEYS` in `lib/progress.ts` so the backup code carries it. Study keys keep the old `sigma` prefix so nobody's progress resets.

**Generated files.** Change the generator, then rerun it:

| Output | Generator |
|---|---|
| `app/tokens.css`, `lib/tokens.ts` | `scripts/make-tokens.ts` from `tokens/monte.tokens.json` (`npm run tokens`) |
| `public/llms.txt`, `public/llms-full.txt`, `public/api/v1/` | `scripts/make-api.ts` |
| The Markdown twins: `public/index.md` and the `.md` files under `public/learn/`, `public/solve/`, `public/decide/`, `public/play/` | `scripts/make-api.ts` (built in `scripts/lib/markdown.ts`) |
| `public/og/`, `public/og.png` | `scripts/make-og.tsx` (`npm run brand` runs it) |
| `public/brand/`, including the kit (`kit.zip`, `kit.json`) | `scripts/make-brand.tsx` (`npm run brand`; it also runs the icon and share card scripts, and `prebuild` runs it when the source changed) |
| `public/cheatsheets/` | `scripts/make-cheatsheets.tsx` |
| app icons, `public/favicon.ico`, `app/icon.svg` | `scripts/make-icons.tsx` (`npm run brand` runs it) |
| `lib/play/data/drawit.json` | `scripts/fetch-drawit.ts` (also run daily by `.github/workflows/refresh-data.yml`) |

`lib/play/data/markets.json` is a saved snapshot of the 2026 midterms and no longer changes.

**Markdown twins.** Each topic, lesson, solver, decision and game (plus the home page, the formula sheet and the glossary) has a plain Markdown copy at its path without the trailing slash, plus `.md`, linked from the page by `pageAlternates` in `lib/seo.ts`. After adding or changing one, run `npm run api` and commit the `.md` files; `tests/markdown.test.ts` fails on a page in the sitemap with no twin. A game's "What's going on" text lives in `lib/play/explain.tsx` and a decision's "How this works" steps in `lib/decide/how.tsx`, so the page and its twin share them: edit them there.

**Data.** Every number a page shows is real or computed by code in `lib/`. `scripts/fetch-drawit.ts` reads only the tickers it lists: add a series there on purpose, with its round in `lib/play/drawit.ts`. A source's "Checked" date on the Sources page means a person read that page: change it only after reading it. The weekly link check (`.github/workflows/check-sources.yml`, `npm run check-sources`) only reports broken links.

**The daily chart.** Each day's chart depends only on the date (`lib/play/daily.ts`). Changing `DAILY_START`, the order of `ROUNDS`, a round's `SHAPE` or `lag` changes past and present days' charts for everyone: treat them as fixed.

**The Shuffle.** Each day's round depends only on the date (`lib/play/shuffle.ts`), and its number is the daily chart's. Changing the order of `FAMILIES`, a family's draws, `SALT` or the cases in `lib/study/start.ts` it deals from changes past and present rounds for everyone: treat them as fixed, and add a new family at the end. Every answer comes from code in `lib/study/` (the start cases and the solvers); never type a number into a round. `tests/shuffle.test.ts` checks two years of rounds, and `tests/brand.test.ts` holds their copy to the voice.

**Security headers.** `vercel.json` sets a strict Content Security Policy. A new outside script, font, image, audio or fetch origin needs adding there, or the browser blocks it on the live site (the local QA server does not send the header).

**Analytics.** Events use fixed names and fixed values (see README, "Deploy"); nothing a visitor types is ever sent.

## Boundaries

- **Always:** run the gating commands above; keep each change to its task; update `DESIGN.md`, `README.md` and `CHANGELOG.md` in the same change when what they describe changes.
- **Ask first:** a new dependency, a new localStorage key, anything that changes the daily chart's inputs, a new data source, a new analytics event.
- **Never:** commit secrets or `.env` files; send what a visitor types anywhere; add a paid service.

## Done means

- Tests, `typecheck`, `lint`, `tokens:check`, `scale-check` and `brand:check` pass, and `npm run build` succeeds. A change to the logo, a colour token, the board, a share card's words or a game's mark needs `npm run brand` and its output committed.
- A visual change has been looked at in the built site at a phone width (390) and a desktop width (1440), and `npm run qa` is clear.
- `DESIGN.md`, `README.md` and `CHANGELOG.md` say what changed, in the same change.
