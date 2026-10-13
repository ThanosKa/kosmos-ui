'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/registry/kosmos/ui/chart';

const data = [
  { quarter: 'Q1', web: 40, ios: 24, android: 18 },
  { quarter: 'Q2', web: 46, ios: 28, android: 27 },
  { quarter: 'Q3', web: 52, ios: 31, android: 36 },
  { quarter: 'Q4', web: 58, ios: 33, android: 45 },
];

const config = {
  web: { label: 'Web', color: 'var(--chart-1)' },
  ios: { label: 'iOS', color: 'var(--chart-2)' },
  android: { label: 'Android', color: 'var(--chart-3)' },
} satisfies ChartConfig;

export default function ChartCustom() {
  return (
    <ChartContainer config={config} className="aspect-auto h-64 max-w-2xl">
      <BarChart data={data} title="Signups per quarter, by platform" barGap={2}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width="auto" />
        <ChartTooltip cursor content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="web" fill="var(--color-web)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="ios" fill="var(--color-ios)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="android" fill="var(--color-android)" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  );
}
