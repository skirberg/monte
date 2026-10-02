"use client";

import * as React from "react";
import { MotionConfig, motion, useInView } from "motion/react";
import { CUPS, CUP_R } from "@/components/brand/logo";

const settle = [0.2, 0.8, 0.2, 1] as const;

export function Motion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Enters once: a short rise, like a grain settling. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, delay, ease: settle }}
    >
      {children}
    </M>
  );
}

const STEPS = [
  {
    k: "Learn",
    t: "Read the one-line idea, try the example, and drag the lab until the number makes sense.",
  },
  {
    k: "Practice",
    t: "Answer timed questions with fresh numbers. Score 80% on a topic to win its match.",
  },
  {
    k: "Check",
    t: "Misses come back in Due today, and the timed closed-book mock shows how ready you are.",
  },
];

/** Three steps on one court line. Each step's grain drops onto the line as it scrolls in. */
export function LoopSteps() {
  const ref = React.useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  return (
    <ol ref={ref} className="relative grid gap-10 md:grid-cols-3 md:gap-8">
      <motion.span
        aria-hidden
        className="absolute left-0 right-0 top-[53px] hidden h-0.5 origin-left rounded-full bg-ink md:block"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, ease: settle }}
      />
      {STEPS.map((s, i) => (
        <li key={s.k} className="relative space-y-4">
          <div className="flex h-14 items-end gap-3">
            <motion.span
              aria-hidden
              className="mb-[3px] block size-[22px] rounded-full bg-clay"
              initial={{ y: -60, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ type: "spring", stiffness: 420, damping: 16, mass: 0.9, delay: 0.35 + i * 0.22 }}
            />
            <span className="mb-1 font-mono text-xs text-ink-muted tabular">0{i + 1}</span>
          </div>
          <h3 className="font-display text-4xl font-[650]" style={{ fontVariationSettings: "'wdth' 85" }}>
            {s.k}
          </h3>
          <p className="max-w-[34ch] text-ink-muted">{s.t}</p>
        </li>
      ))}
    </ol>
  );
}

/** The mark builds itself: three cups draw in turn, the grain drops under the middle one, then the shell game slides it under the last. */
export function MarkBuild({ className }: { className?: string }) {
  const ref = React.useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const shift = CUPS[1] - CUPS[2];
  return (
    <svg ref={ref} viewBox="0 0 32 32" className={className} aria-hidden>
      {CUPS.map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="16"
          r={CUP_R}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.15, ease: settle }}
        />
      ))}
      <motion.circle
        cx={CUPS[2]}
        cy="16"
        r="1.9"
        fill="var(--clay)"
        initial={{ x: shift, y: -10, opacity: 0 }}
        animate={inView ? { x: [shift, shift, shift, 0], y: [-10, 0, 0, 0], opacity: [0, 1, 1, 1] } : {}}
        transition={{ duration: 1.4, delay: 0.85, times: [0, 0.35, 0.6, 1], ease: settle }}
      />
    </svg>
  );
}
