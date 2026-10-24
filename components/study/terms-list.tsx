"use client";

import Link from "next/link";
import { cn } from "cn";
import { DATA, TOPICS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { studyHref } from "@/lib/site-data";
import { norm } from "@/lib/study/search";
import { useLearnQuery } from "@/components/study/learn-bar";
import { Fold, PageHead, lead, linkBtn } from "@/components/study/ui";
import { sym } from "@/lib/study/symbols";

/** The glossary: every key word in plain English with a quick example, grouped by topic. */
export function TermsList() {
  const q = norm(useLearnQuery().trim());
  const groups = TOPICS.map((t) => {
    const kw = norm(t.keywords ?? "");
    const rows = DATA.terms.filter((x) => x[1] === t.id).filter((x) => !q || norm(`${x[0]} ${x[2]} ${x[3]}`).includes(q) || (q.length > 2 && kw.includes(q)));
    return { t, rows };
  }).filter((g) => g.rows.length);

  return (
    <div className="grid gap-6 pb-8">
      <PageHead title="Terms">
        <p className={cn(lead, "max-w-[62ch] text-ink-muted")}>Every key word in plain English, with a quick example.</p>
        <div className="print:hidden">
          <a href={studyHref("#practice/cards")} className={cn(linkBtn, "min-h-11 font-medium")}>
            Study them as flashcards
          </a>
        </div>
      </PageHead>
      {/* One row per topic. A search opens every topic it matches. */}
      <div className="border-t border-line">
        {groups.map(({ t, rows }) => (
          <Fold key={t.id} id={`tm-${t.id}`} flat open={q ? true : undefined} title={`${t.n}. ${t.name}`}>
            <dl className="divide-y divide-line border-y border-line">
              {rows.map(([term, , meaning, example]) => (
                <div key={term} className="grid gap-1 py-3.5 md:grid-cols-[minmax(10rem,15rem)_1fr] md:gap-6">
                  <dt className="font-semibold">{sym(term)}</dt>
                  <dd className="grid max-w-[62ch] gap-0.5">
                    <span>{sym(meaning)}</span>
                    <span className="text-sm text-ink-muted">{sym(example)}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <Link href={study.topic(t.id)} className={cn(linkBtn, "mt-2 min-h-11")}>
              Read the topic
            </Link>
          </Fold>
        ))}
      </div>
      {!groups.length && <p className="rounded-[18px] border border-dashed border-line-strong p-4 text-sm text-ink-muted">No term matches that search.</p>}
    </div>
  );
}
