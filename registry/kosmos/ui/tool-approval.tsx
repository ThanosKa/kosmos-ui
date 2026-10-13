'use client';

import { LoaderCircle, ShieldCheck } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/registry/kosmos/ui/collapsible';
import { StatusBadge, StatusIcon } from '@/registry/kosmos/ui/status';
import { cn } from '@/registry/kosmos/lib/cn';

type ApprovalDecision = 'allow-once' | 'always-allow' | 'deny';

type ToolApprovalDetail = { label: string; value: React.ReactNode; mono?: boolean };

type ToolApprovalProps = {
  tool: string;
  title: string;
  description?: string;
  details?: ToolApprovalDetail[];
  /** Irreversible action: Allow turns destructive, Deny turns secondary, Always allow hides and the consequence line shows. */
  danger?: boolean;
  consequence?: string;
  /** Show the "Always allow" button and the note that Allow once covers this run only. Default true; ignored with `danger`. */
  allowAlways?: boolean;
  status?: 'pending' | 'submitting' | 'decided';
  /** While submitting, the decision being sent; once decided, the decision taken. */
  decision?: ApprovalDecision;
  decidedBy?: string;
  /** The time of the decision, `HH:MM`. */
  decidedAt?: string;
  onDecide?: (decision: ApprovalDecision) => void | Promise<void>;
  defaultDetailsOpen?: boolean;
  /** `card` is a standalone card; `none` sits flat in the card or timeline that hosts it. */
  surface?: 'card' | 'none';
  className?: string;
};

const recordText = {
  'allow-once': 'Allowed once',
  'always-allow': 'Always allowed',
  deny: 'Denied',
} satisfies Record<ApprovalDecision, string>;

/** Asks before an agent runs a tool, then folds to a one-line record of who decided and when. */
function ToolApproval({
  tool,
  title,
  description,
  details,
  danger = false,
  consequence,
  allowAlways = true,
  status = 'pending',
  decision,
  decidedBy,
  decidedAt,
  onDecide,
  defaultDetailsOpen = false,
  surface = 'card',
  className,
}: ToolApprovalProps) {
  const titleId = React.useId();
  const sectionRef = React.useRef<HTMLElement>(null);
  const recordRef = React.useRef<HTMLParagraphElement>(null);
  const decided = status === 'decided';
  const submitting = status === 'submitting';
  const allowed = decision === 'allow-once' || decision === 'always-allow';
  const showAlways = allowAlways && !danger;

  React.useEffect(() => {
    // The focused button folds away with the actions, so focus moves to the record instead of the page.
    if (decided && sectionRef.current?.contains(document.activeElement)) recordRef.current?.focus();
  }, [decided]);

  function pick(next: ApprovalDecision) {
    void onDecide?.(next);
  }

  function leadingIcon(target: ApprovalDecision) {
    return submitting && decision === target ? (
      <LoaderCircle aria-hidden className="motion-safe:animate-spin motion-reduce:animate-pulse" />
    ) : null;
  }

  const who = [decision ? recordText[decision] : null, decidedBy ? `by ${decidedBy}` : null].filter(Boolean).join(' ');
  const record = [who, decidedAt].filter(Boolean).join(' · ');

  return (
    <section
      ref={sectionRef}
      aria-labelledby={titleId}
      aria-busy={submitting || undefined}
      data-slot="tool-approval"
      data-status={status}
      className={cn(
        'w-full min-w-0',
        surface === 'card' ? 'rounded-2xl border border-transparent bg-card p-4 shadow-card' : 'px-2 py-2',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
          <div className="flex min-w-0 flex-1 basis-40 flex-col">
            <h3 id={titleId} className="text-body font-medium text-pretty text-foreground">
              {title}
            </h3>
            <span className="font-mono text-caption wrap-anywhere text-muted-foreground">{tool}</span>
          </div>
          <StatusBadge
            key={decided ? 'decided' : 'pending'}
            status={decided ? (allowed ? 'done' : 'skipped') : 'waiting'}
            className="transition-[opacity] duration-fast starting:opacity-0"
          >
            {decided ? (allowed ? 'Allowed' : 'Denied') : 'Needs approval'}
          </StatusBadge>
        </div>
      </div>

      {description ? <p className="mt-2 max-w-[40em] text-small text-muted-foreground">{description}</p> : null}

      <Collapsible open={!decided}>
        <CollapsibleContent className="-m-1 p-1">
          {details && details.length > 0 ? (
            <Collapsible defaultOpen={defaultDetailsOpen} className="mt-2">
              <CollapsibleTrigger variant="ghost" size="sm" className="-ms-2">
                <span className="group-data-panel-open/collapsible:hidden">Show details</span>
                <span className="hidden group-data-panel-open/collapsible:inline">Hide details</span>
                <CollapsibleChevron size="sm" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  {details.map((detail) => (
                    <div key={detail.label} className="col-span-2 grid grid-cols-subgrid items-baseline">
                      <dt className="text-small text-muted-foreground">{detail.label}</dt>
                      <dd className="min-w-0 text-body break-words text-foreground">
                        {detail.mono ? (
                          <span className="rounded-sm bg-muted box-decoration-clone px-1.5 font-mono text-caption">{detail.value}</span>
                        ) : (
                          detail.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
          {danger && consequence ? <p className="mt-3 max-w-[40em] text-small text-foreground">{consequence}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 @container">
            <Button
              variant={danger ? 'destructive' : 'primary'}
              disabled={submitting}
              focusableWhenDisabled
              onClick={() => pick('allow-once')}
            >
              {leadingIcon('allow-once')}
              Allow once
            </Button>
            {showAlways ? (
              <Button variant="secondary" disabled={submitting} focusableWhenDisabled onClick={() => pick('always-allow')}>
                {leadingIcon('always-allow')}
                Always allow
              </Button>
            ) : null}
            <Button
              variant={danger ? 'secondary' : 'ghost'}
              disabled={submitting}
              focusableWhenDisabled
              onClick={() => pick('deny')}
            >
              {leadingIcon('deny')}
              Deny
            </Button>
            {showAlways ? (
              <span className="w-full text-caption text-muted-foreground @lg:ms-auto @lg:w-auto">
                Allow once applies to this run only
              </span>
            ) : null}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div role="status">
        {decided ? (
          <p
            ref={recordRef}
            tabIndex={-1}
            className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-small text-muted-foreground tabular-nums transition-[opacity] duration-fast starting:opacity-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <StatusIcon status={allowed ? 'done' : 'skipped'} className="size-3.5" />
            <span className="min-w-0 break-words">{record}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export { ToolApproval, type ApprovalDecision, type ToolApprovalDetail, type ToolApprovalProps };
