'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/registry/kosmos/ui/chart';
import {
  ChartCard,
  ChartCardContent,
  ChartCardDescription,
  ChartCardHeader,
  ChartCardLegend,
  ChartCardTitle,
} from '@/registry/kosmos/ui/chart-card';

const data = [
  { week: 'Sep 14', web: 2.1, ios: 1.6, android: 0.4, server: 2.3 },
  { week: 'Sep 21', web: 2.2, ios: 1.7, android: 0.4, server: 2.4 },
  { week: 'Sep 28', web: 2.2, ios: 2.4, android: 0.5, server: 2.4 },
  { week: 'Oct 5', web: 2.3, ios: 1.8, android: 0.5, server: 2.5 },
];

const config = {
  web: { label: 'Web', color: 'var(--chart-1)' },
  ios: { label: 'iOS', color: 'var(--chart-2)' },
  android: { label: 'Android', color: 'var(--chart-3)' },
  server: { label: 'Server', color: 'var(--chart-4)' },
} satisfies ChartConfig;

const millions = (value: number) => `${value}M`;

export default function ChartCardLegendExample() {
  return (
    <ChartCard className="w-full max-w-2xl">
      <ChartCardHeader>
        <ChartCardTitle render={<h2 />}>Events by platform</ChartCardTitle>
        <ChartCardDescription>Each week, in millions</ChartCardDescription>
        <ChartCardLegend config={config} />
      </ChartCardHeader>
      <ChartCardContent>
        <ChartContainer config={config} className="aspect-auto h-60">
          <BarChart data={data} title="Events by platform, each week from September 14, in millions">
            <CartesianGrid vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width="auto" tickFormatter={millions} />
            <ChartTooltip cursor content={<ChartTooltipContent valueFormatter={(value) => millions(Number(value))} />} />
            {Object.keys(config).map((key) => (
              <Bar key={key} dataKey={key} stackId="events" fill={`var(--color-${key})`} stroke="var(--card)" maxBarSize={40} />
            ))}
          </BarChart>
        </ChartContainer>
      </ChartCardContent>
    </ChartCard>
  );
}
