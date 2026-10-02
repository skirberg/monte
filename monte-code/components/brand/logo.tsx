import { cn } from "cn";
import { SITE_NAME } from "@/lib/seo";

/** Three cups of the shell game, left to right (x on a 32 grid). The grain hides under the last one. */
export const CUPS = [6.5, 16, 25.5] as const;
export const CUP_R = 4.2;

/**
 * The Monte mark: three cups seen from above, with one clay grain (the ball, the data point)
 * under the third. Monte Carlo, Monty Hall's doors and three-card monte in one picture. See DESIGN.md, "Mark".
 */
export function Mark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {CUPS.map((x) => (
        <circle key={x} cx={x} cy="16" r={CUP_R} fill="none" stroke="var(--ink)" strokeWidth="2.6" />
      ))}
      <circle cx={CUPS[2]} cy="16" r="1.9" fill="var(--clay)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark className="size-8" />
      <span
        className="font-display text-[1.3rem] font-[680] leading-none tracking-[-0.04em]"
        style={{ fontVariationSettings: "'wdth' 88" }}
      >
        {SITE_NAME}
      </span>
    </span>
  );
}
