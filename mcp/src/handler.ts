// One stateless Streamable HTTP endpoint: a fresh server and transport per request, so it runs on any serverless host.
import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server";

const ABOUT = {
  name: "Monte MCP server",
  endpoint: "POST /mcp (Streamable HTTP, stateless)",
  tools: ["list_topics", "get_topic", "search_terms", "list_solvers", "solve", "test_result", "warranty", "ab_test"],
  site: "https://monte.markets",
  docs: "https://monte.markets/built/",
};

async function readBody(req: IncomingMessage & { body?: unknown }) {
  if (req.body !== undefined) return req.body;
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, mcp-protocol-version, mcp-session-id");
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
  if (req.method === "OPTIONS") return void res.writeHead(204).end();
  if (req.method === "GET") return void res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(ABOUT, null, 2));
  if (req.method !== "POST") return void res.writeHead(405, { allow: "GET, POST, OPTIONS" }).end();

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, await readBody(req));
  } catch (e) {
    if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" }).end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: String(e) }, id: null }));
  }
}
