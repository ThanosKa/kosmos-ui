'use client';

import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { HighlightBarChart } from '@/registry/kosmos/ui/highlight-bar-chart';

const week = [
  { label: 'Mon', name: 'Mon, Oct 5', value: 962400 },
  { label: 'Tue', name: 'Tue, Oct 6', value: 978100 },
  { label: 'Wed', name: 'Wed, Oct 7', value: 991500 },
  { label: 'Thu', name: 'Thu, Oct 8', value: 953800 },
  { label: 'Fri', name: 'Fri, Oct 9', value: 969700 },
  { label: 'Sat', name: 'Sat, Oct 10', value: 971300 },
  { label: 'Sun', name: 'Sun, Oct 11', value: 1012000 },
];

export default function HighlightBarChartEntrance() {
  const [run, setRun] = React.useState(0);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <HighlightBarChart key={run} data={week} label="Events, last 7 days" entrance="always" className="w-full" />
      <Button variant="secondary" size="sm" onClick={() => setRun(run + 1)}>
        Replay
      </Button>
    </div>
  );
}
