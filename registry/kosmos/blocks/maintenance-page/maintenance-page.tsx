'use client';

import { CircleCheck } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { FlickeringGrid } from '@/registry/kosmos/ui/flickering-grid';
import { Input } from '@/registry/kosmos/ui/input';
import { StatusDot, type Status } from '@/registry/kosmos/ui/status';

type MaintenanceStep = { id: string; label: string; status: Status };

// Sample data: replace it with your own upgrade, its steps and links.
const sampleSteps: MaintenanceStep[] = [
  { id: 'pipeline', label: 'Moving the event pipeline', status: 'done' },
  { id: 'queries', label: 'Moving the query engine', status: 'running' },
  { id: 'dashboards', label: 'Bringing dashboards back', status: 'pending' },
  { id: 'api', label: 'Bringing the API and webhooks back', status: 'pending' },
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
  /** What the upgrade does, each with its state. The page shows the first step not yet done. An empty list leaves it out. */
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
            <span aria-hidden className="text-display font-semibold text-muted-foreground @2xl:text-hero">
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

function CurrentStep({ steps }: { steps: MaintenanceStep[] }) {
  const index = steps.findIndex((step) => step.status !== 'done');
  const step = steps[index];
  return (
    <p className="mt-6 flex max-w-full justify-center text-body text-muted-foreground">
      {step ? (
        <StatusDot status={step.status} title={step.label}>
          Step {index + 1} of {steps.length} · {step.label}
        </StatusDot>
      ) : (
        <StatusDot status="done">All {steps.length} steps done</StatusDot>
      )}
    </p>
  );
}

function NotifyForm({ onNotify }: { onNotify: NonNullable<MaintenancePageProps['onNotify']> }) {
  const [email, setEmail] = React.useState('');
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

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
        setFailed(false);
        try {
          await onNotify(email);
          setSentTo(email);
        } catch {
          setFailed(true);
        } finally {
          setPending(false);
        }
      }}
      className="w-full text-start"
    >
      <Field invalid={failed}>
        <FieldLabel>Email me when it’s back</FieldLabel>
        <div className="flex flex-col gap-2 @md:flex-row">
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="you@acme.example"
            value={email}
            onValueChange={(value) => {
              setEmail(value);
              setFailed(false);
            }}
            className="h-7.5 min-w-0 flex-1"
          />
          <Button type="submit" variant="primary" disabled={pending}>
            Notify me
          </Button>
        </div>
        <FieldError>We couldn’t save your email. Try again in a moment.</FieldError>
      </Field>
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
        <h1 className="max-w-[20em] text-heading font-semibold text-balance wrap-break-word @2xl:text-display">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[32em] text-body text-pretty wrap-break-word text-muted-foreground @2xl:text-lead">{description}</p>
        ) : null}
        {backAt === null ? null : (
          <div className="mt-8">
            <Countdown secondsLeft={secondsLeft} />
          </div>
        )}
        {steps.length ? <CurrentStep steps={steps} /> : null}
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
