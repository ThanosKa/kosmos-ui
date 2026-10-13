'use client';

import * as React from 'react';
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/registry/kosmos/ui/collapsible';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';
import { StatusIcon } from '@/registry/kosmos/ui/status';
import { cn } from '@/registry/kosmos/lib/cn';
import { formatDuration } from '@/registry/kosmos/lib/format';

type ReasoningStep = { label: string; done: boolean };

type ReasoningProps = {
  status: 'thinking' | 'done';
  /** How long the agent thought. Shown once `status` is `done`. */
  durationMs?: number;
  /** Streamed prose. */
  children?: React.ReactNode;
  /** Shown instead of `children`: what the agent works through, one row each. */
  steps?: ReasoningStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Opens while thinking and closes when done, unless the reader toggled it. Defaults to `true`. */
  autoCollapse?: boolean;
  className?: string;
};

function doneLabel(durationMs?: number) {
  if (durationMs === undefined || durationMs < 1000) return 'Thought for a moment';
  return (
    <>
      Thought for <span className="whitespace-nowrap">{formatDuration(durationMs)}</span>
    </>
  );
}

const spokenUnit = (unit: 'minute' | 'second') =>
  new Intl.NumberFormat('en', { style: 'unit', unit, unitDisplay: 'long', maximumFractionDigits: 1 });

/** The label read aloud, rounded as `formatDuration` rounds it: "4.2 seconds", "48 seconds", "2 minutes 5 seconds". */
function doneAnnouncement(durationMs?: number) {
  if (durationMs === undefined || durationMs < 1000) return 'Thought for a moment';
  if (durationMs < 10_000) return `Thought for ${spokenUnit('second').format(Math.round(durationMs / 100) / 10)}`;
  if (durationMs < 60_000) return `Thought for ${spokenUnit('second').format(Math.round(durationMs / 1000))}`;
  const minutes = spokenUnit('minute').format(Math.floor(durationMs / 60_000));
  const seconds = Math.floor((durationMs % 60_000) / 1000);
  return seconds ? `Thought for ${minutes} ${spokenUnit('second').format(seconds)}` : `Thought for ${minutes}`;
}

/**
 * Shows that the agent is thinking, and lets a reader open what it thought without the thinking
 * crowding out the answer. It has no surface of its own.
 */
function Reasoning({
  status,
  durationMs,
  children,
  steps,
  open: openProp,
  defaultOpen,
  onOpenChange,
  autoCollapse = true,
  className,
}: ReasoningProps) {
  const controlled = openProp !== undefined;
  const [openState, setOpenState] = React.useState(defaultOpen ?? (autoCollapse && status === 'thinking'));
  const [toggledByReader, setToggledByReader] = React.useState(false);
  const open = controlled ? openProp : openState;

  const [previousStatus, setPreviousStatus] = React.useState(status);
  const [finishedWhileMounted, setFinishedWhileMounted] = React.useState(false);
  if (previousStatus !== status) {
    setPreviousStatus(status);
    setFinishedWhileMounted(status === 'done');
    if (autoCollapse && !controlled && !toggledByReader) setOpenState(status === 'thinking');
  }

  const viewportRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (status === 'thinking' && viewport) viewport.scrollTop = viewport.scrollHeight;
  });

  const thinking = status === 'thinking';
  const currentStep = thinking ? (steps?.findIndex((step) => !step.done) ?? -1) : -1;
  return (
    <Collapsible
      data-slot="reasoning"
      data-status={status}
      open={open}
      onOpenChange={(next) => {
        setToggledByReader(true);
        setOpenState(next);
        onOpenChange?.(next);
      }}
      className={cn('w-full', className)}
    >
      <CollapsibleTrigger
        variant="item"
        className="h-auto min-h-9 max-w-full justify-start gap-2 px-2 py-1.5 text-start whitespace-normal text-muted-foreground"
      >
        <StatusIcon status={thinking ? 'running' : 'done'} />
        <span key={status} className="min-w-0 transition-[opacity] duration-fast starting:opacity-0">
          {thinking ? 'Thinking…' : doneLabel(durationMs)}
        </span>
        <CollapsibleChevron size="md" />
      </CollapsibleTrigger>
      <CollapsibleContent aria-busy={thinking}>
        <div className="ms-4 mb-2 border-s border-border ps-3.75">
          {steps ? (
            <ul className="flex flex-col gap-1.5 py-1">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-small text-muted-foreground">
                  <StatusIcon
                    status={step.done ? 'done' : index === currentStep ? 'running' : 'pending'}
                    className="mt-0.5 size-3.5"
                  />
                  <span className="min-w-0">{step.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ScrollArea className="max-h-64" viewportClassName="max-h-64" viewportRef={viewportRef}>
              <div className="max-w-[40em] text-small whitespace-pre-wrap text-muted-foreground">{children}</div>
            </ScrollArea>
          )}
        </div>
      </CollapsibleContent>
      <span role="status" className="sr-only">
        {finishedWhileMounted ? doneAnnouncement(durationMs) : null}
      </span>
    </Collapsible>
  );
}

export { Reasoning, type ReasoningProps, type ReasoningStep };
