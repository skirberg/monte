// One place for the public URL. Change it here if the site moves to its own domain.
export const SITE_URL = "https://monte.markets";
export const SITE_NAME = "Monte";
export const abs = (path: string) => `${SITE_URL}${path}`;

type ShareImage = { url: string; width: number; height: number; alt: string };
const DEFAULT_IMAGE: ShareImage = { url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME}: drop enough grains and the shape appears.` };

/**
 * Share tags for any page, so a link pasted into a chat shows the page's own title and line, not just "Monte".
 * Spread it into the page's metadata: `{ title, description, ...pageShare(path, title, description) }`.
 */
export function pageShare(path: string, title: string, description: string, image: ShareImage = DEFAULT_IMAGE) {
  return {
    openGraph: { title: `${title} · ${SITE_NAME}`, description, type: "website" as const, siteName: SITE_NAME, url: path, images: [image] },
    twitter: { card: "summary_large_image" as const, title: `${title} · ${SITE_NAME}`, description, images: [image.url] },
  };
}

/** Share tags for a game page: its own title, line and card (public/og/<slug>.png from scripts/make-og.tsx). */
export function gameShare(slug: string, title: string, description: string) {
  return pageShare(`/play/${slug}/`, title, description, { url: `/og/${slug}.png`, width: 1200, height: 630, alt: `${title}, a game on ${SITE_NAME}` });
}

/** A page's title, description, canonical link and share tags in one call. */
export function pageMeta(path: string, title: string, description: string) {
  return { title, description, alternates: { canonical: path }, ...pageShare(path, title, description) };
}
