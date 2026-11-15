'use client';

import { UsageMeter, type UsageBreakdownRow } from '@/registry/kosmos/ui/usage-meter';

function rows(conversation: number): UsageBreakdownRow[] {
  return [
    { label: 'System prompt', value: 2400 },
    { label: 'Tool definitions', value: 6100 },
    { label: 'Conversation', value: conversation },
  ];
}

export default function UsageMeterThresholds() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      <div className="flex items-center gap-2 text-small whitespace-nowrap text-muted-foreground">
        <UsageMeter breakdown={rows(41_500)} limit={200_000} />
        Under the limit
      </div>
      <div className="flex items-center gap-2 text-small whitespace-nowrap text-muted-foreground">
        <UsageMeter breakdown={rows(131_500)} limit={200_000} warnAt={0.6} />
        Near limit
      </div>
      <div className="flex items-center gap-2 text-small whitespace-nowrap text-muted-foreground">
        <UsageMeter breakdown={rows(183_500)} limit={200_000} warnAt={0.6} criticalAt={0.9} />
        Almost full
      </div>
    </div>
  );
}
