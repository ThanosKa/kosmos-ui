'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { currentLinkHref, siteLinks } from '@/lib/site-links';

/** The site links atop the docs phone drawer, which replaces the header's sheet on docs pages. */
export function SiteNav({ className }: { className?: string }) {
  const current = currentLinkHref(siteLinks, usePathname());
  return (
    <nav aria-label="Site" className={cn('flex flex-wrap items-center gap-0.5', className)}>
      {siteLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.href === current ? 'page' : undefined}
          // A nav item: the ghost look without the press scale, which dense rows of items skip.
          className="inline-flex h-7.5 items-center rounded-lg border border-transparent px-3 text-body font-medium text-muted-foreground transition-[background-color,color] hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-accent aria-[current=page]:text-active-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
