import { StatusIcon, type Status } from '@/registry/kosmos/ui/status';

const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  running: 'Running',
  waiting: 'Waiting',
  done: 'Done',
  error: 'Failed',
  skipped: 'Skipped',
};

const steps: { status: Status; label: string; detail?: string }[] = [
  { status: 'done', label: 'Fetch events from the last 7 days', detail: '6.8M events' },
  { status: 'done', label: 'Group the events by project' },
  { status: 'running', label: 'Write the weekly summary' },
  { status: 'pending', label: 'Post it to the Acme team channel' },
];

export default function StatusSteps() {
  return (
    <ol className="flex w-full max-w-sm flex-col">
      {steps.map((step) => (
        <li key={step.label} className="flex min-h-7.5 items-start gap-2 px-2 py-1">
          <StatusIcon status={step.status} label={statusLabels[step.status]} className="mt-0.5" />
          <span
            className={
              step.status === 'running'
                ? 'min-w-0 flex-1 text-body font-medium text-pretty text-foreground'
                : 'min-w-0 flex-1 text-body text-pretty text-muted-foreground'
            }
          >
            {step.label}
          </span>
          {step.detail ? <span className="shrink-0 pt-0.5 text-caption text-muted-foreground tabular-nums">{step.detail}</span> : null}
        </li>
      ))}
    </ol>
  );
}
