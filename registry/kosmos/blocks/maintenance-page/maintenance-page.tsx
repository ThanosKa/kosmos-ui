'use client';

import { CircleCheck } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { Field, FieldLabel } from '@/registry/kosmos/ui/field';
import { FlickeringGrid } from '@/registry/kosmos/ui/flickering-grid';
import { Input } from '@/registry/kosmos/ui/input';
import { StatusDot, type Status } from '@/registry/kosmos/ui/status';

type MaintenanceStep = { id: string; label: string; status: Status; note?: string };

// Sample data: replace it with your own upgrade, its steps and links.
const sampleSteps: MaintenanceStep[] = [
  { id: 'pipeline', label: 'Event pipeline', status: 'done', note: 'Moved' },
  { id: 'queries', label: 'Query engine', status: 'running', note: 'In progress' },
  { id: 'dashboards', label: 'Dashboards', status: 'waiting', note: 'Up next' },
  { id: 'api', label: 'API and webhooks', status: 'pending', note: 'Queued' },
];
const sampleSecondsLeft = 1 * 3600 + 42 * 60 + 18;
const sampleActions = (
  <Button variant="ghost" href="https://status.acme.example">
    Check the status page
  </Button>
);

type MaintenancePageProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** A logo or icon above the title. Left out by default. */
  media?: React.ReactNode;
  /** The page's `<h1>`. */
  title?: React.ReactNode;
  /** One or two lines under the title: what is happening and that data is safe. */
  description?: React.ReactNode;
  /** When the app is back, for the countdown. Left out, the sample counts down from 1:42:18. `null` hides it. */
  backAt?: Date | string | number | null;
  /** What the upgrade does, each with its state. An empty list leaves it out. */
  steps?: MaintenanceStep[];
  /** Shows a field for an email to tell when the app is back, and gets the address. Left out, there is no field. */
  onNotify?: (email: string) => void | Promise<void>;
  /** Links under the form, such as the status page. `null` leaves them out. */
  actions?: React.ReactNode;
  /** The flickering grid behind the content. */
  grid?: boolean;
};

const pad = (value: number) => String(value).padStart(2, '0');

function useSecondsLeft(backAt: MaintenancePageProps['backAt']) {
  const [secondsLeft, setSecondsLeft] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (backAt === null) return;
    const end = backAt === undefined ? Date.now() + sampleSecondsLeft * 1000 : new Date(backAt).getTime();
    const tick = () => setSecondsLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [backAt]);
  return secondsLeft;
}

function Countdown({ secondsLeft }: { secondsLeft: number | null }) {
  const parts =
    secondsLeft === null
      ? null
      : [
          { label: 'Hours', value: Math.floor(secondsLeft / 3600) },
          { label: 'Minutes', value: Math.floor((secondsLeft % 3600) / 60) },
          { label: 'Seconds', value: secondsLeft % 60 },
        ];
  const spoken = parts
    ? parts.map((part) => `${part.value} ${part.label.toLowerCase().slice(0, part.value === 1 ? -1 : undefined)}`).join(', ')
    : undefined;
  return (
    <div role="timer" aria-label={spoken ? `Back in ${spoken}` : 'Back soon'} className="flex items-start justify-center gap-3">
      {['Hours', 'Minutes', 'Seconds'].map((label, index) => (
        <React.Fragment key={label}>
          {index > 0 ? (
            <span aria-hidden className="text-display font-semibold text-muted-foreground">
              :
            </span>
          ) : null}
          <div aria-hidden className="flex flex-col items-center">
            <span className="text-display font-semibold tabular-nums @2xl:text-hero">
              {parts ? pad(parts[index].value) : '--'}
            </span>
            <span className="text-caption text-muted-foreground">{label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function NotifyForm({ onNotify }: { onNotify: NonNullable<MaintenancePageProps['onNotify']> }) {
  const [email, setEmail] = React.useState('');
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  if (sentTo) {
    return (
      <p role="status" className="flex max-w-full items-start justify-center gap-2 text-body text-pretty">
        <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
        <span className="min-w-0 wrap-anywhere">
          We’ll email <span className="font-medium">{sentTo}</span> when it’s back.
        </span>
      </p>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        try {
          await onNotify(email);
          setSentTo(email);
        } finally {
          setPending(false);
        }
      }}
      className="flex w-full flex-col gap-2 text-start @md:flex-row @md:items-end"
    >
      <Field className="min-w-0 flex-1">
        <FieldLabel>Email me when it’s back</FieldLabel>
        <Input type="email" required autoComplete="email" placeholder="you@acme.example" value={email} onValueChange={setEmail} className="h-7.5" />
      </Field>
      <Button type="submit" variant="primary" disabled={pending}>
        Notify me
      </Button>
    </form>
  );
}

/**
 * The page an app shows while it is down for maintenance: a title, a countdown to when it is back, what the upgrade
 * does, and an optional field to be told when it ends, centered over a flickering grid. It fills its parent and lays
 * itself out by its own width.
 */
function MaintenancePage({
  media,
  title = 'Down for maintenance',
  description = 'We’re upgrading Acme to make it faster. Your data is safe, and events sent now are kept and processed after.',
  backAt,
  steps = sampleSteps,
  onNotify,
  actions = sampleActions,
  grid = true,
  className,
  ...props
}: MaintenancePageProps) {
  const secondsLeft = useSecondsLeft(backAt);
  return (
    <section data-slot="maintenance-page" className={cn('relative isolate flex flex-1 flex-col overflow-hidden', className)} {...props}>
      {grid ? <FlickeringGrid spotlight className="mask-[radial-gradient(ellipse_50%_60%_at_50%_50%,black,transparent)]" /> : null}
      <div className="@container flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        {media ? <div className="mb-6 flex shrink-0 [&_svg:not([class*='size-'])]:size-10">{media}</div> : null}
        <h1 className="max-w-[24em] text-title text-balance wrap-break-word">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[32em] text-body text-pretty wrap-break-word text-muted-foreground @2xl:text-lead">{description}</p>
        ) : null}
        {backAt === null ? null : (
          <div className="mt-8">
            <Countdown secondsLeft={secondsLeft} />
          </div>
        )}
        {steps.length ? (
          <ul className="mt-8 w-full max-w-md divide-y divide-border overflow-hidden rounded-2xl border border-transparent bg-card text-start shadow-card">
            {steps.map((step) => (
              <li key={step.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-body">
                <StatusDot status={step.status} title={step.label}>
                  {step.label}
                </StatusDot>
                {step.note ? <span className="shrink-0 text-caption text-muted-foreground">{step.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {onNotify || actions ? (
          <div className="mt-8 flex w-full max-w-md flex-col items-center gap-4">
            {onNotify ? <NotifyForm onNotify={onNotify} /> : null}
            {actions ? <div className="flex flex-wrap justify-center gap-2">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { MaintenancePage, type MaintenancePageProps, type MaintenanceStep };
