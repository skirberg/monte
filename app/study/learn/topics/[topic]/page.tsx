import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { TOPICS, topicById } from "@/lib/study/data";
import { plainText } from "@/lib/study/math";
import { study } from "@/lib/study/routes";
import { studyHref } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL, abs } from "@/lib/seo";
import { TopicLab } from "@/components/study/labs";
import { Listen, QuizList, ReadMarker, TopicPath, WatchHere } from "@/components/study/topic-parts";
import { Box, Html, blockTitle, btn, eyebrow, h1, label, lead } from "@/components/study/ui";

export const dynamicParams = false;
export const generateStaticParams = () => TOPICS.map((t) => ({ topic: t.id }));

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = topicById((await params).topic);
  if (!t) return {};
  return {
    title: t.name,
    description: plainText(t.line),
    alternates: { canonical: study.topic(t.id) },
  };
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
          teaches: t.name,
          inLanguage: "en",
          isAccessibleForFree: true,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
        }}
      />
      <header>
        {/* Phones already say "Topic n of 14" on the topic picker. */}
        <p className={cn(eyebrow, "mb-2 hidden lg:block")}>
          Topic {t.n} of {TOPICS.length}
        </p>
        <h1 className={h1}>{t.name}</h1>
        <TopicPath id={t.id} />
        <Html as="p" html={t.line} className={lead} />
        <Listen id={t.id} />
      </header>

      {t.why && (
        <section aria-labelledby="why-t" className="grid gap-3 rounded-[18px] border border-line bg-paper p-6">
          <h2 id="why-t" className="sr-only">
            Why it matters
          </h2>
          <p className="text-pretty font-display text-[clamp(1.2rem,1.05rem+0.6vw,1.5rem)] font-semibold leading-tight tracking-[-0.015em]">{t.why.click}</p>
          <p className="max-w-[62ch] text-ink-muted">{t.why.care}</p>
          <ul className="mt-1 grid gap-2.5 md:grid-cols-3 md:gap-4">
            {t.why.uses.map(([field, use]) => (
              <li key={field} className="grid content-start gap-0.5 border-l-2 border-clay pl-3.5">
                <b className="text-sm">{field}</b>
                <span className="text-[15px]">{use}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Box subtle className="grid gap-2">
        <p className={label}>{t.ex.tag} example</p>
        <Html as="p" html={t.ex.text} />
      </Box>

      {t.labs.map((l) => (
        <TopicLab key={l} id={l} />
      ))}

      <QuizList id={t.id} />

      <Box subtle className="grid gap-2">
        <p className={cn(label, "flex items-center gap-1.5")}>
          <TriangleAlert className="size-4" aria-hidden /> Trap
        </p>
        <Html as="p" html={t.trap} />
      </Box>

      <section aria-labelledby="f-t" className="grid gap-3">
        <h2 id="f-t" className={blockTitle}>
          Formulas
        </h2>
        <dl className="divide-y divide-line border-y border-line">
          {[...t.formulas, ["Remember it", t.hook] as const].map(([name, f]) => (
            <div key={name} className="grid gap-1 py-3.5 md:grid-cols-[minmax(10rem,14rem)_1fr] md:gap-6">
              <dt className="text-sm font-semibold">{name}</dt>
              <dd className="tabular-nums">{f}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="g-t" className="grid gap-3">
        <h2 id="g-t" className={blockTitle}>
          Watch and go deeper
        </h2>
        <ul className="divide-y divide-line border-y border-line">
          {t.links.map(([title, url, about]) => (
            <li key={url} className="grid justify-items-start gap-1 py-3.5">
              <a href={url} target="_blank" rel="noopener noreferrer" className="group grid gap-1">
                <b className="font-semibold group-hover:text-clay-ink">{title}</b>
                <span className="text-sm text-ink-muted">{about}</span>
              </a>
              <WatchHere url={url} title={title} />
            </li>
          ))}
        </ul>
      </section>

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
