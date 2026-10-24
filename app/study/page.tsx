import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { StudyShell } from "@/components/study/study-shell";
import { Today } from "@/components/study/today";
import { OldHashRedirect } from "@/components/study/old-hash-redirect";
import { btn, lead } from "@/components/study/ui";
import { DATA, TOPICS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { SITE_NAME, SITE_URL, abs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Study",
  description: "Statistics, one idea at a time. Fourteen topics in plain English, drills with fresh numbers, and solvers that show the work.",
  alternates: { canonical: "/study/" },
};

export default function StudyPage() {
  return (
    <StudyShell>
      <JsonLd
        data={{
          "@type": "LearningResource",
          name: `${SITE_NAME}: study`,
          description: "Fourteen statistics topics in plain English, with labs, drills with fresh numbers, a mock test and solvers that show the work.",
          url: abs("/study/"),
          learningResourceType: "Interactive lessons and practice questions",
          teaches: TOPICS.map((t) => t.name),
          inLanguage: "en",
          isAccessibleForFree: true,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
        }}
      />
      <OldHashRedirect />
      <section aria-labelledby="hero-t" className="grid gap-5 pt-10 md:pt-16">
        <h1
          id="hero-t"
          className="max-w-[22ch] font-display text-[clamp(2.4rem,1.4rem+4vw,4.4rem)] font-[650] leading-[0.98] tracking-[-0.02em] [font-variation-settings:'wdth'_82]"
        >
          Statistics, one idea at a time.
        </h1>
        <p className={`${lead} max-w-[62ch] text-ink-muted`}>{DATA.copy.heroSub}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={study.topic(TOPICS[0].id)} className={btn.primary}>
            Start with topic 1
          </Link>
          <Link href={study.drill} className={btn.ghost}>
            Practice now
          </Link>
          <Link href={study.solve()} className={btn.ghost}>
            Solve a problem
          </Link>
        </div>
      </section>
      <Today />
    </StudyShell>
  );
}
