import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";
import { symHtml } from "@/lib/study/symbols";

// The study app's small kit, in Tailwind: pill buttons, chips, segmented links, boxes, the clay
// value mark and the trusted-HTML span. Clay means the number. Ink means the action.

// Buttons come from the site's one button system (app/globals.css, DESIGN.md "Buttons").
const svg = "[&_svg]:size-4 [&_svg]:shrink-0";
export const btn = {
  primary: cn("btn btn-primary", svg),
  ghost: cn("btn btn-secondary", svg),
  /** Pressed state: ink fill (Listen while it plays). */
  on: "aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper",
};

export const chip =
  "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-sm text-ink transition-colors duration-150 hover:border-ink aria-pressed:border-ink aria-pressed:bg-clay-tint aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper";

export const linkBtn = "inline-flex min-h-8 items-center gap-1.5 text-sm text-clay-ink underline-offset-4 hover:underline";

/** A row of sibling pages that looks like a segmented control. Links, so each view is a real URL. */
export function SegNav({ label, items, current }: { label: string; items: { href: string; label: string }[]; current: string }) {
  return (
    <nav aria-label={label} className="max-w-full">
      <ul className="flex gap-0.5 overflow-x-auto overscroll-x-contain rounded-full bg-sand p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <li key={it.href} className="flex-none">
            <Link
              href={it.href}
              aria-current={it.href === current ? "page" : undefined}
              className="flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-base text-ink-muted transition-colors hover:text-ink sm:px-4 sm:text-base aria-[current=page]:bg-paper aria-[current=page]:text-ink aria-[current=page]:shadow-[0_1px_2px_color-mix(in_oklch,var(--ink)_18%,transparent),0_0_0_1px_var(--line)]"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Pressed-state toggle buttons in the same segmented look (quick math levels). */
export const segBtn =
  "flex min-h-11 flex-none items-center whitespace-nowrap rounded-full px-3 text-base text-ink-muted transition-colors hover:text-ink sm:px-4 sm:text-base aria-pressed:bg-paper aria-pressed:text-ink aria-pressed:shadow-[0_1px_2px_color-mix(in_oklch,var(--ink)_18%,transparent),0_0_0_1px_var(--line)]";

export function Box({ subtle, className, ...rest }: React.ComponentProps<"div"> & { subtle?: boolean }) {
  return <div className={cn("rounded-[18px] p-5 md:p-6", subtle ? "bg-sand" : "border border-line bg-paper", className)} {...rest} />;
}

/** Labels: sentence case, plain sans, muted. One style everywhere (DESIGN.md, Type scale). Never caps or letter-spaced. */
export const label = "text-sm font-medium text-ink-muted";
export const eyebrow = label;
export const blockTitle = "font-display text-heading font-semibold";
export const h1 = "font-display text-headline font-semibold leading-tight [font-variation-settings:'wdth'_88]";
export const lead = "text-lead leading-normal";
export const input =
  "min-h-11 w-full min-w-0 rounded-xl border border-line-strong bg-paper px-3 text-base text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-ink-muted focus:border-clay focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--clay)_25%,transparent)] focus:outline-none";
export const divided = "divide-y divide-line border-y border-line";

/**
 * Study content with a little trusted inline HTML (<mark>, <b>, <sup>). The strings come from
 * lib/study/data.json, which only this repo writes, never from visitors.
 */
export function Html({ html, as: Tag = "span", className }: { html: string; as?: "span" | "p" | "div"; className?: string }) {
  return <Tag className={cn("[&_mark]:rounded-[4px] [&_mark]:bg-clay-tint [&_mark]:px-[0.15em] [&_mark]:text-ink [&_mark]:[box-decoration-break:clone]", className)} dangerouslySetInnerHTML={{ __html: symHtml(html) }} />;
}

export function PageHead({ title, children, as: Tag = "h1" }: { title: string; children?: React.ReactNode; as?: "h1" | "h2" }) {
  return (
    <div className="grid gap-2">
      <Tag className={h1}>{title}</Tag>
      {children}
    </div>
  );
}

/**
 * Progressive disclosure: anything that is not the page's one job starts folded behind one row with a one-line teaser.
 * A native <details>, so it works before hydration and the browser's find-in-page opens it. The heading sits in the
 * summary, so the outline still reads in order. Pass `open` and `onToggle` to control it (a search that should open it).
 */
export function Fold({
  title,
  teaser,
  children,
  id,
  open,
  onToggle,
  level = "h2",
  className,
  bodyClassName,
  flat,
}: {
  title: React.ReactNode;
  teaser?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  level?: "h2" | "h3";
  className?: string;
  bodyClassName?: string;
  /** A row in a divided list instead of a box: for accordions of many sections. */
  flat?: boolean;
}) {
  const H = level;
  return (
    <details
      id={id}
      open={open}
      onToggle={onToggle ? (e) => onToggle(e.currentTarget.open) : undefined}
      className={cn("group scroll-mt-24", flat ? "border-b border-line" : "rounded-[18px] border border-line", className)}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-4 transition-colors [&::-webkit-details-marker]:hidden",
          flat ? "min-h-12 py-2.5 hover:text-clay-ink" : "min-h-14 rounded-[18px] px-4 py-3 hover:bg-sand md:px-5",
        )}
      >
        <span className="grid min-w-0 gap-0.5">
          <H className="font-display text-lg font-semibold leading-snug">{title}</H>
          {teaser && <span className="text-sm text-ink-muted">{teaser}</span>}
        </span>
        <ChevronDown aria-hidden className="size-5 flex-none text-ink-muted transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className={cn(flat ? "pb-5 pt-1" : "px-4 pb-5 pt-1 md:px-5", bodyClassName)}>{children}</div>
    </details>
  );
}
