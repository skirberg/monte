import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { TopicIndex } from "@/components/study/topic-index";
import { PageHead, lead } from "@/components/study/ui";
import { TOPICS } from "@/lib/study/data";

export const metadata: Metadata = pageMeta("/study/learn/", "Learn", "Fourteen statistics topics, each with one plain sentence, a real example, a lab to drag and questions to check yourself.");

export default function LearnPage() {
  return (
    <div className="grid gap-6">
      <PageHead title="Topics">
        <p className={`${lead} max-w-[62ch] text-ink-muted`}>
          {TOPICS.length} topics, each building on the one before.
        </p>
      </PageHead>
      <TopicIndex />
    </div>
  );
}
