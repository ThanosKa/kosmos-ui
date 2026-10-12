'use client';

import { Collapsible } from '@base-ui/react/collapsible';
import { AnchorProvider, ScrollProvider, TOCItem, type TableOfContents } from 'fumadocs-core/toc';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRef, type CSSProperties } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { eyebrowClass } from './classes';

function DocsTocList({ toc, itemClassName }: { toc: TableOfContents; itemClassName?: string }) {
  return (
    <ul className="flex flex-col">
      {toc.map((item) => (
        <li
          key={item.url}
          style={{ '--toc-depth': Math.max(item.depth - 2, 0) } as CSSProperties}
          className="ms-[calc(var(--toc-depth)*0.75rem)]"
        >
          <TOCItem
            href={item.url}
            className={cn(
              'block rounded-md py-1 text-small text-muted-foreground transition-[color] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[active=true]:text-foreground',
              itemClassName,
            )}
          >
            {item.title}
          </TOCItem>
        </li>
      ))}
    </ul>
  );
}

/** The page's headings, with the section in view in full ink. Scrolls on its own when the page is long. */
export function DocsToc({ toc, className }: { toc: TableOfContents; className?: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  if (toc.length === 0) return null;

  return (
    <AnchorProvider toc={toc}>
      <nav aria-labelledby="docs-toc-label" className={cn('flex min-h-0 flex-col gap-2', className)}>
        <h2 id="docs-toc-label" className={cn('px-1', eyebrowClass)}>
          On this page
        </h2>
        <div ref={viewport} className="min-h-0 overflow-y-auto overscroll-contain p-1">
          <ScrollProvider containerRef={viewport}>
            <DocsTocList toc={toc} />
          </ScrollProvider>
        </div>
      </nav>
    </AnchorProvider>
  );
}

/** The same headings behind an "On this page" toggle, for widths where the right rail is hidden. Starts closed. */
export function DocsTocDisclosure({ toc, className }: { toc: TableOfContents; className?: string }) {
  if (toc.length === 0) return null;

  return (
    <Collapsible.Root
      data-docs-toc-disclosure=""
      className={cn('rounded-2xl border border-transparent bg-card shadow-card', className)}
    >
      <Collapsible.Trigger
        render={<Button variant="item" className="group/toc-trigger h-10 w-full justify-between rounded-2xl px-4" />}
      >
        On this page
        <span aria-hidden className="relative size-3.5 shrink-0 text-muted-foreground *:absolute *:inset-0">
          <ChevronDown
            className={cn(
              'transition-[rotate,opacity] duration-fast ease-power3-out group-data-panel-open/toc-trigger:duration-slow',
              'motion-safe:group-data-panel-open/toc-trigger:rotate-180 motion-safe:group-data-panel-open/toc-trigger:ease-smooth-in-out',
              'motion-reduce:group-data-panel-open/toc-trigger:opacity-0',
            )}
          />
          <ChevronUp className="opacity-0 transition-[opacity] duration-fast motion-reduce:group-data-panel-open/toc-trigger:opacity-100" />
        </span>
      </Collapsible.Trigger>
      <Collapsible.Panel
        render={<nav aria-label="On this page" />}
        className={cn(
          'h-(--collapsible-panel-height) overflow-hidden duration-fast ease-power3-out data-open:duration-slow',
          'motion-safe:transition-[height] motion-safe:data-open:ease-smooth-in-out motion-safe:data-ending-style:h-0 motion-safe:data-starting-style:h-0',
          'motion-reduce:transition-[opacity] motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:opacity-0',
        )}
      >
        <AnchorProvider toc={toc}>
          <div className="border-t border-border px-2 py-2">
            <DocsTocList toc={toc} itemClassName="px-2 focus-visible:-outline-offset-2" />
          </div>
        </AnchorProvider>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
