import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { cardLinkClass } from './classes';

/** A grid of `LinkCard`s: one column on a phone, as many 12rem columns as fit beside each other. */
export function LinkCards({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-4">{children}</div>;
}

/** A card that is one link. An `href` to an anchor on the same page (`#add-the-registry`) points down instead of on. */
export function LinkCard({ title, href, children }: { title: string; href: string; children?: ReactNode }) {
  const Arrow = href.startsWith('#') ? ArrowDown : ArrowRight;
  return (
    <Link href={href} className={cardLinkClass}>
      <span className="flex items-center justify-between gap-2 text-body font-medium text-foreground">
        {title}
        <Arrow
          aria-hidden
          className="size-3.5 shrink-0 text-muted-foreground transition-[color] group-hover:text-foreground"
        />
      </span>
      {children ? <div className="text-small text-muted-foreground">{children}</div> : null}
    </Link>
  );
}
