import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS, topicById, type TopicId } from "@/lib/study/data";
import { LESSONS, lessonBySlug, lessonsFor } from "@/lib/study/lessons";
import { study } from "@/lib/study/routes";
import { pageMeta } from "@/lib/seo";
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
  return pageMeta(study.lesson(t.id, l.slug), `${l.title} · ${t.short}`, `A five-minute lesson on ${t.name.toLowerCase()}: a question first, then the idea.`);
}

export default async function LessonPage({ params }: Props) {
  const { topic, lesson } = await params;
  const t = topicById(topic);
  const l = t && lessonBySlug(t.id, lesson);
  if (!t || !l) notFound();
  const list = lessonsFor(t.id), i = list.indexOf(l);
  const nextTopic = TOPICS[TOPICS.indexOf(t) + 1];
  const nextLesson = list[i + 1];
  const next = nextLesson
    ? { href: study.lesson(t.id, nextLesson.slug), label: `Next: ${nextLesson.title}` }
    : nextTopic && lessonsFor(nextTopic.id as TopicId)[0]
      ? { href: study.drillTopic(t.id, 8), label: `Drill ${t.short.toLowerCase()}, 8 questions` }
      : { href: study.drillStart("mock"), label: "Take the mock test" };

  return (
    <article className="grid max-w-[720px] gap-6">
      <header className="grid gap-2">
        <p className="text-sm text-ink-muted">
          <Link href={study.topic(t.id)} className="underline-offset-4 hover:text-ink hover:underline">
            {t.n}. {t.short}
          </Link>{" "}
          · Lesson {i + 1} of {list.length}
        </p>
        <h1 className={h1}>{l.title}</h1>
      </header>
      {/* key: a fresh player for each lesson, so client navigation never carries answers over. */}
      <LessonPlayer key={`${t.id}/${l.slug}`} topic={t.id} lesson={l} next={next} />
    </article>
  );
}
