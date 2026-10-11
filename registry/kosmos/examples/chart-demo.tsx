'use client';

import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';

const data = [
  { month: 'Jan', revenue: 18200 },
  { month: 'Feb', revenue: 21400 },
  { month: 'Mar', revenue: 19800 },
  { month: 'Apr', revenue: 24600 },
  { month: 'May', revenue: 27100 },
  { month: 'Jun', revenue: 26300 },
  { month: 'Jul', revenue: 31800 },
  { month: 'Aug', revenue: 34200 },
];

const config = { revenue: { label: 'Revenue', color: 'var(--chart-1)' } } satisfies ChartConfig;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function ChartDemo() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-transparent bg-card p-4 shadow-card">
      <div className="mb-4 flex flex-col gap-0.5">
        <h2 className="text-body font-medium">Revenue</h2>
        <p className="text-small text-muted-foreground">January to August 2026</p>
      </div>
      <GrowthChart
        title="Monthly revenue, January to August 2026"
        data={data}
        config={config}
        xKey="month"
        xLabel="Month"
        valueFormatter={(value) => usd.format(value)}
      />
    </div>
  );
}
