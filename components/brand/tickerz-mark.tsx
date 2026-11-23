import * as React from "react";

/**
 * Tickerz's mark, the small "tape" finish (tickerz.com/brand: tickerz-mark-tape-3), drawn in currentColor so it
 * follows Monte's ink in light and dark. Used only to credit Tickerz as a data source; its geometry is theirs,
 * unchanged (no outline, no wordmark, no stretching).
 */
export function TickerzMark({ className }: { className?: string }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 1175 760" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`tkz-${id}`}>
          <path d="M 160 320 H 580 A 50 50 0 0 1 630 370 V 830 A 50 50 0 0 1 530 830 V 420 H 160 A 50 50 0 0 1 160 320 Z" />
          <path d="M 726.675 805.041 L 991.675 345.041 A 50 50 0 0 1 1078.325 394.959 L 813.325 854.959 A 50 50 0 0 1 726.675 805.041 Z" />
        </clipPath>
      </defs>
      <g transform="translate(-10 -220)">
        <g clipPath={`url(#tkz-${id})`} fill="currentColor">
          {Array.from({ length: 17 }, (_, i) => (
            <rect key={i} x={100} y={328.333 + i * 33.333} width={995} height={16.667} />
          ))}
        </g>
      </g>
    </svg>
  );
}
