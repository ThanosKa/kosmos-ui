import { StatusIcon, type Status } from '@/registry/kosmos/ui/status';

const statuses: { status: Status; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'running', label: 'Running' },
  { status: 'waiting', label: 'Waiting' },
  { status: 'done', label: 'Done' },
  { status: 'error', label: 'Error' },
  { status: 'skipped', label: 'Skipped' },
];

export default function StatusIcons() {
  return (
    <ul className="grid w-full max-w-sm grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
      {statuses.map(({ status, label }) => (
        <li key={status} className="flex items-center gap-2 text-body text-foreground">
          <StatusIcon status={status} />
          {label}
        </li>
      ))}
    </ul>
  );
}
