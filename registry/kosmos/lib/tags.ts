function escapeForPattern(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function delimiterPattern(delimiters: readonly string[]) {
  return new RegExp(['\\r?\\n', ...delimiters.map(escapeForPattern)].join('|'));
}

/** The tags in a pasted or typed text: split on each delimiter and on line breaks, trimmed, empty pieces dropped. */
function splitTags(text: string, delimiters: readonly string[]): string[] {
  return text
    .split(delimiterPattern(delimiters))
    .map((piece) => piece.trim())
    .filter(Boolean);
}

/**
 * What a typed draft holds once a delimiter is typed: the tags before the last delimiter are `complete`, and the text
 * after it stays the draft (`rest`). A draft with no delimiter comes back whole, as typed.
 */
function takeTags(draft: string, delimiters: readonly string[]): { complete: string[]; rest: string } {
  const pieces = draft.split(delimiterPattern(delimiters));
  if (pieces.length === 1) return { complete: [], rest: draft };
  const rest = pieces.pop() ?? '';
  return { complete: splitTags(pieces.join('\n'), []), rest: rest.trimStart() };
}

type AddTagsOptions = {
  /** The most tags the list holds. No limit by default. */
  max?: number;
  /** Keeps a tag that is already in the list. Off by default, comparing without case. */
  allowDuplicates?: boolean;
};

type AddedTags = {
  /** The whole list after adding. */
  tags: string[];
  added: string[];
  /** Left out because the list already holds them. */
  duplicates: string[];
  /** Left out because the list was full. */
  overLimit: string[];
};

/** Adds `incoming` to the end of `current`, in order, leaving out duplicates and anything past `max`. */
function addTags(current: readonly string[], incoming: readonly string[], { max = Infinity, allowDuplicates = false }: AddTagsOptions = {}): AddedTags {
  const tags = [...current];
  const seen = new Set(current.map((tag) => tag.toLocaleLowerCase()));
  const result: AddedTags = { tags, added: [], duplicates: [], overLimit: [] };
  for (const tag of incoming) {
    const key = tag.toLocaleLowerCase();
    if (!allowDuplicates && seen.has(key)) result.duplicates.push(tag);
    else if (tags.length >= max) result.overLimit.push(tag);
    else {
      tags.push(tag);
      result.added.push(tag);
      seen.add(key);
    }
  }
  return result;
}

/**
 * Whether a tag reads as an email address: a name, one @, and a domain with a dot inside it. A quick check for marking
 * typos while people type; the address is only proven when a message reaches it.
 */
function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

export { addTags, isEmail, splitTags, takeTags, type AddedTags, type AddTagsOptions };
