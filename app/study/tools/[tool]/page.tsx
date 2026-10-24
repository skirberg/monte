import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { TOOLS, toolById } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { StudyShell } from "@/components/study/study-shell";
import { PageHead, SegNav, btn, lead } from "@/components/study/ui";

export const dynamicParams = false;
export const generateStaticParams = () => TOOLS.map((t) => ({ tool: t.id }));

type Props = { params: Promise<{ tool: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = toolById((await params).tool);
  if (!t) return {};
  return { title: `${t.name} for statistics`, description: t.blurb, alternates: { canonical: study.tools(t.id) } };
}

/** Tools: the same statistics in Excel, R, Python, Power Query and SQL, one page each. */
export default async function ToolPage({ params }: Props) {
  const t = toolById((await params).tool);
  if (!t) notFound();
  return (
    <StudyShell>
      <div className="py-5 print:hidden">
        <SegNav label="Tools" items={TOOLS.map((x) => ({ href: study.tools(x.id), label: x.name }))} current={study.tools(t.id)} />
      </div>
      <div className="grid gap-6 pb-8">
        <PageHead title={t.name}>
          <p className={`${lead} max-w-[62ch] text-ink-muted`}>{t.intro}</p>
          {t.download && (
            <div>
              <a href={t.download[1]} download className={btn.primary}>
                <Download aria-hidden /> {t.download[0]}
              </a>
            </div>
          )}
        </PageHead>
        <div className="divide-y divide-line border-y border-line">
          {t.rows.map(([task, code, note]) => (
            <div key={task} className="grid gap-2 py-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-x-6">
              <span className="text-sm font-semibold">{task}</span>
              <div className="grid min-w-0 gap-1.5">
                <pre className="whitespace-pre-wrap rounded-xl border border-line bg-sand px-3 py-2 font-mono text-[13px] leading-relaxed [overflow-wrap:anywhere]">
                  <code>{code}</code>
                </pre>
                {note && <span className="text-sm text-ink-muted">{note}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudyShell>
  );
}
