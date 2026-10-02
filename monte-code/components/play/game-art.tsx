import { hold } from "@/lib/play/tennis";

/** Small static drawings for the Play hub, one per game. Same devices as the rest of the brand: grains and one line. */

// Fixed points so the server and client draw the same thing.
const SCATTER = [
  [8, 70], [14, 62], [19, 66], [24, 55], [29, 60], [33, 49], [38, 53], [42, 44], [47, 47], [51, 40],
  [56, 43], [60, 34], [64, 38], [69, 30], [73, 33], [78, 24], [82, 28], [87, 20], [91, 22], [95, 14],
];

export function GameArt({ slug }: { slug: string }) {
  if (slug === "correlation")
    return (
      <svg viewBox="0 0 100 80" className="w-full" aria-hidden>
        {SCATTER.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.8} fill="var(--clay)" />
        ))}
        <line x1={6} y1={70} x2={97} y2={16} stroke="var(--ink)" strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    );
  if (slug === "monty-hall")
    return (
      <svg viewBox="0 0 100 80" className="w-full" aria-hidden>
        {[0, 1, 2].map((d) => (
          <g key={d}>
            <rect x={8 + d * 30} y={12} width={24} height={56} rx={5} fill={d === 1 ? "var(--sand-2)" : "var(--paper)"} stroke="var(--ink)" strokeWidth={1.6} />
            <rect x={14 + d * 30} y={60} width={12} height={2} rx={1} fill="var(--ink)" />
          </g>
        ))}
        <circle cx={80} cy={40} r={5} fill="var(--clay)" />
      </svg>
    );
  if (slug === "fake-coin") {
    const seq = "HHTHTTTTHHTHHHTTHTHH";
    return (
      <svg viewBox="0 0 100 80" className="w-full" aria-hidden>
        {seq.split("").map((c, i) => {
          const x = 10 + (i % 10) * 9;
          const y = 28 + Math.floor(i / 10) * 18;
          return c === "H" ? (
            <circle key={i} cx={x} cy={y} r={3.6} fill="var(--clay)" />
          ) : (
            <circle key={i} cx={x} cy={y} r={3} fill="none" stroke="var(--ink)" strokeWidth={1.4} />
          );
        })}
      </svg>
    );
  }
  if (slug === "house-edge") {
    // a roulette wheel: 18 clay, 18 ink, one green-free blank for the 0
    const n = 37;
    return (
      <svg viewBox="0 0 100 80" className="w-full" aria-hidden>
        {Array.from({ length: n }, (_, i) => {
          const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
          const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
          const R = 34, r = 24, cx = 50, cy = 40;
          const p = (a: number, rad: number) => `${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
          const fill = i === 0 ? "var(--paper)" : i % 2 ? "var(--clay)" : "var(--ink)";
          return <path key={i} d={`M${p(a0, r)} L${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} L${p(a1, r)} A${r} ${r} 0 0 0 ${p(a0, r)}Z`} fill={fill} stroke="var(--sand)" strokeWidth={0.6} />;
        })}
        <circle cx={50} cy={40} r={9} fill="none" stroke="var(--ink)" strokeWidth={1.6} />
        <circle cx={62} cy={18} r={2.6} fill="var(--paper)" stroke="var(--ink)" strokeWidth={1} />
      </svg>
    );
  }
  if (slug === "odds")
    return (
      <svg viewBox="0 0 100 80" className="w-full" aria-hidden>
        <rect x={10} y={22} width={41} height={14} rx={3} fill="var(--ink)" />
        <rect x={53} y={22} width={41} height={14} rx={3} fill="var(--line-strong)" />
        <rect x={86} y={22} width={8} height={14} rx={2} fill="var(--clay)" />
        <line x1={86} x2={86} y1={14} y2={46} stroke="var(--ink)" strokeWidth={1.4} strokeDasharray="2.5 2.5" />
        <text x={86} y={56} textAnchor="middle" fontSize="7" className="font-mono" fill="var(--ink-muted)">100%</text>
      </svg>
    );
  if (slug === "ab-test") {
    const ys = [10, 22, 16, 30, 24, 40, 33, 52, 45, 58, 50, 44, 49, 38];
    return (
      <svg viewBox="0 0 100 80" className="w-full" aria-hidden>
        <line x1={6} x2={96} y1={52} y2={52} stroke="var(--clay)" strokeWidth={1.4} strokeDasharray="4 3" />
        <path d={ys.map((y, i) => `${i ? "L" : "M"}${8 + i * 6.6} ${y + 6}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth={1.8} strokeLinejoin="round" />
        <circle cx={8 + 7 * 6.6} cy={58} r={3.4} fill="var(--clay)" />
      </svg>
    );
  }
  if (slug === "long-run") {
    const line = (g: number, wob: number) => {
      let d = "";
      for (let i = 0; i <= 20; i++) {
        const x = 8 + i * 4.3;
        const y = 66 - (Math.pow(1 + g, i) - 1) * 30 + Math.sin(i * 1.7 + wob) * 2.5;
        d += `${i ? "L" : "M"}${x.toFixed(1)} ${Math.max(6, y).toFixed(1)}`;
      }
      return d;
    };
    return (
      <svg viewBox="0 0 100 80" className="w-full" aria-hidden>
        {[0.01, 0.03, 0.05, 0.07].map((g, i) => (
          <path key={g} d={line(g, i)} fill="none" stroke={i === 2 ? "var(--ink)" : "var(--line-strong)"} strokeWidth={i === 2 ? 2 : 1.2} />
        ))}
        <path d={line(0.06, 9)} fill="none" stroke="var(--clay)" strokeWidth={1.6} strokeDasharray="3 3" />
      </svg>
    );
  }
  if (slug === "options") {
    const paths = [[0, 2, -1, 3, 5, 4, 8, 11], [0, -2, -1, -4, -3, -6, -5, -8], [0, 1, 3, 2, 6, 9, 8, 14], [0, -1, 1, 0, -2, 1, 2, 1], [0, 3, 2, 5, 4, 7, 6, 4]];
    return (
      <svg viewBox="0 0 100 80" className="w-full" aria-hidden>
        <line x1={8} x2={94} y1={34} y2={34} stroke="var(--ink)" strokeWidth={1.3} strokeDasharray="3 3" />
        {paths.map((p, k) => {
          const end = p[p.length - 1];
          return <path key={k} d={p.map((v, i) => `${i ? "L" : "M"}${8 + i * 12} ${40 - v * 2.2}`).join(" ")} fill="none" stroke={end > 2 ? "var(--clay)" : "var(--line-strong)"} strokeWidth={1.6} />;
        })}
        <circle cx={8} cy={40} r={2.6} fill="var(--ink)" />
      </svg>
    );
  }
  // serve: the hold curve against the diagonal
  let d = "";
  for (let i = 0; i <= 40; i++) {
    const p = 0.3 + (i / 40) * 0.6;
    d += `${i ? " L" : "M"}${(8 + ((p - 0.3) / 0.6) * 86).toFixed(1)} ${(72 - hold(p) * 64).toFixed(1)}`;
  }
  return (
    <svg viewBox="0 0 100 80" className="w-full" aria-hidden>
      <line x1={8} y1={72 - 0.3 * 64} x2={94} y2={72 - 0.9 * 64} stroke="var(--line-strong)" strokeDasharray="3 3" />
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth={1.8} />
      <circle cx={8 + ((0.6 - 0.3) / 0.6) * 86} cy={72 - hold(0.6) * 64} r={3.6} fill="var(--clay)" />
    </svg>
  );
}
