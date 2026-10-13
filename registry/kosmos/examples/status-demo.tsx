import { formatDuration } from '@/registry/kosmos/lib/format';
import { StatusBadge, type Status } from '@/registry/kosmos/ui/status';

const runs: { name: string; status: Status; label: string; durationMs?: number }[] = [
  { name: 'Nightly event rollup', status: 'done', label: 'Done', durationMs: 125_000 },
  { name: 'Quota warnings', status: 'error', label: 'Failed', durationMs: 8_400 },
  { name: 'Weekly summary', status: 'running', label: 'Running' },
  { name: 'Plan change review', status: 'waiting', label: 'Needs approval' },
  { name: 'Trial report', status: 'pending', label: 'Queued' },
];

export default function StatusDemo() {
  return (
    <ul className="flex w-full max-w-md flex-col divide-y divide-border rounded-2xl border border-transparent bg-card px-3 shadow-card">
      {runs.map((run) => (
        <li key={run.name} className="flex min-h-11 items-center gap-3 py-2">
          <span className="min-w-0 flex-1 truncate text-body font-medium text-foreground">{run.name}</span>
          {run.durationMs !== undefined ? (
            <span className="text-caption text-muted-foreground tabular-nums">{formatDuration(run.durationMs)}</span>
          ) : null}
          <StatusBadge status={run.status}>{run.label}</StatusBadge>
        </li>
      ))}
    </ul>
  );
}
