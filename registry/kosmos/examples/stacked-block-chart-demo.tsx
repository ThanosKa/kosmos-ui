'use client';

import * as React from 'react';
import type { ChartConfig } from '@/registry/kosmos/ui/chart';
import {
  ChartCard,
  ChartCardAction,
  ChartCardContent,
  ChartCardDescription,
  ChartCardHeader,
  ChartCardLegend,
  ChartCardTitle,
} from '@/registry/kosmos/ui/chart-card';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { StackedBlockChart, type StackedBlockChartItem, type StackedBlockChartSeries } from '@/registry/kosmos/ui/stacked-block-chart';

const platforms: StackedBlockChartSeries[] = [
  { key: 'web', label: 'Web' },
  { key: 'ios', label: 'iOS' },
  { key: 'server', label: 'Server' },
  { key: 'android', label: 'Android' },
];

const legend: ChartConfig = Object.fromEntries(
  platforms.map((platform, index) => [platform.key, { label: platform.label, color: `var(--chart-${index + 1})` }]),
);

/** Each column is the 30 days to October 11 of its year, across every project. */
const metrics = {
  users: {
    label: 'Users',
    description: 'Monthly active users, a year apart',
    data: [
      { label: 'Oct 2024', name: 'October 2024', values: { web: 21_800, ios: 15_200, server: 5_300, android: 4_100 } },
      { label: 'Oct 2025', name: 'October 2025', values: { web: 38_900, ios: 34_100, server: 11_400, android: 8_200 } },
      { label: 'Oct 2026', name: 'October 2026', values: { web: 57_210, ios: 57_490, server: 17_720, android: 12_180 } },
    ],
  },
  events: {
    label: 'Events',
    description: 'Events in 30 days, a year apart',
    data: [
      { label: 'Oct 2024', name: 'October 2024', values: { web: 1_630_000, ios: 2_210_000, server: 4_180_000, android: 390_000 } },
      { label: 'Oct 2025', name: 'October 2025', values: { web: 2_940_000, ios: 4_520_000, server: 8_960_000, android: 760_000 } },
      { label: 'Oct 2026', name: 'October 2026', values: { web: 4_432_800, ios: 7_784_600, server: 15_073_000, android: 1_204_800 } },
    ],
  },
} satisfies Record<string, { label: string; description: string; data: StackedBlockChartItem[] }>;

type Metric = keyof typeof metrics;

export default function StackedBlockChartDemo() {
  const [metric, setMetric] = React.useState<Metric>('users');
  const { label, description, data } = metrics[metric];

  return (
    <ChartCard className="w-full max-w-4xl">
      <ChartCardHeader>
        <ChartCardTitle render={<h3 />}>{label} by platform</ChartCardTitle>
        <ChartCardDescription>{description}</ChartCardDescription>
        <ChartCardAction>
          <SegmentedControl size="sm" value={metric} onValueChange={(value) => setMetric(value as Metric)} aria-label="Metric">
            <SegmentedControlItem value="users">Users</SegmentedControlItem>
            <SegmentedControlItem value="events">Events</SegmentedControlItem>
          </SegmentedControl>
        </ChartCardAction>
        <ChartCardLegend config={legend} />
      </ChartCardHeader>
      <ChartCardContent className="min-h-0">
        <StackedBlockChart data={data} series={platforms} label={`${label} by platform, October 2024 to October 2026`} />
      </ChartCardContent>
    </ChartCard>
  );
}
