import { UsageMeter, type UsageBreakdownRow } from '@/registry/kosmos/ui/usage-meter';

const breakdown: UsageBreakdownRow[] = [
  { label: 'System prompt', value: 2400 },
  { label: 'Tool definitions', value: 6100 },
  { label: 'Skills', value: 3200 },
  { label: 'Conversation', value: 41_800 },
];

export default function UsageMeterInline() {
  return (
    <div className="w-full max-w-xs">
      <UsageMeter variant="inline" label="Context usage, Claude Sonnet 5.5" breakdown={breakdown} limit={200_000} />
    </div>
  );
}
