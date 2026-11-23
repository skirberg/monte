# Contributing

Monte gets better one fix at a time. The most useful help, in order:

1. **A wrong answer or number.** Open a [Something is wrong](https://github.com/skirberg/monte/issues/new?template=content.yml) issue with the page and what it should say. A source helps.
2. **A sentence that confuses.** The same issue: quote the sentence and say what you expected it to mean.
3. **Something broken.** A page that fails, a layout that overlaps, a button that does nothing: open a [Something is broken](https://github.com/skirberg/monte/issues/new?template=bug.yml) issue with the page, your device and a screenshot.
4. **Code.** Small pull requests that fix one thing. For anything bigger, open an issue first so we can agree on the shape.

## Run it

```bash
npm ci
npm run dev
```

Node 24. The site is a static Next.js export, so `npm run build` writes plain files to `out/`. The MCP server in `mcp/` is its own package (`cd mcp && npm ci`).

## Before you open a pull request

```bash
npm test && npm run typecheck && npm run lint && npm run scale-check && npm run build
```

CI runs the same checks, plus contrast, smoke and the MCP server's test, on every pull request. For a visual change, also run `npm run qa` after the build and look at the page at a phone width (390) and a desktop width (1440).

## House rules

- **Voice.** Plain words, one idea per sentence, no em dashes, and no exam, class or school framing: Monte is for everyone. `DESIGN.md` has the full rules, and `tests/brand.test.ts` fails on a word Monte never uses.
- **Numbers.** Every number a page shows is real data or computed by code in `lib/`. Never type in a result.
- **Look.** Colours, corners and durations come from `tokens/monte.tokens.json` (`npm run tokens` writes the CSS and TypeScript from it). Sizes and widths come from the scale in `app/globals.css`; `npm run scale-check` fails on a hand-set value. Clay means the number, ink means the action.
- **Generated files.** Change the generator, then rerun it. `AGENTS.md` lists which script writes what, including the Markdown copy of each page.
- **Ask first, in an issue:** a new dependency, a new data source, a new browser storage key, a change to the daily chart's inputs, or a new analytics event.
- **Docs move with the code.** Update `README.md`, `DESIGN.md` and `CHANGELOG.md` in the same pull request when what they describe changes.

Coding agents start at [`AGENTS.md`](AGENTS.md).

## Licences

By contributing, you agree that your code is released under the MIT licence ([`LICENSE`](LICENSE)) and your lesson content under CC BY 4.0 ([`LICENSE-CONTENT`](LICENSE-CONTENT)), like the rest of Monte.

## Security

Never report a security problem in a public issue. See [`SECURITY.md`](SECURITY.md).
