import { source } from './source';

/**
 * Changelog convention: one MDX file per entry in `content/docs/changelog/`, named
 * `YYYY-MM-DD-<slug>.mdx` with the same `date` in its frontmatter (plus `title` and `description`).
 * Start the title with what happened ("Added Button", "Fixed Select focus ring"), so in search it
 * doesn't read as the component's own page.
 * `/docs/changelog` (the folder's `index.mdx`) lists every entry newest first; each entry also has its
 * own page at `/docs/changelog/<file name>`. Adding an entry touches no other file.
 */
export const changelogFolder = 'changelog';

const datePrefix = /^(\d{4}-\d{2}-\d{2})-[a-z0-9-]+$/;

export type ChangelogEntry = {
  page: ReturnType<typeof source.getPages>[number];
  /** `YYYY-MM-DD`, for `<time dateTime>`. */
  isoDate: string;
  /** For example "October 11, 2026". */
  displayDate: string;
};

export function formatChangelogDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/** Every changelog entry, newest first. Throws (and fails the build) on an entry that breaks the convention. */
export function getChangelogEntries(): ChangelogEntry[] {
  return source
    .getPages()
    .filter((page) => page.slugs[0] === changelogFolder && page.slugs.length === 2)
    .map((page) => {
      const file = page.slugs[1];
      const { date } = page.data;
      const prefix = datePrefix.exec(file)?.[1];
      if (!prefix) throw new Error(`Changelog entry "${file}": name it YYYY-MM-DD-<slug>.mdx`);
      if (!date) throw new Error(`Changelog entry "${file}": add a \`date: ${prefix}\` frontmatter field`);
      const isoDate = date.toISOString().slice(0, 10);
      if (isoDate !== prefix) throw new Error(`Changelog entry "${file}": date ${isoDate} does not match the file name`);
      return { page, isoDate, displayDate: formatChangelogDate(date) };
    })
    .sort((a, b) => b.isoDate.localeCompare(a.isoDate) || b.page.slugs[1].localeCompare(a.page.slugs[1]));
}
