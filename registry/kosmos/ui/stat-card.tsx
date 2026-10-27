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

/** What the number counts. A longer label wraps. */
function StatCardLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="stat-card-label"
      className={cn('block text-body font-medium text-pretty wrap-break-word text-muted-foreground', className)}
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

/** The trend under the number, across the card. Say what it shows in `aria-label` ("Signups, last 12 months, up 4.2%"). */
function StatCardSparkline({ className, ...props }: React.ComponentProps<typeof Sparkline>) {
  const { loading } = React.useContext(StatCardContext);
  if (loading) return <Skeleton data-slot="stat-card-sparkline" className={cn('mt-2 h-10 w-full', className)} />;
  return <Sparkline className={cn('mt-2 h-10 w-full', className)} {...props} />;
}

export {
  StatCard,
  StatCardLabel,
  StatCardValue,
  StatCardDelta,
  StatCardDescription,
  StatCardSparkline,
  type StatCardProps,
  type StatCardDeltaProps,
};
