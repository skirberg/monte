"use client";

import * as React from "react";
import { readNumber, warranty } from "@/lib/decide/math";
import { useMediaQuery } from "@/lib/hooks";
import { ChanceMeter, HowItWorks, NumField, Presets, Stat, Stats, chance, useToolXp } from "@/components/decide/fields";

type Preset = { label: string; note: string; price: string; chance: string; loss: string; deductible: string };

/** Made-up but believable prices and chances. */
const PRESETS: Preset[] = [
  {
    label: "Phone protection plan",
    note: "Two years of cover for $180, or $7.50 a month. Say 1 in 5 people break or lose a phone in two years. A new one costs $800; with the plan you still pay a $99 deductible.",
    price: "180",
    chance: "20",
    loss: "800",
    deductible: "99",
  },
  {
    label: "Rental car damage waiver",
    note: "$25 a day for a five-day rental. Damage is rare, about 2 in 100 rentals, but a dent plus the company's fees can run $3,000.",
    price: "125",
    chance: "2",
    loss: "3,000",
    deductible: "0",
  },
  {
    label: "Extended appliance warranty",
    note: "Three extra years on a new fridge for $150. Most fridges need no covered repair in those years; say 8 in 100 do, at about $350.",
    price: "150",
    chance: "8",
    loss: "350",
    deductible: "0",
  },
];

/** Dollars, with cents only when there are some: $160, $199.80. */
const cash = (v: number) => {
  if (!Number.isFinite(v)) return "?";
  const r = Math.round(Math.abs(v) * 100) / 100;
  const t = r.toLocaleString("en-US", { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 });
  return `${v < 0 && r > 0 ? "−" : ""}$${t}`;
};

export function Warranty() {
  const [preset, setPreset] = React.useState(0);
  const [price, setPrice] = React.useState(PRESETS[0].price);
  const [pText, setPText] = React.useState(PRESETS[0].chance);
  const [loss, setLoss] = React.useState(PRESETS[0].loss);
  const [ded, setDed] = React.useState(PRESETS[0].deductible);
  const [cushion, setCushion] = React.useState("1,500");
  const xp = useToolXp("warranty");

  const choose = (i: number) => {
    const p = PRESETS[i];
    setPreset(i);
    setPrice(p.price);
    setPText(p.chance);
    setLoss(p.loss);
    setDed(p.deductible);
    xp();
  };
  const edit = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPreset(-1);
    xp();
  };

  const P = readNumber(price);
  const p = readNumber(pText) / 100;
  const L = readNumber(loss);
  const D = ded.trim() === "" ? 0 : readNumber(ded);
  const cash0 = cushion.trim() === "" ? NaN : readNumber(cushion);
  const errors = [
    !(P >= 0) && "The price is $0 or more.",
    !(p >= 0 && p <= 1) && "The chance runs from 0% to 100%.",
    !(L > 0) && "The cost if it happens is above $0.",
    !(D >= 0 && D <= L) && "The deductible is between $0 and the full cost.",
  ].filter(Boolean) as string[];
  const ok = errors.length === 0;
  const w = ok ? warranty(P, p, L, D) : null;
  const beShown = w && Number.isFinite(w.breakEven) && w.breakEven <= 1;
  const cheaper = w ? (w.extra > 0.005 ? "skip" : w.extra < -0.005 ? "buy" : "even") : null;
  const hurts = Number.isFinite(cash0) && cash0 >= 0 && L > cash0;

  let read = "Fix the numbers to compare the two choices.";
  if (w) {
    read =
      cheaper === "skip"
        ? `Skipping the plan costs ${cash(w.extra)} less on average. The plan only pays on average if the chance is above ${beShown ? chance(w.breakEven, 1) : "100%"}, and you put it at ${chance(p, 1)}.`
        : cheaper === "buy"
          ? `The plan costs ${cash(-w.extra)} less on average, because your ${chance(p, 1)} chance is above the ${chance(w.breakEven, 1)} break-even. Plans priced this well are rare, so check the chance and the cost.`
          : "The two choices cost about the same on average.";
    if (hurts) {
      read += ` But ${cash(L)} is more than the ${cash(cash0)} you could cover. If a bill that size would really hurt, paying a little extra to rule it out can be the right call. That is what insurance is for.`;
    } else if (Number.isFinite(cash0) && cheaper !== "buy") {
      read += ` You could pay ${cash(L)} from the ${cash(cash0)} you have, so this is a loss you can absorb. Skipping plans like this one and keeping the money tends to win across many of them.`;
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-2">
            <Presets label="Example plans" items={PRESETS.map((x) => x.label)} value={preset} onChange={choose} />
            <p className="text-sm text-ink-muted">{preset >= 0 ? `${PRESETS[preset].note} ` : ""}Made-up numbers. Change any of them.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumField id="wr-price" label="Price of the plan" prefix="$" value={price} onChange={edit(setPrice)} invalid={!(P >= 0)} describedBy="wr-hint" className="col-span-2" />
            <NumField id="wr-p" label="Chance it goes wrong" suffix="%" value={pText} onChange={edit(setPText)} invalid={!(p >= 0 && p <= 1)} describedBy="wr-hint" />
            <NumField id="wr-loss" label="Cost if it does" prefix="$" value={loss} onChange={edit(setLoss)} invalid={!(L > 0)} describedBy="wr-hint" />
            <NumField id="wr-ded" label="You still pay, with the plan" prefix="$" value={ded} onChange={edit(setDed)} invalid={!(D >= 0 && D <= L)} describedBy="wr-hint" className="col-span-2" />
          </div>
          <p id="wr-hint" className="text-sm text-ink-muted" role={ok ? undefined : "alert"}>
            {ok ? "The chance is over the whole plan, not per year. What you still pay is the deductible, if there is one." : errors.join(" ")}
          </p>
          <NumField id="wr-cushion" label="Cash you could spend on a surprise bill (optional)" prefix="$" value={cushion} onChange={(v) => { setCushion(v); xp(); }} invalid={cushion.trim() !== "" && !(cash0 >= 0)} />
        </div>

        <div className="space-y-6 lg:col-span-7">
          {w && (
            <>
              <div className="rounded-[28px] bg-sand p-4 sm:p-5">
                <CostBars skip={w.skip} buy={w.buy} worstSkip={L} worstBuy={P + D} />
              </div>
              {beShown && <ChanceMeter market={w.breakEven} mine={p} marketLabel={`break-even ${chance(w.breakEven, 1)}`} mineLabel={`your chance ${chance(p, 1)}`} />}
              <Stats className="grid-cols-2">
                <Stat k="Skip it, on average" v={cash(w.skip)} tone={cheaper === "skip" ? "clay" : undefined} sub={`${chance(p, 1)} × ${cash(L)}`} />
                <Stat k="Buy it, on average" v={cash(w.buy)} tone={cheaper === "buy" ? "clay" : undefined} sub={D > 0 ? `${cash(P)} + ${chance(p, 1)} × the ${cash(D)} you still pay` : "the price, whatever happens"} />
                <Stat k="Break-even chance" v={beShown ? chance(w.breakEven, 1) : "Never"} sub={beShown ? "above this, the plan pays on average" : "the plan costs more than it could ever save"} />
                <Stat k="The plan's markup" v={Number.isFinite(w.times) ? `${w.times.toFixed(2)}×` : "?"} sub={Number.isFinite(w.times) ? `you pay ${cash(w.times)} for each $1 it pays out, on average` : "it never pays out at this chance"} />
              </Stats>
            </>
          )}
          <p aria-live="polite" className="text-ink-muted">
            {read}
          </p>
        </div>
      </div>

      <HowItWorks
        id="wr"
        steps={[
          {
            title: "Two choices, two kinds of cost.",
            body: (
              <p>
                Skip the plan, and most of the time you pay nothing, but now and then you pay the whole bill. Buy it, and you pay a sure price every time, plus a deductible if
                something goes wrong. One is a small certain cost, the other a big uncertain one.
              </p>
            ),
          },
          {
            title: "Average each one over many tries.",
            body: (
              <p>
                Picture 100 people with the same phone. If they all skip the plan, about 20 pay $800: $16,000 in all, or $160 each on average. If they all buy it, each pays $180,
                and 20 of them pay $99 more: $199.80 each. That average is the <b>expected cost</b>.
              </p>
            ),
            math: <>skip = chance × cost · buy = price + chance × deductible · 0.20 × $800 = $160 · $180 + 0.20 × $99 = $199.80</>,
          },
          {
            title: "Find the break-even chance.",
            body: (
              <p>
                There is one chance where both choices cost the same. Above it the plan is the better deal on average; below it, skipping is. Compare it with your honest guess of
                the real chance.
              </p>
            ),
            math: <>break-even = price ÷ (cost − deductible) · $180 ÷ ($800 − $99) = 25.7%</>,
          },
          {
            title: "The seller knows the chance better than you.",
            body: (
              <p>
                A company selling cover has records of how often things break. It sets the price above the average payout, because that gap pays its staff and its profit. So most
                plans cost more than they pay out on average, often far more. The markup shows by how much.
              </p>
            ),
            math: <>markup = price ÷ (chance × (cost − deductible)) · fridge: $150 ÷ (0.08 × $350) = 5.36×</>,
          },
          {
            title: "Buy it anyway when the loss would hurt.",
            body: (
              <p>
                An average only helps if you can live through the bad case and many choices like this even out. A loss you can&rsquo;t absorb breaks that: a car crash with no
                savings, a house fire, a big medical bill. Turning a loss that would ruin you into a small sure cost is worth paying extra for. Small losses you could cover, like a
                phone or a fridge repair, are the ones to cover yourself: keep the money in savings instead.
              </p>
            ),
          },
        ]}
        after={
          <>
            <p className="font-display text-xl font-[650] !text-ink">Check what already covers you</p>
            <p>
              Before buying cover at the counter, check what you already have. Many credit cards include rental car damage cover. New products come with a maker&rsquo;s warranty,
              usually for the first year, and some cards extend it. Home and renters policies can cover theft. Paying twice for the same cover is the worst deal of all.
            </p>
            <p>For learning, not financial advice.</p>
          </>
        }
      />
    </div>
  );
}

/** Two bars on one dollar scale: the solid part is the average cost, the thin line runs to the worst case. */
function CostBars({ skip, buy, worstSkip, worstBuy }: { skip: number; buy: number; worstSkip: number; worstBuy: number }) {
  const narrow = useMediaQuery("(max-width: 639px)");
  const W = narrow ? 360 : 560;
  const L = 4;
  const R = 8;
  const max = Math.max(worstSkip, worstBuy, 1);
  const X = (v: number) => L + (v / max) * (W - L - R);
  const rows = [
    { name: "Skip it", avg: skip, worst: worstSkip, color: "var(--clay)" },
    { name: "Buy it", avg: buy, worst: worstBuy, color: "var(--ink)" },
  ];
  const rowH = 58;
  const H = rows.length * rowH + 20;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Skip it: ${cash(skip)} on average, ${cash(worstSkip)} at worst. Buy it: ${cash(buy)} on average, ${cash(worstBuy)} at worst.`}
    >
      {rows.map((r, i) => {
        const y = i * rowH + 30;
        return (
          <g key={r.name}>
            <text x={L} y={y - 10} className="font-mono" fontSize="12" fill="var(--ink)">
              {r.name}
            </text>
            <text x={W - R} y={y - 10} textAnchor="end" className="font-mono" fontSize="12" fill="var(--ink-muted)">
              {`average ${cash(r.avg)} · worst ${cash(r.worst)}`}
            </text>
            <line x1={X(0)} x2={X(r.worst)} y1={y + 7} y2={y + 7} stroke={r.color} strokeWidth={2} strokeOpacity={0.55} />
            <line x1={X(r.worst)} x2={X(r.worst)} y1={y} y2={y + 14} stroke={r.color} strokeWidth={2} strokeOpacity={0.55} />
            <rect x={X(0)} y={y} width={Math.max(2, X(r.avg) - X(0))} height={14} rx={4} fill={r.color} />
          </g>
        );
      })}
      <text x={L} y={H - 4} className="font-mono" fontSize="12" fill="var(--ink-muted)">
        Bar: the average · line: the worst case
      </text>
    </svg>
  );
}
