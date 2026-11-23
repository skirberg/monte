# Monte MCP server

Monte's own calculators and lesson data over the Model Context Protocol, so a chat app can get the same numbers the site shows and link back to the page that works them.

**Endpoint:** `https://mcp.monte.markets/mcp` (Streamable HTTP, stateless, no key). `GET` returns a short description.

| Tool | What it does |
|---|---|
| `list_topics` | The 14 topics with page links |
| `get_topic` | One topic: the idea, why it matters, an example, the trap, formulas, the five lessons |
| `search_terms` | The glossary, matched on the term or its meaning |
| `list_solvers` | The 11 solvers and their inputs |
| `solve` | Runs a solver and returns every answer with its working (same code as `/solve/<id>/`) |
| `test_result` | Is this test result real? (Bayes) |
| `warranty` | Should I buy the warranty? |
| `ab_test` | Did my change really work? (two-proportion z test, 95% range, sample size) |

The tools import `lib/study/*` and `lib/decide/math.ts` from the site, so a fix there fixes both.

Every tool only reads: each sets all four hints (`readOnlyHint` true, `destructiveHint` false, `idempotentHint` true, `openWorldHint` false), which the Claude and ChatGPT directories check. Server version 1.1.0.

## Listings

- **Official MCP Registry:** `io.github.skirberg/monte`, from `server.json` at the repository root. `.github/workflows/publish-mcp.yml` publishes it when `server.json` changes on main; bump `version` there to publish a change. Directories that copy the registry (Glama and others) pick it up from there.
- **Claude and ChatGPT directories:** the fields to paste, example prompts and test cases are in [`docs/launch/README.md`](../docs/launch/README.md). Privacy: https://monte.markets/privacy/. Terms: https://monte.markets/terms/.

## Run and test

```bash
cd mcp && npm install
npm run dev     # http://localhost:8787/mcp
npm test        # starts it and calls every tool with the official MCP client
```

## Deploy

Its own Vercel project, `monte-mcp`, with Root Directory `mcp`, Node 24 and the domain `mcp.monte.markets`. `mcp/vercel.json` turns framework detection off (the repository root is a Next.js app), and `npm run build` writes `.vercel/output` (Build Output API). Every push to main redeploys it. Add it to a client as a remote MCP server with the URL above.
