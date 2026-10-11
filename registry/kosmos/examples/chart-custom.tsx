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
  { quarter: 'Q1', direct: 40, partners: 24, online: 18 },
  { quarter: 'Q2', direct: 46, partners: 28, online: 27 },
  { quarter: 'Q3', direct: 52, partners: 31, online: 36 },
  { quarter: 'Q4', direct: 58, partners: 33, online: 45 },
];

const config = {
  direct: { label: 'Direct', color: 'var(--chart-1)' },
  partners: { label: 'Partners', color: 'var(--chart-2)' },
  online: { label: 'Online', color: 'var(--chart-3)' },
} satisfies ChartConfig;

export default function ChartCustom() {
  return (
    <ChartContainer config={config} className="aspect-auto h-64 max-w-2xl">
      <BarChart data={data} title="Deals closed per quarter, by channel" barGap={2}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width="auto" />
        <ChartTooltip cursor content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="direct" fill="var(--color-direct)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="partners" fill="var(--color-partners)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="online" fill="var(--color-online)" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  );
}
