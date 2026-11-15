import type * as React from 'react';
import type { ChartEntrance } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';
import { BarListEntrance } from '@/registry/kosmos/ui/bar-list-entrance';

type BarListItem = {
  /** What the row counts: a page, a country, an event. A long label truncates. */
  label: React.ReactNode;
  value: number;
  /** Muted text after the label, such as a country code or a count. */
  meta?: React.ReactNode;
  /** Identifies the row across renders. Defaults to its position. */
  id?: React.Key;
};

type BarListProps = Omit<React.ComponentProps<'ul'>, 'children'> & {
  items: BarListItem[];
  /** Writes each value. Defaults to a grouped number (18,420). */
  format?: (value: number) => string;
  /** Adds a column with each row's share of the total. */
  showShare?: boolean;
  /** What the share is a share of, when the list shows only the top rows of a larger whole. Defaults to the sum of `items`. */
  total?: number;
  /** What shows in place of the list when `items` is empty. */
  empty?: React.ReactNode;
  /** When the bars grow in: the first time in the browser tab (`session`, the default), every time, or never. */
  entrance?: ChartEntrance;
};

/** The bars start one after another within this span, so a long list takes no longer than a short one. */
const SPREAD_MS = 240;

const grouped = new Intl.NumberFormat('en-US');
const formatGrouped = (value: number) => grouped.format(value);

function shareText(value: number, total: number) {
  if (total <= 0 || value <= 0) return '0%';
  const percent = (value / total) * 100;
  return percent < 1 ? '<1%' : `${Math.round(percent)}%`;
}

/**
 * Ranked values as rows whose fill is the bar: the label sits on the bar, the value and an optional share at the end.
 * The largest value's bar is the chart ink at low strength and the rest are muted, so the leader stands out without a
 * hue; on a tie, the first of them leads. On entrance the bars grow from the start edge one after another; under
 * reduced motion they fade in. Renders a `<ul>`, or a status `<div>` with `empty` when there are no items; name it with
 * `aria-label` or `aria-labelledby`.
 */
function BarList({
  items,
  format = formatGrouped,
  showShare = false,
  total,
  empty = 'No data yet',
  entrance,
  className,
  ...props
}: BarListProps) {
  if (items.length === 0) {
    return (
      <div
        role="status"
        data-slot="bar-list"
        data-empty=""
        className={cn('flex min-h-20 items-center justify-center p-4 text-center text-small text-muted-foreground', className)}
        {...(props as React.ComponentProps<'div'>)}
      >
        {empty}
      </div>
    );
  }

  const values = items.map((item) => (Number.isFinite(item.value) ? Math.max(0, item.value) : 0));
  const max = Math.max(...values);
  const whole = total ?? values.reduce((sum, value) => sum + value, 0);
  const leader = max > 0 ? values.indexOf(max) : -1;

  return (
    <BarListEntrance
      entrance={entrance}
      role="list"
      data-slot="bar-list"
      className={cn(
        'grid min-w-0 gap-x-3 gap-y-1 data-instant:**:transition-none',
        showShare ? 'grid-cols-[minmax(0,1fr)_auto_auto]' : 'grid-cols-[minmax(0,1fr)_auto]',
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <li
          key={item.id ?? index}
          data-slot="bar-list-item"
          data-leader={index === leader || undefined}
          className="col-span-full grid grid-cols-subgrid items-center"
        >
          <div className="relative flex h-8 min-w-0 items-center overflow-hidden rounded-lg">
            {values[index] > 0 ? (
              <span
                aria-hidden
                style={
                  {
                    '--bar': `${(values[index] / max) * 100}%`,
                    '--delay': `${index * (SPREAD_MS / items.length)}ms`,
                  } as React.CSSProperties
                }
                className={cn(
                  'absolute inset-y-0 start-0 w-(--bar) min-w-4 rounded-lg border border-transparent ltr:origin-left rtl:origin-right',
                  'transition-[opacity] delay-(--delay) duration-reveal ease-power3-out motion-safe:transition-[scale,opacity,width]',
                  'in-data-waiting:opacity-0 motion-safe:in-data-waiting:scale-x-0',
                  index === leader ? 'bg-chart-1/15' : 'bg-muted',
                )}
              />
            ) : null}
            <span className="relative flex w-full min-w-0 items-center gap-2 px-2.5 text-body">
              <span title={typeof item.label === 'string' ? item.label : undefined} className="min-w-0 truncate text-foreground">
                {item.label}
              </span>
              {item.meta === undefined || item.meta === null ? null : (
                <span className="max-w-1/2 shrink-0 truncate text-caption text-muted-foreground">{item.meta}</span>
              )}
            </span>
          </div>
          <span className="text-end text-body whitespace-nowrap text-foreground tabular-nums">
            <bdi dir="ltr">{format(item.value)}</bdi>
          </span>
          {showShare ? (
            <span className="text-end text-small whitespace-nowrap text-muted-foreground tabular-nums">
              <bdi dir="ltr">{shareText(values[index], whole)}</bdi>
            </span>
          ) : null}
        </li>
      ))}
    </BarListEntrance>
  );
}

export { BarList, type BarListItem, type BarListProps };
