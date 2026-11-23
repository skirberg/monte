import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local-only folders (git-ignored): brand studies, screenshots, deploy copies.
    "brand/**",
    "screenshots/**",
    "deploy/**",
    // The MCP server is its own package, with its own dependencies; only its build output is skipped.
    "mcp/.local/**",
    "mcp/.vercel/**",
  ]),
]);

export default eslintConfig;
