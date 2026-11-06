"use client";

import * as React from "react";
import { MotionConfig, motion } from "motion/react";

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
      // Position only, like .rise: the server HTML is readable before any script runs,
      // so a slow phone, a fast scroll, find-in-page or print never meets an empty section.
      initial={{ y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, delay, ease: settle }}
    >
      {children}
    </M>
  );
}
