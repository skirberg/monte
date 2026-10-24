"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "cn";
import { DATA } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { SegNav, input } from "@/components/study/ui";

const QueryContext = React.createContext<{ query: string; setQuery: (q: string) => void }>({ query: "", setQuery: () => {} });
/** What is typed in the Learn search box. Each Learn view filters its own content by it. */
export const useLearnQuery = () => React.useContext(QueryContext).query;

const VIEWS = [
  { href: study.learn, label: "Topics", placeholder: DATA.copy.search },
  { href: study.formulas, label: "Formulas", placeholder: "Search the formula sheet" },
  { href: study.frameworks, label: "Frameworks", placeholder: "Search the frameworks" },
  { href: study.terms, label: "Terms", placeholder: "Search the terms" },
];

/** Learn: the four views as links, and one search box that filters whichever view is open. */
export function LearnFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const view = VIEWS.find((v) => v.href !== study.learn && pathname.startsWith(v.href)) ?? VIEWS[0];
  const [query, setQuery] = React.useState("");
  // A new view starts with an empty search.
  const [seen, setSeen] = React.useState(view.href);
  if (seen !== view.href) {
    setSeen(view.href);
    setQuery("");
  }
  const ctx = React.useMemo(() => ({ query, setQuery }), [query]);

  return (
    <QueryContext.Provider value={ctx}>
      <div className="flex flex-col gap-3 py-5 print:hidden lg:flex-row lg:flex-wrap lg:items-center">
        <SegNav label="Learn views" items={VIEWS} current={view.href} />
        <div className="relative lg:ml-auto lg:max-w-[760px] lg:flex-[1_1_18rem]">
          <label htmlFor="learn-find" className="sr-only">
            Search
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="learn-find"
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={view.placeholder}
            className={cn(input, "pl-9")}
          />
        </div>
      </div>
      {children}
    </QueryContext.Provider>
  );
}
