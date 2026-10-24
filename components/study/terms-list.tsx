"use client";

import Link from "next/link";
import { cn } from "cn";
import { DATA, TOPICS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { studyHref } from "@/lib/site-data";
import { norm } from "@/lib/study/search";
import { useLearnQuery } from "@/components/study/learn-bar";
import { PageHead, blockTitle, btn, lead } from "@/components/study/ui";

/** The glossary: every key word in plain English with a quick example, grouped by topic. */
export function TermsList() {
  const q = norm(useLearnQuery().trim());
  const groups = TOPICS.map((t) => {
    const kw = norm(t.keywords ?? "");
    const rows = DATA.terms.filter((x) => x[1] === t.id).filter((x) => !q || norm(`${x[0]} ${x[2]} ${x[3]}`).includes(q) || (q.length > 2 && kw.includes(q)));
    return { t, rows };
  }).filter((g) => g.rows.length);

  return (
    <div className="grid gap-8 pb-8">
      <PageHead title="Terms">
        <p className={cn(lead, "max-w-[62ch] text-ink-muted")}>Every key word in plain English, with a quick example. Search above, or turn them into flashcards.</p>
        <div className="print:hidden">
          <a href={studyHref("#practice/cards")} className={btn.ghost}>
            Study these as flashcards
          </a>
        </div>
      </PageHead>
      {groups.map(({ t, rows }) => (
        <section key={t.id} aria-labelledby={`tm-${t.id}`} className="grid gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id={`tm-${t.id}`} className={blockTitle}>
              {t.n}. {t.name}
            </h2>
            <Link href={study.topic(t.id)} className="inline-flex min-h-8 items-center text-sm text-clay-ink underline-offset-4 hover:underline">
              Read the topic
            </Link>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {rows.map(([term, , meaning, example]) => (
              <div key={term} className="grid gap-1 py-3.5 md:grid-cols-[minmax(10rem,15rem)_1fr] md:gap-6">
                <dt className="font-semibold">{term}</dt>
                <dd className="grid max-w-[62ch] gap-0.5">
                  <span>{meaning}</span>
                  <span className="text-sm text-ink-muted">{example}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      {!groups.length && <p className="rounded-[18px] border border-dashed border-line-strong p-4 text-sm text-ink-muted">No term matches that search.</p>}
    </div>
  );
}
