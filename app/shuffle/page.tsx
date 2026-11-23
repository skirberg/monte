import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShuffleGame } from "@/components/play/shuffle-game";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, abs, pageMeta } from "@/lib/seo";

const DESCRIPTION = "One statistics question a day, under three cups. Follow the right answer through the shuffle, lift a cup, see the work.";

export const metadata: Metadata = pageMeta("/shuffle/", "The Shuffle", DESCRIPTION);

/** The Shuffle on its own page: the link Share sends, and the one daily game lists point to. Same game as the home page. */
export default function ShufflePage() {
  return (
    <>
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="outline-none">
        <JsonLd data={{ "@type": "Game", name: `${SITE_NAME} Shuffle`, url: abs("/shuffle/"), description: DESCRIPTION, isAccessibleForFree: true, genre: "Daily puzzle" }} />
        <Section top="block" last aria-labelledby="shuffle-t">
          <h1 id="shuffle-t" className="mb-block font-display text-headline font-semibold leading-none" style={{ fontVariationSettings: "'wdth' 84" }}>
            Find the grain
          </h1>
          <ShuffleGame titleAs="h2" />
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
