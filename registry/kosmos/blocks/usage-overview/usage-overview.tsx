'use client';

import { Bot, TrendingDown, TrendingUp } from 'lucide-react';
import * as React from 'react';
import * as Recharts from 'recharts';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  chartAnimation,
  type ChartConfig,
} from '@/registry/kosmos/ui/chart';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { Meter, MeterBar, MeterLabel, MeterValue } from '@/registry/kosmos/ui/meter';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

type UsageRange = '7d' | '30d' | '90d';

type UsageRow = { id: string; name: string; avatarUrl?: string; runs: number; tokens: number; costUsd: number };

type UsageDataset = {
  /** The period shown under the title, such as "Sep 14 – Oct 13". */
  periodLabel: string;
  totals: {
    tokens: number;
    runs: number;
    costUsd: number;
    /** The change against the previous period, in percent. */
    changePct: { tokens: number; runs: number; costUsd: number };
  };
  /** One point per day: the `date` label and the tokens of each model, keyed by model id. */
  daily: Array<{ date: string } & Record<string, number | string>>;
  /** One row per model. The first five are the chart's series, keyed in `daily` by their `id`. */
  models: UsageRow[];
  members: UsageRow[];
};

type UsageBudget = { usedUsd: number; limitUsd: number };

// Sample data: replace it with your usage. Values are made up but stable, so server and browser match.
const sampleWorkspace = 'Acme Inc.';

const sampleModels = [
  { id: 'sonnet', name: 'Claude Sonnet 5.5', share: 0.55, tokensPerRun: 14200, usdPerMillion: 18 },
  { id: 'haiku', name: 'Claude Haiku 5.5', share: 0.33, tokensPerRun: 6100, usdPerMillion: 3.2 },
  { id: 'opus', name: 'Claude Opus 5.5', share: 0.12, tokensPerRun: 2300, usdPerMillion: 90 },
];

const sampleMembers = [
  { id: 'admin', name: 'Admin', share: 0.46 },
  { id: 'analyst', name: 'Analyst', share: 0.33 },
  { id: 'growth', name: 'Growth team', share: 0.21 },
];

const sampleChanges: Record<UsageRange, { tokens: number; runs: number; costUsd: number }> = {
  '7d': { tokens: 6.8, runs: 4.1, costUsd: 9.3 },
  '30d': { tokens: 12.4, runs: 8.6, costUsd: 15.2 },
  '90d': { tokens: 41.7, runs: 33.5, costUsd: 38.9 },
};

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const dayAt = (daysAgo: number) => dayLabel.format(Date.UTC(2026, 9, 13) - daysAgo * 86_400_000);

function buildDataset(days: number, tokensPerDay: number, changePct: UsageDataset['totals']['changePct']): UsageDataset {
  const daily = Array.from({ length: days }, (_, i) => {
    const swing = 1 + 0.22 * Math.sin(i * 1.3) + 0.12 * Math.cos(i * 0.45) + (i / days) * 0.2;
    const weekend = i % 7 === 5 || i % 7 === 6 ? 0.55 : 1;
    const row: UsageDataset['daily'][number] = { date: dayAt(days - 1 - i) };
    sampleModels.forEach((model, m) => {
      row[model.id] = Math.round((tokensPerDay * model.share * swing * weekend * (1 + 0.1 * Math.sin(i * 0.9 + m * 2))) / 1000) * 1000;
    });
    return row;
  });

  const models = sampleModels.map((model) => {
    const tokens = daily.reduce((sum, day) => sum + (day[model.id] as number), 0);
    return {
      id: model.id,
      name: model.name,
      tokens,
      runs: Math.round(tokens / model.tokensPerRun),
      costUsd: (tokens / 1_000_000) * model.usdPerMillion,
    };
  });
  const sum = (key: 'tokens' | 'runs' | 'costUsd') => models.reduce((total, row) => total + row[key], 0);
  const totals = { tokens: sum('tokens'), runs: sum('runs'), costUsd: sum('costUsd') };
  const members = sampleMembers.map((member) => ({
    id: member.id,
    name: member.name,
    tokens: Math.round(totals.tokens * member.share),
    runs: Math.round(totals.runs * member.share),
    costUsd: totals.costUsd * member.share,
  }));

  return {
    periodLabel: `${dayAt(days - 1)} – ${dayAt(0)}`,
    totals: { ...totals, changePct },
    daily,
    models,
    members,
  };
}

const sampleUsage: Record<UsageRange, UsageDataset> = {
  '7d': buildDataset(7, 2_150_000, sampleChanges['7d']),
  '30d': buildDataset(30, 2_300_000, sampleChanges['30d']),
  '90d': buildDataset(90, 1_900_000, sampleChanges['90d']),
};

const sampleBudget: UsageBudget = { usedUsd: sampleUsage['30d'].totals.costUsd, limitUsd: 2000 };

const rangeLabels: Record<UsageRange, string> = { '7d': '7 days', '30d': '30 days', '90d': '90 days' };

/** One chart series per model, in `models` order, colored `chart-1` to `chart-5`. */
const seriesOf = (models: UsageRow[]) => models.slice(0, 5);
const chartConfigOf = (models: UsageRow[]): ChartConfig =>
  Object.fromEntries(seriesOf(models).map((model, index) => [model.id, { label: model.name, color: `var(--chart-${index + 1})` }]));

// A fixed locale, so the server and the browser render the same text.
const integer = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usdWhole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const signed = new Intl.NumberFormat('en-US', { signDisplay: 'exceptZero', maximumFractionDigits: 1 });
// A true minus sign, not the hyphen Intl writes.
const formatChange = (change: number) => `${signed.format(change).replace('-', '−')}%`;

const initials = (name: string) =>
  (name.includes(' ') ? name.split(' ').map((part) => part[0]) : [name.slice(0, 2)]).join('').toUpperCase();

type Tile = { id: string; label: string; value: string; change: number; goodWhen: 'up' | 'down' };

function StatTile({ tile, loading }: { tile: Tile; loading: boolean }) {
  const rising = tile.change > 0;
  const good = tile.change === 0 ? null : rising === (tile.goodWhen === 'up');
  const Icon = rising ? TrendingUp : TrendingDown;

  return (
    <div
      data-slot="stat-tile"
      className="flex min-w-0 flex-col gap-2 rounded-2xl border border-transparent bg-card p-4 text-card-foreground shadow-card"
    >
      <p title={tile.label} className="truncate text-body font-medium text-muted-foreground">
        {tile.label}
      </p>
      {loading ? (
        <>
          <Skeleton className="my-2 h-6 w-28" />
          <Skeleton className="h-3.5 w-36" />
        </>
      ) : (
        <>
          <p className="truncate text-display tabular-nums">{tile.value}</p>
          <p className="flex min-w-0 items-center gap-2 text-small tabular-nums">
            <Badge variant={good === null ? 'secondary' : good ? 'green' : 'red'}>
              {good === null ? null : <Icon aria-hidden />}
              {formatChange(tile.change)}
            </Badge>
            <span className="truncate text-muted-foreground">vs previous period</span>
          </p>
        </>
      )}
    </div>
  );
}

function BreakdownRows({ rows, by, totalTokens, loading }: { rows: UsageRow[]; by: 'model' | 'member'; totalTokens: number; loading: boolean }) {
  return (
    <Table aria-label={`Usage by ${by}`} containerClassName="-mx-3 w-auto">
      <TableHeader>
        <TableRow>
          <TableHead>{by === 'model' ? 'Model' : 'Member'}</TableHead>
          <TableHead className="hidden text-end @sm:table-cell">Runs</TableHead>
          <TableHead className="text-end">Tokens</TableHead>
          <TableHead className="hidden text-end @md:table-cell">Share</TableHead>
          <TableHead className="text-end">Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: 3 }, (_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 5 }, (_, cell) => (
                  <TableCell key={cell} className={cn(cell > 0 && 'text-end', cell === 1 && 'hidden @sm:table-cell', cell === 3 && 'hidden @md:table-cell')}>
                    <Skeleton className={cn('h-3.5 w-16', cell > 0 && 'ms-auto')} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="w-full max-w-0 font-medium">
                  <span className="flex min-w-0 items-center gap-2">
                    {by === 'member' ? (
                      <Avatar size="sm">
                        {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt="" /> : null}
                        <AvatarFallback>{initials(row.name)}</AvatarFallback>
                      </Avatar>
                    ) : null}
                    <span title={row.name} className="truncate">
                      {row.name}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="hidden text-end @sm:table-cell">{integer.format(row.runs)}</TableCell>
                <TableCell className="text-end">{compact.format(row.tokens)}</TableCell>
                <TableCell className="hidden text-end text-muted-foreground @md:table-cell">
                  {totalTokens > 0 ? `${Math.round((row.tokens / totalTokens) * 100)}%` : '0%'}
                </TableCell>
                <TableCell className="text-end">{usd.format(row.costUsd)}</TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}

type UsageOverviewProps = Omit<React.ComponentProps<'section'>, 'children'> & {
  /** The workspace named under the title. */
  workspace?: string;
  /** The data of each range. A range with no runs shows the empty state. */
  usage?: Record<UsageRange, UsageDataset>;
  /** The monthly budget, shown as a meter under the table. Leave it out for no meter. */
  budget?: UsageBudget;
  /** The range shown. Use with `onRangeChange`, or leave it out and pass `defaultRange`. */
  range?: UsageRange;
  defaultRange?: UsageRange;
  onRangeChange?: (range: UsageRange) => void;
  /** The breakdown shown. Use with `onBreakdownChange`, or leave it out and pass `defaultBreakdown`. */
  breakdown?: 'model' | 'member';
  defaultBreakdown?: 'model' | 'member';
  onBreakdownChange?: (breakdown: 'model' | 'member') => void;
  /** Where the empty state's button goes. */
  agentsHref?: string;
  /** Shows skeletons while the data loads. */
  loading?: boolean;
};

/**
 * Agent usage and cost for a workspace: four stat tiles, tokens per day stacked by model, and a
 * breakdown by model or member with the monthly budget. Lays itself out by its own width, not the screen's.
 */
function UsageOverview({
  workspace = sampleWorkspace,
  usage = sampleUsage,
  budget = sampleBudget,
  range: rangeProp,
  defaultRange = '30d',
  onRangeChange,
  breakdown: breakdownProp,
  defaultBreakdown = 'model',
  onBreakdownChange,
  agentsHref = '#',
  loading = false,
  className,
  ...props
}: UsageOverviewProps) {
  const [rangeState, setRangeState] = React.useState<UsageRange>(defaultRange);
  const [breakdownState, setBreakdownState] = React.useState<'model' | 'member'>(defaultBreakdown);
  const range = rangeProp ?? rangeState;
  const breakdown = breakdownProp ?? breakdownState;
  const setRange = (next: UsageRange) => {
    if (rangeProp === undefined) setRangeState(next);
    onRangeChange?.(next);
  };
  const setBreakdown = (next: 'model' | 'member') => {
    if (breakdownProp === undefined) setBreakdownState(next);
    onBreakdownChange?.(next);
  };

  const data = usage[range];
  const { totals } = data;
  const empty = !loading && totals.runs === 0;
  const costPerRun = totals.runs > 0 ? totals.costUsd / totals.runs : 0;
  const previousRunsRatio = 1 + totals.changePct.runs / 100;
  const costPerRunChange = previousRunsRatio > 0 ? ((1 + totals.changePct.costUsd / 100) / previousRunsRatio - 1) * 100 : 0;

  const tiles: Tile[] = [
    { id: 'tokens', label: 'Tokens', value: compact.format(totals.tokens), change: totals.changePct.tokens, goodWhen: 'up' },
    { id: 'runs', label: 'Runs', value: integer.format(totals.runs), change: totals.changePct.runs, goodWhen: 'up' },
    { id: 'spend', label: 'Spend', value: usd.format(totals.costUsd), change: totals.changePct.costUsd, goodWhen: 'down' },
    { id: 'cost-per-run', label: 'Cost per run', value: usd.format(costPerRun), change: costPerRunChange, goodWhen: 'down' },
  ];

  const budgetPercent = budget ? (budget.usedUsd / budget.limitUsd) * 100 : 0;
  const rows = breakdown === 'model' ? data.models : data.members;
  const series = seriesOf(data.models);
  const chartConfig = chartConfigOf(data.models);

  return (
    <section
      data-slot="usage-overview"
      aria-label="Agent usage"
      aria-busy={loading || undefined}
      className={cn('@container flex min-w-0 flex-col gap-4', className)}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-title font-medium">Agent usage</h2>
          <p className="text-small text-muted-foreground tabular-nums">
            {workspace} · {loading ? 'Loading…' : data.periodLabel}
          </p>
        </div>
        <SegmentedControl size="sm" aria-label="Period" value={range} onValueChange={(value) => setRange(value as UsageRange)}>
          {(Object.keys(rangeLabels) as UsageRange[]).map((key) => (
            <SegmentedControlItem key={key} value={key}>
              {rangeLabels[key]}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      {empty ? (
        <div className="rounded-2xl border border-transparent bg-card p-4 shadow-card">
          <Empty className="p-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bot />
              </EmptyMedia>
              <EmptyTitle render={<h3 />}>No agent runs in this period</EmptyTitle>
              <EmptyDescription>Tokens, runs and spend show up here once an agent runs.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="secondary" href={agentsHref}>
                Open agents
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-4">
            {tiles.map((tile) => (
              <StatTile key={tile.id} tile={tile} loading={loading} />
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-transparent bg-card p-4 shadow-card">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-title">Tokens per day</h3>
              <p className="text-small text-muted-foreground">By model, last {rangeLabels[range]}</p>
            </div>
            {loading ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <figure className="m-0 flex w-full flex-col">
                <ChartContainer config={chartConfig} className="aspect-auto h-60">
                  <Recharts.BarChart
                    key={range}
                    title={`Tokens per day by model, last ${rangeLabels[range]}`}
                    data={data.daily}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <Recharts.CartesianGrid vertical={false} />
                    <Recharts.XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                    <Recharts.YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width="auto"
                      tickFormatter={(value: number) => compact.format(value)}
                    />
                    <ChartTooltip
                      isAnimationActive={false}
                      cursor
                      content={
                        <ChartTooltipContent
                          valueFormatter={(value) => (typeof value === 'number' ? `${compact.format(value)} tokens` : String(value))}
                        />
                      }
                    />
                    <ChartLegend verticalAlign="top" content={<ChartLegendContent verticalAlign="top" />} />
                    {series.map((model) => (
                      <Recharts.Bar
                        key={model.id}
                        dataKey={model.id}
                        name={model.name}
                        stackId="tokens"
                        fill={`var(--color-${model.id})`}
                        maxBarSize={24}
                        {...chartAnimation}
                      />
                    ))}
                  </Recharts.BarChart>
                </ChartContainer>
                <div className="sr-only">
                  <table>
                    <caption>Tokens per day by model, last {rangeLabels[range]}</caption>
                    <thead>
                      <tr>
                        <th scope="col">Day</th>
                        {series.map((model) => (
                          <th key={model.id} scope="col">
                            {model.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.daily.map((day) => (
                        <tr key={day.date}>
                          <th scope="row">{day.date}</th>
                          {series.map((model) => (
                            <td key={model.id}>{integer.format(Number(day[model.id] ?? 0))}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </figure>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-transparent bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-title">Breakdown</h3>
                <p className="text-small text-muted-foreground">Runs, tokens and cost for the period</p>
              </div>
              <SegmentedControl
                size="sm"
                aria-label="Breakdown"
                value={breakdown}
                onValueChange={(value) => setBreakdown(value as 'model' | 'member')}
              >
                <SegmentedControlItem value="model">Model</SegmentedControlItem>
                <SegmentedControlItem value="member">Member</SegmentedControlItem>
              </SegmentedControl>
            </div>
            <BreakdownRows rows={rows} by={breakdown} totalTokens={totals.tokens} loading={loading} />
            {budget ? (
              loading ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ) : (
                <Meter value={budget.usedUsd} max={budget.limitUsd} tone={budgetPercent >= 90 ? 'warning' : 'primary'}>
                  <MeterLabel>Monthly budget</MeterLabel>
                  <MeterValue>
                    {() => (
                      <>
                        <span className="text-foreground">{usd.format(budget.usedUsd)}</span>
                        <span className="ms-1">of {usdWhole.format(budget.limitUsd)}</span>
                      </>
                    )}
                  </MeterValue>
                  <MeterBar />
                </Meter>
              )
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

export { UsageOverview, type UsageOverviewProps, type UsageDataset, type UsageRow, type UsageBudget, type UsageRange };
