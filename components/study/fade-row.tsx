"use client";

import * as React from "react";

/**
 * A row that scrolls sideways (segmented links on a phone). The edge with more to see fades out, so a cut-off
 * tab reads as "there is more" instead of a mistake, and the current item is scrolled into view on load.
 */
export function FadeRow({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLUListElement>(null);
  const [more, setMore] = React.useState<"start" | "end" | "both" | undefined>();
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const start = el.scrollLeft > 2;
      const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
      setMore(start && end ? "both" : start ? "start" : end ? "end" : undefined);
    };
    const current = el.querySelector<HTMLElement>("[aria-current=page]");
    if (current && el.scrollWidth > el.clientWidth) el.scrollLeft = Math.max(0, current.offsetLeft - el.clientWidth / 2 + current.offsetWidth / 2);
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, []);
  return (
    <ul ref={ref} data-more={more} className={`fade-x ${className ?? ""}`}>
      {children}
    </ul>
  );
}
