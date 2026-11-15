'use client';

import * as React from 'react';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import { Panel, PanelAction, PanelContent, PanelDescription, PanelHeader, PanelTitle } from '@/registry/kosmos/ui/panel';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

type Range = '7d' | '30d' | '90d';

const ranges: Record<Range, { label: string; days: number; step: number; end: number }> = {
  '7d': { label: 'Daily, last 7 days', days: 7, step: 1, end: 29400 },
  '30d': { label: 'Daily, last 30 days', days: 30, step: 1, end: 29400 },
  '90d': { label: 'Weekly, last 90 days', days: 13, step: 7, end: 74800 },
};

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const today = Date.UTC(2026, 9, 11);
const count = new Intl.NumberFormat('en-US');
const config = { users: { label: 'Active users', color: 'var(--chart-1)' } } satisfies ChartConfig;

/** Active users a day (a week for 90 days), rising to the end of the range, with a stable wobble. */
function points(range: Range) {
  const { days, step, end } = ranges[range];
  return Array.from({ length: days }, (_, i) => {
    const progress = i / (days - 1);
    const wobble = i === days - 1 ? 0 : 0.012 * Math.sin(i * 0.9);
    return {
      day: dayLabel.format(today - (days - 1 - i) * step * 86_400_000),
      users: Math.round(end * (0.9 + 0.1 * progress + wobble)),
    };
  });
}

export default function PanelChart() {
  const [range, setRange] = React.useState<Range>('30d');
  return (
    <Panel className="w-full max-w-2xl">
      <PanelHeader>
        <PanelTitle>Active users</PanelTitle>
        <PanelDescription>{ranges[range].label}</PanelDescription>
        <PanelAction>
          <SegmentedControl aria-label="Range" value={range} onValueChange={(value) => setRange(value as Range)}>
            <SegmentedControlItem value="7d">7d</SegmentedControlItem>
            <SegmentedControlItem value="30d">30d</SegmentedControlItem>
            <SegmentedControlItem value="90d">90d</SegmentedControlItem>
          </SegmentedControl>
        </PanelAction>
      </PanelHeader>
      <PanelContent className="flex min-h-64 flex-col p-4">
        <GrowthChart
          key={range}
          title={`Active users, ${ranges[range].label.toLowerCase()}`}
          data={points(range)}
          config={config}
          xKey="day"
          xLabel={range === '90d' ? 'Week of' : 'Day'}
          valueFormatter={(value) => count.format(value)}
        />
      </PanelContent>
    </Panel>
  );
}
