'use client';

import * as React from 'react';
import { type ChartEntrance, useChartEntrance, useCountUp, useReducedMotion } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration } from '@/registry/kosmos/lib/motion';
import { Button } from '@/registry/kosmos/ui/button';

type DailyStackedBarChartSeries = {
  /** The key of the series in each day's `values`. */
  key: string;
  label: string;
  /** Any CSS color. Defaults to the chart tokens in order, `--chart-1` for the first series to `--chart-5` for the fifth. */
  color?: string;
};

type DailyStackedBarChartItem = {
  /** The short label under the bar ("Oct 11"). */
  label: string;
  /** The full name in the tooltip and for screen readers ("Sun, Oct 11"). Defaults to `label`. */
  name?: string;
  /** One amount per series key. A missing or negative amount counts as zero. */
  values: Record<string, number>;
};

type DailyStackedBarChartProps = Omit<React.ComponentProps<'figure'>, 'children'> & {
  /** The days, oldest first. The last one is selected until another is picked. */
  data: readonly DailyStackedBarChartItem[];
  /** The series stacked in each bar, from the bottom up, each with a button that shows its total and hides or shows it. */
  series: readonly DailyStackedBarChartSeries[];
  /** Names the chart for screen readers and captions its hidden table, such as "Events by platform, last 14 days". */
  label: string;
  /** Writes the totals, the axis and the tooltip. The hidden table and the bars' names read the whole number. */
  format?: (value: number) => string;
  /** When the bars build up. See `ChartEntrance`. */
  entrance?: ChartEntrance;
};

type Phase = 'idle' | 'column' | 'tooltip' | 'settled';

const PHASES: readonly Phase[] = ['idle', 'column', 'tooltip', 'settled'];

/** When the first bar starts to build, once the axis and labels are on their way. */
const BARS_START_MS = 200;
/** The time between one bar starting to build and the next, left to right. */
const BAR_STAGGER_MS = 40;
/** The time between one segment starting to grow and the one above it. */
const SEGMENT_STAGGER_MS = 70;
const GROW_MS = duration.slow * 1000;
/** The highlight column is most of the way up when the tooltip starts to rise in. */
const TOOLTIP_AFTER_MS = 200;
const TICK_STAGGER_MS = 40;
const LABEL_STAGGER_MS = 25;
/** Room a short day label needs; past this the labels thin out from the last day backwards. */
const LABEL_WIDTH = 44;
/** About the width of one caption character, so longer labels thin out sooner. */
const LABEL_CHAR_WIDTH = 8;
/** The tooltip's distance from the column. */
const TOOLTIP_GAP = 8;
/** The tooltip's width, `w-36`, for placing it in CSS. */
const TOOLTIP_WIDTH = 'calc(var(--spacing) * 36)';
const TICKS = 4;

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat('en-US');
const formatCompact = (value: number) => compact.format(value);

const seriesColor = (item: DailyStackedBarChartSeries, index: number) => item.color ?? `var(--chart-${Math.min(index, 4) + 1})`;
const amount = (day: DailyStackedBarChartItem, key: string) => Math.max(day.values[key] ?? 0, 0);

function useSize<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((current) => (current && current.width === width && current.height === height ? current : { width, height }));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

/** True two frames after `ready`, once marks mounted then have painted. */
function usePaintedAfter(ready: boolean) {
  const [painted, setPainted] = React.useState(false);
  React.useEffect(() => {
    if (!ready || painted) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPainted(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [ready, painted]);
  return painted;
}

/** Round ticks from zero up to the first one at or above `max`, about four steps apart. */
function niceTicks(max: number) {
  if (!(max > 0) || !Number.isFinite(max)) return [0];
  const raw = max / TICKS;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5].map((m) => m * power).find((candidate) => candidate >= raw) ?? 10 * power;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

/** A number that counts to `value`, with the final value for screen readers. */
function Count({ value, format, ready, instant }: { value: number; format: (value: number) => string; ready: boolean; instant: boolean }) {
  const shown = useCountUp(value, { ready, instant });
  return (
    <>
      <span aria-hidden>{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}

/**
 * A few series stacked per day, with a stat button per series that shows its total and hides or shows it. One day is
 * selected: a soft column sits behind its bar and a tooltip beside it lists each amount. Hover previews a day, a click or
 * the arrow keys select one. The bars build up segment by segment from the axis, left to right, then the column rises
 * and the tooltip opens. Hiding a series folds its segments away while the others close up and the axis rescales;
 * under reduced motion the plot fades in again instead.
 */
function DailyStackedBarChart({
  data,
  series,
  label,
  format = formatCompact,
  entrance,
  className,
  ...props
}: DailyStackedBarChartProps) {
  const figure = React.useRef<HTMLElement>(null);
  const { revealed, instant } = useChartEntrance(figure, entrance);
  const reduced = useReducedMotion();
  const [plotRef, size] = useSize<HTMLDivElement>();
  const days = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(() => new Set());
  const [pinned, setPinned] = React.useState<number | null>(null);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [phaseState, setPhaseState] = React.useState<Phase>('idle');
  const [shownData, setShownData] = React.useState(data);
  const [version, setVersion] = React.useState(0);
  const [skipped, setSkipped] = React.useState(entrance === 'none');
  if (data !== shownData) {
    setShownData(data);
    setVersion(version + 1);
    setPinned(null);
    setHovered(null);
  }
  if (instant && !skipped) setSkipped(true);
  // The plot mounts once it is measured, so a chart that skips its entrance keeps its transitions off until then.
  const painted = usePaintedAfter(size !== null && revealed);
  const still = instant || (skipped && !painted);

  const columnAt = BARS_START_MS + Math.max(data.length - 1, 0) * BAR_STAGGER_MS + Math.max(series.length - 1, 0) * SEGMENT_STAGGER_MS + GROW_MS;
  React.useEffect(() => {
    if (!revealed) return;
    // Phases only move forward, so a chart that has settled never plays its column again.
    const advance = (next: Phase) => setPhaseState((current) => (PHASES.indexOf(current) < PHASES.indexOf(next) ? next : current));
    const timers = skipped
      ? [setTimeout(() => advance('settled'))]
      : [
          setTimeout(() => advance('column'), columnAt),
          setTimeout(() => advance('tooltip'), columnAt + TOOLTIP_AFTER_MS),
          setTimeout(() => advance('settled'), columnAt + TOOLTIP_AFTER_MS + GROW_MS),
        ];
    return () => timers.forEach(clearTimeout);
  }, [revealed, skipped, columnAt]);

  // A chart that skips its entrance lands with the column and tooltip already in place.
  const phase = skipped ? 'settled' : phaseState;
  const settled = phase === 'settled';
  const columnIn = phase !== 'idle';
  const tooltipIn = phase === 'tooltip' || settled;
  const delay = (ms: number) => ({ '--delay': `${settled ? 0 : ms}ms` }) as React.CSSProperties;

  const visible = series.filter((item) => !hidden.has(item.key));
  const totalOf = (day: DailyStackedBarChartItem) => visible.reduce((total, item) => total + amount(day, item.key), 0);
  const ticks = niceTicks(Math.max(0, ...data.map(totalOf)));
  const top = ticks[ticks.length - 1] || 1;
  const last = data.length - 1;
  const selected = pinned === null ? last : Math.min(pinned, last);
  const lit = hovered === null ? selected : Math.min(hovered, last);
  const litDay = data[lit];

  const toggle = (key: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else if (series.filter((item) => !next.has(item.key)).length > 1) next.add(key);
      return next;
    });

  const select = (index: number) => {
    setHovered(null);
    setPinned(index);
    days.current[index]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    const jump = { Home: 0, End: last }[event.key];
    if ((step === undefined && jump === undefined) || data.length === 0) return;
    event.preventDefault();
    select(jump ?? Math.min(Math.max(selected + (step ?? 0), 0), last));
  };

  const slot = size && data.length > 0 ? size.width / data.length : 0;
  const longest = Math.max(0, ...data.map((day) => day.label.length));
  const labelWidth = Math.max(LABEL_WIDTH, longest * LABEL_CHAR_WIDTH);
  const labelEvery = slot ? Math.ceil(labelWidth / slot) : 1;
  const labelRoom = size ? Math.min(labelEvery * slot, size.width) : 0;
  // A label at either end moves inward to stay in the chart, so the label next to it needs that much more room.
  const edgeShift = Math.max(0, (labelWidth - slot) / 2);
  const firstShown = last % labelEvery === 0;
  const showLabel = (d: number) =>
    (last - d) % labelEvery === 0 &&
    (d === last || (last - d) * slot >= labelWidth + edgeShift) &&
    (d === 0 || !firstShown || d * slot >= labelWidth + edgeShift);
  const columnLeft = lit * slot;
  // Beside the column on the side with more room, and never past the plot's edges.
  const tooltipX = !size
    ? '0px'
    : columnLeft + slot / 2 <= size.width / 2
      ? `max(0px, min(${columnLeft + slot + TOOLTIP_GAP}px, ${size.width}px - var(--tooltip-w)))`
      : `max(0px, ${columnLeft - TOOLTIP_GAP}px - var(--tooltip-w))`;

  return (
    <figure
      ref={figure}
      data-slot="daily-stacked-bar-chart"
      data-instant={still || undefined}
      className={cn('@container/daily-stacked-bar-chart m-0 flex min-w-0 flex-col gap-4 data-instant:**:transition-none', className)}
      {...props}
    >
      <div
        role="group"
        aria-label="Series"
        data-slot="daily-stacked-bar-chart-series"
        className="grid grid-cols-2 gap-1 @md/daily-stacked-bar-chart:grid-flow-col @md/daily-stacked-bar-chart:grid-cols-none @md/daily-stacked-bar-chart:auto-cols-fr"
      >
        {series.map((item, s) => {
          const off = hidden.has(item.key);
          return (
            <Button
              key={item.key}
              variant="item"
              aria-pressed={!off}
              onClick={() => toggle(item.key)}
              data-slot="daily-stacked-bar-chart-toggle"
              data-hidden={off || undefined}
              style={{ '--series': seriesColor(item, s), ...delay(s * BAR_STAGGER_MS) } as React.CSSProperties}
              className="h-auto min-w-0 flex-col items-stretch justify-start gap-2 rounded-lg p-2 text-start whitespace-normal"
            >
              <span
                aria-hidden
                className={cn(
                  'h-1 w-full origin-left rounded-full bg-(--series) forced-colors:bg-[CanvasText]',
                  'transition-[opacity] delay-(--delay) duration-reveal ease-power3-out motion-safe:transition-[opacity,scale]',
                  !revealed && 'motion-safe:scale-x-0 motion-reduce:opacity-0',
                  off && 'opacity-20',
                )}
              />
              <span className="flex min-w-0 flex-col">
                <span title={item.label} className="truncate text-caption font-normal text-muted-foreground">
                  {item.label}
                </span>
                <span className={cn('truncate text-title tabular-nums transition-[color]', off && 'font-normal text-muted-foreground')}>
                  <Count
                    value={data.reduce((total, day) => total + amount(day, item.key), 0)}
                    format={format}
                    ready={revealed}
                    instant={still}
                  />
                </span>
              </span>
            </Button>
          );
        })}
      </div>

      <div data-slot="daily-stacked-bar-chart-plot-area" className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-2">
        <div aria-hidden data-slot="daily-stacked-bar-chart-axis" className="relative h-48">
          {/* Every tick in flow at no height, so the axis is as wide as its widest label. */}
          <div className="invisible flex h-0 flex-col overflow-hidden text-caption whitespace-nowrap tabular-nums">
            {ticks.map((tick) => (
              <span key={tick}>{format(tick)}</span>
            ))}
          </div>
          <div key={top} className="absolute inset-0">
            {ticks.map((tick, t) => (
              <span
                key={tick}
                style={{ '--at': `${(tick / top) * 100}%`, ...delay(t * TICK_STAGGER_MS) } as React.CSSProperties}
                className={cn(
                  'absolute right-0 bottom-(--at) translate-y-1/2 text-caption whitespace-nowrap text-muted-foreground tabular-nums',
                  'transition-[opacity] delay-(--delay) duration-base ease-power3-out motion-safe:transition-[opacity,translate]',
                  'starting:opacity-0 motion-safe:starting:-translate-x-1',
                  !revealed && 'opacity-0 motion-safe:-translate-x-1',
                )}
              >
                {format(tick)}
              </span>
            ))}
          </div>
        </div>

        <div ref={plotRef} data-slot="daily-stacked-bar-chart-plot" className="relative h-48 min-w-0" onPointerLeave={() => setHovered(null)}>
          {size ? (
            <div
              key={reduced ? `${version}-${visible.map((item) => item.key).join()}` : undefined}
              className="absolute inset-0 transition-[opacity] duration-base starting:opacity-0"
            >
              {litDay ? (
                <div
                  aria-hidden
                  key={reduced ? lit : undefined}
                  data-slot="daily-stacked-bar-chart-column"
                  style={{ '--x': `${columnLeft}px`, '--w': `${slot}px` } as React.CSSProperties}
                  className={cn(
                    'absolute inset-y-0 left-0 w-(--w) origin-bottom translate-x-(--x) rounded-md bg-accent',
                    'transition-[opacity] duration-slow ease-smooth-in-out motion-safe:transition-[opacity,scale,translate] starting:opacity-0',
                    !columnIn && 'opacity-0 motion-safe:scale-y-0',
                  )}
                />
              ) : null}

              <div
                role="group"
                aria-roledescription="stacked bar chart"
                aria-label={`${label}. Use the arrow keys to move between days.`}
                onKeyDown={onKeyDown}
                className="absolute inset-0 flex"
              >
                {data.map((day, d) => {
                  const total = totalOf(day);
                  return (
                    // Keyed by place, so a change moves each stack from its current shape instead of mounting a new one.
                    <Button
                      key={d}
                      ref={(element: HTMLButtonElement | null) => {
                        days.current[d] = element;
                      }}
                      variant="item"
                      tabIndex={d === selected ? 0 : -1}
                      aria-pressed={d === selected}
                      aria-label={`${day.name ?? day.label}: ${visible.map((item) => `${item.label} ${whole.format(amount(day, item.key))}`).join(', ')}. Total ${whole.format(total)}.`}
                      onPointerEnter={() => setHovered(d)}
                      onClick={() => select(d)}
                      data-slot="daily-stacked-bar-chart-day"
                      data-lit={d === lit || undefined}
                      className="h-full min-w-0 flex-1 items-end rounded-md border-0 px-0 hover:not-data-disabled:bg-transparent"
                    >
                      <span data-slot="daily-stacked-bar-chart-bar" className="flex w-3/5 max-w-6 flex-col-reverse overflow-hidden rounded-sm">
                        {series.map((item, s) => {
                          const off = hidden.has(item.key);
                          const height = off || (!revealed && !reduced) ? 0 : (amount(day, item.key) / top) * size.height;
                          return (
                            <span
                              key={item.key}
                              data-slot="daily-stacked-bar-chart-segment"
                              style={
                                {
                                  '--series': seriesColor(item, s),
                                  '--h': `${height}px`,
                                  ...delay(BARS_START_MS + d * BAR_STAGGER_MS + s * SEGMENT_STAGGER_MS),
                                } as React.CSSProperties
                              }
                              className={cn(
                                // The transparent top edge is the 1px gap to the segment above, in the color behind the bar.
                                'block h-(--h) shrink-0 border-t border-transparent bg-(--series) bg-clip-padding forced-colors:bg-[CanvasText]',
                                'transition-[opacity] delay-(--delay) duration-slow motion-safe:transition-[height,border-top-width]',
                                settled ? 'ease-smooth-in-out' : 'ease-power3-out',
                                height === 0 && 'border-t-0',
                                !revealed && 'motion-reduce:opacity-0',
                              )}
                            />
                          );
                        })}
                      </span>
                    </Button>
                  );
                })}
              </div>

              {litDay ? (
                <div
                  aria-hidden
                  key={reduced ? `tooltip-${lit}` : undefined}
                  data-slot="daily-stacked-bar-chart-tooltip"
                  style={{ '--x': tooltipX, '--tooltip-w': TOOLTIP_WIDTH } as React.CSSProperties}
                  className={cn(
                    'pointer-events-none absolute top-0 left-0 w-(--tooltip-w) max-w-full translate-x-(--x)',
                    'transition-[opacity] duration-base ease-smooth-in-out starting:opacity-0',
                    'motion-safe:transition-[opacity,translate] motion-safe:duration-slow',
                    !tooltipIn && 'opacity-0 motion-safe:translate-y-1',
                  )}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)] gap-1.5 rounded-xl border border-transparent bg-popover px-2.5 py-1.5 text-caption text-popover-foreground tabular-nums shadow-popover">
                    <div className="truncate font-medium">{litDay.name ?? litDay.label}</div>
                    <ul className="grid grid-cols-[minmax(0,1fr)] gap-1">
                      {series.map((item, s) => {
                        const off = hidden.has(item.key);
                        return (
                          <li key={item.key} style={{ '--series': seriesColor(item, s) } as React.CSSProperties} className="flex items-center gap-2">
                            <span
                              className={cn(
                                'size-2 shrink-0 rounded-sm bg-(--series) transition-[opacity] forced-colors:bg-[CanvasText]',
                                off && 'opacity-25',
                              )}
                            />
                            <span className="min-w-0 flex-1 truncate text-muted-foreground">{item.label}</span>
                            <span className={cn('shrink-0 font-medium transition-[color]', off && 'font-normal text-muted-foreground')}>
                              <Count value={amount(litDay, item.key)} format={format} ready={tooltipIn} instant={still} />
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex items-center gap-2 border-t border-border pt-1.5 font-medium">
                      <span className="flex-1">Total</span>
                      <span className="shrink-0">
                        <Count value={totalOf(litDay)} format={format} ready={tooltipIn} instant={still} />
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div aria-hidden data-slot="daily-stacked-bar-chart-labels" className="col-start-2 flex min-w-0">
          {data.map((day, d) => (
            <span
              key={d}
              style={{ '--label-room': `${labelRoom}px`, ...delay(100 + d * LABEL_STAGGER_MS) } as React.CSSProperties}
              className={cn(
                'flex min-w-0 flex-1 justify-center text-caption whitespace-nowrap',
                // At the edges a label wider than its day stays inside the chart, and is centered when it fits.
                d === 0 && 'justify-center-safe',
                // Right to left, so the last label's safe fallback is the right edge.
                d === last && 'justify-center-safe [direction:rtl]',
                'transition-[opacity] delay-(--delay) duration-base ease-power3-out motion-safe:transition-[opacity,translate]',
                !revealed && 'opacity-0 motion-safe:translate-y-1',
              )}
            >
              <span className={cn('max-w-(--label-room) shrink-0 truncate text-muted-foreground transition-[color] [direction:ltr]', d === lit && 'text-foreground')}>
                {showLabel(d) ? day.label : null}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* A table keeps its content width at 1px, so the visually hidden box is a wrapper. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              {series.map((item) => (
                <th key={item.key} scope="col">
                  {item.label}
                </th>
              ))}
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day, d) => (
              <tr key={d}>
                <th scope="row">{day.name ?? day.label}</th>
                {series.map((item) => (
                  <td key={item.key}>{whole.format(amount(day, item.key))}</td>
                ))}
                <td>{whole.format(series.reduce((total, item) => total + amount(day, item.key), 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export { DailyStackedBarChart, type DailyStackedBarChartItem, type DailyStackedBarChartProps, type DailyStackedBarChartSeries };
