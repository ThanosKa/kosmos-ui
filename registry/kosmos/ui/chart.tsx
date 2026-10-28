'use client';

import * as React from 'react';
import * as Recharts from 'recharts';
import type { LegendPayload, TooltipContentProps, TooltipValueType } from 'recharts';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration, ease } from '@/registry/kosmos/lib/motion';

/**
 * One entry per series, keyed by the data key. `color` is any CSS color, usually a chart token
 * (`var(--chart-1)`); it is exposed to the chart as `var(--color-<key>)`. The tokens switch with
 * the theme, so there is no per-theme color.
 */
type ChartConfig = Record<string, { label?: React.ReactNode; icon?: React.ComponentType; color?: string }>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error('Chart parts must be used inside <ChartContainer />');
  return context;
}

/** Recharts draws with the power3-out curve over the slow duration; it skips the animation under reduced motion. */
const chartAnimation = {
  isAnimationActive: 'auto' as const,
  animationDuration: duration.slow * 1000,
  animationEasing: `cubic-bezier(${ease.power3Out.join(',')})` as `cubic-bezier(${number},${number},${number},${number})`,
};

const INITIAL_DIMENSION = { width: 320, height: 200 } as const;

/**
 * Sizes a Recharts chart to its box (give it a height or an aspect ratio), exposes each series color as
 * `--color-<key>` and themes axes, grid, cursor and focus with Kosmos tokens.
 */
function ChartContainer({
  config,
  className,
  style,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof Recharts.ResponsiveContainer>['children'];
}) {
  const colorVars = Object.fromEntries(
    Object.entries(config).flatMap(([key, item]) => (item.color ? [[`--color-${key}`, item.color]] : [])),
  ) as React.CSSProperties;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        style={{ ...colorVars, ...style }}
        className={cn(
          'flex aspect-video w-full justify-center text-caption tabular-nums',
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground',
          '[&_.recharts-cartesian-grid_line]:stroke-border',
          '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border',
          '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-accent',
          '[&_.recharts-reference-line_line]:stroke-border',
          '[&_.recharts-surface]:overflow-visible [&_.recharts-surface]:rounded-lg [&_.recharts-wrapper]:rounded-lg',
          '[&_.recharts-surface]:focus-visible:outline-2 [&_.recharts-surface]:focus-visible:outline-offset-2 [&_.recharts-surface]:focus-visible:outline-ring',
          '[&_.recharts-wrapper]:focus-visible:outline-2 [&_.recharts-wrapper]:focus-visible:outline-offset-2 [&_.recharts-wrapper]:focus-visible:outline-ring',
          className,
        )}
        {...props}
      >
        <Recharts.ResponsiveContainer initialDimension={INITIAL_DIMENSION}>{children}</Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/** The CSS color of a series, as `ChartContainer` exposes it. */
const seriesColor = (key: string) => `var(--color-${key})`;

/** The color square beside a series name in the tooltip and the legend. */
function SeriesSwatch({ seriesKey, fallback, previous }: { seriesKey: string; fallback?: string; previous?: boolean }) {
  return (
    <span
      aria-hidden
      style={{ '--series': `var(--color-${seriesKey}, ${fallback ?? 'currentColor'})` } as React.CSSProperties}
      className={cn('size-2 shrink-0 rounded-sm bg-(--series) forced-colors:bg-[CanvasText]', previous && 'opacity-45')}
    />
  );
}

const ChartTooltip = Recharts.Tooltip;

// A fixed locale, so server and client render the same text. Pass a formatter for the user's locale.
const defaultNumber = new Intl.NumberFormat('en-US');

function formatValue(value: TooltipValueType | undefined) {
  if (typeof value === 'number') return defaultNumber.format(value);
  if (Array.isArray(value)) return value.join(' – ');
  return value;
}

type ChartTooltipContentProps = Partial<Pick<TooltipContentProps, 'active' | 'payload' | 'label'>> & {
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  /** Formats the label above the values (the x value). */
  labelFormatter?: (label: React.ReactNode) => React.ReactNode;
  /** Formats each value; numbers default to en-US grouping (1,234). */
  valueFormatter?: (value: TooltipValueType, key: string) => React.ReactNode;
  /** Keys of the series that are the period before, whose swatch is faint like their line. */
  previousKeys?: string[];
};

/** The tooltip card: the x value, then one row per series with its color, name and value. */
function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  valueFormatter,
  previousKeys = [],
}: ChartTooltipContentProps) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        'grid min-w-32 gap-1.5 rounded-xl border border-transparent bg-popover px-2.5 py-1.5 text-caption text-popover-foreground tabular-nums shadow-popover',
        className,
      )}
    >
      {!hideLabel && label !== undefined && (
        <div className="font-medium">{labelFormatter ? labelFormatter(label) : label}</div>
      )}
      <ul className="grid gap-1">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? 'value');
          const series = config[key];
          const Icon = series?.icon;
          return (
            <li key={key} className="flex items-center gap-2">
              {Icon ? (
                <Icon />
              ) : (
                !hideIndicator && (
                  <SeriesSwatch seriesKey={key} fallback={item.color} previous={previousKeys.includes(key)} />
                )
              )}
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{series?.label ?? item.name}</span>
              <span className="font-medium text-foreground">
                {item.value === undefined ? null : valueFormatter ? valueFormatter(item.value, key) : formatValue(item.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const ChartLegend = Recharts.Legend;

/** One swatch and name per series, in the order the series are drawn. */
function ChartLegendContent({
  payload,
  className,
  verticalAlign = 'bottom',
  previousKeys = [],
}: {
  payload?: readonly LegendPayload[];
  className?: string;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  /** Keys of the series that are the period before, whose swatch is faint like their line. */
  previousKeys?: string[];
}) {
  const { config } = useChart();
  if (!payload?.length) return null;
  // Recharts sorts legend items by name; list them in config order, the order the series are drawn in.
  const order = Object.keys(config);
  const rank = (item: LegendPayload) => {
    const index = order.indexOf(String(item.dataKey));
    return index === -1 ? order.length : index;
  };
  const items = [...payload].sort((a, b) => rank(a) - rank(b));

  return (
    <ul
      data-slot="chart-legend"
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-caption text-muted-foreground',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {items.map((item) => {
        const key = String(item.dataKey ?? item.value ?? 'value');
        const series = config[key];
        const Icon = series?.icon;
        return (
          <li key={key} className="flex items-center gap-1.5">
            {Icon ? (
              <Icon />
            ) : (
              <SeriesSwatch seriesKey={key} fallback={item.color} previous={previousKeys.includes(key)} />
            )}
            {series?.label ?? item.value}
          </li>
        );
      })}
    </ul>
  );
}

type Datum = Record<string, string | number | null | undefined>;

type SparklineProps = Omit<React.ComponentProps<'div'>, 'children' | 'color'> & {
  data: readonly Datum[];
  dataKey?: string;
  /** `line` draws the trend; `bar` draws one thin bar per point, the latest in `color` and the rest a lighter gray. */
  variant?: 'line' | 'bar';
  /** Any CSS color; a chart token by default. In the bar form it colors the latest bar. */
  color?: string;
  /** Washes the area under the line. The bar form ignores it. */
  fill?: boolean;
  'aria-label': string;
};

/**
 * A word-sized trend with no axes, for a stat tile or a table cell: a line, or with `variant="bar"` a row of thin bars.
 * It is an image with one accessible name, so say what it shows in `aria-label` ("Revenue, last 30 days, up 12%").
 */
function Sparkline({ data, dataKey = 'value', variant = 'line', color = 'var(--chart-1)', fill = true, className, ...props }: SparklineProps) {
  if (variant === 'bar') return <SparklineBars data={data} dataKey={dataKey} color={color} className={className} {...props} />;
  return (
    <ChartContainer
      config={{ [dataKey]: { color } }}
      role="img"
      className={cn('aspect-auto h-8 w-24', className)}
      {...props}
    >
      <Recharts.AreaChart data={data as Datum[]} margin={{ top: 2, right: 2, bottom: 2, left: 2 }} accessibilityLayer={false}>
        <Recharts.YAxis hide domain={['dataMin', 'dataMax']} />
        <Recharts.Area
          dataKey={dataKey}
          type="linear"
          stroke={seriesColor(dataKey)}
          strokeWidth={1.5}
          strokeLinejoin="round"
          fill={seriesColor(dataKey)}
          fillOpacity={fill ? 0.05 : 0}
          dot={false}
          activeDot={false}
          baseValue="dataMin"
          {...chartAnimation}
        />
      </Recharts.AreaChart>
    </ChartContainer>
  );
}

/** Each bar takes a 6px slot: a 4px bar with 1px of room on either side, so neighbours sit 2px apart. */
const BAR_SLOT = 6;

/**
 * Bars grow from zero, so their heights compare. A bar at zero or below, or with no value, is a dot. When there are
 * more bars than room, the oldest drop out of view, so the latest stays.
 */
function SparklineBars({ data, dataKey, color, className, ...props }: Omit<SparklineProps, 'variant' | 'fill'> & { dataKey: string }) {
  const bars = data.map((datum) => {
    const value = Number(datum[dataKey]);
    return { [dataKey]: Number.isFinite(value) ? Math.max(value, 0) : 0 };
  });
  return (
    <div
      data-slot="sparkline"
      role="img"
      className={cn('flex h-9 w-fit max-w-full justify-end overflow-hidden', className)}
      {...props}
    >
      <ChartContainer
        config={{ [dataKey]: { color } }}
        style={{ '--sparkline-width': `${bars.length * BAR_SLOT}px` } as React.CSSProperties}
        className="aspect-auto h-full w-(--sparkline-width) shrink-0"
      >
        <Recharts.BarChart data={bars} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={0} accessibilityLayer={false}>
          <Recharts.YAxis hide domain={[0, 'dataMax']} />
          <Recharts.Bar
            dataKey={dataKey}
            barSize={BAR_SLOT - 2}
            radius={2}
            minPointSize={4}
            shape={(bar: Recharts.BarShapeProps) => {
              const latest = bar.index === bars.length - 1;
              return (
                <Recharts.Rectangle
                  {...bar}
                  fill={latest ? seriesColor(dataKey) : 'var(--chart-4)'}
                  className={latest ? 'forced-colors:fill-[CanvasText]' : 'forced-colors:fill-[GrayText]'}
                />
              );
            }}
            {...chartAnimation}
          />
        </Recharts.BarChart>
      </ChartContainer>
    </div>
  );
}

/** Gives the value axis 10% of room above and below the data, so a calm line does not sit on the edges. */
const paddedDomain = ([min, max]: readonly [number, number]): [number, number] => {
  const pad = (max - min) * 0.1 || 1;
  return [min - pad, max + pad];
};

/** Draws the first and last x label only, each pulled inside the plot so neither is cut off. */
function EndTick({ x, y, payload, first }: { x?: number; y?: number; payload?: { value: string }; first: string }) {
  return (
    <text x={x} y={y} dy={14} textAnchor={payload?.value === first ? 'start' : 'end'} className="fill-muted-foreground">
      {payload?.value}
    </text>
  );
}

/**
 * A value over time: each series is a 1.5px straight line, and the first series is washed with a faint flat fill.
 * A series named in `previousKeys` is the period before: the same hue at 45% opacity, with no fill. The
 * chrome stays quiet: no value axis, only the first and last x labels, a thin cursor line in the tooltip, and
 * with `grid` a faint dotted vertical grid for a large chart. Two or more series get a legend. A hidden
 * table repeats the data for screen readers.
 */
function GrowthChart({
  data,
  config,
  xKey,
  xLabel = xKey,
  title,
  valueFormatter,
  xFormatter,
  previousKeys = [],
  grid = false,
  legend,
  defaultIndex,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children' | 'title'> & {
  data: readonly Datum[];
  config: ChartConfig;
  /** The key of the x value in each datum, usually a date label. */
  xKey: string;
  /** Heads the x column of the hidden data table. Defaults to `xKey`. */
  xLabel?: string;
  /** Names the chart for screen readers and captions its hidden data table. */
  title: string;
  /** Formats values in the tooltip and the hidden table. */
  valueFormatter?: (value: number) => string;
  /** Formats x values on the axis, the tooltip and the hidden table. */
  xFormatter?: (value: string) => string;
  /** Keys of the series that are the period before: drawn at reduced opacity, with no fill. Give them the same color as the current series. */
  previousKeys?: string[];
  /** Draws a faint dotted vertical grid. For a large chart only. */
  grid?: boolean;
  /** Draws the legend. By default it shows for two or more series. */
  legend?: boolean;
  /** Shows the tooltip at this index without hovering, for a pinned state. */
  defaultIndex?: number;
}) {
  const keys = Object.keys(config);
  const formatX = (value: unknown) => (xFormatter ? xFormatter(String(value)) : String(value));
  const formatY = (value: number) => (valueFormatter ? valueFormatter(value) : defaultNumber.format(value));
  const first = data.length > 0 ? String(data[0][xKey]) : '';
  const last = data.length > 0 ? String(data[data.length - 1][xKey]) : '';
  const filledKey = keys.find((key) => !previousKeys.includes(key));
  const ends = first === last ? [first] : [first, last];

  return (
    <figure data-slot="growth-chart" className={cn('m-0 flex w-full flex-col', className)}>
      <ChartContainer
        config={config}
        className="aspect-auto h-60 [&_.recharts-cartesian-grid_line]:stroke-foreground/15"
        {...props}
      >
        <Recharts.AreaChart title={title} data={data as Datum[]} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          {grid ? <Recharts.CartesianGrid horizontal={false} strokeDasharray="1 5" strokeLinecap="round" /> : null}
          <Recharts.XAxis
            dataKey={xKey}
            ticks={ends}
            interval={0}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatX}
            tick={<EndTick first={first} />}
          />
          <Recharts.YAxis hide domain={paddedDomain} />
          <ChartTooltip
            cursor={{ strokeWidth: 1 }}
            defaultIndex={defaultIndex}
            isAnimationActive={false}
            content={
              <ChartTooltipContent
                labelFormatter={(label) => formatX(label)}
                valueFormatter={(value) => (typeof value === 'number' ? formatY(value) : String(value))}
                previousKeys={previousKeys}
              />
            }
          />
          {(legend ?? keys.length > 1) && <ChartLegend verticalAlign="top" content={<ChartLegendContent verticalAlign="top" previousKeys={previousKeys} />} />}
          {[...keys.filter((key) => previousKeys.includes(key)), ...keys.filter((key) => !previousKeys.includes(key))].map((key) => {
            const isPrevious = previousKeys.includes(key);
            return (
              <Recharts.Area
                key={key}
                dataKey={key}
                name={typeof config[key].label === 'string' ? config[key].label : key}
                type="linear"
                stroke={seriesColor(key)}
                strokeOpacity={isPrevious ? 0.45 : 1}
                strokeWidth={1.5}
                strokeLinejoin="round"
                fill={seriesColor(key)}
                fillOpacity={key === filledKey ? 0.05 : 0}
                dot={false}
                activeDot={isPrevious ? false : { r: 3, strokeWidth: 1.5, stroke: 'var(--card)' }}
                {...chartAnimation}
              />
            );
          })}
        </Recharts.AreaChart>
      </ChartContainer>
      {/* A table keeps its content width at 1px, so the visually hidden box is a wrapper. */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">{xLabel}</th>
              {keys.map((key) => (
                <th key={key} scope="col">
                  {config[key].label ?? key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((datum, index) => (
              <tr key={index}>
                <th scope="row">{formatX(datum[xKey])}</th>
                {keys.map((key) => (
                  <td key={key}>{typeof datum[key] === 'number' ? formatY(datum[key]) : datum[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export {
  ChartContainer,
  chartAnimation,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  Sparkline,
  GrowthChart,
  useChart,
};
