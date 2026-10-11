'use client';

import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';

const data = [
  { month: 'Jan', revenue: 18200, expenses: 12100 },
  { month: 'Feb', revenue: 21400, expenses: 13900 },
  { month: 'Mar', revenue: 19800, expenses: 14200 },
  { month: 'Apr', revenue: 24600, expenses: 15800 },
  { month: 'May', revenue: 27100, expenses: 16400 },
  { month: 'Jun', revenue: 26300, expenses: 18900 },
];

const config = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  expenses: { label: 'Expenses', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function ChartMultiple() {
  return (
    <GrowthChart
      title="Revenue and expenses, January to June 2026"
      data={data}
      config={config}
      xKey="month"
      xLabel="Month"
      valueFormatter={(value) => usd.format(value)}
      className="max-w-2xl"
    />
  );
}
