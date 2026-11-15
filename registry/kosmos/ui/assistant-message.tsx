'use client';

import { Check, CircleAlert, Copy, CornerDownRight, ExternalLink, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Collapsible,
  CollapsibleChevron,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/kosmos/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

type Source = { id: string; title: string; url: string; domain?: string };

type Feedback = 'up' | 'down' | null;

type AssistantMessageProps = {
  /** `user` renders the prompt as a bubble at the end of the row; `assistant` renders the full reply. */
  role?: 'assistant' | 'user';
  author?: { name: string; avatarUrl?: string };
  time?: string;
  model?: string;
  status?: 'streaming' | 'done' | 'error';
  error?: string;
  children: React.ReactNode;
  sources?: Source[];
  /** Opens the source list at first. */
  defaultSourcesOpen?: boolean;
  followUps?: string[];
  onFollowUp?: (text: string) => void;
  /** What Copy puts on the clipboard, such as the Markdown source. Defaults to the rendered text of the answer. */
  copyText?: string;
  onCopy?: () => void;
  onRetry?: () => void;
  feedback?: Feedback;
  defaultFeedback?: Feedback;
  onFeedbackChange?: (feedback: Feedback) => void;
  /** `hover` hides the actions until the message is hovered or focused, for earlier replies in a long thread. */
  actionsVisibility?: 'always' | 'hover';
  className?: string;
};

const newTab = { target: '_blank', rel: 'noreferrer' } as const;

const iconHidden = 'opacity-0 motion-safe:scale-25 motion-safe:blur-xs';

/** A numbered marker inside the answer. It links to its source and shows the source title in a tooltip. */
function Citation({ n, source }: { n: number; source: Pick<Source, 'title' | 'url'> }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          // The number is generated content, so Copy, which reads the answer's innerText, leaves it out.
          <a
            href={source.url}
            {...newTab}
            aria-label={`Source ${n}: ${source.title} (opens in a new tab)`}
            data-slot="citation"
            data-n={n}
            className="ms-0.5 rounded-sm bg-muted px-1 align-super text-caption leading-none text-muted-foreground tabular-nums transition-[background-color,color] before:content-[attr(data-n)] hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        }
      />
      <TooltipContent>{source.title}</TooltipContent>
    </Tooltip>
  );
}

function SourceList({ sources, defaultOpen }: { sources: Source[]; defaultOpen?: boolean }) {
  return (
    <Collapsible data-slot="assistant-message-sources" defaultOpen={defaultOpen}>
      <CollapsibleTrigger variant="ghost" size="sm" className="-ms-2">
        <span className="tabular-nums">{sources.length}</span> {sources.length === 1 ? 'source' : 'sources'}
        <CollapsibleChevron size="sm" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="divide-y divide-border pt-1">
          {sources.map((source, index) => (
            <li key={source.id}>
              <a
                href={source.url}
                {...newTab}
                className="flex min-h-9 items-center gap-2 rounded-lg px-2 py-1.5 transition-[background-color] hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <span className="w-4 shrink-0 text-caption text-muted-foreground tabular-nums">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-small font-medium wrap-break-word">{source.title}</span>
                  {source.domain ? (
                    <span className="block text-caption text-muted-foreground wrap-break-word">{source.domain}</span>
                  ) : null}
                </span>
                <ExternalLink aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ActionButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
            className="aria-pressed:bg-accent aria-pressed:[&_svg]:fill-current aria-pressed:[&_svg:not([class*='text-'])]:text-foreground"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** One message in an agent thread or copilot panel: the reply with its sources, actions and follow-ups, or the user's prompt. */
function AssistantMessage({
  role = 'assistant',
  author = { name: 'Assistant' },
  time,
  model,
  status = 'done',
  error,
  children,
  sources,
  defaultSourcesOpen,
  followUps,
  onFollowUp,
  copyText,
  onCopy,
  onRetry,
  feedback: feedbackProp,
  defaultFeedback = null,
  onFeedbackChange,
  actionsVisibility = 'always',
  className,
}: AssistantMessageProps) {
  const [feedbackState, setFeedbackState] = React.useState<Feedback>(defaultFeedback);
  const [copied, setCopied] = React.useState(false);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const feedback = feedbackProp === undefined ? feedbackState : feedbackProp;

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (role === 'user') {
    return (
      <article data-slot="assistant-message" data-role="user" className={cn('flex justify-end', className)}>
        <div className="max-w-[80%] rounded-2xl border border-transparent bg-secondary px-3 py-2 text-body wrap-break-word whitespace-pre-wrap text-secondary-foreground shadow-control">
          {children}
        </div>
      </article>
    );
  }

  const setFeedback = (next: Exclude<Feedback, null>) => {
    const value = feedback === next ? null : next;
    setFeedbackState(value);
    onFeedbackChange?.(value);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText ?? bodyRef.current?.innerText ?? '');
    } catch {
      return;
    }
    setCopied(true);
    onCopy?.();
  };

  return (
    <article
      data-slot="assistant-message"
      data-role="assistant"
      data-status={status}
      aria-busy={status === 'streaming'}
      className={cn('group/message flex flex-col gap-2', className)}
    >
      <header className="flex items-center gap-2">
        <Avatar size="sm">
          {author.avatarUrl ? <AvatarImage src={author.avatarUrl} alt="" /> : null}
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <span className="min-w-0 text-small font-medium wrap-break-word">{author.name}</span>
          {time || model ? (
            <span className="text-caption text-muted-foreground tabular-nums">
              {[time, model].filter(Boolean).join(' · ')}
            </span>
          ) : null}
        </div>
      </header>

      <div ref={bodyRef} data-slot="assistant-message-body" className="max-w-[40em] text-body text-pretty wrap-break-word">
        {children}
        {status === 'streaming' ? (
          <span aria-hidden className="ms-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-foreground align-middle" />
        ) : null}
      </div>

      {status === 'error' ? (
        <div role="alert" className="flex flex-wrap items-center gap-2">
          <CircleAlert aria-hidden className="size-3.5 shrink-0 text-destructive" />
          <span className="text-small">{error ?? 'This reply didn’t finish.'}</span>
          {onRetry ? (
            <Button variant="secondary" onClick={onRetry}>
              <RotateCcw aria-hidden />
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}

      {sources && sources.length > 0 && status !== 'streaming' ? (
        <div className="max-w-[40em]">
          <SourceList sources={sources} defaultOpen={defaultSourcesOpen} />
        </div>
      ) : null}

      {status === 'done' ? (
        <TooltipProvider>
          <div
            role="group"
            aria-label="Message actions"
            data-slot="assistant-message-actions"
            className={cn(
              '-ms-1.5 flex items-center gap-0.5',
              actionsVisibility === 'hover' &&
                'transition-[opacity] pointer-fine:opacity-0 pointer-fine:group-hover/message:opacity-100 pointer-fine:focus-within:opacity-100 pointer-fine:has-aria-pressed:opacity-100',
            )}
          >
            <ActionButton label={copied ? 'Copied' : 'Copy'} onClick={copy}>
              <span
                aria-hidden
                className="relative size-3 *:absolute *:inset-0 *:transition-[opacity,scale,filter] *:duration-slow *:ease-power3-out"
              >
                <Copy className={cn(copied && iconHidden)} />
                <Check className={cn(!copied && iconHidden)} />
              </span>
            </ActionButton>
            {onRetry ? (
              <ActionButton label="Retry" onClick={onRetry}>
                <RotateCcw aria-hidden />
              </ActionButton>
            ) : null}
            <ActionButton label="Good answer" pressed={feedback === 'up'} onClick={() => setFeedback('up')}>
              <ThumbsUp aria-hidden />
            </ActionButton>
            <ActionButton label="Bad answer" pressed={feedback === 'down'} onClick={() => setFeedback('down')}>
              <ThumbsDown aria-hidden />
            </ActionButton>
            <span role="status" className="sr-only">
              {copied ? 'Copied' : ''}
            </span>
          </div>
        </TooltipProvider>
      ) : null}

      {followUps && followUps.length > 0 && status === 'done' ? (
        <ul aria-label="Suggested follow-ups" className="max-w-[40em] divide-y divide-border">
          {followUps.map((text) => (
            <li key={text}>
              <Button
                variant="item"
                onClick={() => onFollowUp?.(text)}
                className="h-auto min-h-9 w-full justify-start gap-2 px-2 py-1.5 text-start whitespace-normal"
              >
                <CornerDownRight aria-hidden className="size-4 text-muted-foreground" />
                {text}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export { AssistantMessage, Citation, type AssistantMessageProps, type Feedback as AssistantMessageFeedback, type Source };
