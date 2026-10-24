"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import { Printer } from "lucide-react";
import { cn } from "cn";
import { DATA, TOPICS } from "@/lib/study/data";
import { stripTags } from "@/lib/study/math";
import { norm } from "@/lib/study/search";
import { useLearnQuery } from "@/components/study/learn-bar";
import { Fold, PageHead, lead, linkBtn } from "@/components/study/ui";
import { sym } from "@/lib/study/symbols";

type Row = { t: string; f: string; x: string };
type Section = { id: string; title: string; kw: string; rows: Row[] };

const SECTIONS: Section[] = [
  { id: "sh-hooks", title: "Memory hooks", kw: "", rows: DATA.hooks.map(([a, b, f, x]) => ({ t: `${a}, ${b}`, f, x })) },
  ...TOPICS.map((t) => ({
    id: `sh-${t.id}`,
    title: `${t.n}. ${t.name}`,
    kw: t.keywords ?? "",
    rows: (DATA.sheet[t.id] ?? []).map(([name, f, x, alias]) => ({ t: alias ? `${name}, ${alias}` : name, f, x })),
  })),
  {
    id: "sh-traps",
    title: "Traps",
    kw: "",
    rows: TOPICS.map((t) => {
      const s = stripTags(t.trap), dot = s.indexOf(". ");
      return { t: `${t.n}. ${t.short}`, f: dot > 0 ? s.slice(0, dot + 1) : s, x: dot > 0 ? s.slice(dot + 2) : "" };
    }),
  },
];
const ROW_TEXT = new Map(SECTIONS.flatMap((s) => s.rows.map((r) => [r, norm(`${r.t} ${r.f} ${r.x}`)] as const)));

/** Opens every fold while the page prints, and closes the ones that were shut afterwards. */
export function usePrintOpen(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    let shut: HTMLDetailsElement[] = [];
    const before = () => {
      shut = [...(ref.current?.querySelectorAll("details:not([open])") ?? [])] as HTMLDetailsElement[];
      shut.forEach((d) => (d.open = true));
    };
    const after = () => {
      shut.forEach((d) => (d.open = false));
      shut = [];
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [ref]);
}

/** The formula sheet: every formula, when to use it and a worked example, folded by topic. Built to print (every fold opens). */
export function FormulaSheet() {
  const q = norm(useLearnQuery().trim());
  const ref = React.useRef<HTMLDivElement>(null);
  usePrintOpen(ref);
  const shown = SECTIONS.map((s) => {
    const head = norm(`${s.title} ${s.kw}`);
    return { ...s, rows: s.rows.filter((r) => !q || ROW_TEXT.get(r)!.includes(q) || head.includes(q)) };
  });
  const any = shown.some((s) => s.rows.length);

  return (
    <div ref={ref} className="grid gap-6 pb-8">
      <PageHead title="Formula sheet">
        <p className={cn(lead, "max-w-[62ch] text-ink-muted")}>Every formula, when to use it, and a worked example.</p>
        <div className="print:hidden">
          <button
            type="button"
            className={cn(linkBtn, "min-h-11 font-medium")}
            onClick={() => {
              track("Formula sheet printed");
              try {
                window.print();
              } catch {}
            }}
          >
            <Printer aria-hidden className="size-4" /> Print the whole sheet
          </button>
        </div>
      </PageHead>

      {/* One row per topic. A search opens every section it matches. */}
      <div className="border-t border-line">
        {shown.map(
          (s) =>
            s.rows.length > 0 && (
              <Fold
                key={s.id}
                id={s.id}
                flat
                open={q ? true : undefined}
                title={s.title}
                className="break-inside-avoid-page"
              >
                <div className="divide-y divide-line border-y border-line">
                  {s.rows.map((r) => (
                    <div key={r.t + r.f} className="grid gap-1 py-3 md:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)] md:items-baseline md:gap-x-4">
                      <span className="text-sm font-semibold">{sym(r.t)}</span>
                      <span className="font-semibold tabular-nums [overflow-wrap:anywhere]">{sym(r.f)}</span>
                      <span className="text-sm text-ink-muted [overflow-wrap:anywhere]">{sym(r.x)}</span>
                    </div>
                  ))}
                </div>
              </Fold>
            ),
        )}
      </div>
      {!any && <p className="rounded-[18px] border border-dashed border-line-strong p-4 text-sm text-ink-muted">Nothing on the sheet matches that search.</p>}
    </div>
  );
}
