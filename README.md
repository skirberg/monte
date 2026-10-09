# Monte

Business statistics, one idea at a time. Thirteen topics with labs, timed drills with fresh numbers, solvers that show the work, and nine games that each hide a real statistics idea.

## Pages

| Route | What it is |
|---|---|
| `/` | Landing page with the Remotion hero film (`remotion/galton-pile.tsx`) |
| `/study/` | The study app: Learn, Practice, Solve, Tools, Sources (hash routes such as `#learn/topics/normal`) |
| `/play/` | Nine games: correlation, Monty Hall, fake a coin, tennis serve math, house edge, betting odds, A/B peeking, 98 years of market returns, option pricing |
| `/built/` | How it's built: stack, fonts, data sources and the math behind each game |

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
npm run smoke    # serves out/ and checks it in headless Chrome
```

`npm run smoke` loads every route at desktop and phone sizes and fails on page errors, sideways scrolling, display type tracked tight enough for glyphs to collide, a hero film that does not start without a click, a closing mark that does not finish, reduced-motion behavior, study analytics, and share links that point at another host. Run it after `npm run build` and before every deploy. It needs Google Chrome (set `CHROME_PATH` to use another Chromium).

## How it is built

- Next.js static export (`output: "export"`), Tailwind CSS 4, shadcn/ui on Base UI, Motion, Remotion Player.
- The study engine in `lib/engine/` is carried from the original Sigma Sandbox study app Monte grew out of: math, question generators, labs and solvers. It mounts once on `/study/` (`components/study/engine-mount.tsx`) and is skinned by `app/study/engine-skin.css`.
- Fun or Focus mode (`lib/mode.ts`): Fun shows Play and celebrates right answers; Focus hides both and stills the hero film.
- Brand rules (concept, voice, type, color, motion) live in `DESIGN.md`.
- App icons come from `scripts/make-icons.tsx` and the share card from `scripts/make-og.tsx` (`npx tsx scripts/<name>.tsx`); the favicon is `app/icon.svg`.
- Browser storage keys keep the original `sigma` prefix so renaming the site never wiped anyone's progress.

## Deploy

Import this repository on Vercel; it detects Next.js and needs no settings. The public URL lives in one place, `lib/seo.ts` (used for canonical links, social cards, robots and the sitemap). Change it there if the site moves to its own domain.

Progress is saved in each visitor's browser only. There is no account and no server. Page visits are counted with Vercel Web Analytics (cookie-free); turn it on in the Vercel project under Analytics. The study app routes with `#` hashes, so `components/study/route-analytics.tsx` reports each section as its own page (`/study/practice/drill/`) and sends custom events (Vercel Pro): Drill started and Drill finished (mode, score band), Solver used, Quick math started, Formula sheet printed, Game played (`components/play/game-played.tsx`) and Mode switched. Only route words and the engine's own button ids are sent, never anything a visitor types.
