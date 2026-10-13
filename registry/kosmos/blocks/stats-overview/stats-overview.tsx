'use client';

import { Activity, ChartNoAxesCombined, TrendingDown, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Badge } from '@/registry/kosmos/ui/badge';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

type StatFormat = 'currency' | 'number' | 'percent';
type Range = '7d' | '30d' | '90d';

/** One point of the chart: the value in the selected range, and the value at the same point of the period before. */
type MetricPoint = { label: string; current: number; previous: number };

type Metric = {
  id: string;
  label: string;
  /** The headline number for the range. */
  value: number;
  format: StatFormat;
  /** The change against the period before: a percentage, or percentage points for a `percent` metric. Leave it out when there is no earlier period. */
  change?: number;
  /** Whether a rise is good news (users) or bad news (errors). Colors the change. */
  goodWhen?: 'up' | 'down';
  /** The chart's points, oldest first. */
  points: MetricPoint[];
};

type TopEvent = { name: string; count: number };

// Sample data: replace it with your metrics. Values are made up but stable, so server and browser match.
const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const dayBefore = (daysAgo: number) => dayLabel.format(Date.UTC(2026, 9, 11) - daysAgo * 86_400_000);

/** The x labels of each range: one per day, or one per week for 90 days. */
const sampleLabels: Record<Range, string[]> = {
  '7d': Array.from({ length: 7 }, (_, i) => dayBefore(6 - i)),
  '30d': Array.from({ length: 30 }, (_, i) => dayBefore(29 - i)),
  '90d': Array.from({ length: 13 }, (_, i) => dayBefore((12 - i) * 7)),
};

/** A curve that rises by `rise` (a share of `end`) and lands on `end`, with a stable wobble. */
const curve = (length: number, end: number, rise: number, swing: number, phase: number) =>
  Array.from({ length }, (_, i) => {
    const progress = length === 1 ? 1 : i / (length - 1);
    const wobble = i === length - 1 ? 0 : Math.sin(i * 1.7 + phase) + 0.5 * Math.cos(i * 0.6 + phase);
    return Math.round(end * (1 - rise * (1 - progress) + swing * wobble));
  });

const steps = (labels: string[], current: number[], previous: number[]) =>
  labels.map((label, i) => ({ label, current: current[i], previous: previous[i] }));

function samplePoints(range: Range, end: number, change: number, rise: number, swing: number, phase: number) {
  const labels = sampleLabels[range];
  const current = curve(labels.length, end, rise, swing, phase);
  const previous = curve(labels.length, end / (1 + change / 100), rise, swing, phase + 2);
  return steps(labels, current, previous);
}

const sampleMetrics: Record<Range, Metric[]> = {
  '7d': [
    { id: 'users', label: 'Active users', value: 61240, format: 'number', change: 3.1, points: samplePoints('7d', 29400, 3.1, 0.04, 0.03, 0) },
    { id: 'events', label: 'Events', value: 6838800, format: 'number', change: 2.4, points: samplePoints('7d', 1012000, 2.4, 0.03, 0.04, 1) },
    { id: 'revenue', label: 'Monthly revenue', value: 14628, format: 'currency', change: 1.2, points: samplePoints('7d', 14628, 1.2, 0.012, 0.002, 2) },
    { id: 'projects', label: 'Live projects', value: 8, format: 'number', change: 0, points: steps(sampleLabels['7d'], Array(7).fill(8), Array(7).fill(8)) },
  ],
  '30d': [
    { id: 'users', label: 'Active users', value: 144600, format: 'number', change: 9.6, points: samplePoints('30d', 29400, 9.6, 0.12, 0.04, 0) },
    { id: 'events', label: 'Events', value: 28495200, format: 'number', change: 14.2, points: samplePoints('30d', 1012000, 14.2, 0.16, 0.05, 1) },
    { id: 'revenue', label: 'Monthly revenue', value: 14628, format: 'currency', change: 6.8, points: samplePoints('30d', 14628, 6.8, 0.07, 0.004, 2) },
    {
      id: 'projects',
      label: 'Live projects',
      value: 8,
      format: 'number',
      change: -11.1,
      points: steps(sampleLabels['30d'], Array.from({ length: 30 }, (_, i) => (i < 6 ? 9 : 8)), Array.from({ length: 30 }, (_, i) => (i < 17 ? 8 : 9))),
    },
  ],
  '90d': [
    { id: 'users', label: 'Active users', value: 312800, format: 'number', change: 21.4, points: samplePoints('90d', 74800, 21.4, 0.24, 0.03, 0) },
    { id: 'events', label: 'Events', value: 88335100, format: 'number', change: 31.8, points: samplePoints('90d', 7040000, 31.8, 0.3, 0.04, 1) },
    { id: 'revenue', label: 'Monthly revenue', value: 14628, format: 'currency', change: 18.9, points: samplePoints('90d', 14628, 18.9, 0.17, 0.006, 2) },
    {
      id: 'projects',
      label: 'Live projects',
      value: 8,
      format: 'number',
      change: 14.3,
      points: steps(sampleLabels['90d'], [7, 7, 8, 8, 8, 9, 9, 9, 9, 8, 8, 8, 8], [6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7]),
    },
  ],
};

const eventsIn30Days: TopEvent[] = [
  { name: 'page_viewed', count: 17410000 },
  { name: 'button_clicked', count: 5960000 },
  { name: 'screen_viewed', count: 4600000 },
  { name: 'signed_up', count: 389000 },
  { name: 'checkout_completed', count: 91200 },
  { name: 'invite_sent', count: 45000 },
];

const scaleEvents = (factor: number) =>
  eventsIn30Days.map((event) => ({ ...event, count: Math.round(event.count * factor) }));

const sampleTopEvents: Record<Range, TopEvent[]> = {
  '7d': scaleEvents(0.24),
  '30d': eventsIn30Days,
  '90d': scaleEvents(3.1),
};

/** Each range's name, and what its x values are, for the hidden data table. */
const ranges: Record<Range, { label: string; xLabel: string }> = {
  '7d': { label: '7 days', xLabel: 'Day' },
  '30d': { label: '30 days', xLabel: 'Day' },
  '90d': { label: '90 days', xLabel: 'Week of' },
};

// A fixed locale, so the server and the browser render the same text.
const formats: Record<StatFormat, Intl.NumberFormat> = {
  currency: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
  number: new Intl.NumberFormat('en-US'),
  percent: new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }),
};
const usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const signed = new Intl.NumberFormat('en-US', { signDisplay: 'exceptZero', maximumFractionDigits: 1 });

/** Values of a million and up go compact (28.5M), so they fit their slot. */
function formatValue(value: number, format: StatFormat) {
  if (format === 'percent') return `${formats.percent.format(value)}%`;
  if (Math.abs(value) < 1_000_000) return formats[format].format(value);
  return format === 'currency' ? usdCompact.format(value) : compactNumber.format(value);
}
// A true minus sign (−), not the hyphen Intl writes.
const formatChange = (change: number, format: StatFormat) =>
  `${signed.format(change).replace('-', '−')}${format === 'percent' ? ' pts' : '%'}`;

function MetricChange({ metric, rangeLabel }: { metric: Metric; rangeLabel: string }) {
  const { change } = metric;
  if (change === undefined) return <span className="truncate text-muted-foreground">No earlier period</span>;
  const rising = change > 0;
  const good = change === 0 ? null : rising === ((metric.goodWhen ?? 'up') === 'up');
  const Icon = rising ? TrendingUp : TrendingDown;
  return (
    <Badge variant={good === null ? 'secondary' : good ? 'green' : 'red'}>
      {good === null ? null : <Icon aria-hidden />}
      {formatChange(change, metric.format)}
      <span className="sr-only">against the previous {rangeLabel}</span>
    </Badge>
  );
}

/** Where the value sits: beside the label and the change in a container under 448px, under the label from there up. */
const valueSlot =
  'col-start-2 row-span-2 row-start-1 justify-self-end @md:col-start-1 @md:row-span-1 @md:row-start-auto @md:justify-self-start';

/** One metric as a tab: its label, its value and its change. The selected one lifts onto a raised surface. */
function MetricTab({ metric, loading, rangeLabel }: { metric: Metric; loading: boolean; rangeLabel: string }) {
  return (
    <TabsTrigger
      value={metric.id}
      className={cn(
        'grid h-auto min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center justify-items-start gap-x-3 gap-y-1 rounded-lg px-3 py-2.5 text-start whitespace-normal @md:grid-cols-1',
        'transition-[color,background-color,box-shadow] hover:not-data-active:bg-accent',
        'data-active:bg-secondary data-active:shadow-control',
        // The raised surface marks the selected metric, so the tab list's underline and its reduced-motion twin stay hidden.
        'after:hidden',
      )}
    >
      <span title={metric.label} className="w-full wrap-break-word @md:truncate">
        {metric.label}
      </span>
      {loading ? (
        <>
          {/* The track is the skeleton's own fill, so these take a darker one. */}
          <Skeleton className={cn('h-6 w-24 bg-foreground/10 @md:my-1.5', valueSlot)} />
          <Skeleton className="h-4 w-14 bg-foreground/10" />
        </>
      ) : (
        <>
          <span className={cn('max-w-full truncate text-display text-foreground tabular-nums', valueSlot)}>
            {formatValue(metric.value, metric.format)}
          </span>
          <span className="flex min-w-0 items-center text-small tabular-nums">
            <MetricChange metric={metric} rangeLabel={rangeLabel} />
          </span>
        </>
      )}
    </TabsTrigger>
  );
}

function TopEvents({ events, loading, rangeLabel }: { events: TopEvent[]; loading: boolean; rangeLabel: string }) {
  const top = events[0]?.count ?? 0;
  const headingId = React.useId();

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-transparent bg-card p-4 text-card-foreground shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={headingId} className="text-title">
          Top events
        </h2>
        <p className="text-small text-muted-foreground">Last {rangeLabel}</p>
      </div>
      {loading ? (
        <div className="flex flex-col gap-1">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      ) : events.length === 0 || top === 0 ? (
        <Empty className="flex-1 p-0 py-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Activity />
            </EmptyMedia>
            <EmptyTitle render={<h3 />}>No events yet</EmptyTitle>
            <EmptyDescription>Events show up here as soon as a project sends its first one.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ol aria-labelledby={headingId} className="flex flex-col gap-1">
          {events.map((event) => (
            <li
              key={event.name}
              className="relative isolate flex h-8 min-w-0 items-center justify-between gap-3 px-2.5 text-small"
              style={{ '--share': `${(event.count / top) * 100}%` } as React.CSSProperties}
            >
              <span aria-hidden className="absolute inset-y-0 start-0 -z-10 w-(--share) rounded-lg bg-muted" />
              <span title={event.name} className="min-w-0 truncate font-mono">
                {event.name}
              </span>
              <span className="shrink-0 text-foreground tabular-nums">{formatValue(event.count, 'number')}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function useControlled<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;
  const setValue = (next: T) => {
    if (value === undefined) setUncontrolled(next);
    onChange?.(next);
  };
  return [current, setValue] as const;
}

type StatsOverviewProps =Omit<React.ComponentProps<'section'>, 'children'> & {
  /** The metrics for each range, as tabs over the chart. Four fit one row on a wide container. */
  metrics?: Record<Range, Metric[]>;
  /** The most frequent events for each range, most frequent first. An empty list shows the empty state. */
  topEvents?: Record<Range, TopEvent[]>;
  /** The range. Use with `onRangeChange`, or leave it out and pass `defaultRange`. */
  range?: Range;
  defaultRange?: Range;
  onRangeChange?: (range: Range) => void;
  /** The `id` of the metric the chart shows. Use with `onMetricChange`, or leave it out and pass `defaultMetric`. */
  metric?: string;
  defaultMetric?: string;
  onMetricChange?: (metric: string) => void;
  /** Shows skeletons while the data loads. */
  loading?: boolean;
};

/**
 * The overview of an analytics dashboard: the headline metrics as tabs over one chart that compares the
 * selected range with the period before it, a range switch, and the top events. Lays itself out by its
 * own width, not the screen's.
 */
function StatsOverview({
  metrics = sampleMetrics,
  topEvents = sampleTopEvents,
  range: rangeProp,
  defaultRange = '30d',
  onRangeChange,
  metric: metricProp,
  defaultMetric,
  onMetricChange,
  loading = false,
  className,
  ...props
}: StatsOverviewProps) {
  const [range, setRange] = useControlled(rangeProp, defaultRange, onRangeChange);
  const list = metrics[range];
  const [metricId, setMetric] = useControlled(metricProp, defaultMetric ?? list[0]?.id ?? '', onMetricChange);
  const active = list.find((item) => item.id === metricId) ?? list[0];
  const rangeLabel = ranges[range].label;

  const chartConfig = {
    current: { label: `Last ${rangeLabel}`, color: 'var(--chart-1)' },
    previous: { label: `Previous ${rangeLabel}`, color: 'var(--chart-2)' },
  } satisfies ChartConfig;

  return (
    <section
      data-slot="stats-overview"
      aria-label="Overview"
      aria-busy={loading || undefined}
      className={cn('@container min-w-0', className)}
      {...props}
    >
      <div className="grid grid-cols-1 gap-4 @6xl:grid-cols-3">
        <Tabs
          value={active?.id ?? ''}
          onValueChange={(value) => setMetric(String(value))}
          className="min-w-0 gap-0 rounded-2xl border border-transparent bg-card text-card-foreground shadow-card @6xl:col-span-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
            <h2 className="text-title">Overview</h2>
            <SegmentedControl size="sm" aria-label="Range" value={range} onValueChange={(value) => setRange(value as Range)}>
              {(Object.keys(ranges) as Range[]).map((key) => (
                <SegmentedControlItem key={key} value={key}>
                  {ranges[key].label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>

          {list.length === 0 ? (
            <Empty className="h-80 flex-none p-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ChartNoAxesCombined />
                </EmptyMedia>
                <EmptyTitle render={<h3 />}>No metrics yet</EmptyTitle>
                <EmptyDescription>Your numbers show up here once the first project sends events.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <TabsList
                aria-label="Metric"
                className={cn(
                  'm-3 mb-0 grid grid-cols-1 gap-1 rounded-xl border border-transparent bg-muted p-1 shadow-inset @md:grid-cols-2 @3xl:grid-cols-4',
                  'data-[orientation=horizontal]:overflow-visible data-[orientation=horizontal]:border-b-transparent',
                  '*:data-[slot=tabs-indicator]:hidden',
                )}
              >
                {list.map((item) => (
                  <MetricTab key={item.id} metric={item} loading={loading} rangeLabel={rangeLabel} />
                ))}
              </TabsList>

              {active ? (
                <TabsContent value={active.id} className="p-4 pt-3">
                  {loading ? (
                    <Skeleton className="h-60 w-full" />
                  ) : active.points.length === 0 ? (
                    <Empty className="h-60 flex-none p-0">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ChartNoAxesCombined />
                        </EmptyMedia>
                        <EmptyTitle render={<h3 />}>No data in this range</EmptyTitle>
                        <EmptyDescription>Pick a longer range, or check back once events come in.</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <GrowthChart
                      key={`${active.id}-${range}`}
                      title={`${active.label}, last ${rangeLabel} against the ${rangeLabel} before`}
                      data={active.points}
                      config={chartConfig}
                      xKey="label"
                      xLabel={ranges[range].xLabel}
                      valueFormatter={(value) => formatValue(value, active.format)}
                    />
                  )}
                </TabsContent>
              ) : null}
            </>
          )}
        </Tabs>

        <TopEvents events={topEvents[range]} loading={loading} rangeLabel={rangeLabel} />
      </div>
    </section>
  );
}

export {
  StatsOverview,
  type StatsOverviewProps,
  type Metric,
  type MetricPoint,
  type TopEvent,
  type StatFormat,
  type Range as StatsRange,
};
