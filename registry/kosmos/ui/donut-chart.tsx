'use client';

import type * as React from 'react';
import * as Recharts from 'recharts';
import { cn } from '@/registry/kosmos/lib/cn';
import { ChartContainer, ChartTooltip, ChartTooltipContent, chartAnimation } from '@/registry/kosmos/ui/chart';

type DonutChartSize = 'sm' | 'md' | 'lg';

type DonutChartItem = {
  /** Names the part in the legend, the tooltip and the accessible name. */
  label: string;
  value: number;
  /** Any CSS color. Defaults to the chart tokens in order, `--chart-1` for the first part to `--chart-5` for the fifth. */
  color?: string;
  /** Identifies the part across renders. Defaults to its label. */
  id?: string;
};

/**
 * The ring of a Gauge of the same size: `strokeWidth` is in units of a 100-wide box, so the stroke and the cut between
 * the parts scale with the ring. `lg` holds a label over the total, `md` the total alone, `sm` neither.
 */
const sizeStyles: Record<DonutChartSize, { box: string; strokeWidth: number; value: string | null; label: boolean }> = {
  sm: { box: 'size-8', strokeWidth: 12, value: null, label: false },
  md: { box: 'size-16', strokeWidth: 9, value: 'text-body font-medium', label: false },
  lg: { box: 'size-32', strokeWidth: 7, value: 'text-title font-medium', label: true },
};

const GAP_RATIO = 0.5;
const RADIAN = Math.PI / 180;

// A fixed locale, so server and client render the same text. Compact, so the total fits the hole at every size.
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const formatCompact = (value: number) => compact.format(value);

/** The widest box that stays inside the hole, so a long label truncates before it reaches the ring. */
const centerClassName = 'pointer-events-none relative flex max-w-[70%] min-w-0 flex-col items-center text-center';

const partColor = (item: DonutChartItem, index: number) => item.color ?? `var(--chart-${Math.min(index, 4) + 1})`;
const partValue = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

function shareText(value: number, total: number) {
  if (total <= 0 || value <= 0) return '0%';
  const percent = (value / total) * 100;
  return percent < 1 ? '<1%' : `${Math.round(percent)}%`;
}

/**
 * The angle each cut takes, so that two round caps a `GAP_RATIO` of a stroke apart fit in it, as between the arcs of a
 * Gauge. Every part takes one, so a part too small to draw an arc still shows as a dot with a cut on each side.
 */
function cutAngle(strokeWidth: number) {
  const radius = 50 - strokeWidth / 2;
  return (strokeWidth * (1 + GAP_RATIO)) / radius / RADIAN;
}

const point = (cx: number, cy: number, radius: number, angle: number) => ({
  x: cx + radius * Math.cos(-angle * RADIAN),
  y: cy + radius * Math.sin(-angle * RADIAN),
});

/**
 * One part as a stroke along the middle of its sector with round caps: a full circle, an arc, or a dot when it has no
 * length. On the entrance every part starts as a dot, so the parts fade in as they sweep rather than land as a row of dots.
 */
function Segment({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  isAnimating,
  isEntrance,
  animationElapsedTime = 1,
}: Recharts.PieSectorShapeProps) {
  const strokeWidth = outerRadius - innerRadius;
  const radius = (innerRadius + outerRadius) / 2;
  const sweep = Math.abs(endAngle - startAngle);
  const opacity = isAnimating && isEntrance ? Math.min(1, Math.max(0, animationElapsedTime)) : 1;
  const common = { 'data-slot': 'donut-chart-segment', opacity };
  const stroke = { ...common, stroke: fill, strokeWidth, fill: 'none', className: 'forced-colors:stroke-[CanvasText]' };

  if (sweep >= 359.99) return <circle cx={cx} cy={cy} r={radius} {...stroke} />;
  const start = point(cx, cy, radius, startAngle);
  if (sweep < 0.01) {
    return <circle {...common} cx={start.x} cy={start.y} r={strokeWidth / 2} fill={fill} className="forced-colors:fill-[CanvasText]" />;
  }
  const end = point(cx, cy, radius, endAngle);
  const largeArc = sweep > 180 ? 1 : 0;
  const clockwise = endAngle < startAngle ? 1 : 0;
  return (
    <path
      d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${clockwise} ${end.x} ${end.y}`}
      strokeLinecap="round"
      {...stroke}
    />
  );
}

type DonutChartProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The parts of the whole, drawn clockwise from the top in this order. Up to five take a color of their own. */
  data: readonly DonutChartItem[];
  /** Names the total in the center, such as "Visitors". Shown at `lg`. */
  label?: string;
  /** Writes the total and the values in the tooltip. Defaults to a compact number (38.9K). */
  format?: (value: number) => string;
  /** The total in the center, when `data` holds only the largest parts of a larger whole. Defaults to the sum of `data`. */
  total?: number;
  size?: DonutChartSize;
  /** Replaces the total and the label in the center. */
  children?: React.ReactNode;
};

/**
 * Parts of a whole as a ring with the total in its hole, drawn like a Gauge: round caps and the same cut between the
 * parts. Hovering a part shows its value. It is an image with one accessible name, which lists every part with its
 * value and share unless `aria-label` says otherwise.
 */
function DonutChart({
  data,
  label,
  format = formatCompact,
  total: wholeTotal,
  size = 'lg',
  className,
  children,
  'aria-label': ariaLabel,
  ...props
}: DonutChartProps) {
  const { box, strokeWidth, value: valueText, label: showLabel } = sizeStyles[size];
  const parts = data.map((item, index) => ({ ...item, value: partValue(item.value), fill: partColor(item, index) }));
  const drawn = parts.filter((part) => part.value > 0);
  const total = wholeTotal ?? parts.reduce((sum, part) => sum + part.value, 0);
  const cut = drawn.length > 1 ? cutAngle(strokeWidth) : 0;
  const startAngle = 90 - cut / 2;
  const innerRadius = `${100 - 2 * strokeWidth}%`;

  const summary = parts.map((part) => `${part.label} ${format(part.value)}, ${shareText(part.value, total)}`).join('; ');
  const name = ariaLabel ?? `${label ? `${label} ` : ''}${format(total)}${parts.length > 0 ? `: ${summary}` : ''}`;

  return (
    <div
      role="img"
      aria-label={name}
      data-slot="donut-chart"
      data-size={size}
      className={cn('relative inline-grid shrink-0 place-items-center', box, className)}
      {...props}
    >
      {drawn.length > 0 ? (
        <ChartContainer config={{}} aria-hidden className="absolute inset-0 aspect-auto size-full motion-reduce:animate-reveal-fade [-webkit-tap-highlight-color:transparent] [&_.recharts-tooltip-wrapper]:z-10">
          <Recharts.PieChart accessibilityLayer={false} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <ChartTooltip
              isAnimationActive={false}
              allowEscapeViewBox={{ x: true, y: true }}
              content={
                <ChartTooltipContent
                  hideLabel
                  valueFormatter={(value) =>
                    typeof value === 'number' ? (
                      <>
                        <bdi dir="ltr">{format(value)}</bdi>
                        <span className="ms-2 font-normal text-muted-foreground">
                          <bdi dir="ltr">{shareText(value, total)}</bdi>
                        </span>
                      </>
                    ) : (
                      String(value)
                    )
                  }
                />
              }
            />
            <Recharts.Pie
              data={drawn}
              dataKey="value"
              nameKey="label"
              innerRadius={innerRadius}
              outerRadius="100%"
              startAngle={startAngle}
              endAngle={startAngle - 360}
              paddingAngle={cut}
              stroke="none"
              rootTabIndex={-1}
              shape={Segment}
              {...chartAnimation}
            />
          </Recharts.PieChart>
        </ChartContainer>
      ) : (
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full">
          <circle
            data-slot="donut-chart-track"
            cx={50}
            cy={50}
            r={50 - strokeWidth / 2}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted forced-colors:stroke-[GrayText]"
          />
        </svg>
      )}
      {children !== undefined ? (
        <div data-slot="donut-chart-label" className={centerClassName}>
          {children}
        </div>
      ) : valueText ? (
        <div data-slot="donut-chart-label" className={centerClassName}>
          {showLabel && label ? <span className="max-w-full truncate text-caption text-muted-foreground">{label}</span> : null}
          <span className={cn('whitespace-nowrap text-foreground tabular-nums', valueText)}>
            <bdi dir="ltr">{format(total)}</bdi>
          </span>
        </div>
      ) : null}
    </div>
  );
}

type DonutChartLegendProps = Omit<React.ComponentProps<'ul'>, 'children'> & {
  /** The same parts, in the same order, as the chart it explains. */
  data: readonly DonutChartItem[];
  /** Writes each value. Defaults to a compact number (38.9K). */
  format?: (value: number) => string;
  /** Adds a column with each part's share of the total. */
  showShare?: boolean;
  /** What the share is a share of. Defaults to the sum of `data`. */
  total?: number;
};

/**
 * The parts of a donut chart as a list: the color dot, the label, the value and its share, one row each. Name it with
 * `aria-label` or `aria-labelledby`.
 */
function DonutChartLegend({ data, format = formatCompact, showShare = true, total, className, ...props }: DonutChartLegendProps) {
  const whole = total ?? data.reduce((sum, item) => sum + partValue(item.value), 0);
  return (
    <ul role="list" data-slot="donut-chart-legend" className={cn('flex min-w-0 flex-col divide-y divide-border', className)} {...props}>
      {data.map((item, index) => (
        <li key={item.id ?? `${index}-${item.label}`} className="flex min-w-0 items-center gap-2 py-2 text-body first:pt-0 last:pb-0">
          <span
            aria-hidden
            style={{ '--part': partColor(item, index) } as React.CSSProperties}
            className="size-2 shrink-0 rounded-full bg-(--part) forced-colors:bg-[CanvasText]"
          />
          <span title={item.label} className="min-w-0 flex-1 truncate">
            {item.label}
          </span>
          <span className="tabular-nums">
            <bdi dir="ltr">{format(partValue(item.value))}</bdi>
          </span>
          {showShare ? (
            <span className="w-9 shrink-0 text-end text-small text-muted-foreground tabular-nums">
              <bdi dir="ltr">{shareText(partValue(item.value), whole)}</bdi>
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export { DonutChart, DonutChartLegend, type DonutChartItem, type DonutChartProps, type DonutChartLegendProps, type DonutChartSize };
