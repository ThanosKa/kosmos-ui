'use client';

import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { CompareAreaChart } from '@/registry/kosmos/ui/compare-area-chart';

const week = [
  { label: 'Oct 5', name: 'Mon, Oct 5', current: 962400, previous: 941200 },
  { label: 'Oct 6', name: 'Tue, Oct 6', current: 978100, previous: 950300 },
  { label: 'Oct 7', name: 'Wed, Oct 7', current: 991500, previous: 968900 },
  { label: 'Oct 8', name: 'Thu, Oct 8', current: 953800, previous: 944700 },
  { label: 'Oct 9', name: 'Fri, Oct 9', current: 969700, previous: 952100 },
  { label: 'Oct 10', name: 'Sat, Oct 10', current: 971300, previous: 948600 },
  { label: 'Oct 11', name: 'Sun, Oct 11', current: 1012000, previous: 972600 },
];

export default function CompareAreaChartEntrance() {
  const [run, setRun] = React.useState(0);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <CompareAreaChart
        key={run}
        data={week}
        label="Events per day, last 7 days against the 7 days before"
        currentLabel="Last 7 days"
        previousLabel="7 days before"
        entrance="always"
      />
      <Button variant="secondary" size="sm" onClick={() => setRun(run + 1)}>
        Replay
      </Button>
    </div>
  );
}
