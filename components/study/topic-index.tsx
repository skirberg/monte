"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "cn";
import { TOPICS, isTopicId, topicById } from "@/lib/study/data";
import { plainText } from "@/lib/study/math";
import { study } from "@/lib/study/routes";
import { topicMatches } from "@/lib/study/search";
import { isWon, statsFor, useStudyProgress } from "@/lib/study/progress";
import { useStoredString } from "@/lib/hooks";
import { useLearnQuery } from "@/components/study/learn-bar";
import { eyebrow } from "@/components/study/ui";

/** Learn home: every topic with where you stand on it, and a way back to the last one you read. */
export function TopicIndex() {
  const p = useStudyProgress();
  const query = useLearnQuery();
  const last = useStoredString("sigmaTopic");
  const lastTopic = isTopicId(last) ? topicById(last) : undefined;
  const shown = TOPICS.filter((t) => topicMatches(t.id, query));

  return (
    <div className="grid gap-6 pb-8">
      {lastTopic && !query && (
        <Link href={study.topic(lastTopic.id)} className="group flex items-center justify-between gap-4 rounded-[18px] bg-sand p-5 transition-colors hover:bg-sand-2">
          <span className="grid gap-1">
            <span className={eyebrow}>Pick up where you left off</span>
            <span className="font-display text-xl font-[650] tracking-[-0.02em]">
              {lastTopic.n}. {lastTopic.name}
            </span>
          </span>
          <ArrowRight className="size-5 flex-none transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
      <ol className="grid border-t border-line sm:grid-cols-2 sm:gap-3 sm:border-t-0 lg:grid-cols-3">
        {shown.map((t) => {
          const d = statsFor(p, t.id), won = isWon(p, t.id);
          const status = won ? "Mastered" : d.asked ? `Best ${Math.round(d.best * 100)}%` : p.read?.[t.id] ? "Read" : "";
          return (
            <li key={t.id} className="border-b border-line sm:border-b-0">
              {/* Phones: a row with the number, the name and where you stand. Wider: a card with the one-line idea. */}
              <Link
                href={study.topic(t.id)}
                className="grid h-full min-h-12 grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-x-3 py-2.5 transition-colors hover:bg-sand sm:grid-cols-1 sm:content-start sm:items-start sm:gap-2 sm:rounded-[18px] sm:border sm:border-line sm:p-5 sm:hover:border-ink"
              >
                <span className="font-mono text-xs tabular-nums text-ink-muted sm:hidden">{t.n}</span>
                <span className="order-3 flex items-center justify-between gap-3 sm:order-none">
                  <span className={cn(eyebrow, "hidden sm:inline")}>Topic {t.n}</span>
                  {status && (
                    <span className={cn(eyebrow, "flex items-center gap-1", won && "text-clay-ink")}>
                      {(won || status === "Read") && <Check className="size-3.5" aria-hidden />}
                      {status}
                    </span>
                  )}
                </span>
                <span className="font-display text-[1.05rem] font-[650] leading-snug tracking-[-0.02em] sm:text-lg">{t.short}</span>
                <span className="hidden text-sm text-ink-muted sm:line-clamp-3">{plainText(t.line)}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      {!shown.length && (
        <p className="rounded-[18px] border border-dashed border-line-strong p-4 text-sm text-ink-muted">
          No topics match. Try a simpler word like mean, SD, given, or Poisson.
        </p>
      )}
    </div>
  );
}
