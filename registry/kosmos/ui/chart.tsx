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
export type ChartConfig = Record<string, { label?: React.ReactNode; icon?: React.ComponentType; color?: string }>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error('Chart parts must be used inside <ChartContainer />');
  return context;
}

/** Recharts draws with the power3-out curve over the slow duration; it skips the animation under reduced motion. */
export const chartAnimation = {
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
  /** Formats each value; numbers default to the user's locale. */
  valueFormatter?: (value: TooltipValueType, key: string) => React.ReactNode;
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
}: ChartTooltipContentProps) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        'grid min-w-32 gap-1.5 rounded-lg border border-transparent bg-popover px-2.5 py-1.5 text-caption text-popover-foreground tabular-nums shadow-popover',
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
                  <span
                    aria-hidden
                    style={{ '--series': `var(--color-${key}, ${item.color ?? 'currentColor'})` } as React.CSSProperties}
                    className="size-2 shrink-0 rounded-xs bg-(--series) forced-colors:bg-[CanvasText]"
                  />
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
}: {
  payload?: readonly LegendPayload[];
  className?: string;
  verticalAlign?: 'top' | 'middle' | 'bottom';
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
              <span
                aria-hidden
                style={{ '--series': `var(--color-${key}, ${item.color ?? 'currentColor'})` } as React.CSSProperties}
                className="size-2 shrink-0 rounded-xs bg-(--series) forced-colors:bg-[CanvasText]"
              />
            )}
            {series?.label ?? item.value}
          </li>
        );
      })}
    </ul>
  );
}

type Datum = Record<string, string | number | null | undefined>;

/**
 * A word-sized trend line with no axes, for a stat tile or a table cell. It is an image with one
 * accessible name, so say what it shows in `aria-label` ("Revenue, last 30 days, up 12%").
 */
function Sparkline({
  data,
  dataKey = 'value',
  color = 'var(--chart-1)',
  fill = true,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children' | 'color'> & {
  data: readonly Datum[];
  dataKey?: string;
  /** Any CSS color; a chart token by default. */
  color?: string;
  /** Washes the area under the line. */
  fill?: boolean;
  'aria-label': string;
}) {
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
          type="monotone"
          stroke={`var(--color-${dataKey})`}
          strokeWidth={1.5}
          fill={`var(--color-${dataKey})`}
          fillOpacity={fill ? 0.1 : 0}
          dot={false}
          activeDot={false}
          baseValue="dataMin"
          {...chartAnimation}
        />
      </Recharts.AreaChart>
    </ChartContainer>
  );
}

const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

/**
 * A value over time: one or more series as lines with a soft area wash, a horizontal grid, axes
 * and a tooltip. Two or more series get a legend. A hidden table repeats the data for screen readers.
 */
function GrowthChart({
  data,
  config,
  xKey,
  xLabel = xKey,
  title,
  valueFormatter,
  xFormatter,
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
  /** Formats values in the tooltip and the hidden table. Axis ticks are compact (1.2K). */
  valueFormatter?: (value: number) => string;
  /** Formats x values on the axis, the tooltip and the hidden table. */
  xFormatter?: (value: string) => string;
  /** Shows the tooltip at this index without hovering, for a pinned state. */
  defaultIndex?: number;
}) {
  const keys = Object.keys(config);
  const formatX = (value: unknown) => (xFormatter ? xFormatter(String(value)) : String(value));
  const formatY = (value: number) => (valueFormatter ? valueFormatter(value) : defaultNumber.format(value));

  return (
    <figure data-slot="growth-chart" className={cn('m-0 flex w-full flex-col', className)}>
      <ChartContainer config={config} className="aspect-auto h-60" {...props}>
        <Recharts.AreaChart title={title} data={data as Datum[]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <Recharts.CartesianGrid vertical={false} />
          <Recharts.XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={formatX}
          />
          <Recharts.YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width="auto"
            tickFormatter={(value: number) => compactNumber.format(value)}
          />
          <ChartTooltip
            cursor
            defaultIndex={defaultIndex}
            isAnimationActive={false}
            content={
              <ChartTooltipContent
                labelFormatter={(label) => formatX(label)}
                valueFormatter={(value) => (typeof value === 'number' ? formatY(value) : String(value))}
              />
            }
          />
          {keys.length > 1 && <ChartLegend verticalAlign="top" content={<ChartLegendContent verticalAlign="top" />} />}
          {keys.map((key) => (
            <Recharts.Area
              key={key}
              dataKey={key}
              name={typeof config[key].label === 'string' ? config[key].label : key}
              type="monotone"
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              fill={`var(--color-${key})`}
              fillOpacity={0.1}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              {...chartAnimation}
            />
          ))}
        </Recharts.AreaChart>
      </ChartContainer>
      <table className="sr-only">
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
    </figure>
  );
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  Sparkline,
  GrowthChart,
  useChart,
};
