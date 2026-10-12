'use client';

import { AnchorProvider, ScrollProvider, TOCItem, type TableOfContents } from 'fumadocs-core/toc';
import { useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/kosmos/ui/accordion';
import { eyebrowClass } from './classes';

/** A little longer than the accordion's 150ms close. */
const closeDuration = 180;

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

/**
 * The same headings in a Kosmos Accordion, for widths where the right rail is hidden. Starts closed and closes again
 * once a heading is picked, so the page it jumps to is not pushed down.
 */
export function DocsTocDisclosure({ toc, className }: { toc: TableOfContents; className?: string }) {
  const [open, setOpen] = useState<string[]>([]);
  if (toc.length === 0) return null;

  // The list closes first and the page jumps after, so the closing panel doesn't pull the heading out of view.
  const jumpAfterClosing = (event: MouseEvent<HTMLElement>) => {
    const href = (event.target as Element).closest('a')?.getAttribute('href');
    if (!href?.startsWith('#') || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    setOpen([]);
    setTimeout(() => {
      history.pushState(null, '', href);
      document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView();
    }, closeDuration);
  };

  return (
    <Accordion
      data-docs-toc-disclosure=""
      value={open}
      onValueChange={setOpen}
      className={cn('rounded-2xl border border-transparent bg-card px-2 shadow-card', className)}
    >
      <AccordionItem value="toc">
        <AccordionTrigger>On this page</AccordionTrigger>
        <AccordionContent className="px-0 pb-2">
          <nav aria-label="On this page" onClickCapture={jumpAfterClosing}>
            <AnchorProvider toc={toc}>
              <DocsTocList toc={toc} itemClassName="px-2 focus-visible:-outline-offset-2" />
            </AnchorProvider>
          </nav>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
