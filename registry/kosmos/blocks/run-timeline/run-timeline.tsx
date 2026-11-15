'use client';

import { ChartColumn, Check, CircleAlert, Database, Hourglass, Link2, RotateCcw, Square } from 'lucide-react';
import * as React from 'react';
import { formatDuration } from '@/registry/kosmos/lib/format';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/registry/kosmos/ui/collapsible';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';
import { Reasoning, type ReasoningStep } from '@/registry/kosmos/ui/reasoning';
import { StatusBadge, StatusIcon, type Status } from '@/registry/kosmos/ui/status';
import { ToolApproval, type ApprovalDecision, type ToolApprovalProps } from '@/registry/kosmos/ui/tool-approval';
import { ToolCall, type ToolCallProps } from '@/registry/kosmos/ui/tool-call';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';
import { cn } from '@/registry/kosmos/lib/cn';

type RunStatus = 'queued' | 'running' | 'waiting' | 'done' | 'failed' | 'cancelled';

type RunStep = { id: string; offsetMs: number } & (
  | { kind: 'plan'; title?: string; steps: PlanStep[] }
  | { kind: 'reasoning'; status: 'thinking' | 'done'; durationMs?: number; text?: string; steps?: ReasoningStep[] }
  | { kind: 'tool'; call: Omit<ToolCallProps, 'className'> }
  | { kind: 'approval'; approval: Omit<ToolApprovalProps, 'className' | 'onDecide' | 'surface'> }
  | { kind: 'message'; text: string }
);

type Run = {
  id: string;
  number: number;
  title: string;
  status: RunStatus;
  /** Who started the run: a role or a team, with an optional avatar. */
  startedBy: { name: string; avatarUrl?: string };
  model: string;
  /** Wall-clock start, `HH:MM:SS`. Step offsets are added to it for their tooltips. */
  startedAt: string;
  elapsedMs: number;
  tokens: number;
  costUsd: number;
  url?: string;
  /** Runs ahead of this one while it is queued. */
  queuePosition?: number;
  error?: { stepId: string; message: string };
  steps: RunStep[];
};

type RunTimelineProps = {
  run?: Run;
  /** Whether the steps of a finished run show. Queued, running and waiting runs always show them. */
  stepsOpen?: boolean;
  defaultStepsOpen?: boolean;
  onStepsOpenChange?: (open: boolean) => void;
  onStop?: () => void;
  onRetry?: (fromStepId: string) => void;
  onDecide?: (stepId: string, decision: ApprovalDecision) => void | Promise<void>;
  onCopyLink?: (run: Run) => void;
  className?: string;
};

// Sample data: replace it with your run. Values are made up but stable, so server and browser match.

const sampleRun: Run = {
  id: 'run_482',
  number: 482,
  title: 'Find out why Hollow Oak Games stopped sending events',
  status: 'waiting',
  startedBy: { name: 'Lena Park', avatarUrl: '/avatars/lena.jpg' },
  model: 'Claude Sonnet 5.5',
  startedAt: '14:02:10',
  elapsedMs: 252_000,
  tokens: 18_420,
  costUsd: 0.21,
  url: 'https://app.acme.example/runs/482',
  steps: [
    {
      id: 'plan',
      offsetMs: 0,
      kind: 'plan',
      steps: [
        { id: '1', label: 'Pull 30 days of Hollow Oak Games events', status: 'done', detail: '96,200 events' },
        { id: '2', label: 'Group them by day and app version', status: 'done', detail: '30 days' },
        { id: '3', label: 'Compare the last week with the three before', status: 'done' },
        { id: '4', label: 'Write up the findings', status: 'running' },
        { id: '5', label: 'Email them to the team', status: 'pending' },
      ],
    },
    {
      id: 'think',
      offsetMs: 3_000,
      kind: 'reasoning',
      status: 'done',
      durationMs: 6_000,
      text: 'Hollow Oak Games was paused on 18 September, so events should stop there. Before blaming the SDK, I will split the daily counts by app version and check whether anything arrived after the pause.\n\nThe project sends from its Android app, so I will group by app_version and keep the last 30 days.',
    },
    {
      id: 'query',
      offsetMs: 14_000,
      kind: 'tool',
      call: {
        name: 'events.query',
        title: 'Query Hollow Oak Games events, last 30 days',
        icon: Database,
        status: 'done',
        durationMs: 2_300,
        input: { project: 'hollowoak', group_by: 'day', range: '2026-09-12..2026-10-11' },
        output: '30 rows · 3 columns',
      },
    },
    {
      id: 'cohorts',
      offsetMs: 41_000,
      kind: 'tool',
      call: {
        name: 'events.compare',
        title: 'Compare the last week with the three before',
        icon: ChartColumn,
        status: 'done',
        durationMs: 4_100,
        input: { project: 'hollowoak', window: '7d', baseline: '21d' },
        output: 'Sep 12–18  13,743 events a day\nSep 19–25  0 events a day\nSep 26–Oct 2  0 events a day',
      },
    },
    {
      id: 'publish-approval',
      offsetMs: 63_000,
      kind: 'approval',
      approval: {
        tool: 'email.send',
        title: 'Email the findings to the Acme team?',
        description: 'The summary goes to Tomás, Ama and Kai. It says the project was paused on 18 September and that no events arrived after.',
        details: [
          { label: 'Subject', value: 'Hollow Oak Games: events stopped on 18 September' },
          { label: 'To', value: 'tomas@, ama@, kai@acme.example' },
                    { label: 'Requested by', value: 'Acme agent · Run #482' },
        ],
        status: 'pending',
      },
    },
  ],
};

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/** Time since the run started: "+0:14", "+12:05", "+2:03:04". */
function formatOffset(ms: number) {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const pad = (part: number) => String(part).padStart(2, '0');
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours > 0 ? `+${hours}:${pad(minutes)}:${pad(total % 60)}` : `+${minutes}:${pad(total % 60)}`;
}

function clockAt(start: string, offsetMs: number) {
  const [hours = 0, minutes = 0, seconds = 0] = start.split(':').map(Number);
  const total = (hours * 3600 + minutes * 60 + seconds + Math.floor(offsetMs / 1000)) % 86_400;
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

const runBadge: Record<RunStatus, { status: Status; label: string }> = {
  queued: { status: 'pending', label: 'Queued' },
  running: { status: 'running', label: 'Running' },
  waiting: { status: 'waiting', label: 'Waiting for approval' },
  done: { status: 'done', label: 'Done' },
  failed: { status: 'error', label: 'Failed' },
  cancelled: { status: 'skipped', label: 'Canceled' },
};

const stepEnter =
  'transition-[opacity,translate] duration-base ease-power3-out starting:opacity-0 motion-safe:starting:translate-y-1';

/** One row of the timeline: the offset, the node on the connector, then the body. */
function TimelineRow({ time, clock, children }: { time: string; clock: string; children: React.ReactNode }) {
  return (
    <li
      className={cn(
        'group/step grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-3 @md/run:grid-cols-[3.5rem_0.5rem_minmax(0,1fr)]',
        stepEnter,
      )}
    >
      <span className="hidden h-9 items-center justify-end @md/run:flex">
        <Tooltip>
          <TooltipTrigger render={<time dateTime={clock} />} className="text-caption text-muted-foreground tabular-nums">
            {time}
          </TooltipTrigger>
          <TooltipContent side="left">{clock}</TooltipContent>
        </Tooltip>
      </span>
      <span aria-hidden className="relative flex justify-center">
        <span className="absolute inset-y-0 w-px bg-border group-first/step:top-4.5 group-last/step:bottom-auto group-last/step:h-4.5" />
        <span className="relative flex h-9 items-center">
          <span className="size-1.5 rounded-full bg-muted-foreground ring-4 ring-card" />
        </span>
      </span>
      <div className="min-w-0 pb-1">{children}</div>
    </li>
  );
}

function StepBody({
  step,
  onDecide,
}: {
  step: RunStep;
  onDecide?: (stepId: string, decision: ApprovalDecision) => void | Promise<void>;
}) {
  switch (step.kind) {
    case 'plan': {
      const allDone = step.steps.every((item) => item.status === 'done');
      return <PlanChecklist surface="none" title={step.title} steps={step.steps} defaultOpen={!allDone} />;
    }
    case 'reasoning':
      return (
        <Reasoning status={step.status} durationMs={step.durationMs} steps={step.steps}>
          {step.text}
        </Reasoning>
      );
    case 'tool':
      return <ToolCall {...step.call} />;
    case 'approval':
      return <ToolApproval {...step.approval} surface="none" onDecide={(decision) => onDecide?.(step.id, decision)} />;
    default:
      return <p className="max-w-[40em] px-2 py-2 text-body text-pretty text-foreground">{step.text}</p>;
  }
}

function HeaderAction({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" size="icon" aria-label={label} onClick={onClick} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function CopyLinkAction({ run, onCopyLink }: { run: Run; onCopyLink?: (run: Run) => void }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  function copy() {
    if (onCopyLink) onCopyLink(run);
    else if (run.url) void navigator.clipboard?.writeText(run.url);
    setCopied(true);
  }

  return (
    <HeaderAction label={copied ? 'Link copied' : 'Copy link'} onClick={copy}>
      {copied ? <Check /> : <Link2 />}
    </HeaderAction>
  );
}

/**
 * One agent run inside a dashboard: who started it, its status, time, tokens and cost, then its plan,
 * reasoning, tool calls and approvals in order on a timeline. A finished run folds to a summary line.
 */
function RunTimeline({
  run = sampleRun,
  stepsOpen: stepsOpenProp,
  defaultStepsOpen,
  onStepsOpenChange,
  onStop,
  onRetry,
  onDecide,
  onCopyLink,
  className,
}: RunTimelineProps) {
  const finished = run.status === 'done' || run.status === 'failed' || run.status === 'cancelled';
  const active = !finished;
  const [stepsOpenState, setStepsOpenState] = React.useState(defaultStepsOpen ?? run.status !== 'done');
  const stepsOpen = !finished || (stepsOpenProp ?? stepsOpenState);
  const badge = runBadge[run.status];
  const titleId = React.useId();
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const stopPressed = React.useRef(false);

  React.useEffect(() => {
    if (active || !stopPressed.current) return;
    stopPressed.current = false;
    // The Stop button leaves with the run it stopped, so focus moves to the action beside it instead of the page.
    if (document.activeElement === document.body) actionsRef.current?.querySelector('button')?.focus();
  }, [active]);

  function stop() {
    stopPressed.current = true;
    onStop?.();
  }

  const toolCount = run.steps.filter((step) => step.kind === 'tool').length;
  const approvalCount = run.steps.filter((step) => step.kind === 'approval').length;
  const summary = [
    plural(run.steps.length, 'step'),
    toolCount > 0 ? plural(toolCount, 'tool call') : null,
    approvalCount > 0 ? plural(approvalCount, 'approval') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const failedIndex = run.error ? run.steps.findIndex((step) => step.id === run.error?.stepId) : -1;
  const retryLabel = failedIndex >= 0 ? `Retry from step ${failedIndex + 1}` : 'Retry';

  function changeStepsOpen(next: boolean) {
    setStepsOpenState(next);
    onStepsOpenChange?.(next);
  }

  return (
    <section
      aria-labelledby={titleId}
      data-slot="run-timeline"
      data-status={run.status}
      className={cn('@container/run w-full rounded-2xl border border-transparent bg-card shadow-card', className)}
    >
      <header className="flex flex-col gap-2 border-b border-border p-4">
        <div className="flex items-start gap-3">
          <h2 id={titleId} className="min-w-0 flex-1 pt-0.5 text-title text-pretty break-words text-foreground">
            {run.title}
          </h2>
          <div ref={actionsRef} className="flex shrink-0 items-center gap-1.5">
            {active ? (
              <HeaderAction label={run.status === 'queued' ? 'Cancel run' : 'Stop run'} onClick={stop}>
                <Square />
              </HeaderAction>
            ) : null}
            <CopyLinkAction run={run} onCopyLink={onCopyLink} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption text-muted-foreground">
          <StatusBadge status={badge.status}>{badge.label}</StatusBadge>
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar size="sm">
              {run.startedBy.avatarUrl ? <AvatarImage src={run.startedBy.avatarUrl} alt="" /> : null}
              <AvatarFallback>{initials(run.startedBy.name)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 break-words">
              <span className="sr-only">Started by </span>
              <span className="text-foreground">{run.startedBy.name}</span>
              <span aria-hidden> · </span>
              {run.model}
              <span aria-hidden> · </span>
              <span className="tabular-nums">Run #{run.number}</span>
            </span>
          </span>
          {run.status === 'queued' ? null : (
            <span className="whitespace-nowrap tabular-nums">
              <span className="sr-only">Elapsed </span>
              {formatDuration(run.elapsedMs)}
              <span aria-hidden> · </span>
              {compact.format(run.tokens)} tokens
              <span aria-hidden> · </span>
              {usd.format(run.costUsd)}
            </span>
          )}
        </div>
      </header>

      {run.status === 'queued' || (run.steps.length === 0 && active) ? (
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Hourglass aria-hidden />
            </EmptyMedia>
            <EmptyTitle render={<h3 />}>Starts when a worker is free</EmptyTitle>
            <EmptyDescription>
              {run.queuePosition
                ? `${plural(run.queuePosition, 'run')} ${run.queuePosition === 1 ? 'is' : 'are'} ahead of this one. `
                : null}
              Its plan and steps show here as the agent works.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Collapsible open={stepsOpen} onOpenChange={changeStepsOpen}>
          {finished ? (
            <div className="px-4 py-3">
              <CollapsibleTrigger variant="ghost" size="sm" className="-ms-2 tabular-nums">
                {summary}
                <CollapsibleChevron size="sm" />
              </CollapsibleTrigger>
            </div>
          ) : null}
          <CollapsibleContent>
            <ol aria-label="Steps" className={cn('flex flex-col px-3 pb-3 @md/run:px-4', finished ? 'pt-1' : 'pt-3')}>
              {run.steps.map((step) => (
                <TimelineRow key={step.id} time={formatOffset(step.offsetMs)} clock={clockAt(run.startedAt, step.offsetMs)}>
                  <StepBody step={step} onDecide={onDecide} />
                </TimelineRow>
              ))}
              {run.status === 'running' ? (
                <TimelineRow time={formatOffset(run.elapsedMs)} clock={clockAt(run.startedAt, run.elapsedMs)}>
                  <p role="status" className="flex h-9 items-center gap-2 px-2 text-body text-muted-foreground">
                    <StatusIcon status="running" />
                    Working…
                  </p>
                </TimelineRow>
              ) : null}
            </ol>
          </CollapsibleContent>
        </Collapsible>
      )}

      {run.status === 'failed' && run.error ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border px-4 py-3">
          <p role="alert" className="flex min-w-0 flex-1 basis-60 items-start gap-2 text-small text-foreground">
            <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0 text-destructive" />
            <span className="min-w-0 break-words">{run.error.message}</span>
          </p>
          <Button variant="secondary" onClick={() => run.error && onRetry?.(run.error.stepId)}>
            <RotateCcw />
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export { RunTimeline, sampleRun, type Run, type RunStatus, type RunStep, type RunTimelineProps };
