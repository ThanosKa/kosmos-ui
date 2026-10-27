'use client';

import { ArrowRight } from 'lucide-react';
import * as React from 'react';
import { useControlled } from '@/registry/kosmos/hooks/use-controlled';
import { cn } from '@/registry/kosmos/lib/cn';
import { statDelta } from '@/registry/kosmos/lib/stat-delta';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import {
  ChartCard,
  ChartCardAction,
  ChartCardContent,
  ChartCardDescription,
  ChartCardHeader,
  ChartCardTitle,
  type ChartCardState,
} from '@/registry/kosmos/ui/chart-card';
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
  /** Whether a rise is good news (users), bad news (errors) or neither. Colors the change. */
  goodWhen?: 'up' | 'down' | 'neither';
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

/** A curve that rises by `rise` (a share of `end`) and lands on `end`, with small steps around the trend. */
const curve = (length: number, end: number, rise: number, swing: number, phase: number) =>
  Array.from({ length }, (_, i) => {
    const progress = length === 1 ? 1 : i / (length - 1);
    const wobble = i === length - 1 ? 0 : Math.sin(i * 0.9 + phase) + 0.4 * Math.cos(i * 2.3 + phase);
    return Math.round(end * (1 - rise * (1 - progress) + swing * 0.4 * wobble));
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

/** Values of a million and up go compact (28.5M), so they fit their slot. */
function formatValue(value: number, format: StatFormat) {
  if (format === 'percent') return `${formats.percent.format(value)}%`;
  if (Math.abs(value) < 1_000_000) return formats[format].format(value);
  return format === 'currency' ? usdCompact.format(value) : compactNumber.format(value);
}

/** The change as a green or red triangle and signed number, with the muted period it is measured against. A flat change stays muted. */
function MetricChange({ metric, rangeLabel }: { metric: Metric; rangeLabel: string }) {
  const delta = metric.change === undefined ? null : statDelta(metric.change, { goodWhen: metric.goodWhen, unit: metric.format === 'percent' ? 'points' : 'percent' });
  if (!delta) return <span className="truncate text-caption text-muted-foreground">No earlier period</span>;
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-caption tabular-nums">
      <span
        className={cn(
          'flex items-center gap-1 font-medium text-muted-foreground',
          delta.tone === 'good' && 'text-tint-green-foreground',
          delta.tone === 'bad' && 'text-tint-red-foreground',
        )}
      >
        {delta.direction === 'flat' ? (
          <ArrowRight aria-hidden className="size-3 shrink-0" />
        ) : (
          <svg aria-hidden viewBox="0 0 8 8" className={cn('size-2 shrink-0 fill-current', delta.direction === 'down' && 'rotate-180')}>
            <path d="M4 0.5 7.5 7H0.5z" />
          </svg>
        )}
        {delta.text}
      </span>
      <span className="text-muted-foreground" aria-hidden>
        vs. last period
      </span>
      <span className="sr-only">against the previous {rangeLabel}</span>
    </span>
  );
}

/**
 * One metric as a tab cell: its label, its value and its change. The selected cell keeps its value in ink while idle
 * cells step back to muted, and the Tabs indicator slides under it in `primary`.
 */
function MetricTab({ metric, loading, rangeLabel }: { metric: Metric; loading: boolean; rangeLabel: string }) {
  return (
    <TabsTrigger
      value={metric.id}
      className={cn(
        'h-auto min-w-0 flex-col items-start justify-start gap-1 rounded-none px-4 py-3 text-start whitespace-normal',
        'border-s-border transition-[color,background-color] hover:not-data-active:bg-accent',
        // Two cells a row below 768px, four from there: a divider before every cell that is not first in its row, and a rule above the second row.
        'nth-[odd]:border-s-transparent @3xl:nth-[odd]:border-s-border @3xl:first:border-s-transparent',
        'nth-[n+3]:border-t nth-[n+3]:border-t-border @3xl:nth-[n+3]:border-t-transparent',
      )}
    >
      <span title={metric.label} className="w-full truncate text-small">
        {metric.label}
      </span>
      {loading ? (
        <>
          <Skeleton className="my-0.5 h-6 w-24 max-w-full bg-foreground/10" />
          <Skeleton className="h-4 w-14 bg-foreground/10" />
        </>
      ) : (
        <>
          <span className="max-w-full truncate text-title font-medium text-foreground tabular-nums">{formatValue(metric.value, metric.format)}</span>
          <MetricChange metric={metric} rangeLabel={rangeLabel} />
        </>
      )}
    </TabsTrigger>
  );
}

/** The legend as HTML so it can sit in the chart's header: a solid line for this period, the same line at reduced opacity for the one before. */
function PeriodLegend({ rangeLabel }: { rangeLabel: string }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground">
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-0.5 w-4 rounded-full bg-chart-1 forced-colors:bg-[CanvasText]" />
        Last {rangeLabel}
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-0.5 w-4 rounded-full bg-chart-1/45 forced-colors:bg-[CanvasText]" />
        Previous {rangeLabel}
      </li>
    </ul>
  );
}

/** The selected metric as a faint-filled line for this period and the same line at reduced opacity for the period before. A hidden table repeats the data. */
function MetricChart({ metric, range }: { metric: Metric; range: Range }) {
  const rangeLabel = ranges[range].label;
  const config = {
    current: { label: `Last ${rangeLabel}`, color: 'var(--chart-1)' },
    previous: { label: `Previous ${rangeLabel}`, color: 'var(--chart-1)' },
  } satisfies ChartConfig;

  return (
    <GrowthChart
      key={range}
      title={`${metric.label}, last ${rangeLabel} against the ${rangeLabel} before`}
      data={metric.points}
      config={config}
      xKey="label"
      xLabel={ranges[range].xLabel}
      previousKeys={['previous']}
      valueFormatter={(value) => formatValue(value, metric.format)}
      legend={false}
      grid
    />
  );
}

const sharePercent = (count: number, total: number) => {
  const share = (count / total) * 100;
  return share < 1 ? '<1%' : `${Math.round(share)}%`;
};

/** The most frequent events as a numbered list in two columns from 768px, each with its count and its share of the list. */
function TopEvents({ events, state, onRetry, rangeLabel }: { events: TopEvent[]; state: ChartCardState; onRetry?: () => void; rangeLabel: string }) {
  const headingId = React.useId();
  const total = events.reduce((sum, event) => sum + event.count, 0);
  const half = Math.ceil(events.length / 2);
  const columns = [events.slice(0, half), events.slice(half)];

  return (
    // A card of its own inside the overview's, only for its loading, empty and error states.
    <ChartCard state={state} className="rounded-none border-t border-border bg-transparent shadow-none">
      <ChartCardHeader className="items-baseline">
        <ChartCardTitle id={headingId} render={<h2 />}>
          Top events
        </ChartCardTitle>
        <ChartCardDescription className="col-start-2 row-start-1 justify-self-end">Last {rangeLabel}</ChartCardDescription>
      </ChartCardHeader>
      <ChartCardContent
        loadingLabel="Loading top events"
        emptyTitle="No events yet"
        emptyDescription="Events show up here as soon as a project sends its first one."
        errorTitle="The top events could not load"
        onRetry={onRetry}
        className="pb-3"
      >
        <div aria-labelledby={headingId} role="group" className="grid grid-cols-1 gap-x-10 @3xl:grid-cols-2">
          {columns.map((column, columnIndex) => (
            <ol key={columnIndex} start={columnIndex === 0 ? 1 : half + 1} className="divide-y divide-border">
              {column.map((event, i) => (
                <li key={event.name} className="grid min-h-10 grid-cols-[1.25rem_minmax(0,1fr)_auto_3rem] items-center gap-x-3 text-small">
                  <span className="text-caption text-muted-foreground tabular-nums">{columnIndex * half + i + 1}</span>
                  <span title={event.name} className="min-w-0 truncate font-mono">
                    {event.name}
                  </span>
                  <span className="font-medium text-foreground tabular-nums">{formatValue(event.count, 'number')}</span>
                  <span className="text-end text-caption text-muted-foreground tabular-nums">{sharePercent(event.count, total)}</span>
                </li>
              ))}
            </ol>
          ))}
        </div>
      </ChartCardContent>
    </ChartCard>
  );
}

type StatsOverviewProps = Omit<React.ComponentProps<'section'>, 'children'> & {
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
  /** Shows an error in place of the metrics, the chart and the top events, when the data could not load. */
  error?: boolean;
  /** Shows a button that tries again beside the error. */
  onRetry?: () => void;
};

/**
 * The overview of an analytics dashboard on one flat card: the headline metrics as divided cells over one chart that
 * compares the selected range with the period before it, a range switch, and the top events below. Lays itself out
 * by its own width, not the screen's.
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
  error = false,
  onRetry,
  className,
  ...props
}: StatsOverviewProps) {
  const [range, setRange] = useControlled(rangeProp, defaultRange, onRangeChange);
  const list = metrics[range];
  const [metricId, setMetric] = useControlled(metricProp, defaultMetric ?? list[0]?.id ?? '', onMetricChange);
  const active = list.find((item) => item.id === metricId) ?? list[0];
  const rangeLabel = ranges[range].label;
  const events = topEvents[range];

  const stateOf = (empty: boolean): ChartCardState => (loading ? 'loading' : error ? 'error' : empty ? 'empty' : 'ready');
  const chartState = stateOf(!active || active.points.length === 0);
  const showTabs = list.length > 0 && !error;

  const chart = (
    <ChartCardContent
      className="px-4 pb-5"
      emptyTitle={list.length === 0 ? 'No metrics yet' : 'No data in this range'}
      emptyDescription={
        list.length === 0
          ? 'Your numbers show up here once the first project sends events.'
          : 'Pick a longer range, or check back once events come in.'
      }
      onRetry={onRetry}
    >
      {active ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-3">
            <span className="truncate text-small text-muted-foreground">
              {active.label}, last {rangeLabel}
            </span>
            <PeriodLegend rangeLabel={rangeLabel} />
          </div>
          <MetricChart metric={active} range={range} />
        </>
      ) : null}
    </ChartCardContent>
  );

  return (
    <section
      data-slot="stats-overview"
      aria-label="Overview"
      aria-busy={loading || undefined}
      className={cn('@container min-w-0', className)}
      {...props}
    >
      <ChartCard state={chartState}>
        <ChartCardHeader>
          <ChartCardTitle render={<h2 />}>Overview</ChartCardTitle>
          <ChartCardDescription>
            Last {rangeLabel} against the {rangeLabel} before
          </ChartCardDescription>
          <ChartCardAction>
            <SegmentedControl size="sm" aria-label="Range" value={range} onValueChange={(value) => setRange(value as Range)}>
              {(Object.keys(ranges) as Range[]).map((key) => (
                <SegmentedControlItem key={key} value={key}>
                  {ranges[key].label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </ChartCardAction>
        </ChartCardHeader>

        {showTabs && active ? (
          <Tabs value={active.id} onValueChange={(value) => setMetric(String(value))} className="min-w-0 flex-1 gap-0">
            <TabsList aria-label="Metric" className="grid grid-cols-2 gap-0 border-t border-border @3xl:grid-cols-4">
              {list.map((item) => (
                <MetricTab key={item.id} metric={item} loading={loading} rangeLabel={rangeLabel} />
              ))}
            </TabsList>
            <TabsContent value={active.id} className="flex flex-1 flex-col pt-5">
              {chart}
            </TabsContent>
          </Tabs>
        ) : (
          chart
        )}

        <TopEvents
          events={events}
          state={stateOf(events.length === 0 || (events[0]?.count ?? 0) === 0)}
          onRetry={onRetry}
          rangeLabel={rangeLabel}
        />
      </ChartCard>
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
