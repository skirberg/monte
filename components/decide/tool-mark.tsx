import type { CSSProperties } from "react";

/**
 * Each decision's mark, drawn like the game marks (components/play/game-art.tsx): grains and one line, clay for the
 * number that matters. They move the same way, from the same rules in app/globals.css (".ga").
 */

const at = (i: number) => ({ "--i": i }) as CSSProperties;

export function ToolMark({ id, className = "w-full" }: { id: string; className?: string }) {
  const svg = (children: React.ReactNode) => (
    <svg viewBox="0 0 100 80" className={`ga ${className}`} aria-hidden>
      {children}
    </svg>
  );

  if (id === "choose") {
    // two options as two piles of futures: a narrow sure one and a wide risky one
    const a = [6, 14, 24, 14, 6];
    const b = [4, 8, 12, 16, 12, 8, 4];
    return svg(
      <>
        {a.map((h, i) => <rect key={`a${i}`} className="ga-rise" style={at(i)} x={10 + i * 7} y={66 - h * 2} width={5.5} height={h * 2} rx={1.5} fill="var(--ink)" />)}
        {b.map((h, i) => <rect key={`b${i}`} className="ga-rise" style={at(i + 2)} x={46 + i * 7} y={66 - h * 2} width={5.5} height={h * 2} rx={1.5} fill="var(--clay)" />)}
        <line x1={6} x2={96} y1={68} y2={68} stroke="var(--ink)" strokeWidth={1.4} />
      </>,
    );
  }

  if (id === "warranty")
    // a seesaw: the price on one end outweighs the average cost on the other
    return svg(
      <>
        <g className="ga-tilt" style={{ rotate: "-7deg" }}>
          <rect x={14} y={30} width={20} height={16} rx={3} fill="var(--ink)" />
          <rect x={68} y={38} width={16} height={8} rx={2.5} fill="var(--clay)" />
          <line x1={8} x2={92} y1={47.5} y2={47.5} stroke="var(--ink)" strokeWidth={3} strokeLinecap="round" />
        </g>
        <path d="M50 49 L42 66 L58 66 Z" fill="var(--sand-2)" stroke="var(--ink)" strokeWidth={1.4} strokeLinejoin="round" />
      </>,
    );

  if (id === "bet")
    // a die: a chance you can count
    return svg(
      <g className="ga-tilt">
        <rect x={30} y={12} width={40} height={40} rx={9} fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.8} />
        {[[40, 22], [60, 22], [50, 32], [40, 42], [60, 42]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.6} fill={i === 2 ? "var(--clay)" : "var(--ink)"} />
        ))}
      </g>,
    );

  if (id === "market")
    // a price is a chance: 30¢ on a 0 to 100 scale
    return svg(
      <>
        <line x1={10} x2={90} y1={44} y2={44} stroke="var(--line-strong)" strokeWidth={6} strokeLinecap="round" />
        <line className="ga-grow-l" x1={10} x2={34} y1={44} y2={44} stroke="var(--clay)" strokeWidth={6} strokeLinecap="round" />
        {[10, 30, 50, 70, 90].map((x) => <line key={x} x1={x} x2={x} y1={54} y2={58} stroke="var(--ink-muted)" strokeWidth={1.2} />)}
        <circle className="ga-pop" style={at(4)} cx={34} cy={44} r={6.5} fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.8} />
        <text x={34} y={30} textAnchor="middle" fontSize="10" className="font-mono" fill="var(--ink)">30¢</text>
      </>,
    );

  if (id === "option")
    // a stock wanders and ends past the strike
    return svg(
      <>
        <line x1={6} x2={96} y1={34} y2={34} stroke="var(--ink)" strokeWidth={1.3} strokeDasharray="3 3" />
        <path className="ga-draw" pathLength={1} d="M8 56 L18 50 L26 54 L36 44 L46 48 L56 38 L66 41 L76 28 L86 24" fill="none" stroke="var(--ink)" strokeWidth={1.8} strokeLinejoin="round" />
        <circle className="ga-pop" style={at(5)} cx={86} cy={24} r={4} fill="var(--clay)" />
      </>,
    );

  if (id === "bayes") {
    // 60 people tested: the one who has it, and the false alarms flagged beside them
    const sick = new Set([27]);
    const flagged = new Set([8, 19, 41, 52, 33]);
    return svg(
      Array.from({ length: 60 }, (_, k) => {
        const x = 14 + (k % 12) * 6.6;
        const y = 18 + Math.floor(k / 12) * 11;
        if (sick.has(k)) return <circle key={k} className="ga-pop" style={at(1)} cx={x} cy={y} r={3.2} fill="var(--clay)" />;
        if (flagged.has(k)) return <circle key={k} className="ga-pop" style={at(3 + (k % 4))} cx={x} cy={y} r={2.9} fill="none" stroke="var(--clay)" strokeWidth={1.4} />;
        return <circle key={k} cx={x} cy={y} r={1.6} fill="var(--line-strong)" />;
      }),
    );
  }

  if (id === "abtest")
    // two versions, two rates: is the gap real?
    return svg(
      <>
        <rect className="ga-rise" x={24} y={34} width={20} height={32} rx={3} fill="var(--ink)" />
        <rect className="ga-rise" style={at(2)} x={56} y={24} width={20} height={42} rx={3} fill="var(--clay)" />
        <line x1={14} x2={86} y1={67} y2={67} stroke="var(--ink)" strokeWidth={1.4} />
        <text x={34} y={77} textAnchor="middle" fontSize="8" className="font-mono" fill="var(--ink-muted)">A</text>
        <text x={66} y={77} textAnchor="middle" fontSize="8" className="font-mono" fill="var(--ink-muted)">B</text>
      </>,
    );

  if (id === "goal") {
    // savings futures fan out toward a goal; some make it
    const ends = [20, 30, 40, 52, 62];
    return svg(
      <>
        {ends.map((e, i) => (
          <path key={i} className="ga-draw" style={at(i)} pathLength={1} d={`M8 64 Q 40 ${62 - i * 2} 84 ${e}`} fill="none" stroke={e <= 30 ? "var(--clay)" : "var(--line-strong)"} strokeWidth={1.6} />
        ))}
        <line x1={86} x2={86} y1={10} y2={34} stroke="var(--ink)" strokeWidth={1.6} />
        <path className="ga-pop" style={at(6)} d="M86 10 L98 15 L86 20 Z" fill="var(--clay)" />
      </>,
    );
  }

  // staffing: arrivals each hour, against what the team can serve
  const hours = [5, 8, 11, 7, 13, 9, 6, 10];
  return svg(
    <>
      {hours.map((h, i) => (
        <rect key={i} className="ga-rise" style={at(i * 0.6)} x={10 + i * 10.5} y={66 - h * 4} width={7} height={h * 4} rx={1.5} fill={h > 10 ? "var(--clay)" : "var(--ink)"} />
      ))}
      <line x1={6} x2={96} y1={26} y2={26} stroke="var(--ink)" strokeWidth={1.3} strokeDasharray="3 3" />
      <line x1={6} x2={96} y1={67} y2={67} stroke="var(--ink)" strokeWidth={1.4} />
    </>,
  );
}
