import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { StatusBadge, StatusIcon, type Status } from '@/registry/kosmos/ui/status';

const statuses = ['pending', 'running', 'waiting', 'done', 'error', 'skipped'] as const satisfies readonly Status[];
const looks = ['icon', 'icon 14px', 'badge', 'row'] as const;

const labels: Record<Status, string> = {
  pending: 'Queued',
  running: 'Running',
  waiting: 'Needs approval',
  done: 'Done',
  error: 'Failed',
  skipped: 'Skipped',
};

const steps: { status: Status; label: string; detail?: string }[] = [
  { status: 'done', label: 'Fetch accounts from the CRM', detail: '1,204 rows' },
  { status: 'done', label: 'Match accounts to invoices', detail: '1.4s' },
  { status: 'error', label: 'Send the overdue reminder to billing@acme.example', detail: 'Mailbox full' },
  { status: 'running', label: 'Write the weekly summary' },
  { status: 'waiting', label: 'Post the summary to the Growth team channel' },
  { status: 'skipped', label: 'Archive last week’s drafts' },
  { status: 'pending', label: 'Close the run' },
];

export default function StatusPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Statuses × looks">
        <StateMatrix
          rows={statuses}
          states={looks}
          render={(status, look) => {
            if (look === 'icon') return <StatusIcon status={status} label={labels[status]} />;
            if (look === 'icon 14px') return <StatusIcon status={status} label={labels[status]} className="size-3.5" />;
            if (look === 'badge') return <StatusBadge status={status}>{labels[status]}</StatusBadge>;
            return (
              <span className="flex items-center gap-2 text-body">
                <StatusIcon status={status} />
                {labels[status]}
              </span>
            );
          }}
        />
      </PreviewSection>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Steps of a run">
          <ol className="flex flex-col rounded-2xl border border-transparent bg-card p-1 shadow-card">
            {steps.map((step) => (
              <li key={step.label} className="flex min-h-7.5 items-start gap-2 px-2 py-1">
                <StatusIcon status={step.status} label={labels[step.status]} className="mt-0.5" />
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
        </PreviewSection>

        <PreviewSection title="Badges in a narrow slot">
          <div className="flex w-full max-w-40 flex-col items-start gap-2">
            <StatusBadge status="waiting" title="Waiting on an admin to approve">
              Waiting on an admin to approve
            </StatusBadge>
            <StatusBadge status="running">Running for 2m 05s</StatusBadge>
            <StatusBadge status="error">Failed</StatusBadge>
          </div>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
