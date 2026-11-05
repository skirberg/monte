"use client";

import * as React from "react";
import { Phi } from "@/lib/site-data";
import { Fold } from "@/components/study/ui";
import SNAPSHOT from "@/lib/play/data/markets.json";

/**
 * "The real one": what prediction markets and a polling average say about the 2026 US midterms,
 * and how to read each. Shown to teach probability. No links to markets, no trading words.
 *
 * Market prices come from scripts/fetch-markets.mjs (a build-time snapshot of Polymarket and Kalshi).
 * Polymarket allows browser requests, so the page also tries a live refresh of it; Kalshi does not,
 * so Kalshi stays at its snapshot.
 */

type Chamber = "house" | "senate";
type Pair = { dem: number; rep: number };
type Source = { id: string; name: string; asOfText: string; live?: boolean } & Record<Chamber, Pair>;

const ELECTION_DAY = "Tuesday, November 3, 2026";
/** Midnight Eastern after the vote. From here the page shows the last forecasts and grades them. */
const AFTER_VOTE = Date.parse("2026-11-04T05:00:00Z");

type Party = "dem" | "rep";
/** Settled winners, written by scripts/fetch-markets.mjs once Polymarket pays out. Empty until then. */
const RESULTS = ((SNAPSHOT as { results?: Partial<Record<Chamber, Party>> }).results ?? {}) as Partial<Record<Chamber, Party>>;
const PARTY_NAME: Record<Party, string> = { dem: "Democrats", rep: "Republicans" };

/** True once the vote is over. Read after hydration, because the static page is built before election day. */
const noSubscribe = () => () => {};
function useVoteOver() {
  return React.useSyncExternalStore(noSubscribe, () => Date.now() >= AFTER_VOTE, () => false);
}

type Polls = {
  asOfText: string;
  lead: number;
  leader: string;
  averages: { name: string; updated: string; dem: number; rep: number; lead: number }[];
  raw: { count: number; newest: string } | null;
};
/** Refreshed every day by scripts/fetch-markets.mjs from free sources: Wikipedia's table of averages and VoteHub's polls. */
const POLLS = (SNAPSHOT as { polls?: Polls }).polls ?? null;
const POLL = {
  lead: Math.abs(POLLS?.lead ?? 8.6),
  leader: POLLS?.leader ?? "Democrats",
  leaderKey: (POLLS && POLLS.lead < 0 ? "rep" : "dem") as "dem" | "rep",
};

const CHAMBERS: [Chamber, string][] = [
  ["house", "House"],
  ["senate", "Senate"],
];

const POLY_SLUG: Record<Chamber, string> = {
  house: "which-party-will-win-the-house-in-2026",
  senate: "which-party-will-win-the-senate-in-2026",
};

const isProb = (v: number) => Number.isFinite(v) && v > 0 && v < 1;
const whole = (v: number) => `${Math.round(v * 100)}%`;
/** The other side, from the same rounding, so each pair always adds to 100%. */
const rest = (dem: number) => `${100 - Math.round(dem * 100)}%`;
/** One decimal near the ends, where whole numbers would round to 0% or 100%. */
const fine = (v: number) => (v > 0.99 || v < 0.01 ? `${(v * 100).toFixed(1)}%` : whole(v));

/** Same rule as the build script: Democratic and Republican prices, scaled to add to 1. */
async function livePolymarket(signal: AbortSignal): Promise<Record<Chamber, Pair>> {
  const out = {} as Record<Chamber, Pair>;
  for (const [c] of CHAMBERS) {
    const r = await fetch(`https://gamma-api.polymarket.com/events?slug=${POLY_SLUG[c]}`, { signal });
    if (!r.ok) throw new Error(String(r.status));
    const events = await r.json();
    const markets: { groupItemTitle?: string; active?: boolean; closed?: boolean; outcomePrices?: string | string[] }[] = events?.[0]?.markets ?? [];
    const price = (party: string) => {
      const m = markets.find((x) => x.groupItemTitle === party && x.active && !x.closed);
      const p = typeof m?.outcomePrices === "string" ? JSON.parse(m.outcomePrices) : m?.outcomePrices;
      return Number(p?.[0]);
    };
    const dem = price("Democratic Party");
    const rep = price("Republican Party");
    if (!isProb(dem) || !isProb(rep) || Math.abs(dem + rep - 1) > 0.1) throw new Error("shape");
    out[c] = { dem: dem / (dem + rep), rep: rep / (dem + rep) };
  }
  return out;
}

function useMarkets(over: boolean) {
  const [sources, setSources] = React.useState<Source[]>(SNAPSHOT.sources as Source[]);
  React.useEffect(() => {
    // After the vote the snapshot is the record: a settled market's price is the result, not a forecast.
    if (over) return;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 6000);
    livePolymarket(ctl.signal)
      .then((live) => {
        const t = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        setSources((s) => s.map((x) => (x.id === "polymarket" ? { ...x, ...live, live: true, asOfText: `live at ${t} your time` } : x)));
      })
      // No network, blocked, or a changed reply: the snapshot stays, quietly.
      .catch(() => {})
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, [over]);
  return sources;
}

/** Two equal-weight segments in the same neutral tone; the party names carry the meaning, not color. */
function Split({ pair }: { pair: Pair }) {
  return (
    <div aria-hidden="true" className="flex h-3 gap-1">
      <span className="rounded-full bg-line-strong" style={{ flexGrow: pair.dem, flexBasis: 0 }} />
      <span className="rounded-full bg-line-strong" style={{ flexGrow: pair.rep, flexBasis: 0 }} />
    </div>
  );
}

function MarketCard({ chamber, label, sources }: { chamber: Chamber; label: string; sources: Source[] }) {
  return (
    <div className="space-y-5 rounded-2xl bg-paper p-5">
      <h4 className="font-display text-xl font-[650]">Who controls the {label}</h4>
      <ul className="space-y-5">
        {sources.map((s) => {
          const pr = s[chamber];
          return (
            <li key={s.id} className="space-y-2">
              <p className="sr-only">
                {s.name}: {whole(pr.dem)} chance Democrats control the {label}, {rest(pr.dem)} chance Republicans do.
              </p>
              <p aria-hidden="true" className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                {s.name}
              </p>
              <div aria-hidden="true" className="flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-sm tabular">
                <span>Democrats {whole(pr.dem)}</span>
                <span>Republicans {rest(pr.dem)}</span>
              </div>
              <Split pair={pr} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RealRace() {
  const over = useVoteOver();
  const sources = useMarkets(over);
  // The markets for the same party the poll average has ahead.
  const house = sources.map((s) => ({ name: s.name, p: s.house[POLL.leaderKey] }));
  const say = over ? "said" : "say";

  return (
    <Fold
      title="The real one"
      teaser={over ? `US midterms, ${ELECTION_DAY}: the last forecasts, and how they did.` : `US midterms, ${ELECTION_DAY}: what the markets and the polls say.`}
      bodyClassName="space-y-8"
    >
      {over && <Results sources={sources} />}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted">What the markets {say}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHAMBERS.map(([c, l]) => (
              <MarketCard key={c} chamber={c} label={l} sources={sources} />
            ))}
          </div>
          <p className="text-sm text-ink-muted">
            How to read it: a market trades a contract worth $1 if something happens. A price of 67 cents means traders, together, put the chance at about 67%. Each number
            here is the middle of the current price range, scaled so the two parties add to 100%.
          </p>
          <p className="font-mono text-xs leading-relaxed text-ink-muted">
            {sources.map((s) => `${s.name}, ${s.asOfText}`).join(" · ")}
            <br />
            Shown to teach probability, not betting advice.
          </p>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted">What the polls {say}</h3>
          <div className="space-y-3 rounded-2xl bg-sand p-5">
            <p className="font-display text-[clamp(1.9rem,1.2rem+2.4vw,2.6rem)] font-[650] leading-none tracking-[-0.02em] tabular-nums">
              {POLL.leader} +{POLL.lead}
            </p>
            <p className="text-ink-muted">
              The average of {POLLS?.averages.length ?? "several"} poll averages for the generic congressional ballot.
            </p>
            {POLLS && (
              <ul className="divide-y divide-line text-sm">
                {POLLS.averages.map((a) => (
                  <li key={a.name} className="flex items-baseline justify-between gap-3 py-1.5">
                    <span>{a.name}</span>
                    <span className="tabular-nums text-ink-muted">
                      {a.lead >= 0 ? "D" : "R"} +{Math.abs(a.lead)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-ink-muted">
              {POLLS ? `Each average as listed on Wikipedia, checked ${POLLS.asOfText}.` : ""}
              {POLLS?.raw ? ` Behind them: ${POLLS.raw.count} recent public polls in VoteHub's free data, the newest from ${POLLS.raw.newest}.` : ""}
            </p>
          </div>
          <p className="text-sm text-ink-muted">
            How to read it: the generic ballot asks which party you would vote for in your House district. It measures the national vote share, not seats. Other averages to
            compare: the list above. When averages built different ways agree, trust them more.
          </p>
          <p className="text-sm text-ink-muted">
            The Senate has no national poll to read. Only a third of the seats are up, and each one is its own state race, so read state polls one at a time.
          </p>
        </div>
      </div>

      <PollToProbability markets={house} />
    </Fold>
  );
}

/** (forecast − outcome)², averaged. 0 is perfect; always saying 50% scores 0.25. */
const brier = (p: number, won: boolean) => (p - (won ? 1 : 0)) ** 2;

/** After the vote: the result once it is settled, and how to grade a forecast against one result. */
function Results({ sources }: { sources: Source[] }) {
  const settled = CHAMBERS.filter(([c]) => RESULTS[c]);
  return (
    <div className="space-y-4 rounded-2xl bg-sand p-5 md:p-6">
      <h3 className="font-display text-2xl font-[650]">{settled.length ? "The results" : "The vote is in. The count isn't, yet."}</h3>
      {settled.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {settled.map(([c, label]) => {
            const w = RESULTS[c]!;
            return (
              <li key={c} className="space-y-2 rounded-2xl bg-paper p-5">
                <p className="font-display text-xl font-[650]">
                  {PARTY_NAME[w]} won the {label}
                </p>
                <ul className="space-y-1 font-mono text-sm tabular">
                  {sources.map((s) => (
                    <li key={s.id} className="flex flex-wrap justify-between gap-x-3">
                      <span>
                        {s.name} gave it {whole(s[c][w])}
                      </span>
                      <span className="text-ink-muted">Brier {brier(s[c][w], true).toFixed(3)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-ink-muted">The numbers below are the last ones before polls closed. The result shows here once the markets settle.</p>
      )}
      <p className="max-w-[62ch]">
        <b className="font-semibold">How to grade a forecast.</b> One result can&rsquo;t prove a 70% call right or wrong: a good forecaster&rsquo;s 70% calls should come true about
        7 times in 10, and miss the other 3. To score a single call, use the Brier score, (forecast − outcome)², where the outcome is 1 if it happened and 0 if not. Lower is
        better. Saying 50% every time scores 0.25.
      </p>
    </div>
  );
}

function PollToProbability({ markets }: { markets: { name: string; p: number }[] }) {
  const ps = markets.map((m) => Math.round(m.p * 100));
  const lo = Math.min(...ps);
  const hi = Math.max(...ps);
  const marketText = !ps.length ? "?" : lo === hi ? `${lo}%` : `${lo} to ${hi}%`;
  const market = ps.length ? markets.reduce((s, m) => s + m.p, 0) / markets.length : null;
  const [leadText, setLead] = React.useState(String(POLL.lead));
  const [moeText, setMoe] = React.useState("6.2");
  const lead = Number.parseFloat(leadText);
  const moe = Number.parseFloat(moeText);
  const valid = Number.isFinite(lead) && lead >= 0 && lead <= 50 && Number.isFinite(moe) && moe > 0 && moe <= 50;
  const se = moe / 1.96;
  const implied = valid ? Phi(lead / se) : null;
  // The margin that would make the poll say what the market says: lead / z, where Φ(z) is the market price.
  const zMarket = market !== null && market > 0.5 && market < 1 ? invPhi(market) : null;
  const moeMatch = valid && zMarket ? (1.96 * lead) / zMarket : null;

  const field = "h-12 w-full rounded-xl border border-line-strong bg-paper px-3 font-mono text-lg tabular text-ink outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-clay";

  return (
    <div className="grid gap-6 border-t border-line pt-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-5">
        <h3 className="font-display text-2xl font-[650]">Turn a poll lead into a chance</h3>
        <p className="text-ink-muted">
          If the lead is roughly normal around the true lead, the chance the leader is really ahead is <code className="rounded-md bg-sand px-1.5 py-0.5 font-mono text-[0.92em]">Φ(lead ÷ SE)</code>, where SE is the margin
          of error on the lead divided by 1.96.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="real-lead" className="text-sm text-ink-muted">
              Poll lead, points
            </label>
            <input id="real-lead" type="number" inputMode="decimal" min={0} max={50} step={0.1} value={leadText} onChange={(e) => setLead(e.target.value)} className={field} />
          </div>
          <div className="space-y-1">
            <label htmlFor="real-moe" className="text-sm text-ink-muted">
              Margin on the lead, ±
            </label>
            <input id="real-moe" type="number" inputMode="decimal" min={0.1} max={50} step={0.1} value={moeText} onChange={(e) => setMoe(e.target.value)} aria-describedby="real-moe-hint" className={field} />
          </div>
        </div>
        <p id="real-moe-hint" className="text-sm text-ink-muted">
          ±6.2 is one poll of 1,000 people: ±3.1 on each share, doubled for the lead. An average of many polls has a smaller one.
        </p>
      </div>

      <div className="space-y-4 lg:col-span-7">
        {/* One short live sentence for the number that changes as you type; the tiles themselves stay quiet. */}
        <p className="sr-only" aria-live="polite">
          {implied === null ? "" : `Polls, if only luck mattered: ${fine(implied)}.`}
        </p>
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2">
          <div className="bg-paper p-5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">Polls, if only luck mattered</dt>
            <dd className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] tabular">{implied === null ? "?" : fine(implied)}</dd>
            <dd className="mt-1 text-xs text-ink-muted">{implied === null ? "Enter a lead from 0 to 50 and a margin above 0." : "chance the leader truly leads the vote"}</dd>
          </div>
          <div className="bg-paper p-5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">Markets, House control</dt>
            <dd className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] tabular">{marketText}</dd>
            <dd className="mt-1 text-xs text-ink-muted">chance the same party wins the House · {markets.map((m) => `${m.name} ${whole(m.p)}`).join(" · ")}</dd>
          </div>
        </dl>
        {moeMatch !== null && lead > 0 && (
          <p className="text-sm text-ink-muted">
            To get the markets&rsquo; {marketText} from a {lead}-point lead, the margin on the lead would have to be about ±{moeMatch.toFixed(1)} points.
          </p>
        )}
        <div className="max-w-[62ch] space-y-2">
          <p>
            <b className="font-semibold">Why they disagree.</b> A poll measures today&rsquo;s vote share, and its margin only counts the luck of who got asked. A market prices the final
            result, so it also weighs turnout, how district lines turn votes into seats, and the chance that every poll misses the same way. Winning the national vote is not the
            same as winning the House. That is why a 2-point poll lead is not a 2% edge, and why a big lead is still not a sure thing.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Inverse of Φ by bisection; plenty for one number on screen. */
function invPhi(p: number) {
  let lo = -8;
  let hi = 8;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (Phi(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
