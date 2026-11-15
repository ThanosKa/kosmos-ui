'use client';

import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { FlowChart } from '@/registry/kosmos/ui/flow-chart';

const sources = [
  { id: 'search', label: 'Search' },
  { id: 'direct', label: 'Direct' },
  { id: 'referral', label: 'Referral' },
];

const plans = [
  { id: 'free', label: 'Free' },
  { id: 'pro', label: 'Pro' },
];

const flows = [
  { source: 'search', target: 'free', value: 392 },
  { source: 'search', target: 'pro', value: 84 },
  { source: 'direct', target: 'free', value: 284 },
  { source: 'direct', target: 'pro', value: 80 },
  { source: 'referral', target: 'free', value: 176 },
  { source: 'referral', target: 'pro', value: 69 },
];

export default function FlowChartEntrance() {
  const [run, setRun] = React.useState(0);
  return (
    <div className="flex w-full max-w-4xl flex-col items-start gap-4">
      <FlowChart
        key={run}
        sources={sources}
        targets={plans}
        flows={flows}
        label="New signups from search, direct and referral, last 30 days"
        unit="signups"
        sourceLabel="Source"
        targetLabel="Plan"
        entrance="always"
        className="w-full"
      />
      <Button variant="secondary" size="sm" onClick={() => setRun(run + 1)}>
        Replay
      </Button>
    </div>
  );
}
