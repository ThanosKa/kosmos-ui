'use client';

import * as React from 'react';
import { type ChartEntrance, useChartEntrance, useCountUp, useReducedMotion } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';

type StackedBlockChartSeries = {
  /** The key of the series in each period's `values`. */
  key: string;
  label: string;
  /** Any CSS color. Defaults to the chart tokens in order, `--chart-1` for the first series to `--chart-5` for the fifth. */
  color?: string;
};

type StackedBlockChartItem = {
  /** The label under the column ("Oct 2026"). */
  label: string;
  /** The full name screen readers hear ("October 2026"). Defaults to `label`. */
  name?: string;
  /** One amount per series key. A missing or negative amount counts as zero. */
  values: Record<string, number>;
};

type StackedBlockChartProps = Omit<React.ComponentProps<'figure'>, 'children'> & {
  /** The periods, oldest first, one column each. The last one's total is in full ink. */
  data: readonly StackedBlockChartItem[];
  /** The parts of each column, from the bottom up. */
  series: readonly StackedBlockChartSeries[];
  /** Names the chart for screen readers and captions its hidden table, such as "Users by platform, 2024 to 2026". */
  label: string;
  /** Writes the total above each column. The hidden table and announcements read the whole number. */
  format?: (value: number) => string;
  /** When the blocks build up. See `ChartEntrance`. */
  entrance?: ChartEntrance;
};

/** The space between two blocks of a column. */
const GAP = 2;
/** The least a block is drawn, so a tiny or zero part still shows. */
const MIN_BLOCK = 4;
/** Room above the columns for the totals and below them for the labels. */
const LABEL_ROOM = 22;
/** Each column takes up to this share of the width; the rest is the bands between them. */
const COLUMN_SHARE = 0.18;
/** A column is at most this share of its step, so many columns still leave room for the bands. */
const COLUMN_MAX_OF_STEP = 0.66;
/** About the width of one character of a total, so totals thin out before they touch. */
const TOTAL_CHAR_WIDTH = 8;
/** The least space between two labels under the columns. */
const LABEL_GAP = 8;
/** The time between one block starting to grow and the next, bottom to top and column after column. */
const BLOCK_STAGGER_MS = 45;
/** The time between one band starting to flow and the one above it. */
const BAND_STAGGER_MS = 60;

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat('en-US');
const formatCompact = (value: number) => compact.format(value);

const seriesColor = (item: StackedBlockChartSeries, index: number) => item.color ?? `var(--chart-${Math.min(index, 4) + 1})`;
const amount = (column: StackedBlockChartItem, key: string) => Math.max(column.values[key] ?? 0, 0);

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
 * Parts of a whole across a few periods: each period is a column of rounded blocks, one per series, stacked from the
 * first series at the bottom, and faint bands join each series from one column to the next. The blocks build up one
 * after another, and each band flows across from its left column once the right one is up, the lowest first. New data
 * moves every block and band to its new place. Hovering a block, or the arrow keys, lift its series and fade the rest.
 */
function StackedBlockChart({ data, series, label, format = formatCompact, entrance, className, ...props }: StackedBlockChartProps) {
  const figure = React.useRef<HTMLElement>(null);
  const { revealed, instant } = useChartEntrance(figure, entrance);
  const reduced = useReducedMotion();
  const [plotRef, size] = useSize<HTMLDivElement>();
  const [active, setActive] = React.useState<string | null>(null);
  const [skipped, setSkipped] = React.useState(entrance === 'none');
  const [shownData, setShownData] = React.useState(data);
  const [version, setVersion] = React.useState(0);
  if (data !== shownData) {
    setShownData(data);
    setVersion(version + 1);
  }
  if (instant && !skipped) setSkipped(true);
  // The marks mount once the plot is measured, so a chart that skips its entrance keeps its transitions off until then.
  const painted = usePaintedAfter(size !== null && revealed);
  const still = instant || (skipped && !painted);

  const totals = data.map((column) => series.reduce((total, item) => total + amount(column, item.key), 0));
  const largest = Math.max(0, ...totals) || 1;
  const activeIndex = series.findIndex((item) => item.key === active);

  const layout = size
    ? (() => {
        const plotTop = LABEL_ROOM;
        const plotBottom = size.height - LABEL_ROOM;
        const room = Math.max(plotBottom - plotTop - GAP * Math.max(series.length - 1, 0), 0);
        const width =
          data.length > 1 ? Math.min(size.width * COLUMN_SHARE, (size.width / data.length) * COLUMN_MAX_OF_STEP) : size.width * COLUMN_SHARE;
        const step = data.length > 1 ? (size.width - width) / (data.length - 1) : 0;
        const start = data.length > 1 ? 0 : (size.width - width) / 2;
        return data.map((column, c) => {
          const x = start + c * step;
          let y = plotBottom;
          const blocks = series.map((item) => {
            const height = Math.max(MIN_BLOCK, (amount(column, item.key) / largest) * room);
            const block = { key: item.key, x, y: y - height, width, height };
            y -= height + GAP;
            return block;
          });
          return { x, width, top: Math.max(y + GAP, LABEL_ROOM), blocks };
        });
      })()
    : [];

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (series.length === 0 || data.length === 0) return;
    if (event.key === 'Escape') {
      setActive(null);
      return;
    }
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[event.key];
    const jump = { Home: 0, End: series.length - 1 }[event.key];
    if (step === undefined && jump === undefined) return;
    event.preventDefault();
    const from = activeIndex === -1 ? (step === -1 ? series.length : -1) : activeIndex;
    setActive(series[jump ?? Math.min(Math.max(from + (step ?? 0), 0), series.length - 1)].key);
  };

  const activeSeries = series[activeIndex];

  const lastColumn = layout.length - 1;
  const columnStep = layout.length > 1 ? layout[1].x - layout[0].x : Infinity;
  // Labels thin out from the last column backwards when they cannot all fit, keeping at least two.
  const labelWidth = Math.max(0, ...data.map((column) => column.label.length)) * TOTAL_CHAR_WIDTH;
  const labelEvery = Math.min(Math.max(1, Math.ceil(labelWidth / (columnStep - LABEL_GAP))), Math.max(1, lastColumn));
  const labelStep = labelEvery * columnStep;
  const columnWidth = layout[0]?.width ?? 0;
  // A label may be wider than its column. One at either end moves inward to stay in the chart, so it never reaches the next.
  const labelRoom = !size
    ? 0
    : layout.length === 1
      ? size.width
      : Math.min(
          labelStep - LABEL_GAP,
          ((labelStep + columnWidth / 2 - LABEL_GAP) * 2) / 3,
          labelEvery === lastColumn ? (size.width - LABEL_GAP) / 2 : Infinity,
        );
  const totalWidth = Math.max(0, ...totals.map((total) => format(total).length)) * TOTAL_CHAR_WIDTH;
  const totalEvery = Math.max(1, Math.ceil(totalWidth / columnStep));
  // A total at either end moves inward to stay in the chart, so the total next to it needs that much more room.
  const edgeShift = layout.length > 0 ? Math.max(0, (totalWidth - layout[0].width) / 2) : 0;
  const firstTotalShown = lastColumn % totalEvery === 0;
  const showTotal = (c: number) =>
    (lastColumn - c) % totalEvery === 0 &&
    (c === lastColumn || (lastColumn - c) * columnStep >= totalWidth + edgeShift) &&
    (c === 0 || !firstTotalShown || c * columnStep >= totalWidth + edgeShift);

  return (
    <figure
      ref={figure}
      data-slot="stacked-block-chart"
      data-instant={still || undefined}
      className={cn('m-0 flex min-w-0 flex-col data-instant:**:transition-none', className)}
      {...props}
    >
      <div
        ref={plotRef}
        role="group"
        aria-roledescription="stacked bar chart"
        aria-label={`${label}. Use the arrow keys to read each series.`}
        tabIndex={data.length > 0 && series.length > 0 ? 0 : undefined}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        data-slot="stacked-block-chart-plot"
        className="relative h-64 w-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {size ? (
          <div key={reduced ? version : undefined} className="absolute inset-0">
            <svg aria-hidden width={size.width} height={size.height} className="absolute inset-0 overflow-visible">
              {layout.slice(0, -1).map((column, c) =>
                column.blocks.map((block, b) => {
                  const next = layout[c + 1].blocks[b];
                  const d = `M${block.x + block.width} ${block.y}L${next.x} ${next.y}L${next.x} ${next.y + next.height}L${block.x + block.width} ${block.y + block.height}Z`;
                  const rightColumnUp = ((c + 1) * series.length + series.length - 1) * BLOCK_STAGGER_MS;
                  return (
                    <g
                      key={`${c}-${block.key}`}
                      data-slot="stacked-block-chart-band"
                      style={{ '--delay': `${rightColumnUp + b * BAND_STAGGER_MS}ms` } as React.CSSProperties}
                      className={cn(
                        // An end state the start can move to: `none` is not a shape, so it would snap.
                        'transition-[clip-path,opacity] delay-(--delay) duration-slow ease-smooth-in-out [clip-path:inset(0)] forced-colors:hidden',
                        !revealed && 'motion-safe:[clip-path:inset(0_100%_0_0)] motion-reduce:opacity-0',
                      )}
                    >
                      <g className={cn('transition-[opacity]', active && active !== block.key ? 'opacity-[0.03]' : 'opacity-10')}>
                        {/* The shape as CSS too, so browsers that support it move a band to its new place. */}
                        <path
                          d={d}
                          fill={seriesColor(series[b], b)}
                          style={{ d: `path('${d}')` } as React.CSSProperties}
                          className="motion-safe:transition-[d] motion-safe:duration-reveal motion-safe:ease-power3-out"
                        />
                      </g>
                    </g>
                  );
                }),
              )}
              {layout.map((column, c) =>
                column.blocks.map((block, b) => (
                  <g
                    key={`${c}-${block.key}`}
                    style={{ '--delay': `${(c * series.length + b) * BLOCK_STAGGER_MS}ms` } as React.CSSProperties}
                    className={cn(
                      'origin-bottom transition-[opacity] delay-(--delay) duration-reveal ease-power3-out [transform-box:fill-box] starting:opacity-0 motion-safe:transition-[scale,opacity]',
                      !revealed && 'opacity-0 motion-safe:scale-y-0',
                    )}
                  >
                    <rect
                      x={block.x}
                      y={block.y}
                      width={block.width}
                      height={block.height}
                      rx={Math.min(6, block.height / 2)}
                      fill={seriesColor(series[b], b)}
                      onPointerEnter={() => setActive(block.key)}
                      data-slot="stacked-block-chart-block"
                      data-active={active === block.key || undefined}
                      // Geometry as CSS too, so browsers that support it move a block to its new place.
                      style={{ '--y': `${block.y}px`, '--h': `${block.height}px` } as React.CSSProperties}
                      className={cn(
                        '[height:var(--h)] [y:var(--y)] transition-[opacity] forced-colors:fill-[CanvasText]',
                        'motion-safe:transition-[opacity,y,height] motion-safe:duration-reveal motion-safe:ease-power3-out',
                        active && active !== block.key && 'opacity-30',
                      )}
                    />
                  </g>
                )),
              )}
            </svg>
            {layout.map((column, c) => (
              <React.Fragment key={c}>
                <span
                  aria-hidden
                  data-slot="stacked-block-chart-total"
                  style={{ '--x': `${column.x}px`, '--w': `${column.width}px`, '--y': `${column.top - LABEL_ROOM}px` } as React.CSSProperties}
                  className={cn(
                    'absolute top-(--y) left-(--x) flex w-(--w) justify-center text-caption font-medium whitespace-nowrap tabular-nums',
                    // At the edges a total wider than its column stays inside the chart, and is centered when it fits.
                    c === 0 && 'justify-center-safe',
                    // Right to left, so the last total's safe fallback is the right edge.
                    c === lastColumn && 'justify-center-safe [direction:rtl]',
                    'motion-safe:transition-[top] motion-safe:duration-reveal motion-safe:ease-power3-out',
                    c === lastColumn ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  <span
                    // Each total fades in once its column is up.
                    style={{ '--delay': `${(c * series.length + series.length - 1) * BLOCK_STAGGER_MS}ms` } as React.CSSProperties}
                    className={cn('transition-[opacity] delay-(--delay) duration-reveal ease-power3-out [direction:ltr]', !revealed && 'opacity-0')}
                  >
                    {showTotal(c) ? <Count value={totals[c]} format={format} ready={revealed} instant={still} /> : null}
                  </span>
                </span>
                <span
                  aria-hidden
                  data-slot="stacked-block-chart-label"
                  style={{ '--x': `${column.x}px`, '--w': `${column.width}px`, '--room': `${labelRoom}px` } as React.CSSProperties}
                  className={cn(
                    'absolute bottom-0 left-(--x) flex w-(--w) justify-center text-caption whitespace-nowrap text-muted-foreground',
                    c === 0 && 'justify-center-safe',
                    c === lastColumn && 'justify-center-safe [direction:rtl]',
                  )}
                >
                  <span title={data[c].label} className="max-w-(--room) shrink-0 truncate [direction:ltr]">
                    {(lastColumn - c) % labelEvery === 0 ? data[c].label : null}
                  </span>
                </span>
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>

      <p aria-live="polite" className="sr-only">
        {activeSeries
          ? `${activeSeries.label}: ${data.map((column) => `${column.name ?? column.label} ${whole.format(amount(column, activeSeries.key))}`).join(', ')}`
          : ''}
      </p>
      {/* A table keeps its content width at 1px, so the visually hidden box is a wrapper. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              {series.map((item) => (
                <th key={item.key} scope="col">
                  {item.label}
                </th>
              ))}
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((column, c) => (
              <tr key={c}>
                <th scope="row">{column.name ?? column.label}</th>
                {series.map((item) => (
                  <td key={item.key}>{whole.format(amount(column, item.key))}</td>
                ))}
                <td>{whole.format(totals[c])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export { StackedBlockChart, type StackedBlockChartItem, type StackedBlockChartProps, type StackedBlockChartSeries };
