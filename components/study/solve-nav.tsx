"use client";

import * as React from "react";
import Link from "next/link";
import { chip } from "@/components/study/ui";

/** The sticky row of solver chips. The current one scrolls into the middle on phones. */
export function SolveNav({ items, current }: { items: { href: string; label: string }[]; current: string }) {
  const ref = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    const nav = ref.current, a = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav && a) nav.scrollLeft = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
  }, [current]);
  return (
    <nav
      ref={ref}
      aria-label="Solvers"
      className="sticky top-[calc(env(safe-area-inset-top,0px)+56px)] z-10 -mx-4 flex gap-2 overflow-x-auto border-b border-line bg-paper/92 px-4 py-2.5 backdrop-blur-md [scrollbar-width:none] md:-mx-6 md:px-6 lg:top-16 print:hidden [&::-webkit-scrollbar]:hidden"
    >
      {items.map((it) => (
        <Link key={it.href} href={it.href} scroll={false} aria-current={it.href === current ? "page" : undefined} className={chip}>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
