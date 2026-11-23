import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/cn";
import { TOPICS, topicById } from "@/lib/study/data";
import { plainText } from "@/lib/study/math";
import { study } from "@/lib/study/routes";
import { lessonsFor } from "@/lib/study/lessons";
import { studyHref } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, abs, pageMeta, topicSearchTerms, topicSearchTitle } from "@/lib/seo";
import { TopicLab } from "@/components/study/labs";
import { Listen, QuizList, ReadMarker, TopicLessons, TopicPath, WatchHere } from "@/components/study/topic-parts";
import { Box, Fold, Html, btn, h1, label } from "@/components/study/ui";
import { sym } from "@/lib/study/symbols";

export const dynamicParams = false;
export const generateStaticParams = () => TOPICS.map((t) => ({ topic: t.id }));

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = topicById((await params).topic);
  if (!t) return {};
  return pageMeta(study.topic(t.id), topicSearchTitle(t.id, t.name), plainText(t.line));
}

export default async function TopicPage({ params }: Props) {
  const t = topicById((await params).topic);
  if (!t) notFound();
  const i = TOPICS.indexOf(t), prev = TOPICS[i - 1], next = TOPICS[i + 1];

  return (
    <article className="grid gap-8 lg:gap-10">
      <JsonLd
        data={{
          "@type": "LearningResource",
          name: t.name,
          description: plainText(t.line),
          url: abs(study.topic(t.id)),
          learningResourceType: "Lesson",
          teaches: topicSearchTerms(t.id, t.name),
          keywords: t.keywords,
          position: t.n,
          inLanguage: "en",
          isAccessibleForFree: true,
          isPartOf: { "@type": "Course", name: `${SITE_NAME}: business statistics`, url: abs(study.learn) },
          hasPart: lessonsFor(t.id).map((l) => ({ "@type": "LearningResource", name: l.title, url: abs(study.lesson(t.id, l.slug)) })),
        }}
      />
      <header>
        <h1 className={h1}>{t.name}</h1>
        <TopicPath id={t.id} />
      </header>

      {/* Phone first, like Brilliant's course page: the lessons are the path. Then the hands-on parts (lab, quiz).
          Reading for reference waits one tap away, so the page is short on a phone (DESIGN.md, "Lessons"). */}
      <TopicLessons id={t.id} />

      {t.labs.length > 0 && (
        // #lab: the "Your first ten minutes" path links straight here.
        <div id="lab" className="grid scroll-mt-24 gap-8 lg:gap-10">
          {t.labs.map((l) => (
            <TopicLab key={l} id={l} />
          ))}
        </div>
      )}

      <QuizList id={t.id} />

      <div className="grid gap-3">
        <Fold title="The idea in one page">
          <div className="grid gap-5">
            <div>
              <Html as="p" html={t.line} className="max-w-measure" />
              <Listen id={t.id} />
            </div>
            {t.why && (
              <div className="grid gap-3">
                <p className="text-pretty font-display text-lg font-semibold leading-tight">{sym(t.why.click)}</p>
                <ul className="grid gap-2.5 md:grid-cols-3 md:gap-4">
                  {t.why.uses.map(([field, use]) => (
                    <li key={field} className="grid content-start gap-0.5 border-l-2 border-clay pl-3.5">
                      <b className="text-sm">{field}</b>
                      <span className="text-base">{sym(use)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Box subtle className="grid gap-2">
              <p className={label}>{t.ex.tag} example</p>
              <Html as="p" html={t.ex.text} className="max-w-measure" />
            </Box>
          </div>
        </Fold>
        <Fold title="The trap">
          <Html as="p" html={t.trap} className="max-w-measure" />
        </Fold>
        <Fold title="Formulas">
          <dl className="divide-y divide-line border-y border-line">
            {[...t.formulas, ["Remember it", t.hook] as const].map(([name, f]) => (
              <div key={name} className="grid gap-1 py-3.5 md:grid-cols-[minmax(10rem,14rem)_1fr] md:gap-6">
                <dt className="text-sm font-semibold">{sym(name)}</dt>
                <dd className="tabular-nums">{sym(f)}</dd>
              </div>
            ))}
          </dl>
        </Fold>
        {t.links.length > 0 && (
          <Fold title="Videos and further reading">
            <ul className="divide-y divide-line border-y border-line">
              {t.links.map(([title, url, about]) => (
                <li key={url} className="grid justify-items-start gap-1 py-3.5">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="group grid gap-1">
                    <b className="font-semibold group-hover:underline underline-offset-4">{title}</b>
                    <span className="text-sm text-ink-muted">{about}</span>
                  </a>
                  <WatchHere url={url} title={title} />
                </li>
              ))}
            </ul>
          </Fold>
        )}
      </div>

      <div className="grid gap-4">
        <ReadMarker id={t.id} />
        <a href={studyHref(`#practice/drill/topic/${t.id}`)} className={cn(btn.primary, "justify-self-start")}>
          Drill this topic
        </a>
        <nav aria-label="Previous and next topic" className="grid grid-cols-2 gap-3">
          {prev ? (
            <Link href={study.topic(prev.id)} className="grid min-h-16 gap-0.5 rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-ink hover:bg-sand">
              <span className="text-xs text-ink-muted">Previous</span>
              {prev.short}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={study.topic(next.id)} className="grid min-h-16 gap-0.5 rounded-xl border border-line px-4 py-3 text-right text-sm transition-colors hover:border-ink hover:bg-sand">
              <span className="text-xs text-ink-muted">Next</span>
              {next.short}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  );
}
