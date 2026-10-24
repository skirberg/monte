"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "cn";
import { TOPICS, type TopicId } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { topicMatches } from "@/lib/study/search";
import { isWon, statsFor, useStudyProgress } from "@/lib/study/progress";
import { useLearnQuery } from "@/components/study/learn-bar";
import { eyebrow } from "@/components/study/ui";

function Status({ id, current }: { id: TopicId; current: boolean }) {
  const p = useStudyProgress();
  const d = statsFor(p, id);
  const cls = cn(eyebrow, "ml-auto flex items-center gap-1", current ? "text-paper/75" : isWon(p, id) && "text-clay-ink");
  if (isWon(p, id))
    return (
      <span className={cls}>
        <Check className="size-3.5" aria-hidden /> Won
      </span>
    );
  if (d.asked) return <span className={cls}>{Math.round(d.best * 100)}%</span>;
  if (p.read?.[id])
    return (
      <span className={cls}>
        <Check className="size-3.5" aria-hidden /> Read
      </span>
    );
  return null;
}

function TopicList({ active, onPick }: { active?: string; onPick?: () => void }) {
  const query = useLearnQuery();
  const shown = TOPICS.filter((t) => topicMatches(t.id, query));
  return (
    <>
      <ol className="overflow-hidden rounded-[18px] border border-line">
        {shown.map((t) => (
          <li key={t.id} className="border-b border-line last:border-b-0">
            <Link
              href={study.topic(t.id)}
              onClick={onPick}
              aria-current={t.id === active ? "true" : undefined}
              className="flex min-h-11 items-center gap-3 px-3 py-2 text-[15px] transition-colors hover:bg-sand aria-[current=true]:bg-ink aria-[current=true]:text-paper"
            >
              <span className={cn("w-6 font-mono text-xs tabular-nums", t.id === active ? "text-paper/75" : "text-ink-muted")}>{t.n}</span>
              <span>{t.short}</span>
              <Status id={t.id} current={t.id === active} />
            </Link>
          </li>
        ))}
      </ol>
      {!shown.length && (
        <p className="rounded-[18px] border border-dashed border-line-strong p-4 text-sm text-ink-muted">
          No topics match. Try a simpler word like mean, SD, given, or Poisson.
        </p>
      )}
    </>
  );
}

/** Topic pages: the list of fourteen beside the lesson on wide screens, folded above it on phones. */
export function TopicsFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const active = pathname.match(/\/topics\/([a-z]+)/)?.[1];
  const n = TOPICS.find((t) => t.id === active)?.n;
  const query = useLearnQuery();
  const [open, setOpen] = React.useState(false);
  // Typing a search on a phone opens the list so the matches show.
  const [lastQuery, setLastQuery] = React.useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    if (query) setOpen(true);
  }

  return (
    <div className="grid gap-6 pb-8 lg:grid-cols-[300px_minmax(0,760px)] lg:gap-10">
      <aside aria-label="Topics" className="min-w-0 print:hidden">
        <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="group lg:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-[18px] border border-line px-4 [&::-webkit-details-marker]:hidden">
            <span className="font-mono text-xs uppercase tracking-[0.06em]">{n ? `Topic ${n} of ${TOPICS.length}` : "Topics"}</span>
            <span className="flex items-center gap-1 text-sm text-ink-muted">
              All topics <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
            </span>
          </summary>
          <div className="mt-2">
            <TopicList active={active} onPick={() => setOpen(false)} />
          </div>
        </details>
        <div className="hidden lg:block">
          <p className={cn(eyebrow, "mb-2")}>Topics</p>
          <TopicList active={active} />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
