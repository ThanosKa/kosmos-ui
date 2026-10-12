import Link from 'next/link';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/components/mdx';
import { getChangelogEntries } from '@/lib/changelog';
import { source } from '@/lib/source';

/** Every changelog entry, newest first, in full. Used once, on `/docs/changelog`. Each title is an anchor in its table of contents. */
export function ChangelogEntries() {
  return getChangelogEntries().map(({ page, isoDate, displayDate }) => {
    const Body = page.data.body;
    return (
      <section key={page.url} className="border-b border-border pb-8 last:border-b-0">
        <div className="not-prose mt-8 flex flex-col gap-1">
          <time dateTime={isoDate} className="text-small text-muted-foreground">
            {displayDate}
          </time>
          <h2 id={page.slugs[1]} className="text-title text-foreground">
            <Link
              href={page.url}
              className="rounded-sm hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {page.data.title}
            </Link>
          </h2>
        </div>
        <Body components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </section>
    );
  });
}
