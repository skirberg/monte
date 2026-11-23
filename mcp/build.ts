// Bundles the server into one file and writes Vercel's Build Output API layout (.vercel/output), so the deploy needs no
// framework detection: /mcp is the function, / answers with what the server is. Also writes .local/server.js for testing.
import { build, type BuildOptions } from "esbuild";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const common: BuildOptions = { bundle: true, platform: "node", target: "node24", format: "cjs", legalComments: "none", logLevel: "warning" };
const fn = ".vercel/output/functions/mcp.func";
rmSync(".vercel/output", { recursive: true, force: true });
mkdirSync(fn, { recursive: true });
await build({ ...common, entryPoints: ["src/handler.ts"], outfile: `${fn}/index.js` });
writeFileSync(`${fn}/.vc-config.json`, JSON.stringify({ runtime: "nodejs24.x", handler: "index.js", launcherType: "Nodejs", shouldAddHelpers: true, maxDuration: 10 }, null, 2));
writeFileSync(".vercel/output/config.json", JSON.stringify({ version: 3, routes: [{ src: "^/$", dest: "/mcp" }] }, null, 2));
await build({ ...common, entryPoints: ["src/local.ts"], outfile: ".local/server.js" });
// The bundles are CommonJS; this package is "type": "module", so mark both output folders.
for (const dir of [fn, ".local"]) writeFileSync(`${dir}/package.json`, '{ "type": "commonjs" }\n');
console.log("built .vercel/output and .local/server.js");
