'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { ChartNoAxesColumn, CircleAlert, RotateCw } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import type { ChartConfig } from '@/registry/kosmos/ui/chart';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';

type ChartCardState = 'ready' | 'loading' | 'empty' | 'error';

const ChartCardContext = React.createContext<{ state: ChartCardState }>({ state: 'ready' });

type ChartCardProps = useRender.ComponentProps<'div'> & {
  /** What the content shows: the chart (`ready`), a skeleton, an empty state or an error. */
  state?: ChartCardState;
};

/** A chart on a card, with a title, a place for a range control, a legend and a state for every moment. Renders a `<div>`. */
function ChartCard({ className, state = 'ready', render, ...props }: ChartCardProps) {
  const context = React.useMemo(() => ({ state }), [state]);
  const element = useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      {
        className: cn(
          '@container/chart-card flex min-w-0 flex-col rounded-2xl border border-transparent bg-card text-card-foreground shadow-card',
          '*:data-[slot=chart-card-content]:first:pt-4',
          className,
        ),
        'aria-busy': state === 'loading' || undefined,
      },
      props,
    ),
    state: { slot: 'chart-card', state },
  });
  return <ChartCardContext.Provider value={context}>{element}</ChartCardContext.Provider>;
}

/** The title and description, with the action beside the title from a 384px card and under them below that. */
function ChartCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="chart-card-header"
      className={cn('grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 p-4 pb-3', className)}
      {...props}
    />
  );
}

/** Renders a `<div>`. Pass `render={<h2 />}` (the level that fits the page) so screen readers can jump to it. */
function ChartCardTitle({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>({ className: cn('col-start-1 min-w-0 text-title text-pretty wrap-break-word', className) }, props),
    state: { slot: 'chart-card-title' },
  });
}

/** What the chart covers ("Last 30 days"), in muted text under the title. */
function ChartCardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="chart-card-description"
      className={cn('col-start-1 min-w-0 text-small text-pretty wrap-break-word text-muted-foreground', className)}
      {...props}
    />
  );
}

/** The control that changes what the chart shows: a range switch, a select or a menu. */
function ChartCardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="chart-card-action"
      className={cn(
        'col-start-1 mt-2 flex min-w-0 items-center gap-2 justify-self-start',
        '@sm/chart-card:col-start-2 @sm/chart-card:row-start-1 @sm/chart-card:mt-0 @sm/chart-card:justify-self-end',
        className,
      )}
      {...props}
    />
  );
}

/** A swatch and a name for each series in `config`, in its order. Use it when the chart draws no legend of its own. */
function ChartCardLegend({ config, className, ...props }: Omit<React.ComponentProps<'ul'>, 'children'> & { config: ChartConfig }) {
  return (
    <ul
      data-slot="chart-card-legend"
      className={cn('col-span-full mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground', className)}
      {...props}
    >
      {Object.entries(config).map(([key, series]) => {
        const Icon = series.icon;
        return (
          <li key={key} className="flex min-w-0 items-center gap-1.5">
            {Icon ? (
              <span aria-hidden className="flex shrink-0">
                <Icon />
              </span>
            ) : (
              <span
                aria-hidden
                style={{ '--series': series.color ?? 'currentColor' } as React.CSSProperties}
                className="size-2 shrink-0 rounded-sm bg-(--series) forced-colors:bg-[CanvasText]"
              />
            )}
            <span className="wrap-break-word">{series.label ?? key}</span>
          </li>
        );
      })}
    </ul>
  );
}

type ChartCardContentProps = React.ComponentProps<'div'> & {
  /** Read to screen readers while the chart loads. */
  loadingLabel?: string;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  errorTitle?: React.ReactNode;
  errorDescription?: React.ReactNode;
  /** Shows a button that tries again in the error state. */
  onRetry?: () => void;
  retryLabel?: React.ReactNode;
};

/**
 * The chart, or the state in its place, at the same height so the card never jumps: 240px by default, the height of
 * a growth chart. A taller chart takes a `min-h-*` to match; the height leaves out the padding.
 */
function ChartCardContent({
  className,
  children,
  loadingLabel = 'Loading chart',
  emptyTitle = 'No data yet',
  emptyDescription = 'The chart fills in as soon as the first data comes in.',
  errorTitle = 'The chart could not load',
  errorDescription = 'The data did not arrive. Try again in a moment.',
  onRetry,
  retryLabel = 'Try again',
  ...props
}: ChartCardContentProps) {
  const { state } = React.useContext(ChartCardContext);

  return (
    <div
      data-slot="chart-card-content"
      data-state={state}
      className={cn('box-content flex min-h-60 min-w-0 flex-1 flex-col px-4 pb-4', className)}
      {...props}
    >
      <span role="status" className="sr-only">
        {state === 'loading' ? loadingLabel : null}
      </span>
      {state === 'loading' ? (
        <Skeleton className="min-h-0 flex-1" />
      ) : state === 'empty' ? (
        <Empty className="p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartNoAxesColumn />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : state === 'error' ? (
        <Empty role="alert" className="p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="text-destructive">
              <CircleAlert />
            </EmptyMedia>
            <EmptyTitle>{errorTitle}</EmptyTitle>
            <EmptyDescription>{errorDescription}</EmptyDescription>
          </EmptyHeader>
          {onRetry ? (
            <EmptyContent>
              <Button variant="secondary" size="sm" onClick={onRetry}>
                <RotateCw data-icon="inline-start" />
                {retryLabel}
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        children
      )}
    </div>
  );
}

export {
  ChartCard,
  ChartCardHeader,
  ChartCardTitle,
  ChartCardDescription,
  ChartCardAction,
  ChartCardLegend,
  ChartCardContent,
  type ChartCardProps,
  type ChartCardState,
  type ChartCardContentProps,
};
