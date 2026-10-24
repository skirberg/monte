"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import { cn } from "cn";
import type { SolverId } from "@/lib/study/routes";
import { SOLVERS, copyText, defaults, solverById, type Field, type Row, type Solver, type Table, type Values } from "@/lib/study/solvers";
import { Select } from "@/components/study/chart";
import { blockTitle, btn, chip, divided, input } from "@/components/study/ui";
import { sym } from "@/lib/study/symbols";

// One Solve calculator: examples, inputs that re-run on every keystroke, and the answers with the
// work. New problem fills in fresh numbers and hides the answers until Show answers.

export function SolverPanel({ id }: { id: SolverId }) {
  // A new solver starts from its own defaults, so the panel remounts per id.
  return <Panel key={id} solver={solverById(id)} />;
}

function Panel({ solver: S }: { solver: Solver }) {
  const n = SOLVERS.indexOf(S) + 1;
  const [values, setValues] = React.useState<Values>(() => defaults(S));
  const [practice, setPractice] = React.useState(false);
  const [copy, setCopy] = React.useState<"idle" | "ok" | "fail">("idle");
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const result = React.useMemo(() => S.run(values), [S, values]);
  const err = "err" in result ? result.err : null;
  const set = (k: string, v: string) => setValues((cur) => ({ ...cur, [k]: v }));

  const onPreset = (p: Values) => {
    setValues((cur) => ({ ...cur, ...p }));
    setPractice(false);
  };
  const onNew = () => {
    const fresh = S.rand();
    setValues((cur) => ({ ...cur, ...fresh }));
    setPractice(true);
    track("Solver used", { solver: S.id, action: "new problem" });
  };
  const onShow = () => {
    setPractice(false);
    track("Solver used", { solver: S.id, action: "show answers" });
  };
  const onCopy = () => {
    if ("err" in result) return;
    const txt = copyText(S, values, result);
    const done = (ok: boolean) => {
      setCopy(ok ? "ok" : "fail");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopy("idle"), 1500);
    };
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = txt;
        ta.setAttribute("readonly", "");
        ta.className = "sr-only";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    };
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(txt).then(
          () => done(true),
          () => done(fallback()),
        );
        return;
      }
    } catch {}
    done(fallback());
  };

  const titleId = `sv-${S.id}-title`;
  return (
    <section id={`sv-${S.id}`} aria-labelledby={titleId} className="grid grid-cols-1 gap-5 rounded-[18px] border border-line bg-paper p-5 md:p-6">
      <div className="grid gap-1.5">
        <h2 id={titleId} className={blockTitle}>
          {n}. {S.title}
        </h2>
        <p className="text-sm text-ink-muted">{sym(S.sub)}</p>
      </div>

      <div role="group" aria-label="Examples" className="flex flex-wrap gap-2">
        {S.presets.map(([label, vals], j) => (
          <button key={label} type="button" className={chip} data-sv={S.id} data-preset={j} onClick={() => onPreset(vals)}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {S.fields.map((f) => (
          <FieldInput key={f.k} solver={S.id} field={f} value={values[f.k]} onChange={(v) => set(f.k, v)} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn.ghost} data-sv={S.id} data-act="new" onClick={onNew}>
          New problem
        </button>
        <button type="button" className={btn.primary} data-sv={S.id} data-act="show" hidden={!!err || !practice} onClick={onShow}>
          Show answers
        </button>
        <button type="button" className={btn.ghost} data-sv={S.id} data-act="copy" hidden={!!err || practice} onClick={onCopy}>
          {copy === "ok" ? "Copied" : copy === "fail" ? "Copy failed" : "Copy work"}
        </button>
      </div>

      {err && (
        <p id={`sv-${S.id}-err`} role="alert" className="text-sm text-destructive [overflow-wrap:anywhere]">
          {err}
        </p>
      )}

      <div id={`sv-${S.id}-out`} aria-live="polite" className="grid min-w-0 gap-4">
        {!("err" in result) &&
          (practice ? (
            <>
              <p className="text-[15px]">
                <b className="font-semibold">Practice.</b> Work these on paper, then tap Show answers.
              </p>
              <ol className={divided}>
                {result.rows.map((r, i) => (
                  <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline py-3">
                    <Num i={i} />
                    <span className="min-w-0 text-[15px] [overflow-wrap:anywhere]">{sym(r.q)}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              {result.table && <WorkTable table={result.table} />}
              <ol className={divided}>
                {result.rows.map((r, i) => (
                  <Answer key={i} i={i} row={r} />
                ))}
              </ol>
            </>
          ))}
      </div>
    </section>
  );
}

function FieldInput({ solver, field: f, value, onChange }: { solver: SolverId; field: Field; value: string; onChange: (v: string) => void }) {
  const id = `sv-${solver}-${f.k}`;
  const wide = f.wide && "sm:col-span-2 lg:col-span-3";
  if (f.opts) return <Select id={id} label={f.l} value={value} onChange={onChange} options={f.opts} className={cn(wide)} />;
  return (
    <div className={cn("grid min-w-0 gap-1.5", wide)}>
      <label htmlFor={id} className="text-sm">
        {sym(f.l)}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        inputMode={f.t ? undefined : "decimal"}
        className={cn(input, !f.t && "font-mono tabular-nums")}
      />
    </div>
  );
}

const Num = ({ i }: { i: number }) => (
  <span aria-hidden="true" className="font-mono text-[12.5px] tabular-nums text-ink-muted">
    {i + 1}.
  </span>
);

/** Question, answer, why. One column on phones, three from md. */
function Answer({ i, row: r }: { i: number; row: Row }) {
  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-y-1.5 py-3 md:grid-cols-[2rem_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.4fr)] md:gap-x-4">
      <Num i={i} />
      <span className="min-w-0 text-sm text-ink-muted [overflow-wrap:anywhere]">{sym(r.q)}</span>
      <span className="col-start-2 min-w-0 md:col-start-auto">
        <span
          className={cn(
            "rounded-lg bg-clay-tint px-1.5 py-0.5 font-mono text-[0.95em] tabular-nums [box-decoration-break:clone] [overflow-wrap:anywhere]",
            r.hl ? "text-clay-ink" : "text-ink",
            r.strong ? "font-bold" : "font-semibold",
          )}
        >
          {sym(r.a)}
        </span>
      </span>
      {r.w && <span className="col-start-2 min-w-0 text-sm text-ink-muted [overflow-wrap:anywhere] md:col-start-auto">{sym(r.w)}</span>}
    </li>
  );
}

const cell = "whitespace-nowrap border border-line px-2 py-2 text-right first:text-left";

/** The joint table or distribution behind the answers. The first cell of each body row is its header. */
function WorkTable({ table: t }: { table: Table }) {
  return (
    // Focusable, so the table can be scrolled sideways from the keyboard on a phone.
    <div role="region" aria-label="Work table" tabIndex={0} className="min-w-0 overflow-x-auto overscroll-x-contain rounded-sm focus-visible:outline-2 focus-visible:outline-clay">
      <table className="w-full border-collapse font-mono text-sm tabular-nums">
        <thead className="bg-sand">
          <tr>
            {t.head.map((h, i) => (
              <th key={i} scope="col" className={cn(cell, "font-semibold")}>
                {h || <span className="sr-only">Case</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) =>
                j ? (
                  <td key={j} className={cell}>
                    {sym(c)}
                  </td>
                ) : (
                  <th key={j} scope="row" className={cn(cell, "font-semibold")}>
                    {sym(c)}
                  </th>
                ),
              )}
            </tr>
          ))}
        </tbody>
        {t.foot && (
          <tfoot className="bg-sand">
            <tr>
              {t.foot.map((c, i) => (
                <td key={i} className={cn(cell, "font-semibold")}>
                  {sym(c)}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
