// End to end: start the bundled server, connect the official MCP client over Streamable HTTP, call every tool and check
// a few numbers the site itself shows (Tree and Bayes defaults: P(Return) = 0.22; 1% base, 90% catch, 9% false alarm: 9.2%).
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const PORT = 8799;
const srv = spawn(process.execPath, [".local/server.js"], { env: { ...process.env, PORT: String(PORT) }, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => srv.stdout!.once("data", r));
const client = new Client({ name: "monte-test", version: "1.0.0" });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://localhost:${PORT}/mcp`)));
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["ab_test", "get_topic", "list_solvers", "list_topics", "search_terms", "solve", "test_result", "warranty"]);
  // The tools return structured JSON; each assertion below says which field it expects.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = async (name: string, args: Record<string, unknown> = {}): Promise<any> => (await client.callTool({ name, arguments: args })).structuredContent;
  const text = (r: Awaited<ReturnType<typeof client.callTool>>) => (r.content as { text: string }[])[0].text;

  assert.equal((await call("list_topics")).topics.length, 14);
  const clt = await call("get_topic", { topic: "clt" });
  assert.equal(clt.lessons.length, 5);
  assert.match(clt.url, /\/learn\/clt\/$/);
  assert.ok((await call("search_terms", { query: "standard error" })).terms.length > 0);
  assert.equal((await call("list_solvers")).solvers.length, 11);

  const tree = await call("solve", { solver: "tree" });
  assert.equal(tree.answers[0].answer, "0.22");
  const norm = await call("solve", { solver: "normal" });
  assert.ok(norm.answers.length > 3);
  const bad = await client.callTool({ name: "solve", arguments: { solver: "tree", inputs: { p1: "2" } } });
  if (!bad.isError) throw new Error("solve with an unknown input should be an error");
  console.log("bad input -> error", text(bad).slice(0, 80));

  const t = await call("test_result", { how_common: 0.01, catches: 0.9, false_alarms: 0.09 });
  assert.equal(Math.round(t.realIfPositive * 1000) / 10, 9.2);
  const w = await call("warranty", { price: 180, chance: 0.2, cost: 800, deductible: 99 });
  assert.equal(Math.round(w.skipAverage), 160);
  assert.equal(w.cheaper, "skip");
  assert.equal((await call("warranty", { price: 100, chance: 0.2, cost: 500 })).cheaper, "even");
  const ab = await call("ab_test", { visitors_a: 1000, conversions_a: 100, visitors_b: 1000, conversions_b: 130 });
  assert.ok(ab.p < 0.05);
  console.log("all tools ok:", tools.length, "tools; tree P(Return)", tree.answers[0].answer, "; bayes", t.realIfPositive.toFixed(3), "; ab p", ab.p.toPrecision(3));
  console.log(text(await client.callTool({ name: "warranty", arguments: { price: 180, chance: 0.2, cost: 800, deductible: 99 } })));
} finally {
  await client.close();
  srv.kill();
}
