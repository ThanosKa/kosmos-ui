'use client';

import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { MultiLineChart } from '@/registry/kosmos/ui/multi-line-chart';

const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const first = Date.UTC(2026, 8, 12);

const points = Array.from({ length: 30 }, (_, i) => ({
  label: day.format(first + i * 86_400_000),
  tick: i === 0 ? 'Sep 12' : i === 29 ? 'Oct 11' : undefined,
}));

const series = [
  {
    id: 'fernhill',
    name: 'Fernhill Books',
    short: 'Fernhill',
    values: [
      132400, 137900, 117800, 122000, 117700, 123100, 126100, 135200, 140800, 120300, 124500, 120300, 125600, 128700, 138100, 143800, 122900,
      127100, 122800, 128200, 131300, 141000, 146500, 125400, 129700, 125400, 130800, 133800, 143800, 149400,
    ],
  },
  {
    id: 'cirrus',
    name: 'Cirrus Weather',
    short: 'Cirrus',
    values: [
      73100, 73400, 65400, 65700, 66100, 66400, 66700, 75300, 75700, 67700, 68000, 68300, 68600, 69000, 77600, 77900, 69900, 70300, 70600,
      113500, 149600, 151800, 112300, 72200, 72500, 72900, 73200, 73500, 82100, 82400,
    ],
  },
];

export default function MultiLineChartEntrance() {
  const [run, setRun] = React.useState(0);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <MultiLineChart
        key={run}
        series={series}
        points={points}
        label="Events per day for two projects, last 30 days"
        entrance="always"
        className="w-full"
      />
      <Button variant="secondary" size="sm" onClick={() => setRun(run + 1)}>
        Replay
      </Button>
    </div>
  );
}
