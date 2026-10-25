'use client';

import * as React from 'react';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import {
  ChartCard,
  ChartCardAction,
  ChartCardContent,
  ChartCardDescription,
  ChartCardHeader,
  ChartCardTitle,
} from '@/registry/kosmos/ui/chart-card';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

type Range = '7d' | '30d' | '90d';

const ranges: Record<Range, { label: string; days: number; step: number }> = {
  '7d': { label: '7 days', days: 7, step: 1 },
  '30d': { label: '30 days', days: 30, step: 1 },
  '90d': { label: '90 days', days: 13, step: 7 },
};

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const today = Date.UTC(2026, 9, 11);

/** Active users a day (a week for 90 days), rising to the end of the range, with a stable wobble. */
function points(range: Range) {
  const { days, step } = ranges[range];
  const end = step === 7 ? 74800 : 29400;
  return Array.from({ length: days }, (_, i) => {
    const progress = i / (days - 1);
    const wobble = i === days - 1 ? 0 : 0.03 * Math.sin(i * 1.7);
    return {
      day: dayLabel.format(today - (days - 1 - i) * step * 86_400_000),
      current: Math.round(end * (0.9 + 0.1 * progress + wobble)),
      previous: Math.round(end * (0.84 + 0.08 * progress + 0.03 * Math.cos(i * 0.9))),
    };
  });
}

const count = new Intl.NumberFormat('en-US');

export default function ChartCardDemo() {
  const [range, setRange] = React.useState<Range>('30d');
  const { label } = ranges[range];
  const config = {
    current: { label: `Last ${label}`, color: 'var(--chart-1)' },
    previous: { label: `Previous ${label}`, color: 'var(--chart-2)' },
  } satisfies ChartConfig;

  return (
    <ChartCard className="w-full max-w-2xl">
      <ChartCardHeader>
        <ChartCardTitle render={<h2 />}>Active users</ChartCardTitle>
        <ChartCardDescription>Against the {label} before</ChartCardDescription>
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
      <ChartCardContent>
        <GrowthChart
          key={range}
          title={`Active users, last ${label} against the ${label} before`}
          data={points(range)}
          config={config}
          xKey="day"
          xLabel={range === '90d' ? 'Week of' : 'Day'}
          valueFormatter={(value) => count.format(value)}
        />
      </ChartCardContent>
    </ChartCard>
  );
}
