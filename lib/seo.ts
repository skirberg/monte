// One place for the public URL. Change it here if the site moves to its own domain.
export const SITE_URL = "https://monte.markets";
export const SITE_NAME = "Monte";
export const abs = (path: string) => `${SITE_URL}${path}`;

/** Share tags for a game page: its own title, line and card (public/og/<slug>.png from scripts/make-og.tsx). */
export function gameShare(slug: string, title: string, description: string) {
  const image = { url: `/og/${slug}.png`, width: 1200, height: 630, alt: `${title}, a game on ${SITE_NAME}` };
  return {
    openGraph: { title: `${title} · ${SITE_NAME}`, description, type: "website" as const, siteName: SITE_NAME, url: `/play/${slug}/`, images: [image] },
    twitter: { card: "summary_large_image" as const, title: `${title} · ${SITE_NAME}`, description, images: [image.url] },
  };
}
