'use client';

import { Check, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLinkItem, DropdownMenuTrigger } from '@/registry/kosmos/ui/dropdown-menu';

export const siteNavItems = [
  { href: '/docs', label: 'Docs' },
  { href: '/docs/components', label: 'Components' },
  { href: '/docs/blocks', label: 'Blocks' },
] as const;

/** The section of the docs a path belongs to: the longest nav item that prefixes it. */
function useActiveHref() {
  const pathname = usePathname();
  return [...siteNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.href;
}

/** Docs, Components and Blocks, from the `md` breakpoint up. */
export function SiteNav({ className }: { className?: string }) {
  const active = useActiveHref();
  return (
    <nav aria-label="Site" className={cn('flex items-center gap-0.5', className)}>
      {siteNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.href === active ? 'page' : undefined}
          // A nav item: the ghost look without the press scale, which dense rows of items skip. The current page also takes
          // the raised surface of the active sidebar item, since its orange and the idle grey have the same lightness.
          className="inline-flex h-7.5 items-center rounded-lg border border-transparent px-3 text-body font-medium text-muted-foreground transition-[background-color,color,box-shadow] hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-secondary aria-[current=page]:text-active-foreground aria-[current=page]:shadow-control"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** The same links in a menu, below the `md` breakpoint. */
export function SiteNavMenu({ className }: { className?: string }) {
  const active = useActiveHref();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" size="icon" aria-label="Menu" className={className} />}>
        <Menu aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        {siteNavItems.map((item) => (
          <DropdownMenuLinkItem
            key={item.href}
            render={<Link href={item.href} />}
            aria-current={item.href === active ? 'page' : undefined}
            className="aria-[current=page]:text-active-foreground"
          >
            {item.label}
            {item.href === active ? <Check aria-hidden className="ms-auto text-active-foreground" /> : null}
          </DropdownMenuLinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
