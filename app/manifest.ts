import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

// Lets students add the site to a phone home screen like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Business statistics, one idea at a time.",
    start_url: "/study/",
    display: "standalone",
    background_color: "#faf6f1",
    theme_color: "#faf6f1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
