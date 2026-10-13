import { StatusBadge } from '@/registry/kosmos/ui/status';

export default function StatusBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <StatusBadge status="pending">Queued</StatusBadge>
      <StatusBadge status="running">Running</StatusBadge>
      <StatusBadge status="waiting">Needs approval</StatusBadge>
      <StatusBadge status="done">Done</StatusBadge>
      <StatusBadge status="error">Failed</StatusBadge>
      <StatusBadge status="skipped">Skipped</StatusBadge>
    </div>
  );
}
