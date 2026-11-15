'use client';

import { CircleAlert, Wrench, type LucideIcon } from 'lucide-react';
import type * as React from 'react';
import { formatDuration } from '@/registry/kosmos/lib/format';
import {
  Collapsible,
  CollapsibleChevron,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/kosmos/ui/collapsible';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';
import { StatusBadge, type Status } from '@/registry/kosmos/ui/status';
import { cn } from '@/registry/kosmos/lib/cn';

type ToolCallStatus = 'queued' | 'awaiting-approval' | 'running' | 'done' | 'error' | 'denied';

/** A string is shown as is; an object is pretty-printed as JSON. */
type ToolCallPayload = string | Record<string, unknown>;

type ToolCallProps = {
  /** The tool's machine id, shown in mono in wide containers. */
  name: string;
  /** The human label of the call. Falls back to `name`. */
  title?: string;
  /** The tool's icon. Defaults to a wrench. */
  icon?: LucideIcon;
  status: ToolCallStatus;
  /** How long the call took, or has run so far, in milliseconds. */
  durationMs?: number;
  input?: ToolCallPayload;
  output?: ToolCallPayload;
  /** Replaces the output with an error panel. */
  error?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A custom renderer in place of the output panel. */
  children?: React.ReactNode;
  className?: string;
};

const statusBadge: Record<ToolCallStatus, { status: Status; label: string }> = {
  queued: { status: 'pending', label: 'Queued' },
  'awaiting-approval': { status: 'waiting', label: 'Needs approval' },
  running: { status: 'running', label: 'Running' },
  done: { status: 'done', label: 'Done' },
  error: { status: 'error', label: 'Failed' },
  denied: { status: 'skipped', label: 'Denied' },
};

function formatPayload(payload: ToolCallPayload) {
  return typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-caption tracking-[0.05em] text-muted-foreground uppercase">{label}</p>
      {children}
    </div>
  );
}

function CodePanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <ScrollArea role="group" aria-label={label} className="max-h-64 bg-muted" viewportClassName="max-h-64">
      <pre className="p-3 font-mono text-caption break-words whitespace-pre-wrap text-foreground">{children}</pre>
    </ScrollArea>
  );
}

const rowClassName = 'h-auto min-h-9 w-full justify-start gap-2 px-2 py-1.5 text-start whitespace-normal';

/**
 * One tool call by an agent: the tool, its status and its timing, opening to show the input and
 * output. It has no surface of its own; it sits in the card, message or timeline that hosts it.
 */
function ToolCall({
  name,
  title,
  icon: Icon = Wrench,
  status,
  durationMs,
  input,
  output,
  error,
  open,
  defaultOpen,
  onOpenChange,
  children,
  className,
}: ToolCallProps) {
  const badge = statusBadge[status];
  const hasDetails = input !== undefined || output !== undefined || error !== undefined || children !== undefined;
  const row = (
    <>
      <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      <span
        className={cn(
          'min-w-8 text-body font-medium break-words',
          hasDetails && 'line-clamp-2 group-data-panel-open/collapsible:line-clamp-none',
        )}
      >
        {title ?? name}
      </span>
      <span title={name} className="hidden max-w-[40%] truncate font-mono text-caption text-muted-foreground @xl/tool-call:block">
        {name}
      </span>
      <span aria-hidden className="flex-1" />
      {durationMs !== undefined && (
        <span className="hidden shrink-0 text-caption text-muted-foreground tabular-nums @sm/tool-call:inline">
          {formatDuration(durationMs)}
        </span>
      )}
      <StatusBadge
        key={status}
        status={badge.status}
        className="transition-[opacity] duration-fast starting:opacity-0"
      >
        {badge.label}
      </StatusBadge>
    </>
  );

  if (!hasDetails) {
    return (
      <div data-slot="tool-call" data-status={status} className={cn('@container/tool-call w-full', className)}>
        <div className={cn('flex items-center', rowClassName)}>
          {row}
          <span aria-hidden className="size-5 shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <Collapsible
      data-slot="tool-call"
      data-status={status}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={cn('@container/tool-call w-full', className)}
    >
      <CollapsibleTrigger variant="item" className={cn(rowClassName, 'focus-visible:-outline-offset-2')}>
        {row}
        <CollapsibleChevron size="md" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 px-2 pt-2 pb-3">
          <p className="flex gap-1.5 text-caption text-muted-foreground @xl/tool-call:hidden">
            <span className="min-w-0 font-mono break-all">{name}</span>
            {durationMs !== undefined && (
              <span className="shrink-0 tabular-nums @sm/tool-call:hidden">· {formatDuration(durationMs)}</span>
            )}
          </p>
          {input !== undefined && (
            <Section label="Input">
              <CodePanel label={`${name} input`}>{formatPayload(input)}</CodePanel>
            </Section>
          )}
          {error !== undefined ? (
            <Section label="Error">
              <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-small text-foreground">
                <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                <p className="min-w-0 break-words">{error}</p>
              </div>
            </Section>
          ) : children !== undefined ? (
            <Section label="Output">{children}</Section>
          ) : (
            output !== undefined && (
              <Section label="Output">
                <CodePanel label={`${name} output`}>{formatPayload(output)}</CodePanel>
              </Section>
            )
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { ToolCall, type ToolCallPayload, type ToolCallProps, type ToolCallStatus };
