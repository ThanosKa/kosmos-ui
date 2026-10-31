'use client';

import * as React from 'react';
import { ChartCard, ChartCardAction, ChartCardContent, ChartCardDescription, ChartCardHeader, ChartCardTitle } from '@/registry/kosmos/ui/chart-card';
import { FlowChart, type FlowChartFlow } from '@/registry/kosmos/ui/flow-chart';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

const sources = [
  { id: 'search', label: 'Search' },
  { id: 'direct', label: 'Direct' },
  { id: 'referral', label: 'Referral' },
  { id: 'social', label: 'Social' },
  { id: 'email', label: 'Email' },
];

const plans = [
  { id: 'free', label: 'Free' },
  { id: 'pro', label: 'Pro' },
  { id: 'scale', label: 'Scale' },
];

/** Signups from each source to the plan picked, as [free, pro, scale] in source order. */
function flowsOf(rows: [number, number, number][]): FlowChartFlow[] {
  return rows.flatMap((row, s) => row.map((value, p) => ({ source: sources[s].id, target: plans[p].id, value })));
}

const ranges = {
  '7d': {
    label: 'last 7 days',
    flows: flowsOf([
      [34, 7, 1],
      [25, 8, 0],
      [15, 6, 0],
      [8, 1, 0],
      [5, 2, 0],
    ]),
  },
  '30d': {
    label: 'last 30 days',
    flows: flowsOf([
      [392, 84, 6],
      [284, 80, 7],
      [176, 69, 3],
      [86, 11, 0],
      [64, 20, 2],
    ]),
  },
};

type Range = keyof typeof ranges;

export default function FlowChartDemo() {
  const [range, setRange] = React.useState<Range>('30d');
  const { label, flows } = ranges[range];

  return (
    <ChartCard className="w-full max-w-4xl">
      <ChartCardHeader>
        <ChartCardTitle render={<h3 />}>Where signups come from</ChartCardTitle>
        <ChartCardAction>
          <SegmentedControl size="sm" value={range} onValueChange={(value) => setRange(value as Range)} aria-label="Range">
            <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
            <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
          </SegmentedControl>
        </ChartCardAction>
        <ChartCardDescription>New signups in the {label} by source, and the plan each picked</ChartCardDescription>
      </ChartCardHeader>
      <ChartCardContent className="min-h-0">
        <FlowChart
          sources={sources}
          targets={plans}
          flows={flows}
          label={`New signups in the ${label}, from each source to the plan picked`}
          unit="signups"
          sourceLabel="Source"
          targetLabel="Plan"
          targetTotal={{ target: 'pro', label: 'Chose Pro' }}
          defaultSelected={{ source: 'search', target: 'pro' }}
        />
      </ChartCardContent>
    </ChartCard>
  );
}
