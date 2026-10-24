import { Wordmark } from "@/components/brand/logo";
import { playHref, studyHref } from "@/lib/site-data";
import { StudyBottomNav } from "@/components/study/bottom-nav";

const COLUMNS: { title: string; className?: string; links: [string, string, string?][] }[] = [
  {
    title: "Learn",
    links: [
      ["Topics", studyHref("#learn/topics")],
      ["Terms", studyHref("#learn/terms")],
      ["Formula sheet", studyHref("#learn/formulas")],
      ["Which formula?", studyHref("#learn/frameworks")],
      ["Why statistics", "/story/"],
    ],
  },
  {
    title: "Practice",
    links: [
      ["Drill", studyHref("#practice/drill")],
      ["Flashcards", studyHref("#practice/cards")],
      ["Mock exam", studyHref("#practice/drill/mock")],
      ["Quick math", studyHref("#practice/math")],
    ],
  },
  {
    title: "Apply",
    links: [
      ["Solvers", studyHref("#solve")],
      ["Excel, R, Python, SQL", studyHref("#tools")],
      ["The odds of anything", "/decide/"],
      ["Free workbook (.xlsx)", "/downloads/monte-statistics-workbook.xlsx"],
    ],
  },
  {
    title: "More",
    links: [
      ["Play", playHref(), "fun-only"],
      ["Free sources", studyHref("#sources")],
      ["How it’s built", "/built/"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 md:px-6">
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title} className={col.className}>
              <p className="mb-2 text-sm font-semibold">{col.title}</p>
              <ul className="grid text-sm text-ink-muted">
                {col.links.map(([label, href, cls]) => (
                  <li key={label} className={cls}>
                    <a className="inline-flex min-h-11 items-center hover:text-ink" href={href}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
          <Wordmark />
          <a
            href="https://github.com/skirberg"
            target="_blank"
            rel="noreferrer"
            aria-label="Sami on GitHub"
            className="grid size-11 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-ink"
          >
            {/* GitHub mark (Octicons, MIT) */}
            <svg viewBox="0 0 16 16" className="size-5" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
      </div>
      {/* Phones: room for the tab bar so it never covers the footer. */}
      <div aria-hidden className="h-[calc(57px+env(safe-area-inset-bottom,0px))] lg:hidden" />
      <StudyBottomNav site />
    </footer>
  );
}
