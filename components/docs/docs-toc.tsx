'use client';

import { AnchorProvider, ScrollProvider, TOCItem, type TableOfContents } from 'fumadocs-core/toc';
import { useRef, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';

/** The page's headings, with the section in view in full ink. Scrolls on its own when the page is long. */
export function DocsToc({ toc, className }: { toc: TableOfContents; className?: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  if (toc.length === 0) return null;

  return (
    <AnchorProvider toc={toc}>
      <nav aria-labelledby="docs-toc-label" className={cn('flex min-h-0 flex-col gap-2', className)}>
        <h2 id="docs-toc-label" className="px-1 text-caption font-medium tracking-[0.05em] text-muted-foreground uppercase">
          On this page
        </h2>
        <div ref={viewport} className="min-h-0 overflow-y-auto overscroll-contain p-1">
          <ScrollProvider containerRef={viewport}>
            <ul className="flex flex-col">
              {toc.map((item) => (
                <li key={item.url}>
                  <TOCItem
                    href={item.url}
                    style={{ '--toc-depth': Math.max(item.depth - 2, 0) } as CSSProperties}
                    className="block rounded-md py-1 ps-[calc(var(--toc-depth)*0.75rem)] text-small text-muted-foreground transition-[color] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[active=true]:text-foreground"
                  >
                    {item.title}
                  </TOCItem>
                </li>
              ))}
            </ul>
          </ScrollProvider>
        </div>
      </nav>
    </AnchorProvider>
  );
}
