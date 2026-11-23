import { DATA, TOPICS } from "./data";
import { stripTags } from "./math";
import { study } from "./routes";

// The formula sheet and the glossary: their titles, descriptions and sections, shared by their pages
// (app/learn/formulas/, app/learn/terms/) and their Markdown twins (scripts/lib/markdown.ts).

export const FORMULAS_PAGE = {
  path: study.formulas,
  title: "Statistics formula sheet",
  description: "A statistics formula sheet: every core formula, when to use it and a worked example. Built to print, free.",
};
export const TERMS_PAGE = {
  path: study.terms,
  title: "Statistics terms",
  description: "A statistics glossary: every key word in plain English, with a quick example.",
};

/** One line of the sheet: what it is, the formula or rule, and its worked example (or the rest of it). */
export type SheetLine = { t: string; f: string; x: string };
/** A fold on the sheet. `kind` says what the third column holds: a worked example, what a hook stands for, or the rest of a trap. */
export type SheetSection = { id: string; title: string; kw: string; kind: "hooks" | "topic" | "traps"; rows: SheetLine[] };

export const SHEET_SECTIONS: SheetSection[] = [
  { id: "sh-hooks", title: "Memory hooks", kw: "", kind: "hooks", rows: DATA.hooks.map(([a, b, f, x]) => ({ t: `${a}, ${b}`, f, x })) },
  ...TOPICS.map((t) => ({
    id: `sh-${t.id}`,
    title: `${t.n}. ${t.name}`,
    kw: t.keywords ?? "",
    kind: "topic" as const,
    rows: (DATA.sheet[t.id] ?? []).map(([name, f, x, alias]) => ({ t: alias ? `${name}, ${alias}` : name, f, x })),
  })),
  {
    id: "sh-traps",
    title: "Traps",
    kw: "",
    kind: "traps",
    rows: TOPICS.map((t) => {
      const s = stripTags(t.trap), dot = s.indexOf(". ");
      return { t: `${t.n}. ${t.short}`, f: dot > 0 ? s.slice(0, dot + 1) : s, x: dot > 0 ? s.slice(dot + 2) : "" };
    }),
  },
];
