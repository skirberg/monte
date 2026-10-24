"use client";

import * as React from "react";
import { marketBreakEven, marketEvNo, marketEvYes, readNumber } from "@/lib/decide/math";
import { ChanceMeter, HowItWorks, NumField, Presets, ResultBar, Slider, Stat, Stats, chance, signedMoney, useToolXp } from "@/components/decide/fields";

type Preset = { label: string; question: string; price: string; you: number };

/** Made-up questions and prices, to show how to read a price. Not live markets. */
const PRESETS: Preset[] = [
  { label: "Rain on parade day, 30¢", question: "Will it rain on the day of the parade?", price: "30", you: 40 },
  { label: "Film tops the box office, 72¢", question: "Will the big summer film be number one on its opening weekend?", price: "72", you: 65 },
  { label: "Long shot, 4¢", question: "Will a newcomer win the city's mayoral race?", price: "4", you: 2 },
];

const cents = (v: number) => {
  if (!Number.isFinite(v)) return "?";
  const r = Math.round(Math.abs(v) * 10) / 10;
  return `${r === 0 ? "" : v < 0 ? "−" : "+"}${r.toLocaleString("en-US", { maximumFractionDigits: 1 })}¢`;
};

export function Market() {
  const [preset, setPreset] = React.useState(0);
  const [price, setPrice] = React.useState(PRESETS[0].price);
  const [fee, setFee] = React.useState("1");
  const [you, setYou] = React.useState(PRESETS[0].you);
  const xp = useToolXp("market");

  const choose = (i: number) => {
    setPreset(i);
    setPrice(PRESETS[i].price);
    setYou(PRESETS[i].you);
    xp();
  };

  const c = readNumber(price);
  const fe = fee.trim() === "" ? 0 : readNumber(fee);
  const ok = c >= 1 && c <= 99;
  const feeOk = fe >= 0 && fe <= 20;
  const p = you / 100;
  const evYes = ok && feeOk ? marketEvYes(p, c, fe) : NaN;
  const evNo = ok && feeOk ? marketEvNo(p, c, fe) : NaN;
  const be = ok && feeOk ? marketBreakEven(c, fe) : NaN;
  // Per $100 spent on the better side: $100 buys 10,000 ÷ cost contracts, each worth its EV in cents, so dollars = EV × 100 ÷ cost.
  const better = evYes >= evNo ? "Yes" : "No";
  const cost = better === "Yes" ? c + fe : 100 - c + fe;
  const per100 = Math.max(evYes, evNo) * (100 / cost);
  const bar: [string, string] =
    ok && feeOk
      ? [
          chance(c / 100, 0),
          Math.max(evYes, evNo) > 0.05
            ? `is the crowd's chance. At your ${chance(p, 1)}, ${better} is worth ${cents(Math.max(evYes, evNo))} a contract.`
            : `is the crowd's chance. At your ${chance(p, 1)}, neither side pays after the fee.`,
        ]
      : ["", !ok ? "A price is between 1¢ and 99¢." : "Fees are between 0¢ and 20¢."];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-5">
          <ResultBar lead={bar[0]} rest={bar[1]} />
          <div className="space-y-2">
            <Presets label="Example questions" items={PRESETS.map((x) => x.label)} value={preset} onChange={choose} />
            <p className="text-sm text-ink-muted">
              {preset >= 0 ? `${PRESETS[preset].question} ` : ""}Made-up questions and prices, not live markets.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumField id="mk-price" label="Yes price" suffix="¢" value={price} onChange={(v) => { setPrice(v); setPreset(-1); xp(); }} invalid={!ok} describedBy="mk-hint" />
            <NumField id="mk-fee" label="Fee per contract" suffix="¢" value={fee} onChange={(v) => { setFee(v); xp(); }} invalid={!feeOk} describedBy="mk-hint" />
          </div>
          <p id="mk-hint" className="text-sm text-ink-muted">
            {!ok ? "A price is between 1¢ and 99¢." : !feeOk ? "Fees are between 0¢ and 20¢." : "Each contract pays $1 (100¢) if the answer is yes, and nothing if not."}
          </p>
          <Slider id="mk-you" label="Your own chance it happens" value={you} min={0.5} max={99.5} step={0.5} onChange={(v) => { setYou(v); xp(); }} shown={chance(p, 1)} />
        </div>

        <div className="space-y-6 lg:col-span-7">
          {ok && feeOk && (
            <>
              <ChanceMeter market={c / 100} mine={p} marketLabel={`crowd ${chance(c / 100, 0)}`} mineLabel={`you ${chance(p, 1)}`} />
              <Stats className="grid-cols-2">
                <Stat k="The crowd says" v={chance(c / 100, 0)} sub={`a ${c}¢ price is a ${chance(c / 100, 0)} chance`} />
                <Stat k="You need" v={chance(be, 0)} sub="to break even on Yes, fee included" />
                <Stat k="EV per Yes" v={cents(evYes)} tone={evYes > 0.05 ? "clay" : undefined} sub={`costs ${c + fe}¢ with the fee`} />
                <Stat k="EV per No" v={cents(evNo)} tone={evNo > 0.05 ? "clay" : undefined} sub={`costs ${100 - c + fe}¢ with the fee`} />
              </Stats>
            </>
          )}
          <p className="text-ink-muted">
            {ok && feeOk
              ? Math.max(evYes, evNo) > 0.05
                ? `At your ${chance(p, 1)}, ${better} is worth ${cents(Math.max(evYes, evNo))} per contract on average, or ${signedMoney(per100)} on every $100 spent. That only holds if your chance is closer to the truth than the crowd's.`
                : `At your ${chance(p, 1)}, neither side is worth buying after the fee. Your chance is too close to the crowd's.`
              : "Type a price to see what it means."}
          </p>
        </div>
      </div>

      <HowItWorks
        id="mk"
        steps={[
          {
            title: "A contract pays $1 if it happens.",
            body: (
              <p>
                A prediction market asks a yes or no question. A Yes contract pays $1 if the answer is yes and nothing if not. People buy and sell these all day, and the price
                moves.
              </p>
            ),
          },
          {
            title: "The price is the crowd's chance.",
            body: (
              <p>
                If a Yes trades at 30¢, the people trading it, together, put the chance near 30%. If they thought it was likelier, someone would pay more. It is the
                crowd&rsquo;s estimate, not a fact. Busy markets on well-known questions are often well calibrated. Small markets, long shots and questions people feel strongly
                about can be off.
              </p>
            ),
            math: <>implied chance = price ÷ 100¢ · 30¢ → 30%</>,
          },
          {
            title: "Compare with your own chance.",
            body: (
              <p>
                If you think the chance is 40% and Yes costs 30¢, then on average each contract pays 40¢ and costs 30¢. That is a 10¢ edge. If you are wrong about your 40%, the
                edge is not there.
              </p>
            ),
            math: <>EV per Yes = your chance × 100¢ − price − fee · EV per No = (1 − your chance) × 100¢ − (100¢ − price) − fee</>,
          },
          {
            title: "Count the costs.",
            body: (
              <p>
                Fees come off every contract, so you need a bigger edge than it looks. The price to buy is usually a little above the price to sell, called the <b>spread</b>.
                Your money is also tied up until the question is settled, which can take months. A 2¢ edge on a question that settles in a year is a small return.
              </p>
            ),
            math: <>break-even chance = (price + fee) ÷ 100¢</>,
          },
        ]}
      />
    </div>
  );
}
