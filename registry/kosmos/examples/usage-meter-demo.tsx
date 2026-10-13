'use client';

import { UsageMeter, type UsageBreakdownRow } from '@/registry/kosmos/ui/usage-meter';

const breakdown: UsageBreakdownRow[] = [
  { label: 'System prompt', value: 2400 },
  { label: 'Tool definitions', value: 6100 },
  { label: 'Rules', value: 1800 },
  { label: 'Skills', value: 3200 },
  { label: 'Connected data sources', value: 24_000 },
  { label: 'Subagent definitions', value: 900 },
  { label: 'Conversation', value: 61_600 },
];

export default function UsageMeterDemo() {
  return <UsageMeter breakdown={breakdown} limit={200_000} />;
}
