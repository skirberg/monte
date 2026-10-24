import type { Metadata } from "next";
import { TopicIndex } from "@/components/study/topic-index";
import { PageHead, lead } from "@/components/study/ui";
import { TOPICS } from "@/lib/study/data";

export const metadata: Metadata = {
  title: "Learn",
  description: "Fourteen statistics topics, each with one plain sentence, a real example, a lab to drag and questions to check yourself.",
  alternates: { canonical: "/study/learn/" },
};

export default function LearnPage() {
  return (
    <div className="grid gap-6">
      <PageHead title="Topics">
        <p className={`${lead} max-w-[62ch] text-ink-muted`}>
          {TOPICS.length} topics, each building on the one before. Each one is a plain sentence, a real example, something to drag, and questions to check yourself.
        </p>
      </PageHead>
      <TopicIndex />
    </div>
  );
}
