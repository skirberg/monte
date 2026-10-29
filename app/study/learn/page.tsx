import type { Metadata } from "next";
import Link from "next/link";
import { study } from "@/lib/study/routes";
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
          {TOPICS.length} topics, each building on the one before. Not sure where a problem starts?{" "}
          <Link href={study.start} className="text-ink underline underline-offset-4">
            Try the three questions
          </Link>
          .
        </p>
      </PageHead>
      <TopicIndex />
    </div>
  );
}
