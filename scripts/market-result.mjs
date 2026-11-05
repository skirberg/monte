// Reads a settled result from Polymarket's markets for one chamber. Kept apart from fetch-markets.mjs so tests can import it.

const PARTY = { "Democratic Party": "dem", "Republican Party": "rep" };

/**
 * "dem" or "rep" once the market for that party has closed and paid out Yes (outcomePrices[0] is 1),
 * else null. Prices of 0.99 while trading is still open are not a result.
 */
export function polymarketWinner(markets) {
  for (const m of markets ?? []) {
    const party = PARTY[m?.groupItemTitle];
    if (!party || !m.closed) continue;
    const p = typeof m.outcomePrices === "string" ? JSON.parse(m.outcomePrices) : m.outcomePrices;
    if (Number(p?.[0]) === 1) return party;
  }
  return null;
}
