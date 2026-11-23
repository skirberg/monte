import type { Metadata } from "next";
import { study } from "@/lib/study/routes";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL, abs, pageMeta, topicSearchTitle } from "@/lib/seo";
import { TopicIndex } from "@/components/study/topic-index";
import { PageHead } from "@/components/study/ui";
import { TOPICS } from "@/lib/study/data";

export const metadata: Metadata = pageMeta("/learn/", "Learn statistics: fourteen topics, one idea at a time", "Fourteen statistics topics, each with one plain sentence, a real example, a lab to drag and questions to check yourself.");

export default function LearnPage() {
  return (
    <div className="grid gap-6">
      <JsonLd
        data={{
          "@type": "Course",
          name: `${SITE_NAME}: business statistics`,
          description: "Business statistics from data and sampling to multiple regression in fourteen topics, each split into five short lessons, with labs to drag, timed drills with fresh numbers and a formula sheet.",
          url: abs(study.learn),
          inLanguage: "en",
          isAccessibleForFree: true,
          educationalLevel: "Introductory",
          provider: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` },
          offers: { "@type": "Offer", price: 0, priceCurrency: "USD", category: "Free" },
          hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online" },
          hasPart: TOPICS.map((t) => ({ "@type": "LearningResource", name: topicSearchTitle(t.id, t.name), url: abs(study.topic(t.id)), position: t.n })),
        }}
      />
      <PageHead title="Topics" />
      <TopicIndex />
    </div>
  );
}
