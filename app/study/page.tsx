import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { EngineMount } from "@/components/study/engine-mount";
import { JsonLd } from "@/components/json-ld";
import { TOPICS } from "@/lib/site-data";
import { SITE_NAME, SITE_URL, abs } from "@/lib/seo";
import { Celebrations } from "@/components/study/celebrations";
import { StudyBottomNav } from "@/components/study/bottom-nav";
import "./engine-base.css";
import "./engine-skin.css";

export const metadata: Metadata = {
  title: "Study",
  description: "Learn, practice, solve. Thirteen topics, timed drills with fresh numbers, and solvers that show the work.",
  alternates: { canonical: "/study/" },
};

export default function StudyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "LearningResource",
          name: `${SITE_NAME}: study`,
          description: "Thirteen business statistics topics with labs, timed drills with fresh numbers, a mock exam and solvers that show the work.",
          url: abs("/study/"),
          learningResourceType: "Interactive lessons and practice questions",
          teaches: TOPICS.map((t) => t.name),
          inLanguage: "en",
          isAccessibleForFree: true,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
        }}
      />
      <SiteHeader mode="study" />
      <EngineMount />
      <Celebrations />
      <StudyBottomNav />
    </>
  );
}
