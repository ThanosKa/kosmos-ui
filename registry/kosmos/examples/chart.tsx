'use client';

import * as Recharts from 'recharts';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  GrowthChart,
  Sparkline,
  type ChartConfig,
} from '@/registry/kosmos/ui/chart';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/registry/kosmos/ui/empty';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const revenue = [18200, 21400, 19800, 24600, 27100, 26300, 31800, 34200, 33100, 38900, 41200, 45600];
const expenses = [12100, 13900, 14200, 15800, 16400, 18900, 19200, 21800, 22600, 23100, 25400, 26900];

const growthData = months.map((month, index) => ({ month, revenue: revenue[index], expenses: expenses[index] }));

const revenueConfig = { revenue: { label: 'Revenue', color: 'var(--chart-1)' } } satisfies ChartConfig;
const twoSeriesConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  expenses: { label: 'Expenses', color: 'var(--chart-2)' },
} satisfies ChartConfig;
const paletteConfig = {
  north: { label: 'North', color: 'var(--chart-1)' },
  east: { label: 'East', color: 'var(--chart-2)' },
  south: { label: 'South', color: 'var(--chart-3)' },
  west: { label: 'West', color: 'var(--chart-4)' },
  online: { label: 'Online', color: 'var(--chart-5)' },
} satisfies ChartConfig;

const paletteData = ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => ({
  quarter,
  north: 40 + index * 6,
  east: 32 + index * 4,
  south: 28 + index * 7,
  west: 22 + index * 3,
  online: 18 + index * 9,
}));

const usd = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const trend = (values: number[]) => values.map((value) => ({ value }));

const tiles = [
  { label: 'Revenue', value: '$45.6K', change: '+10.7%', data: trend(revenue), color: 'var(--chart-1)' },
  { label: 'Signups', value: '1,284', change: '+4.2%', data: trend([30, 42, 38, 51, 47, 60, 58, 64, 70, 66, 74, 81]), color: 'var(--chart-3)' },
  { label: 'Churn', value: '2.1%', change: '−0.3 pts', data: trend([3.1, 3, 2.9, 3.2, 2.8, 2.7, 2.6, 2.6, 2.4, 2.3, 2.2, 2.1]), color: 'var(--chart-2)' },
];

export default function ChartPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Growth chart: one series, tooltip pinned">
        <div className="rounded-2xl border border-transparent bg-card p-4 shadow-card">
          <div className="mb-4 flex flex-col gap-0.5">
            <span className="text-body font-medium">Revenue</span>
            <span className="text-small text-muted-foreground">Monthly, 2026</span>
          </div>
          <GrowthChart
            title="Monthly revenue, 2026"
            data={growthData}
            config={revenueConfig}
            xKey="month"
            xLabel="Month"
            valueFormatter={usd}
            defaultIndex={8}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Growth chart: two series with a legend">
        <div className="rounded-2xl border border-transparent bg-card p-4 shadow-card">
          <GrowthChart
            title="Revenue and expenses, 2026"
            data={growthData}
            config={twoSeriesConfig}
            xKey="month"
            xLabel="Month"
            valueFormatter={usd}
            defaultIndex={4}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Sparklines in stat tiles and inline">
        <div className="grid gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="flex flex-col gap-3 rounded-2xl border border-transparent bg-card p-4 shadow-card"
            >
              <span className="text-body font-medium text-muted-foreground">{tile.label}</span>
              <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-display tabular-nums">{tile.value}</span>
                  <span className="text-small text-muted-foreground tabular-nums">{tile.change} vs last month</span>
                </div>
                <Sparkline
                  data={tile.data}
                  color={tile.color}
                  aria-label={`${tile.label}, last 12 months, ${tile.change}`}
                  className="h-10 w-24"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-body">
          Weekly active users
          <Sparkline data={trend([4, 6, 5, 8, 7, 9, 12])} fill={false} aria-label="Weekly active users, up" className="h-4 w-16" />
          <span className="tabular-nums">12,408</span>
        </div>
      </PreviewSection>

      <PreviewSection title="Palette: chart-1 to chart-5 with the parts">
        <div className="rounded-2xl border border-transparent bg-card p-4 shadow-card">
          <ChartContainer config={paletteConfig} className="aspect-auto h-64">
            <Recharts.BarChart data={paletteData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2}>
              <Recharts.CartesianGrid vertical={false} />
              <Recharts.XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
              <Recharts.YAxis tickLine={false} axisLine={false} tickMargin={8} width="auto" />
              <ChartTooltip cursor defaultIndex={2} isAnimationActive={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {Object.keys(paletteConfig).map((key) => (
                <Recharts.Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={[4, 4, 0, 0]} maxBarSize={24} />
              ))}
            </Recharts.BarChart>
          </ChartContainer>
        </div>
      </PreviewSection>

      <PreviewSection title="No data yet">
        <div className="relative rounded-2xl border border-transparent bg-card p-4 shadow-card">
          <GrowthChart title="Revenue, no data" data={[]} config={revenueConfig} xKey="month" className="opacity-40" />
          <Empty className="absolute inset-0">
            <EmptyHeader>
              <EmptyTitle render={<h3 />}>No revenue yet</EmptyTitle>
              <EmptyDescription>Your first paid invoice starts this chart.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
