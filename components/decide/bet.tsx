"use client";

import * as React from "react";
import { evPer100, formatOdds, impliedFromDecimal, kelly, overround, readNumber, toDecimal, type OddsFormat } from "@/lib/decide/math";
import { ChanceMeter, HowItWorks, NumField, Presets, ResultBar, Slider, Stat, Stats, Toggle, chance, dollars, signedMoney, useToolXp } from "@/components/decide/fields";
import { HOW_BET } from "@/lib/decide/how";

type Preset = { label: string; note: string; mine: string; other: string; mineName: string; otherName: string; you: number };

/** Made-up lines, typed in American odds. Not live prices. */
const PRESETS: Preset[] = [
  {
    label: "Big game, −150 / +130",
    note: "A championship game moneyline: pick who wins. The favorite is −150, the underdog +130.",
    mine: "-150",
    other: "+130",
    mineName: "Favorite",
    otherName: "Underdog",
    you: 64,
  },
  {
    label: "Coin flip, −110 / −110",
    note: "A point spread priced as an even game. Both sides are −110, so you risk $110 to win $100 either way.",
    mine: "-110",
    other: "-110",
    mineName: "Side A",
    otherName: "Side B",
    you: 50,
  },
  {
    label: "Long shot, +2000",
    note: "A team to win the whole season at +2000: a $100 bet wins $2,000. There is no single other side to compare.",
    mine: "+2000",
    other: "",
    mineName: "Long shot",
    otherName: "Field",
    you: 3,
  },
];

const FORMATS: [OddsFormat, string][] = [
  ["american", "American"],
  ["decimal", "Decimal"],
  ["fractional", "Fractional"],
];


export function Bet() {
  const [preset, setPreset] = React.useState(0);
  const [format, setFormat] = React.useState<OddsFormat>("american");
  const [mine, setMine] = React.useState(PRESETS[0].mine);
  const [other, setOther] = React.useState(PRESETS[0].other);
  const [names, setNames] = React.useState<[string, string]>([PRESETS[0].mineName, PRESETS[0].otherName]);
  const [you, setYou] = React.useState(PRESETS[0].you);
  const [bank, setBank] = React.useState("1,000");
  const xp = useToolXp("bet");

  const choose = (i: number) => {
    const p = PRESETS[i];
    setPreset(i);
    // Presets are typed in American odds; show them in whatever format is picked.
    setMine(formatOdds(format, toDecimal("american", p.mine)));
    setOther(p.other ? formatOdds(format, toDecimal("american", p.other)) : "");
    setNames([p.mineName, p.otherName]);
    setYou(p.you);
    xp();
  };

  const switchFormat = (f: OddsFormat) => {
    // Carry the same line over, so switching formats is a lesson in itself.
    const dm = toDecimal(format, mine);
    const dob = toDecimal(format, other);
    setFormat(f);
    if (dm > 1) setMine(formatOdds(f, dm));
    if (dob > 1) setOther(formatOdds(f, dob));
    xp();
  };

  const d = toDecimal(format, mine);
  const dOther = other.trim() ? toDecimal(format, other) : NaN;
  const ok = d > 1;
  const otherBad = other.trim() !== "" && !(dOther > 1);
  const implied = ok ? impliedFromDecimal(d) : NaN;
  const two = ok && dOther > 1 ? overround(implied, impliedFromDecimal(dOther)) : null;
  const p = you / 100;
  const profit = ok ? (d - 1) * 100 : NaN;
  const ev = ok ? evPer100(p, d) : NaN;
  const f = ok ? kelly(p, d) : 0;
  const bankroll = readNumber(bank);
  const bankOk = bankroll > 0;

  const bar: [string, string] = ok
    ? [chance(implied, 1), `is what the odds say. At your ${chance(p, 1)}, a $100 bet is worth ${signedMoney(ev)} on average.`]
    : ["", "Type odds to see what they mean."];
  const read = (
    <>
      {ok ? (
        <>
          {f > 0 ? `Full Kelly says ${chance(f, 1)} of your money, but your chance is a guess, so most stake half.` : "No edge, no bet."}
        </>
      ) : (
        "Type odds to see what they mean."
      )}
    </>
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-5">
          <ResultBar lead={bar[0]} rest={bar[1]} />
          <div className="space-y-2">
            <Presets label="Example lines" items={PRESETS.map((x) => x.label)} value={preset} onChange={choose} />
            <p className="text-sm text-ink-muted">Made-up lines, not live prices.</p>
          </div>
          <Toggle label="Odds format" value={format} onChange={switchFormat} options={FORMATS} />
          <div className="grid grid-cols-2 gap-3">
            <NumField
              id="bet-mine"
              label={`${names[0]}, your bet`}
              value={mine}
              onChange={(v) => { setMine(v); setPreset(-1); xp(); }}
              inputMode={format === "decimal" ? "decimal" : "text"}
              invalid={!ok}
              describedBy="bet-hint"
            />
            <NumField
              id="bet-other"
              label={`${names[1]} (optional)`}
              value={other}
              onChange={(v) => { setOther(v); setPreset(-1); xp(); }}
              inputMode={format === "decimal" ? "decimal" : "text"}
              invalid={otherBad}
              describedBy="bet-hint"
            />
          </div>
          <p id="bet-hint" className="text-sm text-ink-muted empty:hidden">
            {!ok || otherBad
              ? format === "american"
                ? "American odds are −100 or lower, or +100 or higher."
                : format === "decimal"
                  ? "Decimal odds are above 1, like 1.91."
                  : "Fractional odds look like 3/2 or 10/11."
              : ""}
          </p>

          <Slider
            id="bet-you"
            label={`Your own chance ${names[0].toLowerCase() === "long shot" ? "it comes in" : "this side wins"}`}
            value={you}
            min={0.5}
            max={99.5}
            step={0.5}
            onChange={(v) => { setYou(v); xp(); }}
            shown={chance(p, 1)}
          />
          <NumField id="bet-bank" label="Money you set aside for bets" prefix="$" value={bank} onChange={(v) => { setBank(v); xp(); }} invalid={!bankOk} />
        </div>

        <div className="space-y-6 lg:col-span-7">
          {ok && (
            <>
              <ChanceMeter market={implied} mine={p} marketLabel={`odds ${chance(implied, 1)}`} mineLabel={`you ${chance(p, 1)}`} />
              <Stats className="grid-cols-2">
                <Stat k="Odds say" v={chance(implied, 2)} sub="the chance you need just to break even" />
                <Stat k="Win on $100" v={dollars(profit)} sub={`back as ${dollars(profit + 100)} with your stake`} />
                <Stat k="Your EV per $100" v={signedMoney(ev)} tone={ev > 0.005 ? "clay" : undefined} sub="what the bet is worth on average" />
                <Stat
                  k="Stake, half Kelly"
                  v={f > 0 ? chance(f / 2, 1) : "Nothing"}
                  sub={f > 0 ? (bankOk ? `${dollars((f / 2) * bankroll)} of ${dollars(bankroll)} · full Kelly ${dollars(f * bankroll)}` : `full Kelly ${chance(f, 1)}`) : "your chance is not above the odds"}
                />
              </Stats>
              {two && (
                <Stats className="grid-cols-1 sm:grid-cols-3">
                  <Stat k="Both sides add to" v={chance(two.book, 2)} sub="a fair line adds to 100%" />
                  {two.margin >= 0 ? (
                    <Stat k="Bookmaker's margin" v={chance(two.margin, 2)} tone="clay" sub={`it keeps about ${chance(two.hold, 2)} of all money bet, if both sides get the same`} />
                  ) : (
                    <Stat k="Bookmaker's margin" v="None" sub="under 100%: these lines can't come from one book" />
                  )}
                  <Stat k="Fair chances" v={`${chance(two.fairA, 1)} · ${chance(two.fairB, 1)}`} sub="with the margin taken out" />
                </Stats>
              )}
            </>
          )}
          {/* Phones already have the answer in the sticky result bar, so the longer reading is for wide screens. */}
          <p className="hidden text-ink-muted lg:block">
            {read}
          </p>
        </div>
      </div>

      <HowItWorks id="bet" {...HOW_BET} />
    </div>
  );
}
