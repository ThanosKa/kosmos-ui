import type { TableOfContents } from 'fumadocs-core/toc';
import { CircleAlert, SquarePen } from 'lucide-react';
import { cn } from '@/registry/kosmos/lib/cn';
import { docsSourceUrl, githubUrl } from '@/lib/shared';
import { DocsToc } from './docs-toc';

type DocsPageRef = { path: string; title: string };

/** "Edit this page" and "Report an issue", pointing at the page's source file and a new issue named after it. */
export function DocsPageLinks({ page, className }: { page: DocsPageRef; className?: string }) {
  const links = [
    { label: 'Edit this page', href: docsSourceUrl(page.path, 'edit'), Icon: SquarePen },
    { label: 'Report an issue', href: `${githubUrl}/issues/new?title=${encodeURIComponent(`Docs: ${page.title}`)}`, Icon: CircleAlert },
  ];
  return (
    <ul className={cn('flex flex-col gap-1', className)}>
      {links.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            className="inline-flex items-center gap-2 rounded-md py-1 text-small text-muted-foreground transition-[color] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Icon aria-hidden className="size-3.5" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The right rail: the table of contents and the page links, sticking below the header while the page scrolls. */
export function DocsRail({ page, toc }: { page: DocsPageRef; toc: TableOfContents }) {
  return (
    <aside
      data-docs-rail=""
      aria-label="Page"
      className="sticky top-14 flex max-h-[calc(100svh-3.5rem)] w-56 shrink-0 flex-col gap-6 self-start py-10 max-xl:hidden"
    >
      <DocsToc toc={toc} />
      <DocsPageLinks page={page} className={cn('px-1', toc.length > 0 && 'border-t border-border pt-4')} />
    </aside>
  );
}
