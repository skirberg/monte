import type { NextConfig } from "next";

// Static export: `npm run build` writes a plain folder (out/) that Vercel Drop serves as-is.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
