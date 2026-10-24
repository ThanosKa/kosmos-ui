'use client';

import { Check, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { docsTabOf, docsTabs } from '@/lib/docs-tabs';
import { Button } from '@/registry/kosmos/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLinkItem, DropdownMenuTrigger } from '@/registry/kosmos/ui/dropdown-menu';

/** The header tabs: Docs, Components and Blocks. In the header from the `md` breakpoint up, and atop the docs phone drawer. */
export function SiteNav({ className }: { className?: string }) {
  const active = docsTabOf(usePathname());
  return (
    <nav aria-label="Site" className={cn('flex items-center gap-0.5', className)}>
      {docsTabs.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.id === active ? 'page' : undefined}
          // A nav item: the ghost look without the press scale, which dense rows of items skip.
          className="inline-flex h-7.5 items-center rounded-lg border border-transparent px-3 text-body font-medium text-muted-foreground transition-[background-color,color] hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-accent aria-[current=page]:text-accent-text"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** The same links in a menu, below the `md` breakpoint. */
export function SiteNavMenu({ className }: { className?: string }) {
  const active = docsTabOf(usePathname());
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" size="icon" aria-label="Menu" className={className} />}>
        <Menu aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        {docsTabs.map((item) => (
          <DropdownMenuLinkItem
            key={item.href}
            render={<Link href={item.href} />}
            aria-current={item.id === active ? 'page' : undefined}
            className="aria-[current=page]:text-accent-text"
          >
            {item.label}
            {item.id === active ? <Check aria-hidden className="ms-auto text-accent-text" /> : null}
          </DropdownMenuLinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
