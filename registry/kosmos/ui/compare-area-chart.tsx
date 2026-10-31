'use client';

import * as React from 'react';
import * as Recharts from 'recharts';
import { type ChartEntrance, useChartEntrance, useReducedMotion } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';
import { ease } from '@/registry/kosmos/lib/motion';
import { ChartContainer, ChartTooltip, chartAnimation, type ChartConfig } from '@/registry/kosmos/ui/chart';

type CompareAreaChartItem = {
  /** The short label on the x axis ("Sep 12"). Only the first and last show. */
  label: string;
  /** This period's value on this day. */
  current: number;
  /** The same day of the period before. */
  previous: number;
  /** The full name in the tooltip and the hidden table ("Sat, Sep 12"). Defaults to `label`. */
  name?: string;
};

type CompareAreaChartProps = Omit<React.ComponentProps<'figure'>, 'children'> & {
  /** The days of this period, oldest first, each beside the same day of the period before. */
  data: readonly CompareAreaChartItem[];
  /** Names the chart for screen readers and captions its hidden table, such as "Events per day, last 30 days against the 30 days before". */
  label: string;
  /** Names this period in the tooltip and the hidden table. */
  currentLabel?: string;
  /** Names the period before in the tooltip and the hidden table. */
  previousLabel?: string;
  /** Writes the values and the gap in the tooltip and the hidden table. */
  format?: (value: number) => string;
  /** When the lines draw in. See `ChartEntrance`. */
  entrance?: ChartEntrance;
};

/** Both lines draw across together over this long, slow enough to read as drawing. */
const DRAW_MS = chartAnimation.animationDuration * 3;
/** Lines draw and morph on the size-and-position curve. */
const lineAnimation = {
  animationDuration: DRAW_MS,
  animationEasing: `cubic-bezier(${ease.smoothInOut.join(',')})` as `cubic-bezier(${number},${number},${number},${number})`,
};

const whole = new Intl.NumberFormat('en-US');
const formatWhole = (value: number) => whole.format(value);
const finite = (value: number) => (Number.isFinite(value) ? value : 0);

/** Counts start at zero, so a weekend dip reads as its true size; the room on top keeps the line off the edge. */
const fromZero = ([min, max]: readonly [number, number]): [number, number] => [Math.min(min, 0), max * 1.1 || 1];

function Triangle({ down }: { down: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 8 8" className={cn('size-2 shrink-0 fill-current', down && 'rotate-180')}>
      <path d="M4 0.5 7.5 7H0.5z" />
    </svg>
  );
}

type Point = { index: number; current: number; previous: number };

/** The day, both values, and the gap between them, read without color: a triangle and a sign. */
function CompareTooltip({
  active,
  payload,
  data,
  currentLabel,
  previousLabel,
  format,
}: Partial<Recharts.TooltipContentProps> & {
  data: readonly CompareAreaChartItem[];
  currentLabel: string;
  previousLabel: string;
  format: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as Point;
  const item = data[point.index];
  if (!item) return null;
  const gap = point.current - point.previous;
  return (
    <div
      data-slot="compare-area-chart-tooltip"
      className="grid max-w-64 min-w-40 grid-cols-[minmax(0,1fr)] gap-1.5 rounded-xl border border-transparent bg-popover px-2.5 py-1.5 text-caption text-popover-foreground tabular-nums shadow-popover"
    >
      <div className="truncate font-medium">{item.name ?? item.label}</div>
      <ul className="flex flex-col gap-1">
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-2 shrink-0 rounded-sm bg-chart-1 forced-colors:bg-[CanvasText]" />
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{currentLabel}</span>
          <span className="shrink-0 font-medium">{format(point.current)}</span>
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-2 shrink-0 rounded-sm bg-chart-1 opacity-45 forced-colors:bg-[CanvasText]" />
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{previousLabel}</span>
          <span className="shrink-0 font-medium">{format(point.previous)}</span>
        </li>
      </ul>
      <div
        data-slot="compare-area-chart-gap"
        className={cn(
          'flex items-center gap-1 border-t border-border pt-1.5 font-medium',
          gap > 0 && 'text-tint-green-foreground',
          gap < 0 && 'text-tint-red-foreground',
          gap === 0 && 'text-muted-foreground',
        )}
      >
        {gap === 0 ? null : <Triangle down={gap < 0} />}
        {gap > 0 ? '+' : gap < 0 ? '−' : ''}
        {format(Math.abs(gap))}
      </div>
    </div>
  );
}

/** Draws the first and last x label only, each pulled inside the plot so neither is cut off. They fade in halfway through the draw. */
function EndTick({ x, y, payload, data }: { x?: number; y?: number; payload?: { value: number }; data: readonly CompareAreaChartItem[] }) {
  const index = payload?.value ?? 0;
  const anchor = data.length === 1 ? 'middle' : index === 0 ? 'start' : 'end';
  return (
    <text
      x={x}
      y={y}
      dy={14}
      textAnchor={anchor}
      style={{ '--delay': `${DRAW_MS / 2}ms` } as React.CSSProperties}
      className="fill-muted-foreground transition-[opacity] delay-(--delay) duration-slow starting:opacity-0"
    >
      {data[index]?.label}
    </text>
  );
}

/**
 * This period against the one before: the current line in full with a faint wash, the period before at 45%. A dashed
 * cursor runs the full height, a dot marks the day on each line, and the tooltip slides along with it, adding the gap
 * between the two days. Both lines draw across together once the chart scrolls into view, the end labels fade in
 * halfway, and new data moves every point to its new place. Under reduced motion the chart fades in, and fades in again
 * on new data.
 */
function CompareAreaChart({
  data,
  label,
  currentLabel = 'This period',
  previousLabel = 'Period before',
  format = formatWhole,
  entrance,
  className,
  ...props
}: CompareAreaChartProps) {
  const figure = React.useRef<HTMLElement>(null);
  const { revealed, instant } = useChartEntrance(figure, entrance);
  const reduced = useReducedMotion();
  const [shownData, setShownData] = React.useState(data);
  const [version, setVersion] = React.useState(0);
  if (data !== shownData) {
    setShownData(data);
    setVersion(version + 1);
  }
  // The data drawn while the entrance is skipped stays still; any data after it moves.
  const [stillData, setStillData] = React.useState<readonly CompareAreaChartItem[] | null>(entrance === 'none' ? data : null);
  if (instant && stillData !== data) setStillData(data);
  const animate = stillData === data ? false : chartAnimation.isAnimationActive;

  const points: Point[] = data.map((item, index) => ({ index, current: finite(item.current), previous: finite(item.previous) }));
  const ends = points.length > 1 ? [0, points.length - 1] : [0];
  const single = points.length === 1;
  const config = {
    current: { label: currentLabel, color: 'var(--chart-1)' },
    previous: { label: previousLabel, color: 'var(--chart-1)' },
  } satisfies ChartConfig;

  return (
    <figure
      ref={figure}
      data-slot="compare-area-chart"
      data-instant={instant || undefined}
      className={cn('m-0 flex w-full min-w-0 flex-col data-instant:**:transition-none', className)}
      {...props}
    >
      {/* Recharts plays its entrance on mount, so the chart mounts once it scrolls into view. */}
      {revealed && points.length > 0 ? (
        <ChartContainer
          // Under reduced motion new data fades the chart in again instead of moving the lines.
          key={reduced ? version : 'chart'}
          config={config}
          data-slot="compare-area-chart-plot"
          className={cn(
            'aspect-auto h-52 transition-[opacity] duration-reveal ease-power3-out motion-reduce:starting:opacity-0',
            '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-foreground/30',
            'forced-colors:[&_.recharts-area-curve]:stroke-[CanvasText]',
          )}
        >
          <Recharts.AreaChart title={label} data={points} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
            <Recharts.XAxis
              dataKey="index"
              ticks={ends}
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={<EndTick data={data} />}
            />
            <Recharts.YAxis hide domain={fromZero} />
            <ChartTooltip
              cursor={{ strokeWidth: 1, strokeDasharray: '3 3' }}
              {...chartAnimation}
              content={<CompareTooltip data={data} currentLabel={currentLabel} previousLabel={previousLabel} format={format} />}
            />
            <Recharts.Area
              dataKey="previous"
              name={previousLabel}
              type="linear"
              stroke="var(--color-previous)"
              strokeOpacity={0.45}
              strokeWidth={1.5}
              strokeLinejoin="round"
              fill="none"
              dot={single ? { r: 3, strokeWidth: 0, fill: 'var(--color-previous)', fillOpacity: 0.45 } : false}
              activeDot={{ r: 3, strokeWidth: 1.5, stroke: 'var(--card)', fill: 'var(--color-previous)', fillOpacity: 0.45 }}
              isAnimationActive={animate}
              {...lineAnimation}
            />
            <Recharts.Area
              dataKey="current"
              name={currentLabel}
              type="linear"
              stroke="var(--color-current)"
              strokeWidth={1.5}
              strokeLinejoin="round"
              fill="var(--color-current)"
              fillOpacity={0.05}
              dot={single ? { r: 3, strokeWidth: 0, fill: 'var(--color-current)' } : false}
              activeDot={{ r: 3, strokeWidth: 1.5, stroke: 'var(--card)' }}
              isAnimationActive={animate}
              {...lineAnimation}
            />
          </Recharts.AreaChart>
        </ChartContainer>
      ) : (
        <div data-slot="compare-area-chart-plot" className="h-52" />
      )}
      {/* A table keeps its content width at 1px, so the visually hidden box is a wrapper. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">{currentLabel}</th>
              <th scope="col">{previousLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <th scope="row">{item.name ?? item.label}</th>
                <td>{format(points[index].current)}</td>
                <td>{format(points[index].previous)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export { CompareAreaChart, type CompareAreaChartItem, type CompareAreaChartProps };
