import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DrawIt } from "@/components/landing/draw-it";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, abs, pageMeta } from "@/lib/seo";

const DESCRIPTION = "One real chart a day, the same for everyone. Draw what happens next, see the real line, and share your score.";

export const metadata: Metadata = pageMeta("/daily/", "Daily chart", DESCRIPTION);

/** The daily chart on its own page: a stable link for sharing and for lists of daily games. Same game as the home page. */
export default function DailyPage() {
  return (
    <>
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="outline-none">
        <JsonLd data={{ "@type": "Game", name: `${SITE_NAME} daily chart`, url: abs("/daily/"), description: DESCRIPTION, isAccessibleForFree: true, genre: "Daily puzzle" }} />
        <Section tone="sand" top="block" aria-labelledby="daily-t">
          <h1 id="daily-t" className="mb-block font-display text-headline font-semibold leading-none" style={{ fontVariationSettings: "'wdth' 84" }}>
            What happens next?
          </h1>
          <DrawIt titleAs="h2" />
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
