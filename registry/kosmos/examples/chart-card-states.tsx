'use client';

import * as React from 'react';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import {
  ChartCard,
  ChartCardContent,
  ChartCardDescription,
  ChartCardHeader,
  ChartCardTitle,
  type ChartCardState,
} from '@/registry/kosmos/ui/chart-card';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

const states: ChartCardState[] = ['ready', 'loading', 'empty', 'error'];

const events = [73100, 73400, 65400, 65700, 66100, 66400, 66700, 75300, 75700, 67700, 68000, 68300, 68600, 69000].map(
  (count, i) => ({ day: `Sep ${12 + i}`, count }),
);

const config = { count: { label: 'Events', color: 'var(--chart-1)' } } satisfies ChartConfig;

export default function ChartCardStates() {
  const [state, setState] = React.useState<ChartCardState>('error');

  return (
    <div className="flex w-full max-w-2xl flex-col items-start gap-4">
      <SegmentedControl size="sm" aria-label="State" value={state} onValueChange={(value) => setState(value as ChartCardState)}>
        {states.map((item) => (
          <SegmentedControlItem key={item} value={item} className="capitalize">
            {item}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <ChartCard state={state} className="w-full">
        <ChartCardHeader>
          <ChartCardTitle render={<h2 />}>Cirrus Weather</ChartCardTitle>
          <ChartCardDescription>Events a day, from September 12</ChartCardDescription>
        </ChartCardHeader>
        <ChartCardContent
          emptyTitle="No events yet"
          emptyDescription="Events show up here as soon as the app sends its first one."
          onRetry={() => setState('ready')}
        >
          <GrowthChart title="Cirrus Weather, events a day from September 12" data={events} config={config} xKey="day" />
        </ChartCardContent>
      </ChartCard>
    </div>
  );
}
