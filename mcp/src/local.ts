// Local run: node .local/server.js, then POST http://localhost:8787/mcp
import { createServer } from "node:http";
import handler from "./handler";

const port = Number(process.env.PORT ?? 8787);
createServer((req, res) => void handler(req, res)).listen(port, () => console.log(`Monte MCP on http://localhost:${port}/mcp`));
