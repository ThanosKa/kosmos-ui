'use client';

import { AnchorProvider, ScrollProvider, TOCItem, useTOCListener, type TableOfContents } from 'fumadocs-core/toc';
import { useRef, useState, type MouseEvent, type RefObject } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration } from '@/registry/kosmos/lib/motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/kosmos/ui/accordion';
import { eyebrowClass } from './classes';

/** One motion step past the accordion's `fast` close, so the panel is gone before the page jumps. */
const jumpDelay = duration.base * 1000;

/** The marker on the track: spans the items in view and glides between them. */
function DocsTocThumb({ list }: { list: RefObject<HTMLUListElement | null> }) {
  const thumb = useRef<HTMLSpanElement>(null);
  useTOCListener((items) => {
    const element = thumb.current;
    const root = list.current;
    if (!element || !root) return;
    const active = items.filter((item) => item.active);
    const links = [...root.querySelectorAll<HTMLElement>('a')];
    const find = (id: string | undefined) => links.find((link) => link.getAttribute('href') === `#${id}`);
    const first = find(active[0]?.id);
    const last = find(active[active.length - 1]?.id);
    if (!first || !last) {
      element.style.setProperty('--thumb-height', '0px');
      return;
    }
    element.style.setProperty('--thumb-top', `${first.offsetTop}px`);
    element.style.setProperty('--thumb-height', `${last.offsetTop + last.offsetHeight - first.offsetTop}px`);
  });

  return (
    <span
      ref={thumb}
      aria-hidden
      className="pointer-events-none absolute -inset-s-px top-0 h-(--thumb-height,0px) w-px translate-y-(--thumb-top,0px) bg-foreground motion-safe:transition-[translate,height] motion-safe:duration-slow motion-safe:ease-smooth-in-out"
    />
  );
}

function DocsTocList({ toc, itemClassName, thumb = false }: { toc: TableOfContents; itemClassName?: string; thumb?: boolean }) {
  const list = useRef<HTMLUListElement>(null);
  return (
    <ul ref={list} className="relative flex flex-col border-s border-border">
      {thumb && <DocsTocThumb list={list} />}
      {toc.map((item) => (
        <li key={item.url}>
          <TOCItem
            href={item.url}
            className={cn(
              'block rounded-md py-1 pe-2 text-small text-muted-foreground transition-[color] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[active=true]:text-foreground',
              item.depth <= 2 ? 'ps-3' : item.depth === 3 ? 'ps-6' : 'ps-9',
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
            <DocsTocList toc={toc} thumb />
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
    }, jumpDelay);
  };

  return (
    <Accordion
      data-docs-toc-disclosure=""
      headingLevel={2}
      value={open}
      onValueChange={setOpen}
      className={cn('rounded-2xl border border-transparent bg-card px-2 shadow-card', className)}
    >
      <AccordionItem value="toc">
        <AccordionTrigger>On this page</AccordionTrigger>
        <AccordionContent className="px-0 pb-2">
          <nav aria-label="On this page" onClickCapture={jumpAfterClosing}>
            <AnchorProvider toc={toc}>
              <DocsTocList toc={toc} itemClassName="focus-visible:-outline-offset-2" />
            </AnchorProvider>
          </nav>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
