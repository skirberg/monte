import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { TOPICS, topicById } from "@/lib/study/data";
import { LESSONS, lessonBySlug, lessonDescription, lessonRule, lessonsFor } from "@/lib/study/lessons";
import { study } from "@/lib/study/routes";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, abs, pageMeta, topicSearchTerms } from "@/lib/seo";
import { LessonPlayer } from "@/components/study/lesson-player";
import { h1 } from "@/components/study/ui";

export const dynamicParams = false;
export const generateStaticParams = () =>
  TOPICS.flatMap((t) => (LESSONS[t.id] ?? []).map((l) => ({ topic: t.id, lesson: l.slug })));

type Props = { params: Promise<{ topic: string; lesson: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic, lesson } = await params;
  const t = topicById(topic), l = t && lessonBySlug(t.id, lesson);
  if (!t || !l) return {};
  return pageMeta(study.lesson(t.id, l.slug), `${l.title} · ${t.short}`, lessonDescription(t.name, l));
}

export default async function LessonPage({ params }: Props) {
  const { topic, lesson } = await params;
  const t = topicById(topic);
  const l = t && lessonBySlug(t.id, lesson);
  if (!t || !l) notFound();
  const list = lessonsFor(t.id), i = list.indexOf(l);
  const nextLesson = list[i + 1];
  const next = nextLesson
    ? { href: study.lesson(t.id, nextLesson.slug), label: `Next: ${nextLesson.title}` }
    : { href: study.drillTopic(t.id, 8), label: `Drill this topic, 8 questions` };

  return (
    <article className="grid max-w-[720px] gap-6">
      <JsonLd
        data={{
          "@type": "LearningResource",
          name: l.title,
          description: lessonRule(l),
          url: abs(study.lesson(t.id, l.slug)),
          learningResourceType: "Lesson",
          teaches: topicSearchTerms(t.id, t.name),
          timeRequired: "PT3M",
          position: i + 1,
          inLanguage: "en",
          isAccessibleForFree: true,
          isPartOf: { "@type": "LearningResource", name: t.name, url: abs(study.topic(t.id)), isPartOf: { "@type": "Course", name: `${SITE_NAME}: business statistics`, url: abs(study.learn) } },
        }}
      />
      <header className="grid gap-2">
        {/* On phones this is the way back (no topic picker above a lesson), so it reads as a back link. */}
        <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-ink-muted">
          <Link href={study.topic(t.id)} className="-ml-1 inline-flex min-h-11 items-center gap-1 rounded-md px-1 underline-offset-4 hover:text-ink hover:underline">
            <ArrowLeft className="size-4" aria-hidden /> {t.short}
          </Link>
          <span aria-hidden="true">·</span> Lesson {i + 1} of {list.length}
        </p>
        <h1 className={h1}>{l.title}</h1>
      </header>
      {/* key: a fresh player for each lesson, so client navigation never carries answers over. */}
      <LessonPlayer key={`${t.id}/${l.slug}`} topic={t.id} lesson={l} next={next} trap={t.trap} />
    </article>
  );
}
