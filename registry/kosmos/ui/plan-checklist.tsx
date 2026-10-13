'use client';

import { ListChecks } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/registry/kosmos/ui/collapsible';
import { StatusIcon, type Status } from '@/registry/kosmos/ui/status';
import { cn } from '@/registry/kosmos/lib/cn';

type PlanStepStatus = Extract<Status, 'pending' | 'running' | 'done' | 'error' | 'skipped'>;

type PlanStep = {
  id: string;
  label: string;
  status: PlanStepStatus;
  /** A short note at the end of the row: a count, a percentage, or why the step failed. */
  detail?: string;
};

type PlanChecklistProps = {
  title?: string;
  steps: PlanStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Close the list when every step is done. Default true. */
  collapseWhenDone?: boolean;
  /** Buttons under the list, such as "Run plan" and "Edit" while the plan waits for approval. */
  actions?: React.ReactNode;
  /** `card` is a card of its own; `none` sits flat inside a host such as a run timeline. */
  surface?: 'card' | 'none';
  className?: string;
};

const labelStyle: Record<PlanStepStatus, string> = {
  pending: 'text-muted-foreground',
  running: 'font-medium text-foreground',
  done: 'text-muted-foreground',
  error: 'text-foreground',
  skipped: 'text-muted-foreground line-through',
};

const statusWord: Record<PlanStepStatus, string> = {
  pending: 'pending',
  running: 'running',
  done: 'done',
  error: 'failed',
  skipped: 'skipped',
};

/** What changed since the last steps, in words for the live region, or null when nothing worth saying did. */
function describeChange(previous: PlanStep[], steps: PlanStep[]): string | null {
  const failed = steps.find(
    (step) => step.status === 'error' && previous.find((before) => before.id === step.id)?.status !== 'error',
  );
  if (failed) return `${failed.label} failed`;
  const doneCount = steps.filter((step) => step.status === 'done').length;
  const doneBefore = previous.filter((step) => step.status === 'done').length;
  if (doneCount <= doneBefore) return null;
  if (doneCount === steps.length) return `All ${steps.length} steps done`;
  return `Step ${doneCount} of ${steps.length} done`;
}

/** The agent's plan as a live checklist: what it will do, what it is doing and what is done. */
function PlanChecklist({
  title = 'Plan',
  steps,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  collapseWhenDone = true,
  actions,
  surface = 'card',
  className,
}: PlanChecklistProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const doneCount = steps.filter((step) => step.status === 'done').length;
  const allDone = steps.length > 0 && doneCount === steps.length;
  const [announcement, setAnnouncement] = useState('');
  const previousSteps = useRef(steps);
  const wasAllDone = useRef(allDone);

  function changeOpen(next: boolean) {
    setOpenState(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    const change = describeChange(previousSteps.current, steps);
    if (change) setAnnouncement(change);
    previousSteps.current = steps;
  }, [steps]);

  useEffect(() => {
    if (allDone && !wasAllDone.current && collapseWhenDone) {
      setOpenState(false);
      onOpenChange?.(false);
    }
    wasAllDone.current = allDone;
  }, [allDone, collapseWhenDone, onOpenChange]);

  return (
    <Collapsible
      open={open}
      onOpenChange={changeOpen}
      data-slot="plan-checklist"
      className={cn('w-full', surface === 'card' && 'rounded-2xl border border-transparent bg-card p-1 shadow-card', className)}
    >
      <CollapsibleTrigger
        variant="item"
        className="h-auto min-h-9 w-full justify-start gap-2 px-2 py-1.5 text-start whitespace-normal"
      >
        {allDone ? <StatusIcon status="done" /> : <ListChecks aria-hidden className="size-4 text-muted-foreground" />}
        <span className="min-w-0 flex-1 break-words">{title}</span>
        {steps.length > 0 ? (
          <span className="shrink-0 text-caption font-normal text-muted-foreground tabular-nums">
            {doneCount} of {steps.length}
            <span className="sr-only"> steps done</span>
          </span>
        ) : null}
        <CollapsibleChevron size="md" />
      </CollapsibleTrigger>
      <CollapsibleContent className="-m-1 p-1">
        <ol data-slot="plan-checklist-steps" className="flex flex-col pt-1">
          {steps.map((step) => (
            <li
              key={step.id}
              data-status={step.status}
              className="flex min-h-7.5 items-start gap-2 px-2 py-1.25 transition-[opacity] duration-fast starting:opacity-0"
            >
              <StatusIcon status={step.status} className="mt-0.5" />
              <span className={cn('min-w-0 flex-1 text-body break-words', labelStyle[step.status])}>
                {step.label}
                <span className="sr-only">, {statusWord[step.status]}</span>
              </span>
              {step.detail ? (
                <span className="max-w-[45%] shrink-0 pt-0.5 text-end text-caption break-words text-muted-foreground tabular-nums">
                  {step.detail}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        {actions ? (
          <div data-slot="plan-checklist-actions" className="flex flex-wrap items-center gap-2 px-2 pt-2 pb-1">
            {actions}
          </div>
        ) : null}
      </CollapsibleContent>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </Collapsible>
  );
}

export { PlanChecklist, type PlanChecklistProps, type PlanStep, type PlanStepStatus };
