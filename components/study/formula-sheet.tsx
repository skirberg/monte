"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import { Printer } from "lucide-react";
import { cn } from "cn";
import { DATA, TOPICS } from "@/lib/study/data";
import { stripTags } from "@/lib/study/math";
import { norm } from "@/lib/study/search";
import { useLearnQuery } from "@/components/study/learn-bar";
import { PageHead, blockTitle, btn, chip, lead } from "@/components/study/ui";

type Row = { t: string; f: string; x: string };
type Section = { id: string; title: string; jump: React.ReactNode; caption?: string; kw: string; rows: Row[] };

const SECTIONS: Section[] = [
  { id: "sh-hooks", title: "Memory hooks", jump: "Hooks", kw: "", rows: DATA.hooks.map(([a, b, f, x]) => ({ t: `${a}, ${b}`, f, x })) },
  ...TOPICS.map((t) => ({
    id: `sh-${t.id}`,
    title: `${t.n}. ${t.name}`,
    jump: (
      <>
        <span className="font-mono text-xs text-ink-muted">{t.n}</span> {t.short}
      </>
    ),
    kw: t.keywords ?? "",
    rows: (DATA.sheet[t.id] ?? []).map(([name, f, x, alias]) => ({ t: alias ? `${name}, ${alias}` : name, f, x })),
  })),
  {
    id: "sh-traps",
    title: "Traps",
    jump: "Traps",
    kw: "",
    rows: TOPICS.map((t) => {
      const s = stripTags(t.trap), dot = s.indexOf(". ");
      return { t: `${t.n}. ${t.short}`, f: dot > 0 ? s.slice(0, dot + 1) : s, x: dot > 0 ? s.slice(dot + 2) : "" };
    }),
  },
];
const ROW_TEXT = new Map(SECTIONS.flatMap((s) => s.rows.map((r) => [r, norm(`${r.t} ${r.f} ${r.x}`)] as const)));

/** The formula sheet: every formula, when to use it and a worked example. Built to print. */
export function FormulaSheet() {
  const q = norm(useLearnQuery().trim());
  const shown = SECTIONS.map((s) => {
    const head = norm(`${s.title} ${s.kw}`);
    return { ...s, rows: s.rows.filter((r) => !q || ROW_TEXT.get(r)!.includes(q) || head.includes(q)) };
  });
  const any = shown.some((s) => s.rows.length);

  return (
    <div className="grid gap-8 pb-8">
      <PageHead title="Formula sheet">
        <p className={cn(lead, "max-w-[62ch] text-ink-muted")}>{DATA.copy.sheetIntro}</p>
        <div className="print:hidden">
          <button
            type="button"
            className={btn.ghost}
            onClick={() => {
              track("Formula sheet printed");
              try {
                window.print();
              } catch {}
            }}
          >
            <Printer aria-hidden /> Print
          </button>
        </div>
      </PageHead>

      {/* Buttons, not #anchors: they scroll without adding history entries. */}
      <nav
        aria-label="Jump to a section of the formula sheet"
        className="sticky top-[calc(env(safe-area-inset-top,0px)+56px)] z-10 -mx-4 flex gap-2 overflow-x-auto border-b border-line bg-paper/92 px-4 py-2.5 backdrop-blur-md [scrollbar-width:none] md:-mx-6 md:px-6 lg:top-16 print:hidden [&::-webkit-scrollbar]:hidden"
      >
        {SECTIONS.map((s) => (
          <button key={s.id} type="button" className={chip} onClick={() => document.getElementById(s.id)?.scrollIntoView({ block: "start" })}>
            {s.jump}
          </button>
        ))}
      </nav>

      {shown.map(
        (s) =>
          s.rows.length > 0 && (
            <section key={s.id} aria-labelledby={s.id} className="grid gap-3 break-inside-avoid-page">
              <h2 id={s.id} className={cn(blockTitle, "scroll-mt-[124px] lg:scroll-mt-[136px]")}>
                {s.title}
              </h2>
              <div className="divide-y divide-line border-y border-line">
                {s.rows.map((r) => (
                  <div key={r.t + r.f} className="grid gap-1 py-3 md:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)] md:items-baseline md:gap-x-4">
                    <span className="text-sm font-semibold">{r.t}</span>
                    <span className="font-semibold tabular-nums [overflow-wrap:anywhere]">{r.f}</span>
                    <span className="text-sm text-ink-muted [overflow-wrap:anywhere]">{r.x}</span>
                  </div>
                ))}
              </div>
            </section>
          ),
      )}
      {!any && <p className="rounded-[18px] border border-dashed border-line-strong p-4 text-sm text-ink-muted">Nothing on the sheet matches that search.</p>}
    </div>
  );
}
