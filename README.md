# Monte

Business statistics, one idea at a time. Fourteen topics with labs, timed drills with fresh numbers, solvers that show the work, and ten games that each hide a real statistics idea.

## Pages

| Route | What it is |
|---|---|
| `/` | Landing page with the interactive hero board (`components/landing/hero-board.tsx`): tap to drop grains, hold to pour |
| `/study/` | Study home (Today): what is due, topics won, every way in |
| `/study/learn/`, `/study/learn/topics/<id>/` | The fourteen topics, each a page with its lesson, labs, quiz, formulas and videos |
| `/study/learn/formulas/`, `/study/learn/terms/`, `/study/learn/frameworks/` | Formula sheet (prints), glossary, "which formula?" chooser |
| `/study/practice/drill/`, `/study/practice/math/`, `/study/practice/cards/` | Timed drills, mock exam, Due today and Monte Daily (`?go=start\|mock\|due\|daily`, `?topic=<id>`); quick math; flashcards |
| `/study/solve/<id>/` | Eleven solvers that show the work |
| `/study/tools/<id>/`, `/study/sources/` | Excel, R, Python, Power Query and SQL guides; free sources |
| `/play/` | Nine games: correlation, Monty Hall, fake a coin, tennis serve math, house edge, betting odds, A/B peeking, 98 years of market returns, option pricing |
| `/built/` | How it's built: stack, fonts, data sources and the math behind each game |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
npm run check      # build, then contrast, qa and smoke: run before every deploy
npm run contrast   # WCAG contrast for every color pair, light and dark (app/globals.css)
npm run qa         # every route at 375, 768, 1024, 1440 px, light and dark: axe, sideways scroll, tap targets
npm run smoke      # behavior: hero board, closing mark, reduced motion, analytics, share links, favicon
npm run shots      # full-page screenshots of every route into screenshots/review/ for design review
npx tsx scripts/make-og.tsx   # share cards: public/og.png and one per game in public/og/
```

`npm run smoke` loads every route at desktop and phone sizes and fails on page errors, sideways scrolling, display type tracked tight enough for glyphs to collide, a hero board that does not pour without a click, a closing mark that does not finish, reduced-motion behavior, study analytics, and share links that point at another host. Run it after `npm run build` and before every deploy. It needs Google Chrome (set `CHROME_PATH` to use another Chromium).

## How it is built

- Next.js static export (`output: "export"`), Tailwind CSS 4, shadcn/ui on Base UI, Motion. The hero board is SVG plus one canvas, no video engine.
- The study app is typed React on real routes. Content lives in `lib/study/data.json` (typed by `lib/study/data.ts`); math, drill generators, quick-math tricks and solvers are pure modules in `lib/study/`; pages are in `app/study/`, components in `components/study/` (labs share one chart primitive, `chart.tsx`). Routes are mapped in `lib/study/routes.ts`; the old `/study/#hash` links redirect there (`components/study/old-hash-redirect.tsx`).
- Fun or Focus mode (`lib/mode.ts`): Fun shows Play and celebrates right answers; Focus hides both and shows the hero pile finished.
- Brand rules (concept, voice, type, color, motion) live in `DESIGN.md`.
- App icons come from `scripts/make-icons.tsx` and the share card from `scripts/make-og.tsx` (`npx tsx scripts/<name>.tsx`); the favicon is `app/icon.svg`.
- Browser storage keys keep the original `sigma` prefix so renaming the site never wiped anyone's progress.

## Deploy

Import this repository on Vercel; it detects Next.js and needs no settings. The public URL lives in one place, `lib/seo.ts` (used for canonical links, social cards, robots and the sitemap). Change it there if the site moves to its own domain.

Progress is saved in each visitor's browser only. There is no account and no server. Page visits are counted with Vercel Web Analytics (cookie-free); turn it on in the Vercel project under Analytics. Every study view is its own page, so page views need no extra code. Custom events (Vercel Pro), sent from the components that cause them: Drill started and Drill finished (mode, score band), Solver used, Quick math started, Formula sheet printed, Game played (`components/play/game-played.tsx`) and Mode switched. Only fixed names are sent, never anything a visitor types.

## Backlog

Ideas agreed with the owner and parked for later, newest first. Free tools only unless the owner says otherwise.

- **Sign-in and sync across devices.** Supabase (free plan) through the Vercel Marketplace on the personal team, so the Tickerz Supabase account is never used. Waiting on one click: accepting Supabase's terms in Vercel (Storage, Create Database, Supabase). After that: magic-link and Google sign-in, a `progress` table with row-level security, and sync of the `monte-progress`, `sigma` and `monteElectionCalls` stores (the backup code in the progress panel already uses that shape).
- **A private "My course" space** once sign-in exists: your own notes, flashcards and topic list, never public.
- **Narrated audio per topic.** Generate MP3s for free with an open-source voice (Kokoro or Piper) in a GitHub Action, store them in the repo or Vercel Blob, and play them in place of the browser voice.
- **Monte as a tool inside AI assistants.** A small MCP server (a separate Vercel project) exposing the verified calculators and the open data in `public/api/v1`, so a chat can call Monte and link back to the interactive page.
- **Forecasting leagues.** Weekly questions on real events (elections, the Fed, sports, earnings), Brier-scored, with class and company leagues. Needs sign-in.
- **Seasonal modules.** The big game, March Madness brackets, earnings season, election night, each with a simulator and a plain-English lesson.
- **Paste your own data.** Drop in a spreadsheet column or CSV and get the summary, the right chart, outliers and a plain-English readout, with the formulas shown.
- **Installable app.** Offline support (service worker) so it works like an app from the home screen; a store app later if it earns it.
- **Unit tests** for the statistics math (vitest) as part of `npm run check`.
