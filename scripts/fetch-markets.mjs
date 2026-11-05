// Snapshot of prediction market prices for control of the US House and Senate, 2026.
// Writes lib/play/data/markets.json for the Election night page ("The real one").
//
// Safe as a prebuild step: it never fails the build. Each source is fetched on its own;
// a source that errors, times out or returns an odd shape keeps its last saved numbers
// and its last saved date. The file is only written when it would be valid.
//
// Sources (public, read only, no keys):
//   Polymarket Gamma API  gamma-api.polymarket.com/events?slug=...   price = outcomePrices[0] (their midpoint)
//   Kalshi trade-api v2   api.elections.kalshi.com/.../markets       price = midpoint of yes bid and yes ask

import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { polymarketWinner } from "./market-result.mjs";

const OUT = fileURLToPath(new URL("../lib/play/data/markets.json", import.meta.url));
const TIMEOUT = 8000;
const CHAMBERS = ["house", "senate"];

const POLY = { house: "which-party-will-win-the-house-in-2026", senate: "which-party-will-win-the-senate-in-2026" };
const KALSHI = { house: "CONTROLH-2026", senate: "CONTROLS-2026" };

const isProb = (v) => typeof v === "number" && Number.isFinite(v) && v > 0 && v < 1;
const round3 = (v) => Math.round(v * 1000) / 1000;

/** Both parties' prices, normalized so they add to 1 (raw prices can add to a cent more or less). */
function pair(dem, rep) {
  if (!isProb(dem) || !isProb(rep)) throw new Error(`bad prices ${dem} ${rep}`);
  const s = dem + rep;
  if (s < 0.9 || s > 1.1) throw new Error(`prices do not add up: ${s}`);
  return { dem: round3(dem / s), rep: round3(rep / s) };
}

async function getJson(url) {
  const r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "monte-build/1.0" }, signal: AbortSignal.timeout(TIMEOUT) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

/** Who won each chamber, once Polymarket's market has settled. Empty until then. */
async function results() {
  const out = {};
  for (const c of CHAMBERS) {
    const events = await getJson(`https://gamma-api.polymarket.com/events?slug=${POLY[c]}`);
    const w = polymarketWinner(events?.[0]?.markets);
    if (w) out[c] = w;
  }
  return out;
}

async function polymarket(chamber) {
  const events = await getJson(`https://gamma-api.polymarket.com/events?slug=${POLY[chamber]}`);
  const markets = events?.[0]?.markets ?? [];
  const price = (party) => {
    const m = markets.find((x) => x.groupItemTitle === party && x.active && !x.closed);
    const p = typeof m?.outcomePrices === "string" ? JSON.parse(m.outcomePrices) : m?.outcomePrices;
    return Number(p?.[0]);
  };
  return pair(price("Democratic Party"), price("Republican Party"));
}

async function kalshi(chamber) {
  const d = await getJson(`https://api.elections.kalshi.com/trade-api/v2/markets?event_ticker=${KALSHI[chamber]}`);
  const markets = d?.markets ?? [];
  const price = (suffix) => {
    const m = markets.find((x) => x.ticker === `${KALSHI[chamber]}-${suffix}` && x.status === "active");
    const bid = Number(m?.yes_bid_dollars);
    const ask = Number(m?.yes_ask_dollars);
    return isProb(bid) && isProb(ask) ? (bid + ask) / 2 : Number(m?.last_price_dollars);
  };
  return pair(price("D"), price("R"));
}

const SOURCES = [
  { id: "polymarket", name: "Polymarket", get: polymarket },
  { id: "kalshi", name: "Kalshi", get: kalshi },
];

// ---------- Polls: free and citable, no paid source needed.
// 1. Wikipedia's table of generic-ballot averages (Decision Desk HQ, RealClearPolitics, Silver Bulletin and others),
//    read through the open MediaWiki API. 2. VoteHub's free poll API, for the raw polls behind them.
const WIKI = "https://en.wikipedia.org/w/api.php?action=parse&page=2026_United_States_House_of_Representatives_elections&prop=wikitext&format=json&formatversion=2";
const UA = { "user-agent": "MonteBot/1.0 (https://monte.markets; learning site)" };

async function getJsonUA(url) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(TIMEOUT) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export function parseAverages(w) {
  const a = w.search(/<section begin="GenericBallotAgg"\s*\/>/);
  const b = w.search(/<section end="GenericBallotAgg"\s*\/>/);
  if (a < 0 || b < 0) throw new Error("averages table not found");
  const out = [];
  for (const row of w.slice(a, b).split(/\n\|-\s*\n/).slice(1)) {
    const cells = row.split("\n").filter((l) => l.startsWith("|") && !l.startsWith("|}")).map((l) => l.slice(1));
    if (cells.length < 6 || /colspan|average/i.test(cells[0].replace(/<ref[\s\S]*/, ""))) continue;
    const name = (cells[0].match(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/) || [])[1]?.trim();
    const pct = (s) => Number((s.replace(/\{\{[^}]*\}\}/g, "").match(/([\d.]+)%/) || [])[1]);
    const rep = pct(cells[3]);
    const dem = pct(cells[4]);
    const updated = cells[2].replace(/<[^>]+>|\{\{[^}]*\}\}/g, "").trim();
    const ok = name && dem > 20 && dem < 80 && rep > 20 && rep < 80 && !Number.isNaN(Date.parse(updated));
    if (ok) out.push({ name, updated, dem, rep, lead: Math.round((dem - rep) * 10) / 10 });
  }
  if (out.length < 2) throw new Error("too few averages");
  return out;
}

async function polls(now) {
  const w = (await getJsonUA(WIKI))?.parse?.wikitext ?? "";
  const averages = parseAverages(w);
  const lead = Math.round((averages.reduce((s, x) => s + x.lead, 0) / averages.length) * 10) / 10;
  let raw = null;
  try {
    // Recent raw polls from VoteHub: registered or likely voters, not internal, last 45 days of what exists.
    const list = await getJsonUA("https://api.votehub.com/polls?poll_type=generic-ballot");
    const ps = list
      .filter((p) => p && !p.internal && p.end_date && Array.isArray(p.answers))
      .map((p) => ({ end: p.end_date, pollster: p.pollster, n: p.sample_size, d: p.answers.find((x) => /^dem/i.test(x.choice))?.pct, r: p.answers.find((x) => /^rep/i.test(x.choice))?.pct }))
      .filter((p) => typeof p.d === "number" && typeof p.r === "number")
      .sort((x, y) => y.end.localeCompare(x.end));
    const newest = ps[0]?.end;
    const recent = newest ? ps.filter((p) => Date.parse(newest) - Date.parse(p.end) <= 45 * 864e5) : [];
    if (recent.length) raw = { count: recent.length, newest, latest: recent.slice(0, 6) };
  } catch (e) {
    console.warn(`fetch-markets: VoteHub skipped (${e?.message ?? e})`);
  }
  return { asOf: now.toISOString(), asOfText: stamp(now), lead, leader: lead >= 0 ? "Democrats" : "Republicans", averages, raw, credit: "Averages as listed on Wikipedia (CC BY-SA); raw polls from VoteHub" };
}

function readOld() {
  try {
    return JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    return null;
  }
}

/** "Oct 23, 2026, 11:51 PM ET", fixed here so the server and the browser print the same text. */
function stamp(d) {
  return (
    d.toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) + " ET"
  );
}

async function main() {
  const old = readOld();
  const now = new Date();
  const out = { note: "Generated by scripts/fetch-markets.mjs. Prices shown as probabilities to teach, never as betting advice.", sources: [] };
  let fresh = 0;

  for (const s of SOURCES) {
    const prev = old?.sources?.find((x) => x.id === s.id) ?? null;
    try {
      const entry = { id: s.id, name: s.name, asOf: now.toISOString(), asOfText: stamp(now) };
      for (const c of CHAMBERS) entry[c] = await s.get(c);
      out.sources.push(entry);
      fresh++;
      console.log(`fetch-markets: ${s.name} house D ${entry.house.dem} R ${entry.house.rep}, senate D ${entry.senate.dem} R ${entry.senate.rep}`);
    } catch (e) {
      console.warn(`fetch-markets: ${s.name} failed (${e?.message ?? e}), keeping the last snapshot`);
      if (prev) out.sources.push(prev);
    }
  }

  let pollsFresh = false;
  try {
    out.polls = await polls(now);
    pollsFresh = true;
    console.log(`fetch-markets: polls ${out.polls.averages.length} averages, mean lead ${out.polls.lead}`);
  } catch (e) {
    console.warn(`fetch-markets: polls failed (${e?.message ?? e}), keeping the last snapshot`);
    if (old?.polls) out.polls = old.polls;
  }

  // A settled result never changes, so one found earlier is kept even if this run can't reach Polymarket.
  try {
    out.results = { ...(old?.results ?? {}), ...(await results()) };
  } catch (e) {
    console.warn(`fetch-markets: results check failed (${e?.message ?? e})`);
    if (old?.results) out.results = old.results;
  }
  const newResult = JSON.stringify(out.results ?? {}) !== JSON.stringify(old?.results ?? {});
  if (newResult) console.log(`fetch-markets: results ${JSON.stringify(out.results)}`);
  if (!out.results || !Object.keys(out.results).length) delete out.results;

  if (!fresh && !pollsFresh && !newResult) {
    console.warn("fetch-markets: nothing new, file left as it was");
    return;
  }
  if (!fresh) out.sources = old?.sources ?? out.sources;
  const tmp = `${OUT}.tmp`;
  writeFileSync(tmp, JSON.stringify(out, null, 2) + "\n");
  renameSync(tmp, OUT);
  console.log(`fetch-markets: wrote ${fresh} of ${SOURCES.length} sources`);
}

// Never hold up a build: give up after 30 seconds whatever happens.
setTimeout(() => {
  console.warn("fetch-markets: timed out, file left as it was");
  process.exit(0);
}, 30000).unref();

main()
  .catch((e) => console.warn(`fetch-markets: skipped (${e?.message ?? e})`))
  .finally(() => process.exit(0));
