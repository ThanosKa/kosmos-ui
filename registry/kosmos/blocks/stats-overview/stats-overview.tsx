'use client';

import { ChartNoAxesCombined, TrendingDown, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { GrowthChart, Sparkline, type ChartConfig } from '@/registry/kosmos/ui/chart';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { Meter, MeterBar, MeterLabel, MeterValue } from '@/registry/kosmos/ui/meter';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';

type StatFormat = 'currency' | 'number' | 'percent';

type Stat = {
  id: string;
  label: string;
  value: number;
  format: StatFormat;
  /** The change against the previous period: a percentage, or percentage points for a `percent` stat. Leave it out when there is no earlier period. */
  change?: number;
  /** Whether a rise is good news (revenue) or bad news (churn). Colors the trend icon. */
  goodWhen?: 'up' | 'down';
  /** Recent values, oldest first, for the sparkline. */
  trend: number[];
};

type Range = '30d' | '90d' | '12m';
type RevenuePoint = { label: string; newBusiness: number; expansion: number };
type PlanShare = { plan: string; share: number };

// Sample data: replace it with your metrics. Values are made up but stable, so server and browser match.
const sampleStats: Stat[] = [
  { id: 'mrr', label: 'Monthly revenue', value: 84210, format: 'currency', change: 12.4, trend: [52, 55, 54, 60, 63, 61, 68, 72, 70, 77, 80, 84] },
  { id: 'accounts', label: 'New accounts', value: 38, format: 'number', change: 8.1, trend: [22, 25, 24, 28, 27, 31, 30, 29, 33, 35, 34, 38] },
  { id: 'churn', label: 'Churn rate', value: 1.9, format: 'percent', change: -0.4, goodWhen: 'down', trend: [3.1, 2.9, 3, 2.7, 2.6, 2.6, 2.4, 2.3, 2.3, 2.1, 2, 1.9] },
  { id: 'nrr', label: 'Net retention', value: 112, format: 'percent', change: -1.2, trend: [116, 115, 115, 114, 115, 113, 114, 113, 112, 113, 112, 112] },
];

const wave = (index: number, base: number, growth: number, swing: number) =>
  Math.round(base + growth * index + swing * Math.sin(index * 1.7) + (swing / 2) * Math.cos(index * 0.6));

const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const dayBefore = (daysAgo: number) => dayLabel.format(Date.UTC(2026, 9, 11) - daysAgo * 86_400_000);

const sampleRevenue: Record<Range, RevenuePoint[]> = {
  '30d': Array.from({ length: 30 }, (_, i) => ({ label: dayBefore(29 - i), newBusiness: wave(i, 1800, 22, 260), expansion: wave(i + 3, 700, 9, 120) })),
  '90d': Array.from({ length: 13 }, (_, i) => ({ label: dayBefore((12 - i) * 7), newBusiness: wave(i, 11800, 320, 900), expansion: wave(i + 5, 4300, 140, 500) })),
  '12m': months.map((label, i) => ({ label, newBusiness: wave(i, 41000, 2600, 2400), expansion: wave(i + 2, 15000, 1100, 1300) })),
};

const samplePlans: PlanShare[] = [
  { plan: 'Enterprise', share: 58 },
  { plan: 'Business', share: 27 },
  { plan: 'Starter', share: 15 },
];

/** Each range's name, and what its x values are, for the hidden data table. */
const ranges: Record<Range, { label: string; xLabel: string }> = {
  '30d': { label: '30 days', xLabel: 'Day' },
  '90d': { label: '90 days', xLabel: 'Week of' },
  '12m': { label: '12 months', xLabel: 'Month' },
};

const chartConfig = {
  newBusiness: { label: 'New business', color: 'var(--chart-1)' },
  expansion: { label: 'Expansion', color: 'var(--chart-2)' },
} satisfies ChartConfig;

// A fixed locale, so the server and the browser render the same text.
const formats: Record<StatFormat, Intl.NumberFormat> = {
  currency: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
  number: new Intl.NumberFormat('en-US'),
  percent: new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }),
};
const usd = formats.currency;
const usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const signed = new Intl.NumberFormat('en-US', { signDisplay: 'exceptZero', maximumFractionDigits: 1 });

const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

/** Values of a million and up go compact ($128.5M), so they fit a tile. */
function formatStat(stat: Stat) {
  if (stat.format === 'percent') return `${formats.percent.format(stat.value)}%`;
  if (Math.abs(stat.value) < 1_000_000) return formats[stat.format].format(stat.value);
  return stat.format === 'currency' ? usdCompact.format(stat.value) : compactNumber.format(stat.value);
}
// A true minus sign (−), not the hyphen Intl writes.
const formatChange = (change: number, format: StatFormat) =>
  `${signed.format(change).replace('-', '\u2212')}${format === 'percent' ? ' pts' : '%'}`;

function StatTile({ stat, loading }: { stat: Stat; loading: boolean }) {
  const change = stat.change;
  const rising = change !== undefined && change > 0;
  const good = !change ? null : rising === ((stat.goodWhen ?? 'up') === 'up');
  const Icon = rising ? TrendingUp : TrendingDown;

  return (
    <div data-slot="stat-tile" className="flex min-w-0 flex-col gap-2 bg-card p-4">
      <p title={stat.label} className="truncate text-small text-muted-foreground">
        {stat.label}
      </p>
      {loading ? (
        <>
          <Skeleton className="my-2 h-6 w-28" />
          <Skeleton className="h-3.5 w-36" />
        </>
      ) : (
        <>
          <div className="flex min-w-0 items-end justify-between gap-3">
            <p className="max-w-full shrink-0 truncate text-display tabular-nums">{formatStat(stat)}</p>
            {stat.trend.length > 1 ? (
              <Sparkline
                data={stat.trend.map((value) => ({ value }))}
                aria-label={`${stat.label}, recent trend`}
                className="mb-1.5 h-8 w-auto max-w-20 min-w-10 flex-1"
              />
            ) : null}
          </div>
          <p className="flex min-w-0 items-center gap-1.5 text-small tabular-nums">
            {good === null ? null : (
              <Icon aria-hidden className={cn('size-4 shrink-0', good ? 'text-success' : 'text-destructive')} />
            )}
            {change === undefined ? (
              <span className="truncate text-muted-foreground">No earlier month to compare</span>
            ) : (
              <>
                <span className="font-medium">{formatChange(change, stat.format)}</span>
                <span className="truncate text-muted-foreground">vs last month</span>
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}

type StatsOverviewProps = Omit<React.ComponentProps<'section'>, 'children'> & {
  /** The stat tiles; four fit one row on a wide container. */
  stats?: Stat[];
  /** The chart's points for each range. An empty list shows the empty state. */
  revenue?: Record<Range, RevenuePoint[]>;
  /** Each plan's share of revenue, in percent. */
  plans?: PlanShare[];
  /** The chart's range. Use with `onRangeChange`, or leave it out and pass `defaultRange`. */
  range?: Range;
  defaultRange?: Range;
  onRangeChange?: (range: Range) => void;
  /** Shows skeletons while the data loads. */
  loading?: boolean;
};

/**
 * The overview of a dashboard: a row of stat tiles with trend and sparkline, a revenue chart with a range
 * switch, and each plan's share of revenue. Lays itself out by its own width, not the screen's.
 */
function StatsOverview({
  stats = sampleStats,
  revenue = sampleRevenue,
  plans = samplePlans,
  range: rangeProp,
  defaultRange = '12m',
  onRangeChange,
  loading = false,
  className,
  ...props
}: StatsOverviewProps) {
  const [rangeState, setRangeState] = React.useState<Range>(defaultRange);
  const range = rangeProp ?? rangeState;
  const setRange = (next: Range) => {
    if (rangeProp === undefined) setRangeState(next);
    onRangeChange?.(next);
  };
  const points = revenue[range];
  const total = points.reduce((sum, point) => sum + point.newBusiness + point.expansion, 0);

  return (
    <section
      data-slot="stats-overview"
      aria-label="Overview"
      aria-busy={loading || undefined}
      className={cn('@container flex min-w-0 flex-col gap-4', className)}
      {...props}
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-transparent bg-border bg-clip-padding shadow-card @md:grid-cols-2 @4xl:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.id} stat={stat} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-transparent bg-card p-4 shadow-card @4xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="text-title">Revenue</h2>
              {loading ? (
                <Skeleton className="my-1 h-3.5 w-40" />
              ) : (
                <p className="text-small text-muted-foreground tabular-nums">
                  {usd.format(total)} in the last {ranges[range].label}
                </p>
              )}
            </div>
            <SegmentedControl
              size="sm"
              aria-label="Range"
              value={range}
              onValueChange={(value) => setRange(value as Range)}
            >
              {(Object.keys(ranges) as Range[]).map((key) => (
                <SegmentedControlItem key={key} value={key}>
                  {ranges[key].label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
          {loading ? (
            <Skeleton className="h-60 w-full" />
          ) : points.length === 0 ? (
            <Empty className="h-60 flex-none p-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ChartNoAxesCombined />
                </EmptyMedia>
                <EmptyTitle render={<h3 />}>No revenue yet</EmptyTitle>
                <EmptyDescription>Revenue shows up here once your first invoice is paid.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <GrowthChart
              key={range}
              title={`Revenue by source, last ${ranges[range].label}`}
              data={points}
              config={chartConfig}
              xKey="label"
              xLabel={ranges[range].xLabel}
              valueFormatter={(value) => usd.format(value)}
            />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-transparent bg-card p-4 shadow-card">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-title">Revenue by plan</h2>
            <p className="text-small text-muted-foreground">Share of the last {ranges[range].label}</p>
          </div>
          <div className="flex flex-col gap-5">
            {loading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))
              : plans.map((plan) => (
                  <Meter key={plan.plan} value={plan.share}>
                    <MeterLabel className="truncate">{plan.plan}</MeterLabel>
                    <MeterValue>
                      {(formatted) => (
                        <>
                          <span className="text-foreground">{usdCompact.format((total * plan.share) / 100)}</span>
                          <span className="ms-2">{formatted}</span>
                        </>
                      )}
                    </MeterValue>
                    <MeterBar />
                  </Meter>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { StatsOverview, type StatsOverviewProps, type Stat, type RevenuePoint, type PlanShare, type Range as StatsRange };
