# Security

## Report a problem

Use [GitHub's private vulnerability reporting](https://github.com/skirberg/monte/security/advisories/new). Please don't open a public issue for a security problem.

Say what you found, where (a URL or a file), the steps to reproduce it and what an attacker could do with it. You'll get a reply within a week. Once a fix is live, the advisory is published with credit to you, unless you'd rather stay anonymous.

## Scope

In scope:

- **monte.markets**, the site.
- **mcp.monte.markets**, the read-only MCP server in `mcp/`.
- **This repository**, including its GitHub Actions workflows.

Out of scope: problems in Vercel or GitHub themselves, denial of service and load testing, scanner output with no working exploit, and social engineering.

Research in good faith within this scope is welcome. Keep to your own browser and data, don't disrupt the site for anyone else, and give a reasonable time to fix a problem before you talk about it.

## Supported versions

Only the live site and the `main` branch. There are no releases to patch.

## How Monte keeps visitors safe

- **Nothing to steal.** No accounts, no passwords, no database. Progress stays in each visitor's browser, and nothing a visitor types is sent anywhere.
- **A locked-down site.** The pages are static files, served over HTTPS only (HSTS) with a strict Content Security Policy. Other sites can't frame the pages, and the browser blocks camera, microphone, location and payment access.
- **A read-only MCP server.** It holds no keys and stores nothing; every tool only computes an answer.
- **Checked on every change.** CI runs the tests, type checks and lint on each pull request. CodeQL scans the code and workflows. Dependency review refuses a pull request that adds a dependency with a known high or critical vulnerability. Dependabot proposes updates weekly. OpenSSF Scorecard grades the repository's habits.
- **Least privilege.** Each workflow gets the narrowest token it needs. The MCP Registry listing is published with GitHub's OIDC, so no publishing secret is stored.

Machine-readable contact details are at [monte.markets/.well-known/security.txt](https://monte.markets/.well-known/security.txt).
