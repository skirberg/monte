import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section } from "@/components/layout/section";
import { PageHead } from "@/components/study/ui";

/** A short page of plain words (privacy, terms): a title, the date it was last changed, then headed paragraphs. */
export function PlainPage({ title, updated, parts }: { title: string; updated: string; parts: { h: string; p: React.ReactNode }[] }) {
  return (
    <>
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="outline-none">
        <Section top="block" last>
          <article className="grid gap-8">
            <PageHead title={title}>
              <p className="text-sm text-ink-muted">Updated {updated}</p>
            </PageHead>
            {parts.map((x) => (
              <section key={x.h} className="grid gap-2">
                <h2 className="font-display text-heading font-semibold">{x.h}</h2>
                <p className="max-w-measure leading-relaxed">{x.p}</p>
              </section>
            ))}
          </article>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
