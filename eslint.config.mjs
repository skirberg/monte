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
    // The study engine is carried verbatim from the original artifact.
    "lib/engine/engine.js",
    // Local-only folders (git-ignored): brand studies, screenshots, deploy copies.
    "brand/**",
    "screenshots/**",
    "deploy/**",
  ]),
]);

export default eslintConfig;
