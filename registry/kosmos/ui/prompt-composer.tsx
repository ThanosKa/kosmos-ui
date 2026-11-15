'use client';

import {
  ArrowUp,
  CircleAlert,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Paperclip,
  Square,
  X,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import { ModelSelect, type ModelEffort, type ModelOption } from '@/registry/kosmos/ui/model-select';
import { Textarea } from '@/registry/kosmos/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';
import { UsageMeter, type UsageBreakdownRow } from '@/registry/kosmos/ui/usage-meter';

type PromptComposerAttachment = { id: string; name: string; size: number; kind: 'file' | 'image' | 'table' };

type PromptComposerStatus = 'idle' | 'submitting' | 'streaming';

type PromptComposerMessage = {
  text: string;
  attachments: PromptComposerAttachment[];
  /** The chosen model id, when `models` is set. */
  model?: string;
  /** The chosen effort, when `efforts` is set and the chosen model offers it. */
  effort?: ModelEffort;
};

type PromptComposerProps = {
  /** The text. Controlled when set. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called by Send and by Enter. The composer then clears its text and attachments. */
  onSubmit: (message: PromptComposerMessage) => void;
  /** Called by Stop and by Escape while `status` is `streaming`. */
  onStop?: () => void;
  /** `submitting` spins Send until the agent starts; `streaming` turns Send into Stop. */
  status?: PromptComposerStatus;
  placeholder?: string;
  /** Controlled when set. */
  attachments?: PromptComposerAttachment[];
  defaultAttachments?: PromptComposerAttachment[];
  onAttachmentsChange?: (attachments: PromptComposerAttachment[]) => void;
  /** Called by the Attach button. Without it the button is hidden. */
  onAttach?: () => void;
  /** The models to pick from. Without it the model select is hidden. */
  models?: ModelOption[];
  /** The chosen model id. Controlled when set. */
  model?: string;
  defaultModel?: string;
  onModelChange?: (id: string) => void;
  /** The reasoning efforts to offer in the model menu. */
  efforts?: ModelEffort[];
  /** The chosen effort. Controlled when set. */
  effort?: ModelEffort;
  defaultEffort?: ModelEffort;
  onEffortChange?: (effort: ModelEffort) => void;
  /** What fills the model's context window. Without it the usage meter is hidden. */
  context?: { limit: number; breakdown: UsageBreakdownRow[] };
  disabled?: boolean;
  /** Shown under the composer while disabled. */
  disabledReason?: string;
  /** Shown under the composer, and marks it invalid. */
  error?: string;
  className?: string;
};

const kindIcon = { file: FileText, image: ImageIcon, table: FileSpreadsheet } as const;

function formatSize(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

function useControllableState<Value>(controlled: Value | undefined, initial: Value, onChange?: (next: Value) => void) {
  const [inner, setInner] = React.useState(initial);
  const set = React.useCallback(
    (next: Value) => {
      setInner(next);
      onChange?.(next);
    },
    [onChange],
  );
  return [controlled ?? inner, set] as const;
}

const swapIcon =
  'absolute transition-[opacity,scale] duration-fast data-hidden:opacity-0 motion-safe:data-hidden:scale-80';

/** Where a user writes to an agent: a text box that grows, attachments, the model, the context meter, and Send that turns into Stop. */
function PromptComposer({
  value,
  defaultValue = '',
  onValueChange,
  onSubmit,
  onStop,
  status = 'idle',
  placeholder = 'Write a message…',
  attachments,
  defaultAttachments = [],
  onAttachmentsChange,
  onAttach,
  models,
  model,
  defaultModel,
  onModelChange,
  efforts,
  effort,
  defaultEffort,
  onEffortChange,
  context,
  disabled,
  disabledReason,
  error,
  className,
}: PromptComposerProps) {
  const [text, setText] = useControllableState(value, defaultValue, onValueChange);
  const [files, setFiles] = useControllableState(attachments, defaultAttachments, onAttachmentsChange);
  const [modelId, setModelId] = useControllableState(
    model,
    defaultModel ?? models?.find((option) => !option.disabled)?.id ?? models?.[0]?.id ?? '',
    onModelChange,
  );
  const [currentEffort, setEffort] = useControllableState<ModelEffort>(
    effort,
    defaultEffort ?? efforts?.[Math.floor((efforts.length - 1) / 2)] ?? 'medium',
    onEffortChange,
  );
  const composing = React.useRef(false);
  const noteId = React.useId();

  const streaming = status === 'streaming';
  const submitting = status === 'submitting';
  const canSend = !disabled && status === 'idle' && text.trim().length > 0;
  const hasModels = Boolean(models && models.length > 0);
  const offeredEfforts = models?.find((option) => option.id === modelId)?.efforts ?? efforts ?? [];
  const note = error ?? (disabled ? disabledReason : undefined);

  const submit = () => {
    if (!canSend) return;
    onSubmit({
      text: text.trim(),
      attachments: files,
      model: hasModels ? modelId : undefined,
      effort: offeredEfforts.includes(currentEffort) ? currentEffort : undefined,
    });
    setText('');
    setFiles([]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    // Keys from the model menu and the usage panel bubble here through their portals; they handle their own.
    if (!event.currentTarget.contains(event.target as Node)) return;
    if (event.key === 'Escape' && streaming && onStop) {
      event.preventDefault();
      onStop();
      return;
    }
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing || composing.current) return;
    if (event.target instanceof HTMLTextAreaElement) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <TooltipProvider>
      <div data-slot="prompt-composer" className={cn('flex w-full min-w-0 flex-col gap-2', className)}>
        <form
          data-invalid={error ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          aria-busy={submitting || streaming || undefined}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex flex-col gap-1.5 rounded-2xl border border-transparent bg-secondary p-1.5 shadow-field transition-[box-shadow]',
            // The text field focus: a line and a halo in box-shadow that fade together. The transparent outline paints only in forced-colors mode.
            'has-[textarea:focus-visible]:outline-1 has-[textarea:focus-visible]:outline-offset-0 has-[textarea:focus-visible]:outline-transparent has-[textarea:focus-visible]:ring-offset-1 has-[textarea:focus-visible]:ring-offset-ring has-[textarea:focus-visible]:ring-3 has-[textarea:focus-visible]:ring-ring/20',
            'data-invalid:ring-1 data-invalid:ring-destructive data-invalid:has-[textarea:focus-visible]:ring-offset-destructive data-invalid:has-[textarea:focus-visible]:ring-3 data-invalid:has-[textarea:focus-visible]:ring-destructive/20',
            // The whole composer dims once, so the controls inside keep their own dimming from stacking on top.
            'data-disabled:opacity-50 data-disabled:**:data-disabled:opacity-100',
          )}
        >
          {files.length > 0 ? (
            <ul aria-label="Attachments" className="flex flex-wrap gap-1.5 px-1 pt-0.5">
              {files.map((file) => {
                const Icon = kindIcon[file.kind];
                return (
                  <li
                    key={file.id}
                    className="flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-lg border border-transparent bg-card ps-2 pe-0.5 text-caption shadow-control transition-[opacity] duration-fast starting:opacity-0"
                  >
                    <Icon aria-hidden className="size-3 shrink-0 text-muted-foreground" />
                    <span title={file.name} className="max-w-40 min-w-0 truncate font-medium">{file.name}</span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">{formatSize(file.size)}</span>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            disabled={disabled}
                            aria-label={`Remove ${file.name}`}
                            onClick={() => setFiles(files.filter((item) => item.id !== file.id))}
                          />
                        }
                      >
                        <X aria-hidden />
                      </TooltipTrigger>
                      <TooltipContent className="break-words">Remove {file.name}</TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <Textarea
            aria-label="Message"
            aria-invalid={error ? true : undefined}
            aria-describedby={note ? noteId : undefined}
            placeholder={placeholder}
            value={text}
            disabled={disabled}
            onValueChange={(next) => setText(next)}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
            }}
            // The form carries the field ring, the focus outline and the disabled dimming, so the textarea drops its own.
            className="max-h-60 min-h-[3lh] resize-none bg-transparent shadow-none disabled:opacity-100 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-0 aria-invalid:ring-0 aria-invalid:focus-visible:ring-0 aria-invalid:focus-visible:ring-offset-0"
          />
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              {onAttach ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="secondary"
                        size="icon"
                        type="button"
                        disabled={disabled}
                        aria-label="Attach files"
                        onClick={onAttach}
                      />
                    }
                  >
                    <Paperclip aria-hidden />
                  </TooltipTrigger>
                  <TooltipContent>Attach files</TooltipContent>
                </Tooltip>
              ) : null}
              {hasModels && models ? (
                <ModelSelect
                  models={models}
                  value={modelId}
                  onValueChange={setModelId}
                  efforts={efforts}
                  effort={currentEffort}
                  onEffortChange={setEffort}
                  disabled={disabled}
                  className="shrink"
                />
              ) : null}
              {context ? <UsageMeter breakdown={context.breakdown} limit={context.limit} /> : null}
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={streaming ? 'secondary' : 'primary'}
                    size="icon"
                    type={streaming ? 'button' : 'submit'}
                    focusableWhenDisabled
                    disabled={streaming ? !onStop : !canSend}
                    aria-label={streaming ? 'Stop' : submitting ? 'Sending' : 'Send'}
                    onClick={streaming ? onStop : undefined}
                    className="relative shrink-0"
                  />
                }
              >
                <ArrowUp aria-hidden data-hidden={streaming || submitting ? '' : undefined} className={swapIcon} />
                <LoaderCircle
                  aria-hidden
                  data-hidden={submitting ? undefined : ''}
                  className={cn(swapIcon, 'motion-safe:animate-spin motion-reduce:animate-pulse')}
                />
                <Square aria-hidden data-hidden={streaming ? undefined : ''} className={cn(swapIcon, 'fill-current')} />
              </TooltipTrigger>
              <TooltipContent className="flex items-center gap-2">
                {streaming ? 'Stop' : submitting ? 'Sending' : 'Send'}
                {submitting ? null : (
                  <KbdGroup>
                    <Kbd>{streaming ? 'Esc' : 'Enter'}</Kbd>
                  </KbdGroup>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        </form>
        {error ? (
          <p id={noteId} role="alert" className="flex items-start gap-1.5 px-2 text-small text-muted-foreground">
            <span aria-hidden className="flex h-[1.4em] shrink-0 items-center">
              <CircleAlert className="size-3.5 text-destructive" />
            </span>
            {error}
          </p>
        ) : note ? (
          <p id={noteId} className="px-2 text-small text-muted-foreground">
            {note}
          </p>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

export {
  PromptComposer,
  type PromptComposerAttachment,
  type PromptComposerMessage,
  type PromptComposerProps,
  type PromptComposerStatus,
};
