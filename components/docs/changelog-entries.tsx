import Link from 'next/link';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/components/mdx';
import { getChangelogEntries } from '@/lib/changelog';
import { source } from '@/lib/source';

/** Every changelog entry, newest first, in full. Used once, on `/docs/changelog`. */
export function ChangelogEntries() {
  return getChangelogEntries().map(({ page, isoDate, displayDate }) => {
    const Body = page.data.body;
    return (
      <section key={page.url} className="border-b border-fd-border pb-8 last:border-b-0">
        <time dateTime={isoDate} className="text-sm text-fd-muted-foreground">
          {displayDate}
        </time>
        <h2 id={page.slugs[1]} className="mt-1">
          <Link href={page.url} className="no-underline">
            {page.data.title}
          </Link>
        </h2>
        <Body components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </section>
    );
  });
}
