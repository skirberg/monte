/**
 * The ⌘K filter. Every word typed must appear somewhere in the item's value or keywords. Fuzzy letter matching
 * found "bayes" in every topic. A match in the value ranks above one found only in the keywords.
 */
export function match(value: string, search: string, keywords: string[] = []) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const v = value.toLowerCase();
  if (words.every((w) => v.includes(w))) return 1;
  const all = `${v} ${keywords.join(" ").toLowerCase()}`;
  return words.every((w) => all.includes(w)) ? 0.5 : 0;
}
