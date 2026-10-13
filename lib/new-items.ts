export type ChangelogLinks = {
  title: string;
  /** `YYYY-MM-DD`. */
  isoDate: string;
  /** The text of the entry, scanned for links to docs pages. */
  body: string;
};

/** How many days after its "Added" entry an item still counts as new. */
export const newItemDays = 30;

const itemLink = /\]\((\/docs\/(?:components|blocks)\/[a-z0-9-]+)(?:#[^)]*)?\)/g;
const dayMs = 24 * 60 * 60 * 1000;

/**
 * The docs URLs of the components and block categories that count as new. An item belongs to the first changelog entry
 * that links its page. It is new when that entry's title starts with "Added", the entry is no more than `newItemDays`
 * old on `today`, and the entry is not part of the first release (the earliest date), so what launched together never
 * reads as new. Later entries that only change the item do not renew it.
 */
export function newItemUrls(entries: ChangelogLinks[], today: Date): Set<string> {
  const oldestFirst = [...entries].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const firstRelease = oldestFirst[0]?.isoDate;
  const todayIso = today.toISOString().slice(0, 10);
  const seen = new Set<string>();
  const fresh = new Set<string>();
  for (const entry of oldestFirst) {
    const age = (Date.parse(todayIso) - Date.parse(entry.isoDate)) / dayMs;
    const isNewEntry = /^Added\b/.test(entry.title) && entry.isoDate !== firstRelease && age <= newItemDays;
    for (const [, url] of entry.body.matchAll(itemLink)) {
      if (seen.has(url)) continue;
      seen.add(url);
      if (isNewEntry) fresh.add(url);
    }
  }
  return fresh;
}
