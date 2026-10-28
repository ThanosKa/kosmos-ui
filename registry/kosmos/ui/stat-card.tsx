'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { ArrowRight } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { statDelta, type StatDeltaOptions } from '@/registry/kosmos/lib/stat-delta';
import { Sparkline } from '@/registry/kosmos/ui/chart';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';

const StatCardContext = React.createContext({ loading: false });

type StatCardProps = useRender.ComponentProps<'div'> & {
  /** Swaps the value, the delta and the sparkline for skeletons of the same size. The label stays. */
  loading?: boolean;
};

/** One number on a card: its label, its value, how it changed and, if you like, its trend. Renders a `<div>`. */
function StatCard({ className, loading = false, render, ...props }: StatCardProps) {
  const context = React.useMemo(() => ({ loading }), [loading]);
  const element = useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      {
        className: cn(
          'flex min-w-0 flex-col gap-1 rounded-2xl border border-transparent bg-card p-4 text-card-foreground shadow-card',
          className,
        ),
        'aria-busy': loading || undefined,
      },
      props,
    ),
    state: { slot: 'stat-card' },
  });
  return <StatCardContext.Provider value={context}>{element}</StatCardContext.Provider>;
}

/**
 * The top of a KPI tile: an icon tile beside a two-line heading, the eyebrow over the label. The label turns ink here,
 * since the eyebrow above it is the muted line.
 */
function StatCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="stat-card-header"
      className={cn(
        'group/stat-card-header mb-3 grid min-w-0 grid-cols-[minmax(0,1fr)] items-center gap-x-2.5',
        'has-data-[slot=stat-card-icon]:grid-cols-[auto_minmax(0,1fr)]',
        className,
      )}
      {...props}
    />
  );
}

/** A 32px tile for a 16px icon, at the start of `StatCardHeader`. It is decoration: the label names the stat. */
function StatCardIcon({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="stat-card-icon"
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-secondary text-muted-foreground shadow-control',
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        'group-has-data-[slot=stat-card-eyebrow]/stat-card-header:row-span-2 group-has-data-[slot=stat-card-eyebrow]/stat-card-header:mt-0.5 group-has-data-[slot=stat-card-eyebrow]/stat-card-header:self-start',
        className,
      )}
      {...props}
    />
  );
}

/** A muted line of context above the label ("Web and apps"), inside `StatCardHeader`. */
function StatCardEyebrow({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="stat-card-eyebrow"
      className={cn('block text-caption text-pretty wrap-break-word text-muted-foreground', className)}
      {...props}
    />
  );
}

/** What the number counts. A longer label wraps. */
function StatCardLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="stat-card-label"
      className={cn(
        'block text-body font-medium text-pretty wrap-break-word text-muted-foreground',
        'in-data-[slot=stat-card-header]:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** The number, already formatted. Write a million and up compact (28.5M), so it fits a narrow card. */
function StatCardValue({ className, ...props }: React.ComponentProps<'span'>) {
  const { loading } = React.useContext(StatCardContext);
  if (loading) return <Skeleton data-slot="stat-card-value" className={cn('my-1 h-8 w-24 max-w-full', className)} />;
  return (
    <span
      data-slot="stat-card-value"
      className={cn('block truncate text-display text-foreground tabular-nums', className)}
      {...props}
    />
  );
}


type StatCardDeltaProps = Omit<React.ComponentProps<'span'>, 'children'> &
  StatDeltaOptions & {
    /** The change: 12.4 for a 12.4% rise, or percentage points with `unit="points"`. */
    value: number;
    /** What the change is against ("vs September"), in muted text beside it. */
    children?: React.ReactNode;
  };

/**
 * The change, read without color: a triangle, a sign and the percentage ("▲ +12.4%"). Good news is green and bad news
 * red; set `goodWhen="down"` for a metric where falling is good. A flat change is a muted arrow.
 */
function StatCardDelta({ value, goodWhen, unit, fractionDigits, format, className, children, ...props }: StatCardDeltaProps) {
  const { loading } = React.useContext(StatCardContext);
  if (loading) return <Skeleton data-slot="stat-card-delta" className={cn('h-5 w-28 max-w-full', className)} />;
  const delta = statDelta(value, { goodWhen, unit, fractionDigits, format });
  if (!delta && children === undefined) return null;

  return (
    <span
      data-slot="stat-card-delta"
      className={cn('flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-small tabular-nums', className)}
      {...props}
    >
      {delta ? (
        <span
          data-direction={delta.direction}
          className={cn(
            'flex items-center gap-1 font-medium text-muted-foreground',
            delta.tone === 'good' && 'text-tint-green-foreground',
            delta.tone === 'bad' && 'text-tint-red-foreground',
          )}
        >
          {delta.direction === 'flat' ? (
            <ArrowRight aria-hidden className="size-3 shrink-0" />
          ) : (
            <svg aria-hidden viewBox="0 0 8 8" className={cn('size-2 shrink-0 fill-current', delta.direction === 'down' && 'rotate-180')}>
              <path d="M4 0.5 7.5 7H0.5z" />
            </svg>
          )}
          {delta.text}
        </span>
      ) : null}
      {children === undefined ? null : <span className="min-w-0 wrap-break-word text-muted-foreground">{children}</span>}
    </span>
  );
}

/** A line of context in muted text, for a stat with no change to show ("No earlier period", "Updated 5 min ago"). */
function StatCardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p data-slot="stat-card-description" className={cn('text-small wrap-break-word text-muted-foreground', className)} {...props} />
  );
}

const StatCardContentContext = React.createContext(false);

/**
 * Holds the value, the change and the sparkline, and puts the sparkline beside them at the end of the card. In a card
 * too narrow for both, the sparkline moves under them.
 */
function StatCardContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="stat-card-content" className={cn('@container/stat-card-content min-w-0', className)} {...props}>
      <div
        className={cn(
          'grid grid-cols-[minmax(0,1fr)] items-end gap-x-3 gap-y-1',
          '@[13rem]/stat-card-content:has-data-[slot=stat-card-sparkline]:grid-cols-[minmax(0,1fr)_auto]',
        )}
      >
        <StatCardContentContext.Provider value={true}>{children}</StatCardContentContext.Provider>
      </div>
    </div>
  );
}

const besideClassName =
  'mt-1 @[13rem]/stat-card-content:col-start-2 @[13rem]/stat-card-content:row-span-2 @[13rem]/stat-card-content:row-start-1 @[13rem]/stat-card-content:mt-0';

/**
 * The trend, under the number across the card, or beside it inside `StatCardContent`. `variant="bar"` draws thin bars,
 * the latest in ink. Say what it shows in `aria-label` ("Signups, last 12 months, up 4.2%").
 */
function StatCardSparkline({ className, variant = 'line', ...props }: React.ComponentProps<typeof Sparkline>) {
  const { loading } = React.useContext(StatCardContext);
  const beside = React.useContext(StatCardContentContext);
  const width = variant === 'line' ? (beside ? 'w-18' : 'w-full') : beside && 'max-w-24';
  const size = cn(beside ? cn(besideClassName, 'h-9') : 'mt-2 h-10', width);
  if (loading) {
    return <Skeleton data-slot="stat-card-sparkline" className={cn(size, variant === 'bar' && 'w-16', className)} />;
  }
  return <Sparkline data-slot="stat-card-sparkline" variant={variant} className={cn(size, className)} {...props} />;
}

export {
  StatCard,
  StatCardHeader,
  StatCardIcon,
  StatCardEyebrow,
  StatCardLabel,
  StatCardValue,
  StatCardDelta,
  StatCardDescription,
  StatCardContent,
  StatCardSparkline,
  type StatCardProps,
  type StatCardDeltaProps,
};
