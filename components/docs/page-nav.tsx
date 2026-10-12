import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { DocsNeighbours } from '@/lib/docs-nav';
import { Button, buttonVariants } from '@/registry/kosmos/ui/button';

const defaultLabels = { previous: 'Previous', next: 'Next' };

/** Previous and next as two icon buttons, for the title row. The end of the list shows a disabled button. */
export function PageNavButtons({ previous, next, labels = defaultLabels }: DocsNeighbours) {
  const buttons = [
    { link: previous, rel: 'prev', label: labels.previous, Icon: ChevronLeft },
    { link: next, rel: 'next', label: labels.next, Icon: ChevronRight },
  ] as const;
  return (
    <div className="flex items-center gap-1">
      {buttons.map(({ link, rel, label, Icon }) =>
        link ? (
          <Link
            key={rel}
            href={link.url}
            rel={rel}
            aria-label={`${label}: ${link.title}`}
            title={`${label}: ${link.title}`}
            className={buttonVariants({ variant: 'secondary', size: 'icon' })}
          >
            <Icon aria-hidden />
          </Link>
        ) : (
          <Button key={rel} variant="secondary" size="icon" disabled aria-label={`No ${label.toLowerCase()} page`}>
            <Icon aria-hidden />
          </Button>
        ),
      )}
    </div>
  );
}

/** Previous and next as two cards, for the end of the page. */
export function PageNavCards({ previous, next, labels = defaultLabels, className }: DocsNeighbours & { className?: string }) {
  if (!previous && !next) return null;
  const cards = [
    { link: previous, rel: 'prev', label: labels.previous, Icon: ArrowLeft },
    { link: next, rel: 'next', label: labels.next, Icon: ArrowRight },
  ] as const;
  return (
    <nav aria-label="Previous and next page" className={cn('grid gap-4 sm:grid-cols-2', className)}>
      {cards.map(({ link, rel, label, Icon }) =>
        link ? (
          <Link
            key={rel}
            href={link.url}
            rel={rel}
            className={cn(
              'group flex min-w-0 flex-col gap-1 rounded-2xl border border-transparent bg-card p-4 shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              rel === 'next' && 'items-end text-end sm:col-start-2',
            )}
          >
            <span className="flex items-center gap-1.5 text-small text-muted-foreground">
              {rel === 'prev' && <Icon aria-hidden className="size-3.5 transition-[color] group-hover:text-foreground" />}
              {label}
              {rel === 'next' && <Icon aria-hidden className="size-3.5 transition-[color] group-hover:text-foreground" />}
            </span>
            <span className="max-w-full truncate text-body font-medium text-foreground">{link.title}</span>
          </Link>
        ) : null,
      )}
    </nav>
  );
}
