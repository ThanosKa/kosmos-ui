import { formatDuration } from '@/registry/kosmos/lib/format';
import { StatusDot, type Status } from '@/registry/kosmos/ui/status';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const runs: { id: number; task: string; status: Status; label: string; durationMs?: number }[] = [
  { id: 482, task: 'Weekly summary', status: 'running', label: 'Running' },
  { id: 481, task: 'Plan change review', status: 'waiting', label: 'Needs approval' },
  { id: 480, task: 'Quota warnings', status: 'error', label: 'Failed', durationMs: 8_400 },
  { id: 479, task: 'Nightly event rollup', status: 'done', label: 'Done', durationMs: 125_000 },
  { id: 478, task: 'Archive drafts', status: 'skipped', label: 'Skipped' },
  { id: 477, task: 'Trial report', status: 'pending', label: 'Queued' },
];

export default function StatusDots() {
  return (
    <Table containerClassName="w-full max-w-xl">
      <TableHeader>
        <TableRow>
          <TableHead>Run</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-end">Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="tabular-nums">#{run.id}</TableCell>
            <TableCell>{run.task}</TableCell>
            <TableCell>
              <StatusDot status={run.status}>{run.label}</StatusDot>
            </TableCell>
            <TableCell className="text-end text-muted-foreground tabular-nums">
              {run.durationMs === undefined ? '' : formatDuration(run.durationMs)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
