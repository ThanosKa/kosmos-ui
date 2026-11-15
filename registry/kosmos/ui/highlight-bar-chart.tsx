'use client';

import * as React from 'react';
import { type ChartEntrance, useChartEntrance, useCountUp, useReducedMotion } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';

type HighlightBarChartItem = {
  /** The short label under the bar ("Mon", "Oct 4"), and in the value pill. */
  label: string;
  value: number;
  /** The full name screen readers hear ("Mon, Oct 5"). Defaults to `label`. */
  name?: string;
};

type HighlightBarChartProps = Omit<React.ComponentProps<'figure'>, 'children'> & {
  /** The periods to compare, oldest first. The last one is lit until a bar is picked. */
  data: readonly HighlightBarChartItem[];
  /** Names the chart for screen readers and captions its hidden table, such as "Events, last 7 days". */
  label: string;
  /** Writes the value in the pill. The hidden table and announcements read the whole number. */
  format?: (value: number) => string;
  /** When the bars grow in. See `ChartEntrance`. */
  entrance?: ChartEntrance;
};

/** Above this many bars only the first and last labels show, so they never crowd. */
const MAX_LABELS = 12;
/** Room above the tallest bar for the value pill. */
const HEADROOM = 1.15;
/** The bars' stagger spreads over this long, however many there are. */
const SPREAD_MS = 300;

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat('en-US');
const formatCompact = (value: number) => compact.format(value);

/**
 * Bars that compare periods, one of them lit: the latest by default, the one clicked or picked with the arrow keys,
 * and the one under the pointer while it hovers. A dashed line runs across at the lit bar's height and ends in a pill
 * with its value. On entrance the bars grow from the baseline one after another, then the line draws across and the
 * pill opens. New data moves each bar from its old height to the new one; under reduced motion the bars fade in again.
 */
function HighlightBarChart({ data, label, format = formatCompact, entrance, className, ...props }: HighlightBarChartProps) {
  const figure = React.useRef<HTMLElement>(null);
  const { revealed, instant } = useChartEntrance(figure, entrance);
  const reduced = useReducedMotion();
  const [pinned, setPinned] = React.useState<number | null>(null);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [shownData, setShownData] = React.useState(data);
  const [version, setVersion] = React.useState(0);
  if (data !== shownData) {
    setShownData(data);
    setVersion(version + 1);
    setPinned(null);
    setHovered(null);
  }

  const values = data.map((bar) => Math.max(bar.value, 0));
  const lit = Math.min(hovered ?? pinned ?? data.length - 1, data.length - 1);
  const litBar = data[lit];
  const litValue = useCountUp(values[lit] ?? 0, { ready: revealed, instant });
  const max = Math.max(...values, 0) * HEADROOM || 1;
  const height = (value: number) => `${(value / max) * 100}%`;
  const delay = (index: number, after = 0) => `${after + index * (SPREAD_MS / data.length)}ms`;
  const dense = data.length > MAX_LABELS;
  const showLabel = (index: number) => !dense || index === 0 || index === data.length - 1;
  const gap = dense ? 'gap-1' : 'gap-1.5 @sm/highlight-bar-chart:gap-3';

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    const jump = { Home: 0, End: data.length - 1 }[event.key];
    if ((step === undefined && jump === undefined) || data.length === 0) return;
    event.preventDefault();
    setHovered(null);
    setPinned(jump ?? Math.min(Math.max(lit + (step ?? 0), 0), data.length - 1));
  };

  return (
    <figure
      ref={figure}
      data-slot="highlight-bar-chart"
      data-instant={instant || undefined}
      className={cn('@container/highlight-bar-chart m-0 flex min-w-0 flex-col gap-2 data-instant:**:transition-none', className)}
      {...props}
    >
      <div
        role="group"
        aria-roledescription="bar chart"
        aria-label={`${label}. Use the arrow keys to read each bar.`}
        tabIndex={data.length > 0 ? 0 : undefined}
        onKeyDown={onKeyDown}
        onPointerLeave={() => setHovered(null)}
        data-slot="highlight-bar-chart-plot"
        className="relative h-44 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {/* Keyed by place, so new data moves each bar from its old height; under reduced motion a new key fades them in again. */}
        <div key={reduced ? version : undefined} className={cn('absolute inset-0 flex items-end', gap)}>
          {data.map((bar, index) => (
            <div
              key={index}
              onPointerEnter={() => setHovered(index)}
              onClick={() => setPinned(index)}
              className="flex h-full min-w-0 flex-1 items-end justify-center"
            >
              <div
                style={{ '--bar-height': height(values[index]), '--delay': delay(index) } as React.CSSProperties}
                className={cn(
                  'h-(--bar-height) w-full max-w-10 origin-bottom',
                  'transition-[opacity] delay-(--delay) duration-reveal ease-power3-out motion-safe:transition-[scale,opacity,height]',
                  'starting:opacity-0 motion-safe:starting:scale-y-0',
                  !revealed && 'opacity-0 motion-safe:scale-y-0',
                )}
              >
                <div
                  data-slot="highlight-bar-chart-bar"
                  data-lit={index === lit || undefined}
                  className={cn(
                    'size-full rounded-md bg-chart-1/10 transition-[background-color] duration-base',
                    'data-lit:bg-chart-1 forced-colors:bg-[GrayText] forced-colors:data-lit:bg-[CanvasText]',
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        {litBar ? (
          <div
            aria-hidden
            data-slot="highlight-bar-chart-marker"
            // Never lower than half the pill, so a zero value keeps the pill above the labels.
            style={{ '--line-at': `max(${height(values[lit])}, calc(var(--spacing) * 2.5))` } as React.CSSProperties}
            className="pointer-events-none absolute inset-x-0 bottom-(--line-at) flex translate-y-1/2 items-center motion-safe:transition-[bottom] motion-safe:duration-slow motion-safe:ease-smooth-in-out"
          >
            <span
              style={{ '--delay': `${SPREAD_MS}ms` } as React.CSSProperties}
              className={cn(
                'h-0 flex-1 border-t border-dashed border-foreground/40',
                // An end state the start can move to: `none` is not a shape, so it would snap.
                'transition-[clip-path,opacity] delay-(--delay) duration-slow ease-smooth-in-out [clip-path:inset(0)]',
                !revealed && 'motion-safe:[clip-path:inset(0_100%_0_0)] motion-reduce:opacity-0',
              )}
            />
            <span
              data-slot="highlight-bar-chart-value"
              style={{ '--delay': `${SPREAD_MS + 250}ms` } as React.CSSProperties}
              className={cn(
                'flex max-w-full min-w-0 shrink-0 origin-left rounded-full bg-primary px-2 py-0.5 text-caption font-medium whitespace-nowrap text-primary-foreground tabular-nums',
                'transition-[opacity,scale] delay-(--delay) duration-base ease-power3-out',
                !revealed && 'opacity-0 motion-safe:scale-90',
              )}
            >
              <span className="truncate">{litBar.label}</span>
              <span className="shrink-0">&nbsp;· {format(litValue)}</span>
            </span>
          </div>
        ) : null}
      </div>

      <div aria-hidden data-slot="highlight-bar-chart-labels" className={cn('flex', gap)}>
        {data.map((bar, index) => (
          <span
            key={index}
            style={{ '--delay': delay(index, 150) } as React.CSSProperties}
            className={cn(
              'min-w-0 flex-1 text-center text-caption',
              'transition-[opacity,translate] delay-(--delay) duration-base ease-power3-out',
              'starting:opacity-0 motion-safe:starting:translate-y-1',
              !revealed && 'opacity-0 motion-safe:translate-y-1',
              dense && index === 0 && 'text-start whitespace-nowrap',
              // A flex end keeps an overflowing last label inside the chart; `text-end` would let it spill past the edge.
              dense && index === data.length - 1 && 'flex justify-end whitespace-nowrap',
            )}
          >
            <span className={cn('text-muted-foreground transition-[color]', index === lit && 'text-foreground')}>
              {showLabel(index) ? bar.label : null}
            </span>
          </span>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {litBar && (hovered !== null || pinned !== null) ? `${litBar.name ?? litBar.label}: ${whole.format(values[lit])}` : ''}
      </p>
      {/* A table keeps its content width at 1px, so the visually hidden box is a wrapper. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <tbody>
            {data.map((bar, index) => (
              <tr key={index}>
                <th scope="row">{bar.name ?? bar.label}</th>
                <td>{whole.format(values[index])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export { HighlightBarChart, type HighlightBarChartItem, type HighlightBarChartProps };
