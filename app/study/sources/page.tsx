import type { Metadata } from "next";
import { StudyShell } from "@/components/study/study-shell";
import { SourceList } from "@/components/study/sources";
import { PageHead, lead } from "@/components/study/ui";
import { DATA } from "@/lib/study/data";

export const metadata: Metadata = {
  title: "Sources",
  description: "Free videos, books and apps for statistics, plus R, Python, Excel and Power Query. Every link opened and checked.",
  alternates: { canonical: "/study/sources/" },
};

export default function SourcesPage() {
  return (
    <StudyShell>
      <div className="grid gap-6 py-8">
        <PageHead title="Sources">
          <p className={`${lead} max-w-[62ch] text-ink-muted`}>
            Free videos, books and apps for statistics, plus R, Python, Excel and Power Query. Every link was opened and checked on the date shown.
          </p>
        </PageHead>
        <SourceList />
        <p className="text-sm text-ink-muted">Note: {DATA.sources.note}</p>
      </div>
    </StudyShell>
  );
}
