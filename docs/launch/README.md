# Launch kit

Every free place to list Monte, the text to paste, and what only the owner can click. Checked November 19, 2026.

The order matters: the listings that need nothing but the merge come first, then the ones that take a login, then the posts. Post when the daily chart has a few days of history (it starts at No. 1 on November 19, 2026), so a visitor can see yesterday's answer.

## 1. Happens on merge (nothing to click)

- **Official MCP Registry.** `.github/workflows/publish-mcp.yml` publishes `server.json` as `io.github.skirberg/monte` when it lands on main. Check the run in the Actions tab, then search for "monte" at https://registry.modelcontextprotocol.io/v0/servers?search=monte.
- **Glama** copies new remote servers from the registry about every hour. Claim the listing afterwards on glama.ai (sign in with GitHub) to add the icon and description.
- **Search engines.** `/daily/`, `/privacy/` and `/terms/` are in the sitemap, and the IndexNow workflow tells Bing and Yandex about changed pages.

## 2. GitHub repository settings (two minutes)

On github.com/skirberg/monte, the gear next to About:

- **Description:** Statistics, one idea at a time. Free lessons, a daily chart, solvers that show the work, and games.
- **Website:** https://monte.markets
- **Topics:** statistics, probability, education, learning, data-visualization, daily-puzzle, mcp-server, nextjs, react, typescript

Settings, General, Social preview: upload `docs/launch/github-social.png` (1280 x 640).

Descriptions for every form below, in one line, short and long, with Copy buttons: https://monte.markets/brand/#about-t. Logo files: https://monte.markets/brand/.

## 3. Listings that need a login

### Claude directory (needs a paid Claude plan)

claude.ai/directory/manage, Submit new, MCP connector. First add `https://mcp.monte.markets/mcp` as a custom connector (Settings, Connectors) and call each tool once.

- **Name:** Monte statistics
- **Short description:** Statistics lessons, a glossary and solvers that show every step.
- **Auth:** none (public data, read-only)
- **Privacy policy:** https://monte.markets/privacy/
- **Terms:** https://monte.markets/terms/
- **Docs:** https://github.com/skirberg/monte/tree/main/mcp
- **Support:** https://github.com/skirberg/monte/issues
- **Icon:** `public/icon-512.png`
- **Example prompts:**
  1. A test is 95% accurate and 1% of people have the condition. I tested positive: what are the chances I have it? Show the steps.
  2. My A/B test had 120 sign-ups from 2,400 visitors on A and 151 from 2,410 on B. Did B really work?
  3. Explain the central limit theorem with an example and the trap people fall into.
  4. Find a 95% confidence interval for a mean of 52 with SD 8 from 40 people.

### ChatGPT (needs an OpenAI Platform account with identity verification)

platform.openai.com/plugins. All eight tools already set the four hints the review checks (read-only, not destructive, idempotent, closed world).

- **Name:** Monte statistics. **Short description (30 characters max):** Statistics that shows the work
- **URLs:** privacy, terms and support as above; website https://monte.markets
- **Domain check:** the portal gives a token to host at `/.well-known/openai-apps-challenge`. Paste it into a file at `public/.well-known/openai-apps-challenge` and merge.
- **Test cases:** the four prompts above, plus "solve a Poisson problem with a mean of 3 per hour: chance of exactly 5". Negative cases: "write me an essay", "what is the weather", "book a flight" (the tools should not be called).
- Reviewers reject apps that only repeat what the assistant already does: lead with the solvers and the decisions, which return worked steps from Monte's own code.

### Manual directories

- **mcp.so/submit:** name, the URL above, the GitHub link. Free, reviewed.
- **AlternativeTo** (alternativeto.net, verified email): Suggest new application. Free web app, alternative to Khan Academy, Brilliant and Seeing Theory.
- **Daily game lists:** listdle.com/submit (Math category), alldle.net/submit (no account), dles.gg. Link https://monte.markets/daily/, one line: "Draw the hidden end of a real chart. One a day, the same for everyone."

## 4. Product Hunt

Present it as interactive tools and games: Product Hunt's featuring rules leave out courses. Self-hunting is fine (most featured launches are). Launch at 12:01 AM Pacific; Product Hunt says weekend launches get about 15% more visits.

- **Name:** Monte
- **Tagline (60 max):** Learn statistics by playing with real data, free
- **Description (500 max):** Monte is a free statistics site that teaches by doing. Every day there is one real chart, the same for everyone, with its end hidden: draw what happens next, then see the real line and share your score. Behind it: 14 topics in 70 short lessons, a placement that finds your level in eight questions, drills with fresh numbers, 11 solvers that show every step, and 10 games that each hide one idea. No account, no ads, no paywall.
- **Topics:** Education, Math, Data visualization, Games
- **Thumbnail:** `thumbnail-240.png`
- **Gallery (1270 x 760):** `gallery-1-home.png`, `gallery-2-daily.png`, `gallery-3-path.png`, `gallery-4-decide.png`, `gallery-5-solver.png`
- **First comment:**

  > Hi Product Hunt. Monte teaches statistics by having you do something first. Today's chart hides the end of a real series (sea ice, CO₂, fireworks complaints, potholes): draw it, then see the real line beside a plain rule like "same as last year". The rule usually wins, which is the lesson.
  >
  > Everything is free and stays in your browser, no account. There are 14 topics, a placement that skips what you know, solvers that show every step, and games like three doors and election night.
  >
  > I'd love to hear which topic you'd want next.

## 5. Posts (one at a time, and stay to answer)

- **Show HN** (news.ycombinator.com/submit). Title: `Show HN: Monte, a free statistics site where you draw the end of real charts`. URL: https://monte.markets/daily/. First comment: what it is in two sentences, how it's built (static Next.js, progress in the browser, real series from public sources), and one honest question for feedback.
- **r/InternetIsBeautiful:** one tool per post, not the games. Post the daily chart with a plain title: "Draw the hidden end of a real chart, then see what actually happened".
- **r/statistics, r/AskStatistics, r/learnmath:** read each sidebar first. Share a page only as a direct answer to someone's question (a solver for their problem, a lesson for their topic).
- **AP Statistics teachers:** the Facebook groups "AP Statistics Teachers" and "AP Stats Teachers". Join, then share the daily chart as a free warm-up for class.

## 6. GitHub lists

A pull request each, from the owner's account:

- rossant/awesome-math, Statistics section (see its CONTRIBUTING.md)
- brandonhimpfen/awesome-mathematics
- punkpeye/awesome-remote-mcp-servers (the MCP server)
